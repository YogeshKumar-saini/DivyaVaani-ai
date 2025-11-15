"""CSV file processor."""

import csv
import pandas as pd
from pathlib import Path
from typing import List
from datetime import datetime

from src.pipeline.processors.base import DocumentProcessor
from src.pipeline.models import Document, ProcessorConfig, ValidationResult
from src.utils.logger import log


class CSVProcessor(DocumentProcessor):
    """Processor for CSV files."""
    
    @property
    def supported_formats(self) -> List[str]:
        """File formats this processor supports."""
        return ['.csv']
    
    def can_process(self, file_path: Path) -> bool:
        """Check if processor can handle this file."""
        return file_path.suffix.lower() == '.csv' and file_path.exists()
    
    def process(
        self,
        file_path: Path,
        config: ProcessorConfig
    ) -> List[Document]:
        """Process CSV file and return documents.
        
        Args:
            file_path: Path to CSV file
            config: Processor configuration with schema_mapping
            
        Returns:
            List of processed documents
        """
        log.info(f"Processing CSV file: {file_path}")
        
        try:
            # Read CSV with pandas
            df = pd.read_csv(
                file_path,
                encoding=config.encoding,
                delimiter=config.delimiter or ',',
                skiprows=config.skip_rows,
                quoting=csv.QUOTE_ALL if config.delimiter else csv.QUOTE_MINIMAL,
                engine='python',
                dtype=str,
                on_bad_lines='skip'
            )
            
            log.info(f"Loaded {len(df)} rows from CSV")
            
            # Validate schema
            validation_result = self.validate_schema(df)
            if not validation_result.is_valid:
                log.error(f"Schema validation failed: {validation_result.errors}")
                raise ValueError(f"Invalid CSV schema: {validation_result.errors}")
            
            # Extract collection name from file
            collection_name = config.metadata.get('collection_name', file_path.stem)
            
            # Process rows into documents
            documents = []
            schema_mapping = config.schema_mapping
            
            for idx, row in df.iterrows():
                try:
                    # Extract content field
                    content = self._extract_content(row, schema_mapping)
                    
                    if not content or not content.strip():
                        log.warning(f"Row {idx}: Empty content, skipping")
                        continue
                    
                    # Clean content
                    content = self._clean_text(content)
                    
                    # Extract metadata fields
                    metadata = self._extract_metadata(row, schema_mapping)
                    metadata['source_file'] = str(file_path)
                    metadata['row_number'] = int(idx)
                    
                    # Generate document ID
                    doc_id = self._generate_document_id(collection_name, idx, metadata)
                    
                    # Create document
                    doc = Document(
                        id=doc_id,
                        collection=collection_name,
                        content=content,
                        metadata=metadata,
                        created_at=datetime.now(),
                        updated_at=datetime.now()
                    )
                    
                    documents.append(doc)
                    
                except Exception as e:
                    log.warning(f"Row {idx}: Error processing - {str(e)}")
                    continue
            
            log.info(f"Successfully processed {len(documents)} documents from CSV")
            return documents
            
        except Exception as e:
            log.error(f"Error processing CSV file {file_path}: {str(e)}")
            raise
    
    def validate_schema(self, data: pd.DataFrame) -> ValidationResult:
        """Validate CSV schema.
        
        Args:
            data: DataFrame to validate
            
        Returns:
            ValidationResult with validation details
        """
        errors = []
        warnings = []
        
        # Check if DataFrame is empty
        if data.empty:
            errors.append("CSV file is empty")
            return ValidationResult(
                is_valid=False,
                errors=errors,
                warnings=warnings,
                validated_count=0,
                invalid_count=0
            )
        
        # Check for required columns (at least one column should exist)
        if len(data.columns) == 0:
            errors.append("CSV has no columns")
        
        # Check for duplicate column names
        if len(data.columns) != len(set(data.columns)):
            duplicates = [col for col in data.columns if list(data.columns).count(col) > 1]
            warnings.append(f"Duplicate column names found: {duplicates}")
        
        # Check for completely empty rows
        empty_rows = data.isnull().all(axis=1).sum()
        if empty_rows > 0:
            warnings.append(f"Found {empty_rows} completely empty rows")
        
        is_valid = len(errors) == 0
        
        return ValidationResult(
            is_valid=is_valid,
            errors=errors,
            warnings=warnings,
            validated_count=len(data) if is_valid else 0,
            invalid_count=0 if is_valid else len(data)
        )
    
    def _extract_content(self, row: pd.Series, schema_mapping: dict) -> str:
        """Extract content field from row.
        
        Args:
            row: DataFrame row
            schema_mapping: Schema mapping configuration
            
        Returns:
            Content string
        """
        content_field = schema_mapping.get('content', 'content')
        
        # If content_field is a list, combine multiple fields
        if isinstance(content_field, list):
            parts = []
            for field in content_field:
                if field in row and pd.notna(row[field]):
                    parts.append(str(row[field]))
            return ' '.join(parts)
        
        # Single field
        if content_field in row and pd.notna(row[content_field]):
            return str(row[content_field])
        
        # Fallback: combine all non-null fields
        parts = [str(val) for val in row if pd.notna(val)]
        return ' '.join(parts)
    
    def _extract_metadata(self, row: pd.Series, schema_mapping: dict) -> dict:
        """Extract metadata fields from row.
        
        Args:
            row: DataFrame row
            schema_mapping: Schema mapping configuration
            
        Returns:
            Metadata dictionary
        """
        metadata = {}
        metadata_fields = schema_mapping.get('metadata', [])
        
        # If metadata_fields is a list, extract those fields
        if isinstance(metadata_fields, list):
            for field in metadata_fields:
                if field in row and pd.notna(row[field]):
                    metadata[field] = str(row[field])
        
        # If metadata_fields is a dict, use custom mapping
        elif isinstance(metadata_fields, dict):
            for source_field, target_field in metadata_fields.items():
                if source_field in row and pd.notna(row[source_field]):
                    metadata[target_field] = str(row[source_field])
        
        return metadata
