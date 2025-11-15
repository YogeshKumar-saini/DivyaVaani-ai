"""Ingestion stage for loading documents from files."""

from pathlib import Path
from typing import Any, List
from src.pipeline.stages.base import PipelineStage
from src.pipeline.models import (
    Collection,
    PipelineContext,
    StageResult,
    StageStatus,
    RawDocumentBatch,
    Document,
    ProcessorConfig
)
from src.pipeline.processors import get_global_registry
from src.utils.logger import log


class IngestionStage(PipelineStage):
    """Stage for ingesting documents from source files."""
    
    @property
    def name(self) -> str:
        """Stage name."""
        return "ingestion"
    
    def validate_input(self, input_data: Any) -> bool:
        """Validate input data.
        
        For ingestion stage, input_data should be None (starts the pipeline).
        """
        return input_data is None
    
    def execute(
        self,
        collection: Collection,
        input_data: Any,
        context: PipelineContext
    ) -> StageResult:
        """Execute ingestion stage.
        
        Args:
            collection: Collection being processed
            input_data: None (ingestion is first stage)
            context: Pipeline execution context
            
        Returns:
            StageResult with RawDocumentBatch as output
        """
        log.info(f"Starting document ingestion for collection: {collection.name}")
        
        errors = []
        warnings = []
        all_documents: List[Document] = []
        
        # Get processor registry
        registry = get_global_registry()
        
        # Get source files from collection config
        source_files = collection.config.source_files
        
        if not source_files:
            error_msg = "No source files specified in collection config"
            log.error(error_msg)
            return StageResult(
                stage_name=self.name,
                status=StageStatus.FAILED,
                input_count=0,
                output_count=0,
                execution_time=0,
                errors=[error_msg]
            )
        
        log.info(f"Processing {len(source_files)} source file(s)")
        
        # Process each source file
        for i, file_path in enumerate(source_files, 1):
            file_path = Path(file_path)
            
            log.info(f"[{i}/{len(source_files)}] Processing file: {file_path}")
            
            try:
                # Check if file exists
                if not file_path.exists():
                    error_msg = f"File not found: {file_path}"
                    log.error(error_msg)
                    errors.append(error_msg)
                    continue
                
                # Get appropriate processor
                processor = registry.get_processor(file_path)
                
                if not processor:
                    error_msg = f"No processor found for file: {file_path}"
                    log.error(error_msg)
                    errors.append(error_msg)
                    continue
                
                log.info(f"Using processor: {processor.__class__.__name__}")
                
                # Create processor config
                processor_config = ProcessorConfig(
                    schema_mapping=collection.config.schema_mapping,
                    encoding='utf-8',
                    delimiter=collection.config.metadata.get('delimiter'),
                    sheet_name=collection.config.metadata.get('sheet_name'),
                    metadata={'collection_name': collection.name}
                )
                
                # Process file
                documents = processor.process(file_path, processor_config)
                
                log.info(f"Extracted {len(documents)} documents from {file_path.name}")
                all_documents.extend(documents)
                
            except Exception as e:
                error_msg = f"Error processing file {file_path}: {str(e)}"
                log.error(error_msg, exc_info=True)
                errors.append(error_msg)
                continue
        
        # Check if we got any documents
        if not all_documents:
            error_msg = "No documents extracted from any source files"
            log.error(error_msg)
            return StageResult(
                stage_name=self.name,
                status=StageStatus.FAILED,
                input_count=len(source_files),
                output_count=0,
                execution_time=0,
                errors=errors + [error_msg]
            )
        
        # Create output batch
        output_batch = RawDocumentBatch(
            documents=all_documents,
            source_file=source_files[0] if len(source_files) == 1 else Path("multiple_files"),
            processor_type=collection.config.processor_type,
            metadata={
                'total_files': len(source_files),
                'files_processed': len(source_files) - len(errors),
                'files_failed': len(errors)
            }
        )
        
        # Determine status
        if errors and len(all_documents) == 0:
            status = StageStatus.FAILED
        elif errors:
            status = StageStatus.COMPLETED
            warnings.append(f"Processed with {len(errors)} file errors")
        else:
            status = StageStatus.COMPLETED
        
        log.info(f"Ingestion complete: {len(all_documents)} documents from {len(source_files)} files")
        
        return StageResult(
            stage_name=self.name,
            status=status,
            input_count=len(source_files),
            output_count=len(all_documents),
            execution_time=0,  # Will be set by base class
            errors=errors,
            warnings=warnings,
            output_data=output_batch,
            metadata={
                'files_processed': len(source_files) - len(errors),
                'total_documents': len(all_documents)
            }
        )
