"""Collection configuration loader."""

import yaml
import os
from pathlib import Path
from typing import Dict, List, Optional
from src.pipeline.models import CollectionConfig
from src.utils.logger import log


class CollectionConfigLoader:
    """Loader for collection configurations from YAML files."""
    
    def __init__(self, config_path: Optional[Path] = None):
        """Initialize configuration loader.
        
        Args:
            config_path: Path to collections config file (YAML)
        """
        self.config_path = config_path or Path("config/collections.yaml")
    
    def load_all(self) -> Dict[str, CollectionConfig]:
        """Load all collection configurations.
        
        Returns:
            Dictionary mapping collection names to CollectionConfig
        """
        if not self.config_path.exists():
            log.warning(f"Collection config file not found: {self.config_path}")
            return {}
        
        try:
            with open(self.config_path, 'r') as f:
                data = yaml.safe_load(f)
            
            if not data or 'collections' not in data:
                log.warning("No collections found in config file")
                return {}
            
            collections = {}
            for name, config_data in data['collections'].items():
                try:
                    config = self._parse_collection_config(name, config_data)
                    collections[name] = config
                    log.info(f"Loaded configuration for collection: {name}")
                except Exception as e:
                    log.error(f"Error parsing config for collection {name}: {e}")
            
            return collections
            
        except Exception as e:
            log.error(f"Error loading collection config file: {e}")
            return {}
    
    def load_collection(self, name: str) -> Optional[CollectionConfig]:
        """Load configuration for a specific collection.
        
        Args:
            name: Collection name
            
        Returns:
            CollectionConfig or None if not found
        """
        all_configs = self.load_all()
        return all_configs.get(name)
    
    def _parse_collection_config(self, name: str, data: dict) -> CollectionConfig:
        """Parse collection configuration from dict.
        
        Args:
            name: Collection name
            data: Configuration data
            
        Returns:
            CollectionConfig instance
        """
        # Parse source files with environment variable substitution
        source_files = []
        for file_path in data.get('source_files', []):
            file_path = self._substitute_env_vars(str(file_path))
            source_files.append(Path(file_path))
        
        # Parse schema mapping
        schema_mapping = data.get('schema_mapping', {})
        
        # Parse embedding model with env var substitution
        embedding_model = self._substitute_env_vars(
            data.get('embedding_model', 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
        )
        
        # Parse processor type
        processor_type = data.get('processor', 'csv')
        
        # Parse optional fields
        chunk_size = data.get('chunk_size')
        chunk_overlap = data.get('chunk_overlap')
        enabled = data.get('enabled', True)
        
        # Parse metadata (additional config)
        metadata = {
            'delimiter': data.get('delimiter'),
            'sheet_name': data.get('sheet_name'),
            'encoding': data.get('encoding', 'utf-8')
        }
        
        # Remove None values from metadata
        metadata = {k: v for k, v in metadata.items() if v is not None}
        
        return CollectionConfig(
            name=name,
            source_files=source_files,
            processor_type=processor_type,
            schema_mapping=schema_mapping,
            embedding_model=embedding_model,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            metadata=metadata,
            enabled=enabled
        )
    
    def _substitute_env_vars(self, value: str) -> str:
        """Substitute environment variables in string.
        
        Args:
            value: String potentially containing ${VAR} patterns
            
        Returns:
            String with environment variables substituted
        """
        import re
        
        def replace_env_var(match):
            var_name = match.group(1)
            return os.environ.get(var_name, match.group(0))
        
        return re.sub(r'\$\{([^}]+)\}', replace_env_var, value)
    
    def validate_config(self, config: CollectionConfig) -> List[str]:
        """Validate collection configuration.
        
        Args:
            config: CollectionConfig to validate
            
        Returns:
            List of validation errors (empty if valid)
        """
        errors = []
        
        # Check required fields
        if not config.name:
            errors.append("Collection name is required")
        
        if not config.source_files:
            errors.append("At least one source file is required")
        
        # Check source files exist
        for file_path in config.source_files:
            if not file_path.exists():
                errors.append(f"Source file not found: {file_path}")
        
        # Check processor type
        valid_processors = ['csv', 'excel']
        if config.processor_type not in valid_processors:
            errors.append(f"Invalid processor type: {config.processor_type}. Must be one of {valid_processors}")
        
        # Check schema mapping
        if not config.schema_mapping:
            errors.append("Schema mapping is required")
        elif 'content' not in config.schema_mapping:
            errors.append("Schema mapping must include 'content' field")
        
        return errors


def load_collections_from_yaml(config_path: Optional[Path] = None) -> Dict[str, CollectionConfig]:
    """Convenience function to load collections from YAML.
    
    Args:
        config_path: Optional path to config file
        
    Returns:
        Dictionary of collection configurations
    """
    loader = CollectionConfigLoader(config_path)
    return loader.load_all()
