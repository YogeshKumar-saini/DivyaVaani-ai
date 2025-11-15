#!/usr/bin/env python3
"""Quick test script for the pipeline system."""

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
from src.storage import CollectionManager
from src.config.collections import load_collections_from_yaml
from src.utils.logger import log


def test_pipeline():
    """Test the pipeline with a small collection."""
    
    print("=" * 80)
    print("Pipeline System Test")
    print("=" * 80)
    
    # Register processors
    print("\n1. Registering document processors...")
    register_default_processors()
    print("   ✓ CSV and Excel processors registered")
    
    # Load configurations
    print("\n2. Loading collection configurations...")
    configs = load_collections_from_yaml(Path("config/collections.yaml"))
    print(f"   ✓ Loaded {len(configs)} collection configurations")
    
    for name, config in configs.items():
        status = "enabled" if config.enabled else "disabled"
        print(f"     - {name} ({status})")
    
    # Initialize collection manager
    print("\n3. Initializing collection manager...")
    collection_manager = CollectionManager(Path("artifacts"))
    print("   ✓ Collection manager initialized")
    
    # Create pipeline orchestrator
    print("\n4. Creating pipeline orchestrator...")
    pipeline_config = PipelineConfig(
        artifact_dir=Path("artifacts"),
        temp_dir=Path("temp"),
        enable_intermediate_persistence=True,
        enable_metrics=True
    )
    
    orchestrator = PipelineOrchestrator(pipeline_config)
    
    # Register stages
    orchestrator.register_stage(IngestionStage())
    orchestrator.register_stage(ValidationStage())
    orchestrator.register_stage(CleaningStage())
    orchestrator.register_stage(EmbeddingStage())
    orchestrator.register_stage(IndexingStage())
    
    print(f"   ✓ Registered {len(orchestrator.stages)} pipeline stages")
    for stage in orchestrator.stages:
        print(f"     - {stage.name}")
    
    print("\n" + "=" * 80)
    print("System Test Complete!")
    print("=" * 80)
    print("\nThe pipeline system is ready to use.")
    print("\nTo process a collection, run:")
    print("  python cli.py run --collection bhagavad_gita")
    print("\nTo list all collections, run:")
    print("  python cli.py list-collections")
    print("\n" + "=" * 80)


if __name__ == '__main__':
    try:
        test_pipeline()
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        log.error(f"Test failed: {e}", exc_info=True)
        sys.exit(1)
