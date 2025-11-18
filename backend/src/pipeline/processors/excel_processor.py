"""Excel file processor."""

import pandas as pd
from pathlib import Path
from typing import List
from datetime import datetime

from src.pipeline.processors.base import DocumentProcessor
from src.pipeline.models import Document, ProcessorConfig, ValidationResult
from src.utils.logger import log


class ExcelProcessor(DocumentProcessor):
    """Processor for Excel files (.xlsx, .xls)."""
    
    @property
    def supported_formats(self) -> List[str]:
        """File formats this processor supports."""
        return ['.xlsx', '.xls']
    
    def can_process(self, file_path: Path) -> bool:
        """Check if processor can handle this file."""
        return file_path.suffix.lower() in ['.xlsx', '.xls'] and file_path.exists()
    
    def process(
        self,
        file_path: Path,
        config: ProcessorConfig
    ) -> List[Document]:
        """Process Excel file and return documents.
        
        Args:
            file_path: Path to Excel file
            config: Processor configuration with schema_mapping
            
        Returns:
            List of processed documents
        """
        log.info(f"Processing Excel file: {file_path}")
        
        try:
            # Determine sheet name
            sheet_name = config.sheet_name or 0  # Default to first sheet
            
            # Read Excel file
            df = pd.read_excel(
                file_path,
                sheet_name=sheet_name,
                dtype=str,
                engine='openpyxl' if file_path.suffix == '.xlsx' else 'xlrd'
            )
            
            log.info(f"Loaded {len(df)} rows from Excel sheet: {sheet_name}")
            
            # Validate schema
            validation_result = self.validate_schema(df)
            if not validation_result.is_valid:
                log.error(f"Schema validation failed: {validation_result.errors}")
                raise ValueError(f"Invalid Excel schema: {validation_result.errors}")
            
            # Log warnings
            for warning in validation_result.warnings:
                log.warning(warning)
            
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
                        log.debug(f"Row {idx}: Empty content, skipping")
                        continue
                    
                    # Clean content
                    content = self._clean_text(content)
                    
                    # Extract metadata fields
                    metadata = self._extract_metadata(row, schema_mapping)
                    metadata['source_file'] = str(file_path)
                    metadata['sheet_name'] = str(sheet_name)
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
            
            log.info(f"Successfully processed {len(documents)} documents from Excel")
            return documents
            
        except Exception as e:
            log.error(f"Error processing Excel file {file_path}: {str(e)}")
            raise
    
    def validate_schema(self, data: pd.DataFrame) -> ValidationResult:
        """Validate Excel schema.
        
        Args:
            data: DataFrame to validate
            
        Returns:
            ValidationResult with validation details
        """
        errors = []
        warnings = []
        
        # Check if DataFrame is empty
        if data.empty:
            errors.append("Excel sheet is empty")
            return ValidationResult(
                is_valid=False,
                errors=errors,
                warnings=warnings,
                validated_count=0,
                invalid_count=0
            )
        
        # Check for required columns
        if len(data.columns) == 0:
            errors.append("Excel sheet has no columns")
        
        # Check for duplicate column names
        if len(data.columns) != len(set(data.columns)):
            duplicates = [col for col in data.columns if list(data.columns).count(col) > 1]
            warnings.append(f"Duplicate column names found: {duplicates}")
        
        # Check for completely empty rows
        empty_rows = data.isnull().all(axis=1).sum()
        if empty_rows > 0:
            warnings.append(f"Found {empty_rows} completely empty rows")
        
        # Check for merged cells (indicated by NaN in expected positions)
        # This is a heuristic check
        for col in data.columns:
            if data[col].isnull().sum() > len(data) * 0.5:
                warnings.append(f"Column '{col}' has >50% null values, possible merged cells")
        
        # Check for formula cells (Excel formulas are evaluated by pandas)
        # No direct way to detect, but we can warn about unusual patterns
        
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
                    value = str(row[field]).strip()
                    if value:
                        parts.append(value)
            return ' '.join(parts)
        
        # Single field
        if content_field in row and pd.notna(row[content_field]):
            return str(row[content_field]).strip()
        
        # Fallback: combine all non-null fields
        parts = []
        for val in row:
            if pd.notna(val):
                value = str(val).strip()
                if value:
                    parts.append(value)
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
                    value = str(row[field]).strip()
                    if value:
                        metadata[field] = value
        
        # If metadata_fields is a dict, use custom mapping
        elif isinstance(metadata_fields, dict):
            for source_field, target_field in metadata_fields.items():
                if source_field in row and pd.notna(row[source_field]):
                    value = str(row[source_field]).strip()
                    if value:
                        metadata[target_field] = value
        
        return metadata
