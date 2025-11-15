"""PDF file processor with structured content extraction."""

import re
import pandas as pd
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime
from PIL import Image
import io

from src.pipeline.processors.base import DocumentProcessor
from src.pipeline.models import Document, ProcessorConfig, ValidationResult, StructuredContent
from src.utils.logger import log


class PDFProcessor(DocumentProcessor):
    """Processor for PDF files with structured content extraction."""

    @property
    def supported_formats(self) -> List[str]:
        """File formats this processor supports."""
        return ['.pdf']

    def can_process(self, file_path: Path) -> bool:
        """Check if processor can handle this file."""
        return file_path.suffix.lower() == '.pdf' and file_path.exists()

    def process(
        self,
        file_path: Path,
        config: ProcessorConfig
    ) -> List[Document]:
        """Process PDF file and return structured documents.

        Args:
            file_path: Path to PDF file
            config: Processor configuration

        Returns:
            List of processed documents with structured content
        """
        log.info(f"Processing PDF file: {file_path}")

        try:
            # Import PDF libraries
            import pdfplumber
            import PyPDF2

            documents = []
            file_path_obj = Path(file_path)
            collection_name = config.metadata.get('collection_name', file_path_obj.stem)

            # Extract text and tables using pdfplumber
            with pdfplumber.open(file_path) as pdf:
                for page_num, page in enumerate(pdf.pages, 1):
                    try:
                        # Extract text content
                        text_content = page.extract_text()
                        if text_content:
                            text_content = self._clean_text(text_content)

                        # Extract tables
                        tables = page.extract_tables()
                        table_content = ""
                        if tables:
                            table_content = self._process_tables(tables)

                        # Extract images (metadata only for now)
                        images_info = []
                        if hasattr(page, 'images'):
                            images_info = self._extract_images_info(page.images)

                        # Create structured content
                        structured_content = StructuredContent(
                            text=text_content,
                            tables=self._create_structured_tables(tables),
                            images=images_info,
                            metadata={
                                'page_number': page_num,
                                'total_pages': len(pdf.pages)
                            }
                        )

                        # Combine content for backward compatibility
                        combined_content = self._combine_content(
                            text_content, table_content, images_info
                        )

                        if not combined_content.strip():
                            continue

                        # Create metadata
                        metadata = {
                            'source_file': str(file_path),
                            'page_number': page_num,
                            'total_pages': len(pdf.pages),
                            'content_type': self._determine_content_type(text_content, tables, images_info),
                            'has_text': bool(text_content),
                            'has_tables': bool(tables),
                            'has_images': bool(images_info),
                            'table_count': len(tables) if tables else 0,
                            'image_count': len(images_info),
                            'text_length': len(text_content) if text_content else 0,
                        }

                        # Add table metadata
                        if tables:
                            metadata['tables'] = [
                                {
                                    'rows': len(table),
                                    'columns': len(table[0]) if table else 0
                                } for table in tables
                            ]

                        # Add image metadata
                        if images_info:
                            metadata['images'] = images_info

                        # Generate document ID
                        doc_id = self._generate_document_id(
                            collection_name, f"page_{page_num}", metadata
                        )

                        # Create document with structured content
                        doc = Document(
                            id=doc_id,
                            collection=collection_name,
                            content=combined_content,
                            structured_content=structured_content,
                            metadata=metadata,
                            content_type=self._determine_content_type(text_content, tables, images_info),
                            created_at=datetime.now(),
                            updated_at=datetime.now()
                        )

                        documents.append(doc)

                    except Exception as e:
                        log.warning(f"Error processing page {page_num}: {str(e)}")
                        continue

            # Extract additional metadata using PyPDF2
            try:
                with open(file_path, 'rb') as f:
                    pdf_reader = PyPDF2.PdfReader(f)
                    pdf_metadata = pdf_reader.metadata

                    if pdf_metadata:
                        for doc in documents:
                            doc.metadata.update({
                                'pdf_title': pdf_metadata.title,
                                'pdf_author': pdf_metadata.author,
                                'pdf_subject': pdf_metadata.subject,
                                'pdf_creator': pdf_metadata.creator,
                                'pdf_producer': pdf_metadata.producer,
                            })
            except Exception as e:
                log.warning(f"Could not extract PDF metadata: {str(e)}")

            log.info(f"Successfully processed {len(documents)} pages from PDF")
            return documents

        except ImportError as e:
            log.error(f"PDF processing libraries not available: {str(e)}")
            raise
        except Exception as e:
            log.error(f"Error processing PDF file {file_path}: {str(e)}")
            raise

    def validate_schema(self, data: Any) -> ValidationResult:
        """Validate PDF processing capability.

        Args:
            data: Not used for PDF validation

        Returns:
            ValidationResult
        """
        errors = []
        warnings = []

        try:
            import pdfplumber
            import PyPDF2
        except ImportError as e:
            errors.append(f"Required PDF libraries not available: {str(e)}")

        is_valid = len(errors) == 0

        return ValidationResult(
            is_valid=is_valid,
            errors=errors,
            warnings=warnings,
            validated_count=1 if is_valid else 0,
            invalid_count=0 if is_valid else 1
        )

    def _process_tables(self, tables: List[List[List[str]]]) -> str:
        """Process extracted tables into structured text.

        Args:
            tables: List of tables from pdfplumber

        Returns:
            Formatted table content
        """
        if not tables:
            return ""

        table_texts = []

        for i, table in enumerate(tables):
            try:
                # Convert table to DataFrame for better handling
                df = pd.DataFrame(table[1:], columns=table[0] if table else [])

                # Clean table data
                df = df.applymap(lambda x: self._clean_text(str(x)) if x else "")

                # Convert back to structured text
                table_md = df.to_markdown(index=False)
                table_texts.append(f"**Table {i+1}:**\n{table_md}\n")

            except Exception as e:
                log.warning(f"Error processing table {i}: {str(e)}")
                # Fallback: convert to simple text
                table_text = "\n".join([
                    " | ".join([str(cell) for cell in row if cell])
                    for row in table if row
                ])
                table_texts.append(f"**Table {i+1}:**\n{table_text}\n")

        return "\n".join(table_texts)

    def _extract_images_info(self, images: List[Dict]) -> List[Dict]:
        """Extract image metadata from PDF page.

        Args:
            images: List of image objects from pdfplumber

        Returns:
            List of image metadata
        """
        images_info = []

        for i, img in enumerate(images):
            try:
                image_info = {
                    'index': i,
                    'bbox': img.get('bbox'),
                    'size': (img.get('width'), img.get('height')),
                    'type': 'embedded_image'
                }
                images_info.append(image_info)
            except Exception as e:
                log.warning(f"Error extracting image {i} info: {str(e)}")

        return images_info

    def _combine_content(
        self,
        text_content: str,
        table_content: str,
        images_info: List[Dict]
    ) -> str:
        """Combine different content types into structured document.

        Args:
            text_content: Extracted text
            table_content: Formatted tables
            images_info: Image metadata

        Returns:
            Combined structured content
        """
        sections = []

        # Add text content
        if text_content:
            sections.append(f"**Text Content:**\n{text_content}\n")

        # Add table content
        if table_content:
            sections.append(f"**Tables:**\n{table_content}\n")

        # Add image references
        if images_info:
            image_refs = [f"- Image {img['index'] + 1}: {img.get('size', 'Unknown size')}"
                         for img in images_info]
            sections.append(f"**Images:**\n" + "\n".join(image_refs) + "\n")

        return "\n".join(sections).strip()

    def _create_structured_tables(self, tables: List[List[List[str]]]) -> List[Dict[str, Any]]:
        """Create structured table representations.

        Args:
            tables: Raw tables from pdfplumber

        Returns:
            List of structured table dictionaries
        """
        structured_tables = []

        for i, table in enumerate(tables):
            try:
                # Convert to DataFrame for processing
                df = pd.DataFrame(table[1:] if len(table) > 1 else [], columns=table[0] if table else [])

                # Clean data
                df = df.applymap(lambda x: self._clean_text(str(x)) if x else "")

                structured_table = {
                    'index': i,
                    'headers': list(df.columns) if not df.empty else [],
                    'rows': df.values.tolist() if not df.empty else [],
                    'shape': df.shape,
                    'markdown': df.to_markdown(index=False) if not df.empty else "",
                    'dataframe': df.to_dict('records') if not df.empty else []
                }

                structured_tables.append(structured_table)

            except Exception as e:
                log.warning(f"Error creating structured table {i}: {str(e)}")
                # Fallback structure
                structured_table = {
                    'index': i,
                    'headers': table[0] if table else [],
                    'rows': table[1:] if len(table) > 1 else [],
                    'shape': (len(table), len(table[0]) if table else 0),
                    'markdown': "",
                    'dataframe': []
                }
                structured_tables.append(structured_table)

        return structured_tables

    def _determine_content_type(self, text: str, tables: List, images: List[Dict]) -> str:
        """Determine the primary content type of the document.

        Args:
            text: Extracted text content
            tables: List of tables
            images: List of image metadata

        Returns:
            Content type string
        """
        has_text = bool(text and text.strip())
        has_tables = bool(tables)
        has_images = bool(images)

        if has_text and has_tables and has_images:
            return "multimodal"
        elif has_text and has_tables:
            return "mixed"
        elif has_text and has_images:
            return "text_with_images"
        elif has_tables and has_images:
            return "tables_with_images"
        elif has_text:
            return "text"
        elif has_tables:
            return "table"
        elif has_images:
            return "image"
        else:
            return "empty"

    def _clean_text(self, text: str) -> str:
        """Clean and normalize extracted text.

        Args:
            text: Raw extracted text

        Returns:
            Cleaned text
        """
        if not text:
            return ""

        # Remove excessive whitespace
        text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)
        text = re.sub(r'[ \t]+', ' ', text)

        # Remove zero-width characters
        text = text.replace('\u200d', '').replace('\u200c', '')

        # Normalize line breaks
        text = text.replace('\r\n', '\n').replace('\r', '\n')

        return text.strip()
