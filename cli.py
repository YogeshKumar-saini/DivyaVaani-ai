#!/usr/bin/env python3
"""CLI tool for managing the document processing pipeline."""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

import click
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


@click.group()
def cli():
    """Document Processing Pipeline CLI"""
    pass


@cli.command()
@click.option('--collection', '-c', required=True, help='Collection name to process')
@click.option('--start-stage', '-s', help='Stage to start from')
@click.option('--end-stage', '-e', help='Stage to end at')
@click.option('--config', default='config/collections.yaml', help='Path to collections config file')
def run(collection, start_stage, end_stage, config):
    """Run the pipeline for a collection."""
    click.echo(f"Running pipeline for collection: {collection}")
    
    # Register processors
    register_default_processors()
    
    # Load collection configurations
    config_path = Path(config)
    if not config_path.exists():
        click.echo(f"Error: Config file not found: {config_path}", err=True)
        sys.exit(1)
    
    configs = load_collections_from_yaml(config_path)
    
    if collection not in configs:
        click.echo(f"Error: Collection '{collection}' not found in config", err=True)
        click.echo(f"Available collections: {', '.join(configs.keys())}")
        sys.exit(1)
    
    collection_config = configs[collection]
    
    if not collection_config.enabled:
        click.echo(f"Warning: Collection '{collection}' is disabled in config")
        if not click.confirm("Do you want to continue anyway?"):
            sys.exit(0)
    
    # Initialize collection manager
    collection_manager = CollectionManager(Path("artifacts"))
    
    # Create or get collection
    coll = collection_manager.get_collection(collection)
    if not coll:
        coll = collection_manager.create_collection(collection, collection_config)
    
    # Create pipeline orchestrator
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
    
    # Execute pipeline
    try:
        result = orchestrator.execute(
            collection=coll,
            start_stage=start_stage,
            end_stage=end_stage
        )
        
        # Update collection status
        collection_manager.update_collection_status(
            collection,
            coll.status,
            coll.error_message
        )
        
        # Display results
        click.echo("\n" + "=" * 80)
        click.echo("Pipeline Execution Complete")
        click.echo("=" * 80)
        click.echo(f"Status: {result.status.upper()}")
        click.echo(f"Documents processed: {result.documents_processed}")
        click.echo(f"Execution time: {result.execution_time:.2f}s")
        click.echo(f"Stages completed: {len(result.stages_completed)}/{len(result.stages_completed) + len(result.stages_failed)}")
        
        if result.errors:
            click.echo(f"\nErrors ({len(result.errors)}):")
            for error in result.errors[:5]:  # Show first 5 errors
                click.echo(f"  - {error}")
        
        if result.status == "success":
            click.echo(f"\nArtifacts saved in: artifacts/{collection}/")
            sys.exit(0)
        else:
            sys.exit(1)
            
    except Exception as e:
        click.echo(f"Error: {str(e)}", err=True)
        log.error(f"Pipeline execution failed: {e}", exc_info=True)
        sys.exit(1)


@cli.command()
@click.option('--config', default='config/collections.yaml', help='Path to collections config file')
def list_collections(config):
    """List all configured collections."""
    config_path = Path(config)
    
    if not config_path.exists():
        click.echo(f"Error: Config file not found: {config_path}", err=True)
        sys.exit(1)
    
    configs = load_collections_from_yaml(config_path)
    
    if not configs:
        click.echo("No collections found in config")
        return
    
    click.echo("\nConfigured Collections:")
    click.echo("=" * 80)
    
    for name, config in configs.items():
        status = "✓ enabled" if config.enabled else "✗ disabled"
        click.echo(f"\n{name} ({status})")
        click.echo(f"  Processor: {config.processor_type}")
        click.echo(f"  Source files: {len(config.source_files)}")
        click.echo(f"  Embedding model: {config.embedding_model}")


@cli.command()
@click.option('--collection', '-c', required=True, help='Collection name')
def status(collection):
    """Show status of a collection."""
    collection_manager = CollectionManager(Path("artifacts"))
    
    coll = collection_manager.get_collection(collection)
    
    if not coll:
        click.echo(f"Collection '{collection}' not found")
        sys.exit(1)
    
    stats = collection_manager.get_collection_stats(collection)
    
    click.echo(f"\nCollection: {collection}")
    click.echo("=" * 80)
    click.echo(f"Status: {coll.status.value}")
    click.echo(f"Documents: {coll.document_count}")
    click.echo(f"Created: {coll.created_at}")
    click.echo(f"Updated: {coll.updated_at}")
    
    if stats:
        click.echo(f"\nStatistics:")
        click.echo(f"  Total size: {stats.total_size_bytes / 1024 / 1024:.2f} MB")
        if stats.embedding_dimension:
            click.echo(f"  Embedding dimension: {stats.embedding_dimension}")
        click.echo(f"  Indices created: {stats.index_count}")
        if stats.last_processed:
            click.echo(f"  Last processed: {stats.last_processed}")
        if stats.processing_time_seconds:
            click.echo(f"  Processing time: {stats.processing_time_seconds:.2f}s")
    
    if coll.error_message:
        click.echo(f"\nError: {coll.error_message}")


@cli.command()
def list_stages():
    """List all available pipeline stages."""
    stages = [
        "ingestion - Load documents from source files",
        "validation - Validate document structure",
        "cleaning - Clean and normalize text",
        "embedding - Generate vector embeddings",
        "indexing - Create search indices"
    ]
    
    click.echo("\nAvailable Pipeline Stages:")
    click.echo("=" * 80)
    for stage in stages:
        click.echo(f"  {stage}")


@cli.command()
def health():
    """Check system health."""
    from src.monitoring import HealthCheck
    
    click.echo("\nSystem Health Check")
    click.echo("=" * 80)
    
    health_check = HealthCheck(Path("artifacts"))
    results = health_check.check_all()
    overall = health_check.get_overall_status(results)
    
    # Display results
    for component, result in results.items():
        status_icon = {
            "healthy": "✓",
            "degraded": "⚠",
            "unhealthy": "✗",
            "unknown": "?"
        }.get(result.status.value, "?")
        
        click.echo(f"\n{status_icon} {component.upper()}: {result.status.value}")
        click.echo(f"  {result.message}")
        
        if result.details:
            for key, value in result.details.items():
                click.echo(f"  {key}: {value}")
    
    # Overall status
    click.echo("\n" + "=" * 80)
    overall_icon = {
        "healthy": "✓",
        "degraded": "⚠",
        "unhealthy": "✗",
        "unknown": "?"
    }.get(overall.value, "?")
    
    click.echo(f"{overall_icon} Overall Status: {overall.value.upper()}")
    click.echo("=" * 80)
    
    # Exit code based on status
    if overall.value == "unhealthy":
        sys.exit(1)
    elif overall.value == "degraded":
        sys.exit(2)
    else:
        sys.exit(0)


if __name__ == '__main__':
    cli()
