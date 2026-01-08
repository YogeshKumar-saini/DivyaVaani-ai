"""Build pipeline for creating all artifacts from comprehensive spiritual texts."""

import numpy as np
import pandas as pd
from pathlib import Path
from src.config import settings
from src.data.loader import ComprehensiveDataLoader
from src.embeddings import EmbeddingGenerator
from src.vectorstore import FAISSStore, ChromaStore, BM25Store
from src.utils.logger import log


class BuildPipeline:
    """Pipeline to build all artifacts from comprehensive spiritual text data."""

    def __init__(self):
        self.settings = settings
        self.settings.ensure_directories()

        # Use comprehensive data loader for all files
        self.data_loader = ComprehensiveDataLoader()
        # Use local model - online APIs not working (Cohere rate limits, HF 410 errors)
        self.embedding_generator = EmbeddingGenerator("sentence-transformers/all-MiniLM-L6-v2", use_api=False)
        # Using Pinecone cloud vector store only - no local FAISS/BM25/ChromaDB needed
        # self.faiss_store = FAISSStore(self.settings.faiss_index_path)
        # self.chroma_store = ChromaStore(self.settings.chroma_persist_dir, "verses")
        # self.bm25_store = BM25Store(str(self.settings.artifact_path / "bm25.pkl"))

        self.df = None
        self.embeddings = None

    def run(self):
        """Run the complete build pipeline."""
        log.info("=" * 60)
        log.info("Starting Comprehensive Build Pipeline")
        log.info("=" * 60)

        # Step 1: Load all data from all files
        log.info("\n[Step 1/6] Loading comprehensive data from all files...")
        self.df = self.data_loader.load_all_data()

        # Step 2: Generate embeddings
        log.info("\n[Step 2/6] Generating embeddings...")
        texts = self.df['content'].tolist()
        log.info(f"Processing {len(texts)} text segments from {len(self.df)} total entries")

        # Filter out empty texts
        valid_texts = []
        valid_indices = []
        for i, text in enumerate(texts):
            if text and len(text.strip()) > 10:  # Only keep substantial content
                valid_texts.append(text.strip())
                valid_indices.append(i)

        log.info(f"Found {len(valid_texts)} valid text segments for embedding")

        if not valid_texts:
            raise ValueError("No valid text content found for embedding")

        self.embeddings = self.embedding_generator.generate(valid_texts)

        # Filter dataframe to match valid embeddings
        self.df = self.df.iloc[valid_indices].reset_index(drop=True)

        # Save embeddings for reference
        embeddings_path = self.settings.artifact_path / "embeddings.npy"
        np.save(embeddings_path, self.embeddings)
        log.info(f"Embeddings saved to {embeddings_path}")

        # Step 3: Upload to Pinecone (cloud vector store)
        log.info("\n[Step 3/4] Uploading to Pinecone...")
        try:
            from pinecone import Pinecone, ServerlessSpec
            import os
            
            # Initialize Pinecone
            pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
            
            index_name = "divyavaani-verses"
            
            # Create index if it doesn't exist
            if index_name not in pc.list_indexes().names():
                log.info(f"Creating Pinecone index: {index_name}")
                pc.create_index(
                    name=index_name,
                    dimension=self.embeddings.shape[1],
                    metric='cosine',
                    spec=ServerlessSpec(cloud='aws', region='us-east-1')
                )
                log.info("Waiting for index to be ready...")
                import time
                time.sleep(10)  # Wait for index to initialize
            
            # Get index
            index = pc.Index(index_name)
            
            # Prepare vectors for upload
            vectors = []
            metadatas = self.df[['source_file', 'file_type', 'language', 'title', 'content']].to_dict(orient='records')
            
            for i in range(len(self.embeddings)):
                vectors.append({
                    'id': str(i),
                    'values': self.embeddings[i].tolist(),
                    'metadata': metadatas[i]
                })
            
            # Upload in batches
            batch_size = 100
            for i in range(0, len(vectors), batch_size):
                batch = vectors[i:i+batch_size]
                index.upsert(vectors=batch)
                if (i + batch_size) % 1000 == 0:
                    log.info(f"Uploaded {min(i+batch_size, len(vectors))}/{len(vectors)} vectors")
            
            log.info(f"Successfully uploaded {len(vectors)} vectors to Pinecone")
            
        except Exception as e:
            log.error(f"Failed to upload to Pinecone: {e}")
            log.warning("Continuing without Pinecone...")

        # Step 4: Save processed dataframe
        log.info("\n[Step 4/4] Saving processed dataframe...")
        df_path = self.settings.artifact_path / "verses.parquet"
        self.df.to_parquet(df_path, index=False)
        log.info(f"Dataframe saved to {df_path}")

        log.info("\n" + "=" * 60)
        log.info("Comprehensive Build Pipeline Completed Successfully!")
        log.info("=" * 60)
        log.info(f"\nArtifacts saved in: {self.settings.artifact_path}")
        log.info(f"Total text segments processed: {len(self.df)}")
        log.info(f"Files processed: {self.df['source_file'].nunique()}")
        log.info(f"Content languages: {', '.join(self.df['language'].unique())}")
        log.info(f"Embedding dimension: {self.embeddings.shape[1]}")

        # Show file breakdown
        file_counts = self.df.groupby(['file_type', 'source_file']).size().reset_index(name='count')
        log.info("\nFile Processing Summary:")
        for _, row in file_counts.iterrows():
            log.info(f"  {row['file_type'].upper()}: {row['source_file']} ({row['count']} segments)")


def main():
    """Main entry point for build pipeline."""
    pipeline = BuildPipeline()
    pipeline.run()


if __name__ == "__main__":
    main()
