#!/usr/bin/env python3
"""Upload embeddings to Pinecone."""

import os
import numpy as np
import pandas as pd
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
import time

# Load environment
load_dotenv()

print("Loading embeddings and data...")
embeddings = np.load('artifacts/embeddings.npy')
df = pd.read_parquet('artifacts/verses.parquet')

print(f"Loaded {len(embeddings)} embeddings with dimension {embeddings.shape[1]}")
print(f"Loaded {len(df)} records from dataframe")

# Initialize Pinecone
print("\nInitializing Pinecone...")
pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))

index_name = "divyavaani-verses"

# Create index if it doesn't exist
if index_name not in pc.list_indexes().names():
    print(f"Creating Pinecone index: {index_name}")
    pc.create_index(
        name=index_name,
        dimension=embeddings.shape[1],
        metric='cosine',
        spec=ServerlessSpec(cloud='aws', region='us-east-1')
    )
    print("Waiting for index to be ready...")
    time.sleep(10)
else:
    print(f"Index '{index_name}' already exists")

# Get index
index = pc.Index(index_name)

# Prepare vectors
print("\nPreparing vectors for upload...")
vectors = []
metadatas = df[['source_file', 'file_type', 'language', 'title', 'content']].to_dict(orient='records')

for i in range(len(embeddings)):
    vectors.append({
        'id': str(i),
        'values': embeddings[i].tolist(),
        'metadata': metadatas[i]
    })

# Upload in batches
print(f"\nUploading {len(vectors)} vectors to Pinecone...")
batch_size = 100
for i in range(0, len(vectors), batch_size):
    batch = vectors[i:i+batch_size]
    index.upsert(vectors=batch)
    if (i + batch_size) % 1000 == 0 or i + batch_size >= len(vectors):
        print(f"Uploaded {min(i+batch_size, len(vectors))}/{len(vectors)} vectors")

print(f"\n✅ Successfully uploaded {len(vectors)} vectors to Pinecone!")

# Get index stats
stats = index.describe_index_stats()
print(f"\nPinecone Index Stats:")
print(f"  Total vectors: {stats.total_vector_count}")
print(f"  Dimension: {stats.dimension}")
