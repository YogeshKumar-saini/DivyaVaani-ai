#!/usr/bin/env python3
"""Script to create and populate Pinecone index with spiritual texts."""

import sys
import os
from pathlib import Path
import pandas as pd
import time
from tqdm import tqdm

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv()

from pinecone import Pinecone, ServerlessSpec
from sentence_transformers import SentenceTransformer
import numpy as np

# Configuration
INDEX_NAME = "divyavaani-verses"
EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
DIMENSION = 384  # Dimension for the multilingual model
METRIC = "cosine"
CLOUD = "aws"
REGION = "us-east-1"

def create_index(pc: Pinecone):
    """Create Pinecone index if it doesn't exist."""
    print(f"\n{'='*60}")
    print(f"Creating Pinecone Index: {INDEX_NAME}")
    print(f"{'='*60}\n")
    
    # Check if index already exists
    existing_indexes = [idx.name for idx in pc.list_indexes()]
    
    if INDEX_NAME in existing_indexes:
        print(f"✓ Index '{INDEX_NAME}' already exists")
        return pc.Index(INDEX_NAME)
    
    # Create new index
    print(f"Creating new index with:")
    print(f"  - Dimension: {DIMENSION}")
    print(f"  - Metric: {METRIC}")
    print(f"  - Cloud: {CLOUD}")
    print(f"  - Region: {REGION}")
    
    pc.create_index(
        name=INDEX_NAME,
        dimension=DIMENSION,
        metric=METRIC,
        spec=ServerlessSpec(
            cloud=CLOUD,
            region=REGION
        )
    )
    
    # Wait for index to be ready
    print("\nWaiting for index to be ready...", end="", flush=True)
    while not pc.describe_index(INDEX_NAME).status['ready']:
        time.sleep(1)
        print(".", end="", flush=True)
    print(" Ready!\n")
    
    return pc.Index(INDEX_NAME)

def load_bhagavad_gita_data(file_path: str) -> pd.DataFrame:
    """Load Bhagavad Gita CSV data."""
    print(f"\nLoading Bhagavad Gita from: {file_path}")
    df = pd.read_csv(file_path)
    print(f"✓ Loaded {len(df)} verses")
    
    # Create content field combining all text
    df['content'] = df.apply(
        lambda row: f"{row.get('Shloka', '')} {row.get('Transliteration', '')} {row.get('EngMeaning', '')} {row.get('HinMeaning', '')}",
        axis=1
    )
    
    # Create metadata
    df['source'] = 'Bhagavad Gita'
    df['source_file'] = 'Bhagwad_Gita.csv'
    
    return df

def load_ramayana_data(file_path: str) -> pd.DataFrame:
    """Load Ramayana CSV data."""
    print(f"\nLoading Ramayana from: {file_path}")
    df = pd.read_csv(file_path)
    print(f"✓ Loaded {len(df)} verses")
    
    # Create content field
    df['content'] = df['Translation'].fillna('')
    df['Shloka'] = df['Shloka'].fillna('')
    
    # Create metadata
    df['source'] = 'Ramayana'
    df['source_file'] = 'ramayana.csv'
    
    return df

def generate_embeddings(texts: list, model: SentenceTransformer, batch_size: int = 32):
    """Generate embeddings for texts in batches."""
    print(f"\nGenerating embeddings for {len(texts)} texts...")
    embeddings = []
    
    for i in tqdm(range(0, len(texts), batch_size), desc="Embedding batches"):
        batch = texts[i:i+batch_size]
        batch_embeddings = model.encode(batch, show_progress_bar=False)
        embeddings.extend(batch_embeddings)
    
    return np.array(embeddings)

def upsert_to_pinecone(index, documents: pd.DataFrame, embeddings: np.ndarray, source_name: str):
    """Upsert documents and embeddings to Pinecone."""
    print(f"\nUpserting {len(documents)} vectors from {source_name} to Pinecone...")
    
    vectors = []
    for i, row in documents.iterrows():
        # Create unique ID
        vector_id = f"{source_name.lower().replace(' ', '_')}_{i}"
        
        # Prepare metadata (only simple types)
        metadata = {
            'content': str(row.get('content', ''))[:1000],  # Limit content length
            'source': str(row.get('source', '')),
            'source_file': str(row.get('source_file', '')),
            'chapter': str(row.get('Chapter', '')),
            'verse': str(row.get('Verse', row.get('S.No', ''))),
        }
        
        # Add optional fields if they exist
        if 'Shloka' in row and pd.notna(row['Shloka']):
            metadata['sanskrit'] = str(row['Shloka'])[:500]
        if 'EngMeaning' in row and pd.notna(row['EngMeaning']):
            metadata['translation'] = str(row['EngMeaning'])[:500]
        if 'HinMeaning' in row and pd.notna(row['HinMeaning']):
            metadata['hindi_translation'] = str(row['HinMeaning'])[:500]
        
        vectors.append({
            'id': vector_id,
            'values': embeddings[i].tolist(),
            'metadata': metadata
        })
    
    # Upsert in batches
    batch_size = 100
    for i in tqdm(range(0, len(vectors), batch_size), desc="Upserting batches"):
        batch = vectors[i:i+batch_size]
        index.upsert(vectors=batch)
        time.sleep(0.1)  # Small delay to avoid rate limits
    
    print(f"✓ Successfully upserted {len(vectors)} vectors")

def verify_index(index):
    """Verify index stats."""
    print(f"\n{'='*60}")
    print("Verifying Index")
    print(f"{'='*60}\n")
    
    stats = index.describe_index_stats()
    print(f"Index Statistics:")
    print(f"  - Total vectors: {stats.total_vector_count}")
    print(f"  - Dimension: {stats.dimension}")
    print(f"  - Index fullness: {stats.index_fullness}")
    
    return stats.total_vector_count > 0

def main():
    """Main setup function."""
    print(f"\n{'='*60}")
    print("DivyaVaani Pinecone Index Setup")
    print(f"{'='*60}\n")
    
    # Initialize Pinecone
    api_key = os.getenv('PINECONE_API_KEY')
    if not api_key:
        print("❌ Error: PINECONE_API_KEY not found in environment")
        sys.exit(1)
    
    print("✓ Pinecone API key found")
    pc = Pinecone(api_key=api_key)
    
    # Create index
    index = create_index(pc)
    
    # Load embedding model
    print(f"\nLoading embedding model: {EMBEDDING_MODEL}")
    model = SentenceTransformer(EMBEDDING_MODEL)
    print("✓ Model loaded successfully")
    
    # Load and process Bhagavad Gita
    data_dir = Path(__file__).parent.parent / "data"
    gita_path = data_dir / "Bhagwad_Gita.csv"
    
    if gita_path.exists():
        gita_df = load_bhagavad_gita_data(str(gita_path))
        gita_embeddings = generate_embeddings(gita_df['content'].tolist(), model)
        upsert_to_pinecone(index, gita_df, gita_embeddings, "Bhagavad Gita")
    else:
        print(f"⚠ Warning: {gita_path} not found, skipping")
    
    # Load and process Ramayana
    ramayana_path = data_dir / "ramayana.csv"
    
    if ramayana_path.exists():
        ramayana_df = load_ramayana_data(str(ramayana_path))
        ramayana_embeddings = generate_embeddings(ramayana_df['content'].tolist(), model)
        upsert_to_pinecone(index, ramayana_df, ramayana_embeddings, "Ramayana")
    else:
        print(f"⚠ Warning: {ramayana_path} not found, skipping")
    
    # Verify
    if verify_index(index):
        print(f"\n{'='*60}")
        print("✓ Setup Complete!")
        print(f"{'='*60}\n")
        print("Your Pinecone index is ready. You can now start the backend:")
        print("  cd /home/yogeshsaini/DivyaVaani-ai/backend/scripts")
        print("  python3 run_api.py")
    else:
        print("\n❌ Error: Index verification failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
