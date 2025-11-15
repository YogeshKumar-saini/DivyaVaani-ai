"""Document processors module."""

from src.pipeline.processors.base import DocumentProcessor
from src.pipeline.processors.registry import ProcessorRegistry, get_global_registry
from src.pipeline.processors.csv_processor import CSVProcessor
from src.pipeline.processors.excel_processor import ExcelProcessor
from src.pipeline.processors.pdf_processor import PDFProcessor
from src.pipeline.processors.image_processor import ImageProcessor


def register_default_processors() -> ProcessorRegistry:
    """Register default processors in the global registry.

    Returns:
        Global ProcessorRegistry with default processors registered
    """
    registry = get_global_registry()

    # Register CSV processor
    registry.register(CSVProcessor())

    # Register Excel processor
    registry.register(ExcelProcessor())

    # Register PDF processor
    registry.register(PDFProcessor())

    # Register Image processor
    registry.register(ImageProcessor())

    return registry


__all__ = [
    "DocumentProcessor",
    "ProcessorRegistry",
    "get_global_registry",
    "register_default_processors",
    "CSVProcessor",
    "ExcelProcessor",
    "PDFProcessor",
    "ImageProcessor"
]
