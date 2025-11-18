"""Pipeline orchestrator for coordinating stage execution."""

from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

from src.pipeline.models import (
    Collection,
    CollectionStatus,
    PipelineResult,
    PipelineContext,
    StageResult,
    StageStatus
)
from src.pipeline.stages.base import PipelineStage
from src.monitoring.metrics import MetricsCollector
from src.utils.logger import log


class PipelineConfig:
    """Configuration for pipeline execution."""
    
    def __init__(
        self,
        artifact_dir: Path,
        temp_dir: Path,
        enable_intermediate_persistence: bool = True,
        enable_metrics: bool = True
    ):
        self.artifact_dir = Path(artifact_dir)
        self.temp_dir = Path(temp_dir)
        self.enable_intermediate_persistence = enable_intermediate_persistence
        self.enable_metrics = enable_metrics
        
        # Ensure directories exist
        self.artifact_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir.mkdir(parents=True, exist_ok=True)


class PipelineOrchestrator:
    """Orchestrates pipeline execution for document collections."""
    
    def __init__(self, config: PipelineConfig):
        self.config = config
        self.stages: List[PipelineStage] = []
        self.stage_map: Dict[str, PipelineStage] = {}
        self.metrics = MetricsCollector() if config.enable_metrics else None
    
    def register_stage(self, stage: PipelineStage) -> None:
        """Register a pipeline stage.
        
        Args:
            stage: Pipeline stage to register
        """
        if stage.name in self.stage_map:
            log.warning(f"Stage {stage.name} already registered, replacing")
        
        self.stages.append(stage)
        self.stage_map[stage.name] = stage
        log.info(f"Registered pipeline stage: {stage.name}")
    
    def execute(
        self,
        collection: Collection,
        start_stage: Optional[str] = None,
        end_stage: Optional[str] = None
    ) -> PipelineResult:
        """Execute pipeline for a collection.
        
        Args:
            collection: Collection to process
            start_stage: Optional stage to start from (inclusive)
            end_stage: Optional stage to end at (inclusive)
            
        Returns:
            PipelineResult with execution details
        """
        log.info("=" * 80)
        log.info(f"Starting pipeline execution for collection: {collection.name}")
        log.info("=" * 80)
        
        started_at = datetime.now()
        
        # Update collection status
        collection.status = CollectionStatus.PROCESSING
        collection.updated_at = datetime.now()
        
        # Create pipeline context
        context = self._create_context(collection)
        
        # Start metrics timer
        if self.metrics:
            self.metrics.start_timer("pipeline.execution_time", {"collection": collection.name})
        
        # Determine stages to execute
        stages_to_run = self._get_stages_to_run(start_stage, end_stage)
        
        if not stages_to_run:
            error_msg = f"No stages to execute (start: {start_stage}, end: {end_stage})"
            log.error(error_msg)
            return self._create_error_result(collection, error_msg, started_at)
        
        log.info(f"Executing {len(stages_to_run)} stages: {[s.name for s in stages_to_run]}")
        
        # Execute stages
        stages_completed = []
        stages_failed = []
        errors = []
        current_data = None
        documents_processed = 0
        
        for i, stage in enumerate(stages_to_run, 1):
            log.info(f"\n[Stage {i}/{len(stages_to_run)}] {stage.name}")
            log.info("-" * 80)
            
            try:
                # Execute stage
                result = stage.run(collection, current_data, context)
                
                # Store result in context
                context.stage_results[stage.name] = result
                
                # Track metrics
                if self.metrics:
                    self.metrics.increment_counter(
                        "pipeline.stage_executions",
                        labels={"stage": stage.name, "status": result.status.value}
                    )
                    self.metrics.record_histogram(
                        "pipeline.stage_duration",
                        result.execution_time,
                        labels={"stage": stage.name}
                    )
                
                # Check result status
                if result.status == StageStatus.FAILED:
                    stages_failed.append(stage.name)
                    errors.extend(result.errors)
                    log.error(f"Stage {stage.name} failed, stopping pipeline")
                    break
                elif result.status == StageStatus.COMPLETED:
                    stages_completed.append(stage.name)
                    current_data = result.output_data
                    documents_processed = result.output_count
                    
                    # Persist intermediate results
                    if self.config.enable_intermediate_persistence:
                        self._persist_intermediate_result(collection, stage.name, result)
                else:
                    log.warning(f"Stage {stage.name} completed with status: {result.status}")
                    stages_completed.append(stage.name)
                    current_data = result.output_data
                
                # Add warnings to errors list
                if result.warnings:
                    errors.extend([f"[WARNING] {w}" for w in result.warnings])
                
            except Exception as e:
                error_msg = f"Unexpected error in stage {stage.name}: {str(e)}"
                log.error(error_msg, exc_info=True)
                stages_failed.append(stage.name)
                errors.append(error_msg)
                break
        
        # Stop metrics timer
        execution_time = 0.0
        if self.metrics:
            execution_time = self.metrics.stop_timer(
                "pipeline.execution_time",
                {"collection": collection.name}
            )
        else:
            execution_time = (datetime.now() - started_at).total_seconds()
        
        # Determine final status
        if stages_failed:
            final_status = "failed"
            collection.status = CollectionStatus.FAILED
            collection.error_message = "; ".join(errors[:3])  # Store first 3 errors
        elif len(stages_completed) == len(stages_to_run):
            final_status = "success"
            collection.status = CollectionStatus.COMPLETED
            collection.document_count = documents_processed
        else:
            final_status = "partial"
            collection.status = CollectionStatus.PARTIAL
        
        collection.updated_at = datetime.now()
        
        # Create result
        result = PipelineResult(
            collection_name=collection.name,
            status=final_status,
            stages_completed=stages_completed,
            stages_failed=stages_failed,
            documents_processed=documents_processed,
            execution_time=execution_time,
            errors=errors,
            artifacts=self._collect_artifacts(context),
            started_at=started_at,
            completed_at=datetime.now()
        )
        
        # Generate manifest
        self._generate_manifest(collection, result, context)
        
        # Export metrics
        if self.metrics:
            metrics_path = context.artifact_dir / "metrics.json"
            self.metrics.export_json(metrics_path)
            log.info(f"Metrics exported to {metrics_path}")
        
        log.info("\n" + "=" * 80)
        log.info(f"Pipeline execution completed: {final_status.upper()}")
        log.info(f"Collection: {collection.name}")
        log.info(f"Stages completed: {len(stages_completed)}/{len(stages_to_run)}")
        log.info(f"Documents processed: {documents_processed}")
        log.info(f"Execution time: {execution_time:.2f}s")
        if errors:
            log.info(f"Errors: {len(errors)}")
        log.info("=" * 80)
        
        return result
    
    def execute_stage(
        self,
        stage_name: str,
        collection: Collection,
        input_data: Any
    ) -> StageResult:
        """Execute a specific stage.
        
        Args:
            stage_name: Name of stage to execute
            collection: Collection to process
            input_data: Input data for the stage
            
        Returns:
            StageResult with execution details
        """
        if stage_name not in self.stage_map:
            raise ValueError(f"Stage not found: {stage_name}")
        
        stage = self.stage_map[stage_name]
        context = self._create_context(collection)
        
        log.info(f"Executing single stage: {stage_name}")
        result = stage.run(collection, input_data, context)
        
        return result
    
    def list_stages(self) -> List[str]:
        """List all registered stages.
        
        Returns:
            List of stage names
        """
        return [stage.name for stage in self.stages]
    
    def _create_context(self, collection: Collection) -> PipelineContext:
        """Create pipeline context for execution.
        
        Args:
            collection: Collection being processed
            
        Returns:
            PipelineContext instance
        """
        artifact_dir = self.config.artifact_dir / collection.name
        temp_dir = self.config.temp_dir / collection.name
        
        artifact_dir.mkdir(parents=True, exist_ok=True)
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        return PipelineContext(
            collection=collection,
            artifact_dir=artifact_dir,
            temp_dir=temp_dir
        )
    
    def _get_stages_to_run(
        self,
        start_stage: Optional[str],
        end_stage: Optional[str]
    ) -> List[PipelineStage]:
        """Get list of stages to execute.
        
        Args:
            start_stage: Optional stage to start from
            end_stage: Optional stage to end at
            
        Returns:
            List of stages to execute
        """
        if not start_stage and not end_stage:
            return self.stages
        
        start_idx = 0
        end_idx = len(self.stages)
        
        if start_stage:
            try:
                start_idx = next(i for i, s in enumerate(self.stages) if s.name == start_stage)
            except StopIteration:
                log.error(f"Start stage not found: {start_stage}")
                return []
        
        if end_stage:
            try:
                end_idx = next(i for i, s in enumerate(self.stages) if s.name == end_stage) + 1
            except StopIteration:
                log.error(f"End stage not found: {end_stage}")
                return []
        
        return self.stages[start_idx:end_idx]
    
    def _persist_intermediate_result(
        self,
        collection: Collection,
        stage_name: str,
        result: StageResult
    ) -> None:
        """Persist intermediate stage result.
        
        Args:
            collection: Collection being processed
            stage_name: Name of the stage
            result: Stage result to persist
        """
        try:
            intermediate_dir = self.config.temp_dir / collection.name / "intermediate"
            intermediate_dir.mkdir(parents=True, exist_ok=True)
            
            result_file = intermediate_dir / f"{stage_name}.json"
            
            result_data = {
                "stage_name": result.stage_name,
                "status": result.status.value,
                "input_count": result.input_count,
                "output_count": result.output_count,
                "execution_time": result.execution_time,
                "errors": result.errors,
                "warnings": result.warnings,
                "metadata": result.metadata,
                "timestamp": datetime.now().isoformat()
            }
            
            with open(result_file, 'w') as f:
                json.dump(result_data, f, indent=2)
            
            log.debug(f"Persisted intermediate result to {result_file}")
            
        except Exception as e:
            log.warning(f"Failed to persist intermediate result: {e}")
    
    def _collect_artifacts(self, context: PipelineContext) -> Dict[str, Path]:
        """Collect artifact paths from context.
        
        Args:
            context: Pipeline context
            
        Returns:
            Dictionary of artifact names to paths
        """
        artifacts = {}
        
        # Collect from stage results
        for stage_name, result in context.stage_results.items():
            if result.metadata.get("artifact_path"):
                artifacts[stage_name] = Path(result.metadata["artifact_path"])
        
        return artifacts
    
    def _generate_manifest(
        self,
        collection: Collection,
        result: PipelineResult,
        context: PipelineContext
    ) -> None:
        """Generate manifest file documenting pipeline execution.
        
        Args:
            collection: Collection that was processed
            result: Pipeline execution result
            context: Pipeline context
        """
        try:
            manifest_path = context.artifact_dir / "manifest.json"
            
            manifest = {
                "collection_name": collection.name,
                "status": result.status,
                "started_at": result.started_at.isoformat(),
                "completed_at": result.completed_at.isoformat(),
                "execution_time": result.execution_time,
                "documents_processed": result.documents_processed,
                "stages": {
                    "completed": result.stages_completed,
                    "failed": result.stages_failed
                },
                "stage_results": {
                    name: {
                        "status": res.status.value,
                        "input_count": res.input_count,
                        "output_count": res.output_count,
                        "execution_time": res.execution_time,
                        "errors": res.errors,
                        "warnings": res.warnings
                    }
                    for name, res in context.stage_results.items()
                },
                "artifacts": {name: str(path) for name, path in result.artifacts.items()},
                "errors": result.errors
            }
            
            with open(manifest_path, 'w') as f:
                json.dump(manifest, f, indent=2)
            
            log.info(f"Generated manifest: {manifest_path}")
            
        except Exception as e:
            log.warning(f"Failed to generate manifest: {e}")
    
    def _create_error_result(
        self,
        collection: Collection,
        error_message: str,
        started_at: datetime
    ) -> PipelineResult:
        """Create an error result.
        
        Args:
            collection: Collection being processed
            error_message: Error message
            started_at: Start time
            
        Returns:
            PipelineResult with error status
        """
        return PipelineResult(
            collection_name=collection.name,
            status="failed",
            stages_completed=[],
            stages_failed=[],
            documents_processed=0,
            execution_time=0.0,
            errors=[error_message],
            artifacts={},
            started_at=started_at,
            completed_at=datetime.now()
        )
