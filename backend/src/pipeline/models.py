"""Pipeline data models."""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np


class CollectionStatus(str, Enum):
    """Status of a collection."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    PARTIAL = "partial"


class StageStatus(str, Enum):
    """Status of a pipeline stage."""
    NOT_STARTED = "not_started"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class StructuredContent:
    """Structured content with different modalities."""
    text: str = ""
    tables: List[Dict[str, Any]] = field(default_factory=list)
    images: List[Dict[str, Any]] = field(default_factory=list)
    code_blocks: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Document:
    """Enhanced document schema with structured content support."""
    id: str
    collection: str
    content: str  # Legacy field for backward compatibility
    structured_content: Optional[StructuredContent] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    embedding: Optional[np.ndarray] = None
    multimodal_embedding: Optional[np.ndarray] = None
    content_type: str = "text"  # text, mixed, image, table, multimodal
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class CollectionConfig:
    """Configuration for a document collection."""
    name: str
    source_files: List[Path]
    processor_type: str
    schema_mapping: Dict[str, Any]
    embedding_model: str
    chunk_size: Optional[int] = None
    chunk_overlap: Optional[int] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    enabled: bool = True


@dataclass
class Collection:
    """Document collection with metadata."""
    name: str
    config: CollectionConfig
    status: CollectionStatus = CollectionStatus.PENDING
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    document_count: int = 0
    error_message: Optional[str] = None


@dataclass
class CollectionMetadata:
    """Metadata about a collection."""
    name: str
    status: CollectionStatus
    document_count: int
    created_at: datetime
    updated_at: datetime
    source_files: List[str]
    processor_type: str
    embedding_model: str


@dataclass
class CollectionStats:
    """Statistics for a collection."""
    name: str
    document_count: int
    total_size_bytes: int
    embedding_dimension: Optional[int]
    index_count: int
    last_processed: Optional[datetime]
    processing_time_seconds: Optional[float]


@dataclass
class StageResult:
    """Result of a pipeline stage execution."""
    stage_name: str
    status: StageStatus
    input_count: int
    output_count: int
    execution_time: float
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    output_data: Any = None


@dataclass
class PipelineResult:
    """Result of pipeline execution."""
    collection_name: str
    status: str
    stages_completed: List[str]
    stages_failed: List[str]
    documents_processed: int
    execution_time: float
    errors: List[str]
    artifacts: Dict[str, Path]
    started_at: datetime
    completed_at: datetime


@dataclass
class PipelineContext:
    """Context passed through pipeline stages."""
    collection: Collection
    artifact_dir: Path
    temp_dir: Path
    stage_results: Dict[str, StageResult] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ProcessorConfig:
    """Configuration for document processors."""
    schema_mapping: Dict[str, Any]
    encoding: str = "utf-8"
    delimiter: Optional[str] = None
    sheet_name: Optional[str] = None
    skip_rows: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ValidationResult:
    """Result of document validation."""
    is_valid: bool
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    validated_count: int = 0
    invalid_count: int = 0


# Batch data models for stage outputs
@dataclass
class RawDocumentBatch:
    """Batch of raw documents from ingestion."""
    documents: List[Document]
    source_file: Path
    processor_type: str
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ValidatedDocumentBatch:
    """Batch of validated documents."""
    documents: List[Document]
    validation_result: ValidationResult
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class CleanedDocumentBatch:
    """Batch of cleaned documents."""
    documents: List[Document]
    cleaning_stats: Dict[str, int] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class EmbeddedDocumentBatch:
    """Batch of documents with embeddings."""
    documents: List[Document]
    embeddings: np.ndarray
    embedding_model: str
    cache_hits: int = 0
    cache_misses: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class IndexedCollection:
    """Collection with created indices."""
    collection_name: str
    document_count: int
    faiss_index_path: Optional[Path] = None
    bm25_index_path: Optional[Path] = None
    chroma_collection_name: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
