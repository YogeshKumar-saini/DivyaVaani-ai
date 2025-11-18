"""Base class for document processors."""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import List
from src.pipeline.models import Document, ProcessorConfig, ValidationResult
from src.utils.logger import log


class DocumentProcessor(ABC):
    """Base class for document processors."""
    
    @property
    @abstractmethod
    def supported_formats(self) -> List[str]:
        """File formats this processor supports.
        
        Returns:
            List of file extensions (e.g., ['.csv', '.txt'])
        """
        pass
    
    @abstractmethod
    def can_process(self, file_path: Path) -> bool:
        """Check if processor can handle this file.
        
        Args:
            file_path: Path to file
            
        Returns:
            True if processor can handle the file
        """
        pass
    
    @abstractmethod
    def process(
        self,
        file_path: Path,
        config: ProcessorConfig
    ) -> List[Document]:
        """Process file and return documents.
        
        Args:
            file_path: Path to file to process
            config: Processor configuration
            
        Returns:
            List of processed documents
        """
        pass
    
    @abstractmethod
    def validate_schema(self, data: any) -> ValidationResult:
        """Validate document schema.
        
        Args:
            data: Data to validate
            
        Returns:
            ValidationResult with validation details
        """
        pass
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text.
        
        Args:
            text: Text to clean
            
        Returns:
            Cleaned text
        """
        if not text or not isinstance(text, str):
            return ""
        
        # Remove zero-width characters
        text = text.replace('\u200d', '').replace('\u200c', '')
        
        # Normalize whitespace
        text = text.replace('\r', ' ').replace('\n', ' ')
        
        # Remove multiple spaces
        import re
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def _generate_document_id(self, collection: str, index: int, metadata: dict = None) -> str:
        """Generate a unique document ID.
        
        Args:
            collection: Collection name
            index: Document index
            metadata: Optional metadata for ID generation
            
        Returns:
            Unique document ID
        """
        import hashlib
        
        # Create base ID
        base_id = f"{collection}_{index}"
        
        # Add metadata to make it more unique if available
        if metadata:
            meta_str = "_".join(str(v) for v in metadata.values() if v)
            if meta_str:
                base_id = f"{base_id}_{meta_str}"
        
        # Hash for consistent length
        return hashlib.md5(base_id.encode()).hexdigest()[:16]
    
    def __str__(self) -> str:
        """String representation."""
        return f"{self.__class__.__name__}(formats={self.supported_formats})"
    
    def __repr__(self) -> str:
        """Repr representation."""
        return self.__str__()
