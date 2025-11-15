"""Cleaning stage for text normalization."""

import re
import unicodedata
from typing import Any
from src.pipeline.stages.base import PipelineStage
from src.pipeline.models import (
    Collection,
    PipelineContext,
    StageResult,
    StageStatus,
    ValidatedDocumentBatch,
    CleanedDocumentBatch,
    Document
)
from src.utils.logger import log


class CleaningStage(PipelineStage):
    """Stage for cleaning and normalizing document text."""
    
    @property
    def name(self) -> str:
        """Stage name."""
        return "cleaning"
    
    def validate_input(self, input_data: Any) -> bool:
        """Validate input data."""
        return isinstance(input_data, ValidatedDocumentBatch)
    
    def execute(
        self,
        collection: Collection,
        input_data: ValidatedDocumentBatch,
        context: PipelineContext
    ) -> StageResult:
        """Execute cleaning stage.
        
        Args:
            collection: Collection being processed
            input_data: ValidatedDocumentBatch from validation
            context: Pipeline execution context
            
        Returns:
            StageResult with CleanedDocumentBatch as output
        """
        log.info(f"Starting document cleaning for collection: {collection.name}")
        
        documents = input_data.documents
        cleaned_documents = []
        
        # Cleaning statistics
        stats = {
            'whitespace_normalized': 0,
            'special_chars_removed': 0,
            'unicode_normalized': 0,
            'empty_after_cleaning': 0
        }
        
        log.info(f"Cleaning {len(documents)} documents")
        
        # Clean each document
        for doc in documents:
            try:
                original_content = doc.content
                cleaned_content = self._clean_text(doc.content, stats)
                
                # Skip if content becomes empty after cleaning
                if not cleaned_content or not cleaned_content.strip():
                    stats['empty_after_cleaning'] += 1
                    log.debug(f"Document {doc.id}: Empty after cleaning, skipping")
                    continue
                
                # Update document content
                doc.content = cleaned_content
                cleaned_documents.append(doc)
                
            except Exception as e:
                log.warning(f"Error cleaning document {doc.id}: {str(e)}")
                # Keep original document if cleaning fails
                cleaned_documents.append(doc)
        
        # Create output batch
        output_batch = CleanedDocumentBatch(
            documents=cleaned_documents,
            cleaning_stats=stats,
            metadata={
                'documents_cleaned': len(cleaned_documents),
                'documents_removed': len(documents) - len(cleaned_documents)
            }
        )
        
        warnings = []
        if stats['empty_after_cleaning'] > 0:
            warnings.append(f"Removed {stats['empty_after_cleaning']} documents that became empty after cleaning")
        
        log.info(f"Cleaning complete: {len(cleaned_documents)} documents")
        log.info(f"Stats: {stats}")
        
        return StageResult(
            stage_name=self.name,
            status=StageStatus.COMPLETED,
            input_count=len(documents),
            output_count=len(cleaned_documents),
            execution_time=0,
            warnings=warnings,
            output_data=output_batch,
            metadata=stats
        )
    
    def _clean_text(self, text: str, stats: dict) -> str:
        """Clean and normalize text.
        
        Args:
            text: Text to clean
            stats: Statistics dictionary to update
            
        Returns:
            Cleaned text
        """
        if not text:
            return ""
        
        original_text = text
        
        # Remove zero-width characters
        text = text.replace('\u200d', '').replace('\u200c', '').replace('\ufeff', '')
        
        # Normalize Unicode (NFC normalization)
        text = unicodedata.normalize('NFC', text)
        stats['unicode_normalized'] += 1
        
        # Replace various whitespace characters with space
        text = text.replace('\r\n', ' ').replace('\r', ' ').replace('\n', ' ')
        text = text.replace('\t', ' ')
        
        # Remove multiple spaces
        if re.search(r'\s{2,}', text):
            text = re.sub(r'\s+', ' ', text)
            stats['whitespace_normalized'] += 1
        
        # Remove leading/trailing whitespace
        text = text.strip()
        
        # Remove control characters (except common ones)
        text = ''.join(char for char in text if unicodedata.category(char)[0] != 'C' or char in '\n\r\t ')
        
        # Remove excessive punctuation (more than 3 repeated)
        text = re.sub(r'([!?.,;:]){4,}', r'\1\1\1', text)
        
        # Track if special characters were removed
        if len(text) < len(original_text) * 0.95:  # More than 5% reduction
            stats['special_chars_removed'] += 1
        
        return text
