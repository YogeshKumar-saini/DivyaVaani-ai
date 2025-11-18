"""Image file processor for visual content extraction."""

import base64
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
from PIL import Image as PILImage
import io

from src.pipeline.processors.base import DocumentProcessor
from src.pipeline.models import Document, ProcessorConfig, ValidationResult, StructuredContent
from src.utils.logger import log


class ImageProcessor(DocumentProcessor):
    """Processor for image files with OCR and metadata extraction."""

    @property
    def supported_formats(self) -> List[str]:
        """File formats this processor supports."""
        return ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.webp']

    def can_process(self, file_path: Path) -> bool:
        """Check if processor can handle this file."""
        return file_path.suffix.lower() in self.supported_formats and file_path.exists()

    def process(
        self,
        file_path: Path,
        config: ProcessorConfig
    ) -> List[Document]:
        """Process image file and return documents with OCR and metadata.

        Args:
            file_path: Path to image file
            config: Processor configuration

        Returns:
            List of processed documents
        """
        log.info(f"Processing image file: {file_path}")

        try:
            # Open and analyze image
            with PILImage.open(file_path) as img:
                # Get basic image properties
                width, height = img.size
                mode = img.mode
                format_name = img.format or file_path.suffix[1:].upper()

                # Extract text using OCR if available
                ocr_text = self._extract_text_with_ocr(img)

                # Create structured content
                structured_content = StructuredContent(
                    text=ocr_text,
                    images=[{
                        'index': 0,
                        'path': str(file_path),
                        'size': (width, height),
                        'mode': mode,
                        'format': format_name,
                        'type': 'standalone_image'
                    }],
                    metadata={
                        'image_width': width,
                        'image_height': height,
                        'image_mode': mode,
                        'image_format': format_name,
                        'has_ocr_text': bool(ocr_text and ocr_text.strip())
                    }
                )

                # Create combined content
                content_parts = [f"**Image Description:** {file_path.name} ({width}x{height}, {format_name})"]
                if ocr_text:
                    content_parts.append(f"**OCR Text:** {ocr_text}")
                combined_content = "\n\n".join(content_parts)

                # Create metadata
                metadata = {
                    'source_file': str(file_path),
                    'file_type': 'image',
                    'image_width': width,
                    'image_height': height,
                    'image_mode': mode,
                    'image_format': format_name,
                    'has_ocr_text': bool(ocr_text and ocr_text.strip()),
                    'ocr_text_length': len(ocr_text) if ocr_text else 0,
                    'content_type': 'image_with_text' if ocr_text else 'image'
                }

                # Generate document ID
                collection_name = config.metadata.get('collection_name', file_path.stem)
                doc_id = self._generate_document_id(collection_name, "image", metadata)

                # Create document
                doc = Document(
                    id=doc_id,
                    collection=collection_name,
                    content=combined_content,
                    structured_content=structured_content,
                    metadata=metadata,
                    content_type='image_with_text' if ocr_text else 'image',
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )

                log.info(f"Successfully processed image: {file_path.name} ({width}x{height})")
                return [doc]

        except Exception as e:
            log.error(f"Error processing image file {file_path}: {str(e)}")
            raise

    def validate_schema(self, data: Any) -> ValidationResult:
        """Validate image processing capability.

        Args:
            data: Not used for image validation

        Returns:
            ValidationResult
        """
        errors = []
        warnings = []

        try:
            import PIL
            from PIL import Image as PILImage
        except ImportError:
            errors.append("PIL (Pillow) library not available")

        # Check for OCR capability
        try:
            import pytesseract
            # Try to get tesseract version
            version = pytesseract.get_tesseract_version()
            log.info(f"Tesseract OCR available: {version}")
        except ImportError:
            warnings.append("pytesseract not available - OCR will be limited")
        except Exception as e:
            warnings.append(f"Tesseract OCR not properly configured: {str(e)}")

        is_valid = len(errors) == 0

        return ValidationResult(
            is_valid=is_valid,
            errors=errors,
            warnings=warnings,
            validated_count=1 if is_valid else 0,
            invalid_count=0 if is_valid else 1
        )

    def _extract_text_with_ocr(self, image: PILImage.Image) -> str:
        """Extract text from image using OCR.

        Args:
            image: PIL Image object

        Returns:
            Extracted text
        """
        try:
            import pytesseract

            # Convert to RGB if necessary
            if image.mode not in ('L', 'RGB'):
                image = image.convert('RGB')

            # Extract text
            text = pytesseract.image_to_string(image)

            # Clean the text
            text = self._clean_ocr_text(text)

            log.debug(f"OCR extracted {len(text)} characters")
            return text

        except ImportError:
            log.warning("OCR not available, returning empty text")
            return ""
        except Exception as e:
            log.warning(f"OCR failed: {str(e)}")
            return ""

    def _clean_ocr_text(self, text: str) -> str:
        """Clean OCR-extracted text.

        Args:
            text: Raw OCR text

        Returns:
            Cleaned text
        """
        if not text:
            return ""

        # Remove excessive whitespace
        import re
        text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)
        text = re.sub(r'[ \t]+', ' ', text)

        # Remove common OCR artifacts
        text = text.replace('|', 'I')  # Common OCR mistake

        return text.strip()
