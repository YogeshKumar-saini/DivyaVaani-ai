"""Validation stage for checking document integrity."""

from typing import Any
from src.pipeline.stages.base import PipelineStage
from src.pipeline.models import (
    Collection,
    PipelineContext,
    StageResult,
    StageStatus,
    RawDocumentBatch,
    ValidatedDocumentBatch,
    ValidationResult,
    Document
)
from src.utils.logger import log


class ValidationStage(PipelineStage):
    """Stage for validating document structure and content."""
    
    @property
    def name(self) -> str:
        """Stage name."""
        return "validation"
    
    def validate_input(self, input_data: Any) -> bool:
        """Validate input data."""
        return isinstance(input_data, RawDocumentBatch)
    
    def execute(
        self,
        collection: Collection,
        input_data: RawDocumentBatch,
        context: PipelineContext
    ) -> StageResult:
        """Execute validation stage.
        
        Args:
            collection: Collection being processed
            input_data: RawDocumentBatch from ingestion
            context: Pipeline execution context
            
        Returns:
            StageResult with ValidatedDocumentBatch as output
        """
        log.info(f"Starting document validation for collection: {collection.name}")
        
        documents = input_data.documents
        errors = []
        warnings = []
        valid_documents = []
        invalid_count = 0
        
        log.info(f"Validating {len(documents)} documents")
        
        # Validate each document
        for i, doc in enumerate(documents):
            validation_errors = self._validate_document(doc, i)
            
            if validation_errors:
                invalid_count += 1
                errors.extend(validation_errors)
                log.debug(f"Document {i} ({doc.id}): Validation failed - {validation_errors}")
            else:
                valid_documents.append(doc)
        
        # Create validation result
        validation_result = ValidationResult(
            is_valid=invalid_count == 0,
            errors=errors,
            warnings=warnings,
            validated_count=len(valid_documents),
            invalid_count=invalid_count
        )
        
        # Check if we have any valid documents
        if not valid_documents:
            error_msg = "No valid documents after validation"
            log.error(error_msg)
            return StageResult(
                stage_name=self.name,
                status=StageStatus.FAILED,
                input_count=len(documents),
                output_count=0,
                execution_time=0,
                errors=errors + [error_msg]
            )
        
        # Create output batch
        output_batch = ValidatedDocumentBatch(
            documents=valid_documents,
            validation_result=validation_result,
            metadata={
                'total_validated': len(documents),
                'valid_count': len(valid_documents),
                'invalid_count': invalid_count
            }
        )
        
        # Determine status
        if invalid_count > 0:
            warnings.append(f"Validation completed with {invalid_count} invalid documents")
            log.warning(f"Validation: {len(valid_documents)} valid, {invalid_count} invalid")
        
        status = StageStatus.COMPLETED
        
        log.info(f"Validation complete: {len(valid_documents)}/{len(documents)} documents valid")
        
        return StageResult(
            stage_name=self.name,
            status=status,
            input_count=len(documents),
            output_count=len(valid_documents),
            execution_time=0,
            errors=errors if invalid_count == len(documents) else [],
            warnings=warnings,
            output_data=output_batch,
            metadata={
                'valid_count': len(valid_documents),
                'invalid_count': invalid_count,
                'validation_rate': len(valid_documents) / len(documents) if documents else 0
            }
        )
    
    def _validate_document(self, doc: Document, index: int) -> list:
        """Validate a single document.
        
        Args:
            doc: Document to validate
            index: Document index for error reporting
            
        Returns:
            List of validation errors (empty if valid)
        """
        errors = []
        
        # Check required fields
        if not doc.id:
            errors.append(f"Document {index}: Missing ID")
        
        if not doc.collection:
            errors.append(f"Document {index}: Missing collection name")
        
        if not doc.content or not doc.content.strip():
            errors.append(f"Document {index} ({doc.id}): Empty or missing content")
        
        # Check content length (should have some meaningful content)
        if doc.content and len(doc.content.strip()) < 3:
            errors.append(f"Document {index} ({doc.id}): Content too short (< 3 characters)")
        
        # Check metadata
        if not isinstance(doc.metadata, dict):
            errors.append(f"Document {index} ({doc.id}): Invalid metadata type")
        
        # Check for duplicate IDs (this would need to be done at batch level)
        # For now, just validate ID format
        if doc.id and len(doc.id) < 1:
            errors.append(f"Document {index}: Invalid ID format")
        
        return errors
