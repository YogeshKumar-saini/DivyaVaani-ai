#!/usr/bin/env python3
"""Complete system test - verifies all components."""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.pipeline import PipelineOrchestrator, PipelineConfig
from src.pipeline.stages import (
    IngestionStage,
    ValidationStage,
    CleaningStage,
    EmbeddingStage,
    IndexingStage
)
from src.pipeline.processors import register_default_processors
from src.storage import CollectionManager, ArtifactStore
from src.config.collections import load_collections_from_yaml
from src.embeddings import EmbeddingService, EmbeddingCache
from src.data_access import CollectionAPI, RetrievalAPI
from src.monitoring import HealthCheck, MetricsCollector
from src.utils.logger import log


def test_component(name: str, test_func):
    """Test a component and report results."""
    try:
        print(f"\n{'='*60}")
        print(f"Testing: {name}")
        print(f"{'='*60}")
        test_func()
        print(f"✓ {name} - PASSED")
        return True
    except Exception as e:
        print(f"✗ {name} - FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_processors():
    """Test document processors."""
    register_default_processors()
    from src.pipeline.processors import get_global_registry
    
    registry = get_global_registry()
    processors = registry.list_processors()
    formats = registry.list_supported_formats()
    
    print(f"  Registered processors: {processors}")
    print(f"  Supported formats: {formats}")
    
    assert len(processors) >= 2, "Should have at least 2 processors"
    assert '.csv' in formats, "Should support CSV"
    assert '.xlsx' in formats or '.xls' in formats, "Should support Excel"


def test_pipeline_stages():
    """Test pipeline stages."""
    stages = [
        IngestionStage(),
        ValidationStage(),
        CleaningStage(),
        EmbeddingStage(),
        IndexingStage()
    ]
    
    print(f"  Pipeline stages: {[s.name for s in stages]}")
    
    assert len(stages) == 5, "Should have 5 stages"
    assert all(hasattr(s, 'execute') for s in stages), "All stages should have execute method"


def test_collection_manager():
    """Test collection manager."""
    manager = CollectionManager(Path("artifacts"))
    collections = manager.list_collections()
    
    print(f"  Collections found: {len(collections)}")
    for coll in collections:
        print(f"    - {coll.name}: {coll.status.value}")


def test_artifact_store():
    """Test artifact store."""
    store = ArtifactStore(Path("artifacts"))
    
    # Test path generation
    path = store.get_artifact_path("test_collection", "embeddings", "npy")
    print(f"  Artifact path: {path}")
    
    # Test storage usage
    usage = store.get_storage_usage("test_collection")
    print(f"  Storage usage: {usage}")


def test_embedding_service():
    """Test embedding service with cache."""
    service = EmbeddingService(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        use_api=False,
        enable_cache=True
    )
    
    # Test single embedding
    text = "test text"
    embedding = service.generate_single(text)
    print(f"  Generated embedding shape: {embedding.shape}")
    
    # Test cache
    stats = service.get_cache_stats()
    print(f"  Cache stats: {stats}")
    
    assert embedding.shape[0] > 0, "Embedding should have dimensions"


def test_data_access_apis():
    """Test data access APIs."""
    # Collection API
    coll_api = CollectionAPI(Path("artifacts"))
    print(f"  CollectionAPI initialized")
    
    # Retrieval API
    embedding_service = EmbeddingService(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        use_api=False,
        enable_cache=True
    )
    
    retrieval_api = RetrievalAPI(
        artifact_dir=Path("artifacts"),
        embedding_service=embedding_service
    )
    print(f"  RetrievalAPI initialized")


def test_monitoring():
    """Test monitoring components."""
    # Metrics
    metrics = MetricsCollector()
    metrics.increment_counter("test_counter")
    metrics.set_gauge("test_gauge", 42.0)
    
    summary = metrics.get_summary()
    print(f"  Metrics summary: {summary}")
    
    # Health checks
    health = HealthCheck(Path("artifacts"))
    results = health.check_all()
    overall = health.get_overall_status(results)
    
    print(f"  Health check results:")
    for component, result in results.items():
        print(f"    {component}: {result.status.value}")
    print(f"  Overall status: {overall.value}")


def test_configuration():
    """Test configuration loading."""
    configs = load_collections_from_yaml(Path("config/collections.yaml"))
    
    print(f"  Loaded {len(configs)} collection configurations")
    for name, config in configs.items():
        status = "enabled" if config.enabled else "disabled"
        print(f"    - {name}: {status}")
    
    assert len(configs) > 0, "Should load at least one configuration"


def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("COMPLETE SYSTEM TEST")
    print("="*60)
    print("\nTesting all components of the scalable pipeline architecture...")
    
    tests = [
        ("Document Processors", test_processors),
        ("Pipeline Stages", test_pipeline_stages),
        ("Collection Manager", test_collection_manager),
        ("Artifact Store", test_artifact_store),
        ("Embedding Service", test_embedding_service),
        ("Data Access APIs", test_data_access_apis),
        ("Monitoring System", test_monitoring),
        ("Configuration Loading", test_configuration),
    ]
    
    results = []
    for name, test_func in tests:
        results.append(test_component(name, test_func))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"\nTests Passed: {passed}/{total}")
    
    if passed == total:
        print("\n✓ ALL TESTS PASSED!")
        print("\nThe system is fully functional and ready to use.")
        print("\nNext steps:")
        print("  1. Process a collection: python cli.py run --collection bhagavad_gita")
        print("  2. Check health: python cli.py health")
        print("  3. Try examples: python example_usage.py")
        sys.exit(0)
    else:
        print(f"\n✗ {total - passed} TEST(S) FAILED")
        print("\nSome components may not be working correctly.")
        sys.exit(1)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n✗ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
