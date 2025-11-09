"""Example usage of the Bhagavad Gita RAG system."""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import numpy as np
import pandas as pd
from src.config import settings
from src.data import DataLoader
from src.embeddings import EmbeddingGenerator
from src.vectorstore import FAISSStore, BM25Store
from src.retrieval import HybridRetriever
from src.rag import QASystem
from src.utils.logger import log


def example_basic_usage():
    """Example: Basic usage of the system."""
    log.info("=" * 60)
    log.info("Example 1: Basic Usage")
    log.info("=" * 60)
    
    # Load artifacts
    df = pd.read_parquet(settings.artifact_path / "verses.parquet")
    embeddings = np.load(settings.artifact_path / "embeddings.npy")
    
    # Initialize components
    embedding_generator = EmbeddingGenerator(settings.embedding_model)
    embedding_generator.load_model()
    
    faiss_store = FAISSStore(settings.faiss_index_path)
    faiss_store.load()
    
    bm25_store = BM25Store(str(settings.artifact_path / "bm25.pkl"))
    bm25_store.load()
    
    # Create retriever
    retriever = HybridRetriever(
        faiss_store=faiss_store,
        bm25_store=bm25_store,
        embedding_generator=embedding_generator,
        dataframe=df,
        embeddings=embeddings
    )
    
    # Test retrieval
    query = "What is karma yoga?"
    results = retriever.retrieve(query, top_k=3)
    
    log.info(f"\nQuery: {query}")
    log.info(f"Found {len(results)} results:\n")
    
    for i, result in enumerate(results, 1):
        log.info(f"{i}. Verse: {result['verse']}")
        log.info(f"   Score: {result['score']:.4f}")
        log.info(f"   Text: {result['text'][:200]}...\n")


def example_qa_system():
    """Example: Using the QA system."""
    log.info("=" * 60)
    log.info("Example 2: QA System")
    log.info("=" * 60)
    
    # Load artifacts
    df = pd.read_parquet(settings.artifact_path / "verses.parquet")
    embeddings = np.load(settings.artifact_path / "embeddings.npy")
    
    # Initialize components
    embedding_generator = EmbeddingGenerator(settings.embedding_model)
    embedding_generator.load_model()
    
    faiss_store = FAISSStore(settings.faiss_index_path)
    faiss_store.load()
    
    bm25_store = BM25Store(str(settings.artifact_path / "bm25.pkl"))
    bm25_store.load()
    
    retriever = HybridRetriever(
        faiss_store=faiss_store,
        bm25_store=bm25_store,
        embedding_generator=embedding_generator,
        dataframe=df,
        embeddings=embeddings
    )
    
    # Create QA system
    qa_system = QASystem(
        retriever=retriever,
        openai_api_key=settings.openai_api_key,
        temperature=settings.llm_temperature,
        max_tokens=settings.llm_max_tokens
    )
    
    # Ask questions
    questions = [
        "What is the main teaching of the Bhagavad Gita?",
        "What does Krishna say about duty?",
        "How should one perform actions according to the Gita?"
    ]
    
    for question in questions:
        log.info(f"\nQuestion: {question}")
        result = qa_system.ask(question, user_id="example_user")
        log.info(f"Answer: {result['answer']}")
        log.info(f"Sources: {', '.join(result['sources'])}\n")


def example_api_client():
    """Example: Using the API client."""
    log.info("=" * 60)
    log.info("Example 3: API Client")
    log.info("=" * 60)
    
    import requests
    
    # Make sure API is running
    api_url = f"http://{settings.api_host}:{settings.api_port}"
    
    try:
        # Health check
        response = requests.get(f"{api_url}/health")
        log.info(f"Health check: {response.json()}")
        
        # Query
        question = "What is dharma?"
        response = requests.post(
            f"{api_url}/query",
            json={"user_id": "example_user", "question": question}
        )
        
        result = response.json()
        log.info(f"\nQuestion: {question}")
        log.info(f"Answer: {result['answer']}")
        log.info(f"Sources: {', '.join(result['sources'])}")
        
    except requests.exceptions.ConnectionError:
        log.error("API server is not running. Start it with: python scripts/run_api.py")


if __name__ == "__main__":
    # Check if artifacts exist
    if not settings.artifact_path.exists():
        log.error("Artifacts not found. Please run: python scripts/build.py")
        sys.exit(1)
    
    # Run examples
    example_basic_usage()
    print("\n" + "=" * 60 + "\n")
    
    if settings.openai_api_key:
        example_qa_system()
        print("\n" + "=" * 60 + "\n")
        example_api_client()
    else:
        log.warning("OpenAI API key not set. Skipping QA examples.")
