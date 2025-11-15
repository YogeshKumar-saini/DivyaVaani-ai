"""Collection data access API."""

import pandas as pd
from pathlib import Path
from typing import List, Optional, Dict, Any
from src.pipeline.models import Document
from src.utils.logger import log


class CollectionAPI:
    """API for accessing collection data."""
    
    def __init__(self, artifact_dir: Path):
        """Initialize collection API.
        
        Args:
            artifact_dir: Base directory for artifacts
        """
        self.artifact_dir = Path(artifact_dir)
    
    def get_documents(
        self,
        collection_name: str,
        filters: Optional[Dict[str, Any]] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Document]:
        """Get documents from collection.
        
        Args:
            collection_name: Name of collection
            filters: Optional filters to apply
            limit: Maximum number of documents to return
            offset: Number of documents to skip
            
        Returns:
            List of Document objects
        """
        collection_dir = self.artifact_dir / collection_name
        df_path = collection_dir / "documents.parquet"
        
        if not df_path.exists():
            log.warning(f"Documents file not found for collection: {collection_name}")
            return []
        
        try:
            # Load documents
            df = pd.read_parquet(df_path)
            
            # Apply filters
            if filters:
                for key, value in filters.items():
                    if key in df.columns:
                        df = df[df[key] == value]
            
            # Apply pagination
            df = df.iloc[offset:offset + limit]
            
            # Convert to Document objects
            documents = []
            for _, row in df.iterrows():
                # Separate metadata from standard fields
                metadata = {}
                for col in df.columns:
                    if col not in ['id', 'collection', 'content']:
                        metadata[col] = row[col]
                
                doc = Document(
                    id=row.get('id', ''),
                    collection=row.get('collection', collection_name),
                    content=row.get('content', ''),
                    metadata=metadata
                )
                documents.append(doc)
            
            log.info(f"Retrieved {len(documents)} documents from {collection_name}")
            return documents
            
        except Exception as e:
            log.error(f"Error loading documents from {collection_name}: {e}")
            return []
    
    def get_document_by_id(
        self,
        collection_name: str,
        doc_id: str
    ) -> Optional[Document]:
        """Get specific document by ID.
        
        Args:
            collection_name: Name of collection
            doc_id: Document ID
            
        Returns:
            Document object or None if not found
        """
        collection_dir = self.artifact_dir / collection_name
        df_path = collection_dir / "documents.parquet"
        
        if not df_path.exists():
            log.warning(f"Documents file not found for collection: {collection_name}")
            return None
        
        try:
            df = pd.read_parquet(df_path)
            
            # Filter by ID
            doc_df = df[df['id'] == doc_id]
            
            if doc_df.empty:
                log.warning(f"Document {doc_id} not found in {collection_name}")
                return None
            
            row = doc_df.iloc[0]
            
            # Separate metadata
            metadata = {}
            for col in df.columns:
                if col not in ['id', 'collection', 'content']:
                    metadata[col] = row[col]
            
            doc = Document(
                id=row.get('id', ''),
                collection=row.get('collection', collection_name),
                content=row.get('content', ''),
                metadata=metadata
            )
            
            return doc
            
        except Exception as e:
            log.error(f"Error loading document {doc_id} from {collection_name}: {e}")
            return None
    
    def count_documents(self, collection_name: str) -> int:
        """Count documents in collection.
        
        Args:
            collection_name: Name of collection
            
        Returns:
            Number of documents
        """
        collection_dir = self.artifact_dir / collection_name
        df_path = collection_dir / "documents.parquet"
        
        if not df_path.exists():
            return 0
        
        try:
            df = pd.read_parquet(df_path)
            return len(df)
        except Exception as e:
            log.error(f"Error counting documents in {collection_name}: {e}")
            return 0
    
    def get_metadata_fields(self, collection_name: str) -> List[str]:
        """Get list of metadata fields in collection.
        
        Args:
            collection_name: Name of collection
            
        Returns:
            List of metadata field names
        """
        collection_dir = self.artifact_dir / collection_name
        df_path = collection_dir / "documents.parquet"
        
        if not df_path.exists():
            return []
        
        try:
            df = pd.read_parquet(df_path)
            # Exclude standard fields
            standard_fields = {'id', 'collection', 'content'}
            return [col for col in df.columns if col not in standard_fields]
        except Exception as e:
            log.error(f"Error getting metadata fields from {collection_name}: {e}")
            return []
