#!/usr/bin/env python3
"""Test Hugging Face API key and embedding endpoint."""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_KEY = os.getenv('HUGGINGFACE_API_KEY')
print(f"API Key found: {bool(API_KEY)}")
if API_KEY:
    print(f"API Key (first 10 chars): {API_KEY[:10]}...")

# Test the API
API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"
headers = {"Authorization": f"Bearer {API_KEY}"}

payload = {
    "inputs": "Test Hugging Face embeddings"
}

print(f"\nTesting API endpoint: {API_URL}")
print("Making request...")

try:
    response = requests.post(API_URL, headers=headers, json=payload, timeout=30)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:200]}...")
    
    if response.status_code == 200:
        embeddings = response.json()
        print(f"\n✅ SUCCESS! Embedding vector size: {len(embeddings[0])}")
    else:
        print(f"\n❌ FAILED with status {response.status_code}")
        print(f"Error: {response.text}")
        
except Exception as e:
    print(f"\n❌ ERROR: {e}")
