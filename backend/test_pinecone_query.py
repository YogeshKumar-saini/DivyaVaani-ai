#!/usr/bin/env python3
"""Test Pinecone semantic search."""

import os
import numpy as np
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

# Load environment
load_dotenv()

print("🔧 Initializing...")
print("=" * 60)

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
index = pc.Index("divyavaani-verses")

# Load embedding model
print("\n📦 Loading embedding model...")
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# Test query
query = "What is dharma?"
print(f"\n🔍 Query: '{query}'")
print("=" * 60)

# Generate query embedding
print("\n⚙️  Generating query embedding...")
query_embedding = model.encode([query])[0].tolist()

# Search Pinecone
print("🔎 Searching Pinecone...")
results = index.query(
    vector=query_embedding,
    top_k=5,
    include_metadata=True
)

# Display results
print(f"\n✅ Found {len(results['matches'])} results:")
print("=" * 60)

for i, match in enumerate(results['matches'], 1):
    score = match['score']
    metadata = match.get('metadata', {})
    content = metadata.get('content', 'N/A')[:200]  # First 200 chars
    
    print(f"\n{i}. Score: {score:.4f}")
    print(f"   Source: {metadata.get('source_file', 'N/A')}")
    print(f"   Language: {metadata.get('language', 'N/A')}")
    print(f"   Content: {content}...")
    print("-" * 60)

# Get index stats
print("\n📊 Pinecone Index Stats:")
print("=" * 60)
stats = index.describe_index_stats()
print(f"Total vectors: {stats.total_vector_count}")
print(f"Dimension: {stats.dimension}")

print("\n✅ Pinecone is working correctly!")
