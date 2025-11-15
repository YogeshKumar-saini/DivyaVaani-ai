"""Indexing stage for creating vector indices."""

import pandas as pd
from pathlib import Path
from typing import Any
from src.pipeline.stages.base import PipelineStage
from src.pipeline.models import (
    Collection,
    PipelineContext,
    StageResult,
    StageStatus,
    EmbeddedDocumentBatch,
    IndexedCollection
)
from src.utils.logger import log


class IndexingStage(PipelineStage):
    """Stage for creating vector indices (FAISS, BM25, ChromaDB)."""
    
    @property
    def name(self) -> str:
        """Stage name."""
        return "indexing"
    
    def validate_input(self, input_data: Any) -> bool:
        """Validate input data."""
        return isinstance(input_data, EmbeddedDocumentBatch)
    
    def execute(
        self,
        collection: Collection,
        input_data: EmbeddedDocumentBatch,
        context: PipelineContext
    ) -> StageResult:
        """Execute indexing stage.
        
        Args:
            collection: Collection being processed
            input_data: EmbeddedDocumentBatch from embedding stage
            context: Pipeline execution context
            
        Returns:
            StageResult with IndexedCollection as output
        """
        log.info(f"Starting indexing for collection: {collection.name}")
        
        documents = input_data.documents
        embeddings = input_data.embeddings
        errors = []
        warnings = []
        
        # Paths for indices
        faiss_path = context.artifact_dir / "faiss.index"
        bm25_path = context.artifact_dir / "bm25.pkl"
        chroma_dir = context.artifact_dir / "chroma"
        df_path = context.artifact_dir / "documents.parquet"
        
        log.info(f"Creating indices for {len(documents)} documents")
        
        # Create FAISS index
        faiss_index_path = None
        try:
            from src.vectorstore import FAISSStore
            faiss_store = FAISSStore(str(faiss_path))
            faiss_store.create_index(embeddings)
            faiss_store.save()
            faiss_index_path = faiss_path
            log.info(f"Created FAISS index: {faiss_path}")
        except Exception as e:
            error_msg = f"Error creating FAISS index: {str(e)}"
            log.error(error_msg)
            errors.append(error_msg)
        
        # Create BM25 index
        bm25_index_path = None
        try:
            from src.vectorstore import BM25Store
            texts = [doc.content for doc in documents]
            bm25_store = BM25Store(str(bm25_path))
            bm25_store.create_index(texts)
            bm25_store.save()
            bm25_index_path = bm25_path
            log.info(f"Created BM25 index: {bm25_path}")
        except Exception as e:
            error_msg = f"Error creating BM25 index: {str(e)}"
            log.error(error_msg)
            errors.append(error_msg)
        
        # Create ChromaDB collection
        chroma_collection_name = None
        try:
            from src.vectorstore import ChromaStore
            chroma_store = ChromaStore(str(chroma_dir))
            chroma_store.initialize()
            
            # Prepare data for ChromaDB
            texts = [doc.content for doc in documents]
            metadatas = [doc.metadata for doc in documents]
            ids = [doc.id for doc in documents]
            
            chroma_store.add_documents(texts, metadatas, ids)
            chroma_collection_name = collection.name
            log.info(f"Created ChromaDB collection: {chroma_collection_name}")
        except Exception as e:
            error_msg = f"Error creating ChromaDB collection: {str(e)}"
            log.error(error_msg)
            warnings.append(error_msg)  # ChromaDB is optional
        
        # Save documents as DataFrame
        try:
            # Convert documents to DataFrame
            doc_data = []
            for doc in documents:
                doc_dict = {
                    'id': doc.id,
                    'collection': doc.collection,
                    'content': doc.content,
                    **doc.metadata
                }
                doc_data.append(doc_dict)
            
            df = pd.DataFrame(doc_data)
            df.to_parquet(df_path, index=False)
            log.info(f"Saved documents DataFrame: {df_path}")
        except Exception as e:
            error_msg = f"Error saving documents DataFrame: {str(e)}"
            log.error(error_msg)
            errors.append(error_msg)
        
        # Check if critical indices were created
        if not faiss_index_path or not bm25_index_path:
            error_msg = "Failed to create required indices (FAISS or BM25)"
            log.error(error_msg)
            return StageResult(
                stage_name=self.name,
                status=StageStatus.FAILED,
                input_count=len(documents),
                output_count=0,
                execution_time=0,
                errors=errors + [error_msg]
            )
        
        # Create output
        output = IndexedCollection(
            collection_name=collection.name,
            document_count=len(documents),
            faiss_index_path=faiss_index_path,
            bm25_index_path=bm25_index_path,
            chroma_collection_name=chroma_collection_name,
            metadata={
                'embedding_dimension': embeddings.shape[1],
                'documents_path': str(df_path)
            }
        )
        
        log.info(f"Indexing complete: {len(documents)} documents indexed")
        
        return StageResult(
            stage_name=self.name,
            status=StageStatus.COMPLETED,
            input_count=len(documents),
            output_count=len(documents),
            execution_time=0,
            warnings=warnings,
            output_data=output,
            metadata={
                'faiss_index': str(faiss_index_path) if faiss_index_path else None,
                'bm25_index': str(bm25_index_path) if bm25_index_path else None,
                'chroma_collection': chroma_collection_name,
                'documents_path': str(df_path)
            }
        )
