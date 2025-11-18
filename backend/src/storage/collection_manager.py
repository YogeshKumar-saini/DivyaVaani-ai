"""Collection manager for managing document collections."""

import json
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

from src.pipeline.models import (
    Collection,
    CollectionConfig,
    CollectionStatus,
    CollectionMetadata,
    CollectionStats
)
from src.utils.logger import log


class CollectionManager:
    """Manages document collections and their metadata."""
    
    def __init__(self, base_dir: Path):
        """Initialize collection manager.
        
        Args:
            base_dir: Base directory for collection storage
        """
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self.collections: Dict[str, Collection] = {}
        self._load_collections()
    
    def create_collection(
        self,
        name: str,
        config: CollectionConfig
    ) -> Collection:
        """Create a new collection.
        
        Args:
            name: Collection name
            config: Collection configuration
            
        Returns:
            Created Collection instance
        """
        if name in self.collections:
            log.warning(f"Collection {name} already exists, returning existing")
            return self.collections[name]
        
        collection = Collection(
            name=name,
            config=config,
            status=CollectionStatus.PENDING,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        self.collections[name] = collection
        self._save_collection(collection)
        
        log.info(f"Created collection: {name}")
        return collection
    
    def get_collection(self, name: str) -> Optional[Collection]:
        """Get collection by name.
        
        Args:
            name: Collection name
            
        Returns:
            Collection instance or None if not found
        """
        return self.collections.get(name)
    
    def list_collections(self) -> List[CollectionMetadata]:
        """List all collections.
        
        Returns:
            List of CollectionMetadata
        """
        metadata_list = []
        
        for collection in self.collections.values():
            metadata = CollectionMetadata(
                name=collection.name,
                status=collection.status,
                document_count=collection.document_count,
                created_at=collection.created_at,
                updated_at=collection.updated_at,
                source_files=[str(f) for f in collection.config.source_files],
                processor_type=collection.config.processor_type,
                embedding_model=collection.config.embedding_model
            )
            metadata_list.append(metadata)
        
        return metadata_list
    
    def update_collection_status(
        self,
        name: str,
        status: CollectionStatus,
        error_message: Optional[str] = None
    ) -> None:
        """Update collection processing status.
        
        Args:
            name: Collection name
            status: New status
            error_message: Optional error message
        """
        collection = self.get_collection(name)
        if not collection:
            log.error(f"Collection not found: {name}")
            return
        
        collection.status = status
        collection.updated_at = datetime.now()
        
        if error_message:
            collection.error_message = error_message
        
        self._save_collection(collection)
        log.info(f"Updated collection {name} status to {status.value}")
    
    def get_collection_stats(self, name: str) -> Optional[CollectionStats]:
        """Get collection statistics.
        
        Args:
            name: Collection name
            
        Returns:
            CollectionStats or None if not found
        """
        collection = self.get_collection(name)
        if not collection:
            return None
        
        # Calculate stats from artifacts
        collection_dir = self.base_dir / name
        
        total_size = 0
        if collection_dir.exists():
            for file in collection_dir.rglob('*'):
                if file.is_file():
                    total_size += file.stat().st_size
        
        # Get embedding dimension if available
        embedding_dim = None
        embeddings_file = collection_dir / "embeddings.npy"
        if embeddings_file.exists():
            try:
                import numpy as np
                embeddings = np.load(embeddings_file)
                embedding_dim = embeddings.shape[1]
            except:
                pass
        
        # Count indices
        index_count = 0
        if (collection_dir / "faiss.index").exists():
            index_count += 1
        if (collection_dir / "bm25.pkl").exists():
            index_count += 1
        if (collection_dir / "chroma").exists():
            index_count += 1
        
        # Get last processed time from manifest
        last_processed = None
        processing_time = None
        manifest_file = collection_dir / "manifest.json"
        if manifest_file.exists():
            try:
                with open(manifest_file, 'r') as f:
                    manifest = json.load(f)
                    last_processed = datetime.fromisoformat(manifest.get('completed_at'))
                    processing_time = manifest.get('execution_time')
            except:
                pass
        
        return CollectionStats(
            name=name,
            document_count=collection.document_count,
            total_size_bytes=total_size,
            embedding_dimension=embedding_dim,
            index_count=index_count,
            last_processed=last_processed,
            processing_time_seconds=processing_time
        )
    
    def delete_collection(self, name: str) -> bool:
        """Delete a collection.
        
        Args:
            name: Collection name
            
        Returns:
            True if deleted, False if not found
        """
        if name not in self.collections:
            log.warning(f"Collection not found: {name}")
            return False
        
        # Remove from memory
        del self.collections[name]
        
        # Remove manifest file
        manifest_file = self._get_manifest_path(name)
        if manifest_file.exists():
            manifest_file.unlink()
        
        log.info(f"Deleted collection: {name}")
        return True
    
    def _save_collection(self, collection: Collection) -> None:
        """Save collection metadata to disk.
        
        Args:
            collection: Collection to save
        """
        manifest_file = self._get_manifest_path(collection.name)
        manifest_file.parent.mkdir(parents=True, exist_ok=True)
        
        data = {
            'name': collection.name,
            'status': collection.status.value,
            'created_at': collection.created_at.isoformat(),
            'updated_at': collection.updated_at.isoformat(),
            'document_count': collection.document_count,
            'error_message': collection.error_message,
            'config': {
                'source_files': [str(f) for f in collection.config.source_files],
                'processor_type': collection.config.processor_type,
                'schema_mapping': collection.config.schema_mapping,
                'embedding_model': collection.config.embedding_model,
                'chunk_size': collection.config.chunk_size,
                'chunk_overlap': collection.config.chunk_overlap,
                'metadata': collection.config.metadata,
                'enabled': collection.config.enabled
            }
        }
        
        with open(manifest_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def _load_collections(self) -> None:
        """Load collections from disk."""
        if not self.base_dir.exists():
            return
        
        for manifest_file in self.base_dir.glob('*/collection_manifest.json'):
            try:
                with open(manifest_file, 'r') as f:
                    data = json.load(f)
                
                config = CollectionConfig(
                    name=data['name'],
                    source_files=[Path(f) for f in data['config']['source_files']],
                    processor_type=data['config']['processor_type'],
                    schema_mapping=data['config']['schema_mapping'],
                    embedding_model=data['config']['embedding_model'],
                    chunk_size=data['config'].get('chunk_size'),
                    chunk_overlap=data['config'].get('chunk_overlap'),
                    metadata=data['config'].get('metadata', {}),
                    enabled=data['config'].get('enabled', True)
                )
                
                collection = Collection(
                    name=data['name'],
                    config=config,
                    status=CollectionStatus(data['status']),
                    created_at=datetime.fromisoformat(data['created_at']),
                    updated_at=datetime.fromisoformat(data['updated_at']),
                    document_count=data.get('document_count', 0),
                    error_message=data.get('error_message')
                )
                
                self.collections[collection.name] = collection
                log.debug(f"Loaded collection: {collection.name}")
                
            except Exception as e:
                log.error(f"Error loading collection from {manifest_file}: {e}")
    
    def _get_manifest_path(self, collection_name: str) -> Path:
        """Get path to collection manifest file.
        
        Args:
            collection_name: Collection name
            
        Returns:
            Path to manifest file
        """
        return self.base_dir / collection_name / "collection_manifest.json"
