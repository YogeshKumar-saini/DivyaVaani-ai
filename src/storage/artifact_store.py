"""Artifact store for managing collection artifacts."""

import hashlib
import json
from pathlib import Path
from typing import Dict, Optional
from datetime import datetime
from src.utils.logger import log


class ArtifactStore:
    """Manages artifact storage and organization."""
    
    def __init__(self, base_dir: Path):
        """Initialize artifact store.
        
        Args:
            base_dir: Base directory for artifact storage
        """
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
    
    def get_collection_dir(self, collection_name: str) -> Path:
        """Get directory for collection artifacts.
        
        Args:
            collection_name: Name of collection
            
        Returns:
            Path to collection directory
        """
        collection_dir = self.base_dir / collection_name
        collection_dir.mkdir(parents=True, exist_ok=True)
        return collection_dir
    
    def get_artifact_path(
        self,
        collection_name: str,
        artifact_type: str,
        extension: str = ""
    ) -> Path:
        """Get path for a specific artifact.
        
        Args:
            collection_name: Name of collection
            artifact_type: Type of artifact (embeddings, faiss, bm25, etc.)
            extension: File extension (optional)
            
        Returns:
            Path to artifact file
        """
        collection_dir = self.get_collection_dir(collection_name)
        
        if extension:
            filename = f"{artifact_type}.{extension}"
        else:
            filename = artifact_type
        
        return collection_dir / filename
    
    def save_artifact_metadata(
        self,
        collection_name: str,
        artifact_type: str,
        metadata: Dict
    ) -> None:
        """Save metadata for an artifact.
        
        Args:
            collection_name: Name of collection
            artifact_type: Type of artifact
            metadata: Metadata dictionary
        """
        metadata_file = self.get_artifact_path(
            collection_name,
            f"{artifact_type}_metadata",
            "json"
        )
        
        metadata['created_at'] = datetime.now().isoformat()
        
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        log.debug(f"Saved metadata for {artifact_type} in {collection_name}")
    
    def get_artifact_metadata(
        self,
        collection_name: str,
        artifact_type: str
    ) -> Optional[Dict]:
        """Get metadata for an artifact.
        
        Args:
            collection_name: Name of collection
            artifact_type: Type of artifact
            
        Returns:
            Metadata dictionary or None if not found
        """
        metadata_file = self.get_artifact_path(
            collection_name,
            f"{artifact_type}_metadata",
            "json"
        )
        
        if not metadata_file.exists():
            return None
        
        try:
            with open(metadata_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            log.error(f"Error loading metadata: {e}")
            return None
    
    def calculate_checksum(self, file_path: Path) -> str:
        """Calculate SHA256 checksum for a file.
        
        Args:
            file_path: Path to file
            
        Returns:
            Hex digest of checksum
        """
        sha256 = hashlib.sha256()
        
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                sha256.update(chunk)
        
        return sha256.hexdigest()
    
    def verify_artifact_integrity(
        self,
        collection_name: str,
        artifact_type: str
    ) -> bool:
        """Verify artifact integrity using checksum.
        
        Args:
            collection_name: Name of collection
            artifact_type: Type of artifact
            
        Returns:
            True if integrity check passes
        """
        metadata = self.get_artifact_metadata(collection_name, artifact_type)
        
        if not metadata or 'checksum' not in metadata:
            log.warning(f"No checksum found for {artifact_type}")
            return False
        
        # Find artifact file
        collection_dir = self.get_collection_dir(collection_name)
        artifact_files = list(collection_dir.glob(f"{artifact_type}.*"))
        
        if not artifact_files:
            log.error(f"Artifact file not found: {artifact_type}")
            return False
        
        artifact_file = artifact_files[0]
        current_checksum = self.calculate_checksum(artifact_file)
        
        if current_checksum != metadata['checksum']:
            log.error(f"Checksum mismatch for {artifact_type}")
            return False
        
        log.info(f"Integrity check passed for {artifact_type}")
        return True
    
    def get_storage_usage(self, collection_name: str) -> Dict:
        """Get storage usage for a collection.
        
        Args:
            collection_name: Name of collection
            
        Returns:
            Dictionary with storage statistics
        """
        collection_dir = self.get_collection_dir(collection_name)
        
        total_size = 0
        file_count = 0
        artifacts = {}
        
        for file_path in collection_dir.rglob('*'):
            if file_path.is_file():
                size = file_path.stat().st_size
                total_size += size
                file_count += 1
                
                # Track by artifact type
                artifact_name = file_path.stem
                if artifact_name not in artifacts:
                    artifacts[artifact_name] = {
                        'size': 0,
                        'files': 0
                    }
                artifacts[artifact_name]['size'] += size
                artifacts[artifact_name]['files'] += 1
        
        return {
            'total_size_bytes': total_size,
            'total_size_mb': total_size / (1024 * 1024),
            'file_count': file_count,
            'artifacts': artifacts
        }
    
    def list_artifacts(self, collection_name: str) -> list:
        """List all artifacts for a collection.
        
        Args:
            collection_name: Name of collection
            
        Returns:
            List of artifact names
        """
        collection_dir = self.get_collection_dir(collection_name)
        
        if not collection_dir.exists():
            return []
        
        artifacts = set()
        for file_path in collection_dir.iterdir():
            if file_path.is_file():
                # Remove extension and metadata suffix
                name = file_path.stem
                if not name.endswith('_metadata'):
                    artifacts.add(name)
        
        return sorted(list(artifacts))
    
    def cleanup_old_artifacts(
        self,
        collection_name: str,
        keep_latest: int = 1
    ) -> int:
        """Clean up old artifact versions.
        
        Args:
            collection_name: Name of collection
            keep_latest: Number of latest versions to keep
            
        Returns:
            Number of files deleted
        """
        # This is a placeholder for versioning support
        # Currently we don't have versioning, so this is a no-op
        log.info(f"Cleanup not needed - no versioning implemented yet")
        return 0
