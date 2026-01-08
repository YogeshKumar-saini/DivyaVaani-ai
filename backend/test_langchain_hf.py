#!/usr/bin/env python3
"""Test LangChain HuggingFace Inference API embeddings."""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_KEY = os.getenv('HUGGINGFACE_API_KEY')
print(f"API Key found: {bool(API_KEY)}")
if API_KEY:
    print(f"API Key (first 10 chars): {API_KEY[:10]}...")

try:
    from langchain_huggingface import HuggingFaceEndpointEmbeddings
    
    print("\nInitializing LangChain HuggingFace embeddings...")
    embeddings = HuggingFaceEndpointEmbeddings(
        model="sentence-transformers/all-MiniLM-L6-v2",
        huggingfacehub_api_token=API_KEY
    )
    
    print("Generating embedding for test query...")
    vector = embeddings.embed_query("No local embedding models")
    
    print(f"\n✅ SUCCESS!")
    print(f"Embedding vector size: {len(vector)}")
    print(f"First 5 values: {vector[:5]}")
    
except Exception as e:
    print(f"\n❌ ERROR: {type(e).__name__}")
    print(f"Message: {str(e)}")
    import traceback
    traceback.print_exc()
