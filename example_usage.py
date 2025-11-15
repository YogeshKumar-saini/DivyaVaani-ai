#!/usr/bin/env python3
"""Example usage of the new pipeline system and data access APIs."""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.data_access import CollectionAPI, RetrievalAPI
from src.embeddings import EmbeddingService
from src.storage import CollectionManager


def example_collection_api():
    """Example: Using Collection API to access documents."""
    print("\n" + "=" * 80)
    print("Example 1: Collection API - Accessing Documents")
    print("=" * 80)
    
    # Initialize API
    api = CollectionAPI(artifact_dir=Path("artifacts"))
    
    # Get documents from a collection
    print("\n1. Getting documents from Bhagavad Gita...")
    documents = api.get_documents(
        collection_name="bhagavad_gita",
        limit=5
    )
    
    print(f"   Retrieved {len(documents)} documents")
    if documents:
        print(f"\n   First document:")
        print(f"   ID: {documents[0].id}")
        print(f"   Content: {documents[0].content[:100]}...")
        print(f"   Metadata: {list(documents[0].metadata.keys())}")
    
    # Get document by ID
    if documents:
        print(f"\n2. Getting specific document by ID...")
        doc = api.get_document_by_id(
            collection_name="bhagavad_gita",
            doc_id=documents[0].id
        )
        if doc:
            print(f"   Found document: {doc.id}")
    
    # Count documents
    print(f"\n3. Counting documents...")
    count = api.count_documents("bhagavad_gita")
    print(f"   Total documents in Bhagavad Gita: {count}")
    
    # Get metadata fields
    print(f"\n4. Getting metadata fields...")
    fields = api.get_metadata_fields("bhagavad_gita")
    print(f"   Metadata fields: {fields}")


def example_retrieval_api():
    """Example: Using Retrieval API for search."""
    print("\n" + "=" * 80)
    print("Example 2: Retrieval API - Vector Search")
    print("=" * 80)
    
    # Initialize embedding service
    print("\n1. Initializing embedding service...")
    embedding_service = EmbeddingService(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        use_api=False,
        enable_cache=True
    )
    
    # Initialize retrieval API
    api = RetrievalAPI(
        artifact_dir=Path("artifacts"),
        embedding_service=embedding_service
    )
    
    # Perform vector search
    print("\n2. Searching for 'dharma and duty'...")
    results = api.search(
        query="dharma and duty",
        collections=["bhagavad_gita"],
        top_k=3
    )
    
    print(f"   Found {len(results)} results:")
    for result in results:
        print(f"\n   Rank {result.rank}:")
        print(f"   Score: {result.score:.4f}")
        print(f"   Content: {result.content[:150]}...")
    
    # Perform hybrid search
    print("\n3. Performing hybrid search (vector + BM25)...")
    results = api.hybrid_search(
        query="karma yoga",
        collections=["bhagavad_gita"],
        top_k=3
    )
    
    print(f"   Found {len(results)} results:")
    for result in results:
        print(f"\n   Rank {result.rank}:")
        print(f"   Score: {result.score:.4f}")
        print(f"   Content: {result.content[:150]}...")


def example_collection_manager():
    """Example: Using Collection Manager."""
    print("\n" + "=" * 80)
    print("Example 3: Collection Manager - Managing Collections")
    print("=" * 80)
    
    # Initialize manager
    manager = CollectionManager(Path("artifacts"))
    
    # List all collections
    print("\n1. Listing all collections...")
    collections = manager.list_collections()
    print(f"   Found {len(collections)} collections:")
    for coll in collections:
        print(f"   - {coll.name}: {coll.status.value} ({coll.document_count} documents)")
    
    # Get collection stats
    if collections:
        print(f"\n2. Getting stats for {collections[0].name}...")
        stats = manager.get_collection_stats(collections[0].name)
        if stats:
            print(f"   Documents: {stats.document_count}")
            print(f"   Size: {stats.total_size_bytes / 1024 / 1024:.2f} MB")
            if stats.embedding_dimension:
                print(f"   Embedding dimension: {stats.embedding_dimension}")
            print(f"   Indices: {stats.index_count}")


def example_embedding_cache():
    """Example: Using Embedding Service with Cache."""
    print("\n" + "=" * 80)
    print("Example 4: Embedding Service - Caching")
    print("=" * 80)
    
    # Initialize service with cache
    print("\n1. Initializing embedding service with cache...")
    service = EmbeddingService(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        use_api=False,
        enable_cache=True
    )
    
    # Generate embeddings (first time - cache miss)
    print("\n2. Generating embeddings (first time)...")
    texts = ["dharma", "karma", "yoga"]
    embeddings1 = service.generate_batch(texts)
    print(f"   Generated embeddings with shape: {embeddings1.shape}")
    
    stats1 = service.get_cache_stats()
    print(f"   Cache stats: {stats1['hits']} hits, {stats1['misses']} misses")
    
    # Generate same embeddings (second time - cache hit)
    print("\n3. Generating same embeddings (second time)...")
    embeddings2 = service.generate_batch(texts)
    print(f"   Generated embeddings with shape: {embeddings2.shape}")
    
    stats2 = service.get_cache_stats()
    print(f"   Cache stats: {stats2['hits']} hits, {stats2['misses']} misses")
    print(f"   Cache hit rate: {stats2['hit_rate']:.2%}")


def main():
    """Run all examples."""
    print("\n" + "=" * 80)
    print("Pipeline System - Usage Examples")
    print("=" * 80)
    print("\nNote: These examples require that you've already processed")
    print("at least one collection using: python cli.py run --collection bhagavad_gita")
    
    try:
        # Check if data exists
        if not Path("artifacts/bhagavad_gita/documents.parquet").exists():
            print("\n⚠️  Warning: Bhagavad Gita collection not processed yet.")
            print("   Run this first: python cli.py run --collection bhagavad_gita")
            print("\n   Showing examples anyway (some may fail)...")
        
        # Run examples
        example_collection_api()
        example_retrieval_api()
        example_collection_manager()
        example_embedding_cache()
        
        print("\n" + "=" * 80)
        print("Examples Complete!")
        print("=" * 80)
        print("\nYou can now use these APIs to build features like:")
        print("  - QA systems")
        print("  - Search engines")
        print("  - Analytics dashboards")
        print("  - Recommendation systems")
        print("\n" + "=" * 80)
        
    except Exception as e:
        print(f"\n❌ Error running examples: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
