"""Registry for document processors."""

from pathlib import Path
from typing import Dict, List, Optional
from src.pipeline.processors.base import DocumentProcessor
from src.utils.logger import log


class ProcessorRegistry:
    """Registry for document processors."""
    
    def __init__(self):
        self._processors: List[DocumentProcessor] = []
        self._format_map: Dict[str, DocumentProcessor] = {}
    
    def register(self, processor: DocumentProcessor) -> None:
        """Register a processor.
        
        Args:
            processor: Document processor to register
        """
        self._processors.append(processor)
        
        # Map file formats to processor
        for fmt in processor.supported_formats:
            if fmt in self._format_map:
                log.warning(f"Format {fmt} already registered, replacing with {processor.__class__.__name__}")
            self._format_map[fmt.lower()] = processor
        
        log.info(f"Registered processor: {processor.__class__.__name__} for formats {processor.supported_formats}")
    
    def get_processor(self, file_path: Path) -> Optional[DocumentProcessor]:
        """Get appropriate processor for file.
        
        Args:
            file_path: Path to file
            
        Returns:
            DocumentProcessor instance or None if no processor found
        """
        file_path = Path(file_path)
        
        # Try to find processor by file extension
        suffix = file_path.suffix.lower()
        if suffix in self._format_map:
            processor = self._format_map[suffix]
            if processor.can_process(file_path):
                return processor
        
        # Try all processors
        for processor in self._processors:
            if processor.can_process(file_path):
                return processor
        
        log.warning(f"No processor found for file: {file_path}")
        return None
    
    def list_supported_formats(self) -> List[str]:
        """List all supported formats.
        
        Returns:
            List of supported file extensions
        """
        return list(self._format_map.keys())
    
    def list_processors(self) -> List[str]:
        """List all registered processors.
        
        Returns:
            List of processor class names
        """
        return [p.__class__.__name__ for p in self._processors]
    
    def clear(self) -> None:
        """Clear all registered processors."""
        self._processors.clear()
        self._format_map.clear()
        log.info("Cleared all registered processors")


# Global registry instance
_global_registry = ProcessorRegistry()


def get_global_registry() -> ProcessorRegistry:
    """Get the global processor registry.
    
    Returns:
        Global ProcessorRegistry instance
    """
    return _global_registry
