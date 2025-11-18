"""Embedding stage for generating vector embeddings."""

import numpy as np
from typing import Any
from src.pipeline.stages.base import PipelineStage
from src.pipeline.models import (
    Collection,
    PipelineContext,
    StageResult,
    StageStatus,
    CleanedDocumentBatch,
    EmbeddedDocumentBatch
)
from src.utils.logger import log


class EmbeddingStage(PipelineStage):
    """Stage for generating embeddings for documents."""
    
    def __init__(self, embedding_service=None):
        """Initialize embedding stage.
        
        Args:
            embedding_service: Optional EmbeddingService instance
        """
        super().__init__()
        self.embedding_service = embedding_service
    
    @property
    def name(self) -> str:
        """Stage name."""
        return "embedding"
    
    def validate_input(self, input_data: Any) -> bool:
        """Validate input data."""
        return isinstance(input_data, CleanedDocumentBatch)
    
    def execute(
        self,
        collection: Collection,
        input_data: CleanedDocumentBatch,
        context: PipelineContext
    ) -> StageResult:
        """Execute embedding stage.
        
        Args:
            collection: Collection being processed
            input_data: CleanedDocumentBatch from cleaning
            context: Pipeline execution context
            
        Returns:
            StageResult with EmbeddedDocumentBatch as output
        """
        log.info(f"Starting embedding generation for collection: {collection.name}")
        
        documents = input_data.documents
        
        # Get or create embedding service
        if not self.embedding_service:
            from src.embeddings import EmbeddingService
            self.embedding_service = EmbeddingService(
                model_name=collection.config.embedding_model,
                use_api=False,  # Use local by default
                enable_cache=True
            )
        
        log.info(f"Generating embeddings for {len(documents)} documents")
        log.info(f"Using model: {collection.config.embedding_model}")

        try:
            embeddings = []

            # Generate embeddings based on document structure
            for doc in documents:
                if doc.structured_content:
                    # Use structured embedding generation
                    embedding = self.embedding_service.generator.generate_structured(doc.structured_content)
                else:
                    # Fallback to text content
                    embedding = self.embedding_service.generate_single(doc.content)

                embeddings.append(embedding)

            embeddings = np.array(embeddings)
            log.info(f"Generated embeddings with shape: {embeddings.shape}")

            # Attach embeddings to documents
            for doc, embedding in zip(documents, embeddings):
                doc.embedding = embedding
            
            # Save embeddings to artifact directory
            embeddings_path = context.artifact_dir / "embeddings.npy"
            np.save(embeddings_path, embeddings)
            log.info(f"Saved embeddings to {embeddings_path}")
            
            # Create output batch
            output_batch = EmbeddedDocumentBatch(
                documents=documents,
                embeddings=embeddings,
                embedding_model=collection.config.embedding_model,
                cache_hits=0,  # TODO: Implement caching
                cache_misses=len(documents),
                metadata={
                    'embedding_dimension': embeddings.shape[1],
                    'embeddings_path': str(embeddings_path)
                }
            )
            
            log.info(f"Embedding generation complete: {len(documents)} documents")
            
            return StageResult(
                stage_name=self.name,
                status=StageStatus.COMPLETED,
                input_count=len(documents),
                output_count=len(documents),
                execution_time=0,
                output_data=output_batch,
                metadata={
                    'embedding_dimension': embeddings.shape[1],
                    'embedding_model': collection.config.embedding_model,
                    'artifact_path': str(embeddings_path)
                }
            )
            
        except Exception as e:
            error_msg = f"Error generating embeddings: {str(e)}"
            log.error(error_msg, exc_info=True)
            return StageResult(
                stage_name=self.name,
                status=StageStatus.FAILED,
                input_count=len(documents),
                output_count=0,
                execution_time=0,
                errors=[error_msg]
            )
