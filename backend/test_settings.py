#!/usr/bin/env python3
"""Test script to verify settings are loaded correctly."""

import os
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

# Force reload of dotenv
from dotenv import load_dotenv
load_dotenv(override=True)

print(f"USE_API_EMBEDDINGS from env: {os.getenv('USE_API_EMBEDDINGS')}")
print(f"EMBEDDING_MODEL from env: {os.getenv('EMBEDDING_MODEL')}")
print(f"COHERE_API_KEY present: {bool(os.getenv('COHERE_API_KEY'))}")

# Now import settings
from src.config import settings
print(f"\nSettings use_api_embeddings: {settings.use_api_embeddings}")
print(f"Settings embedding_model: {settings.embedding_model}")
print(f"Settings cohere_api_key present: {bool(settings.cohere_api_key)}")
