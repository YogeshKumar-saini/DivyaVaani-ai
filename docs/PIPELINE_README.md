# Scalable Pipeline Architecture

## Overview

This is a world-class, modular document processing pipeline that can handle multiple spiritual text collections (CSV, Excel, and other formats) and support 10+ independent features.

## Architecture

```
Pipeline Layer → Storage Layer → Data Access Layer → Feature Layer
```

### Key Components

1. **Pipeline Orchestrator** - Coordinates stage execution
2. **Pipeline Stages** - Ingestion → Validation → Cleaning → Embedding → Indexing
3. **Document Processors** - CSV, Excel (extensible)
4. **Collection Manager** - Manages multiple document collections
5. **Metrics & Monitoring** - Comprehensive tracking and logging

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Collections

Edit `config/collections.yaml` to define your document collections:

```yaml
collections:
  bhagavad_gita:
    source_files:
      - data/bhagavad_gita.csv
    processor: csv
    schema_mapping:
      content: combined_en
      metadata:
        - verse_number
        - translation_in_english
    embedding_model: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
    enabled: true
```

### 3. Run the Pipeline

```bash
# List available collections
python cli.py list-collections

# Process a collection
python cli.py run --collection bhagavad_gita

# Check collection status
python cli.py status --collection bhagavad_gita

# Run specific stages only
python cli.py run --collection bhagavad_gita --start-stage cleaning --end-stage embedding
```

## CLI Commands

### `run` - Execute Pipeline

```bash
python cli.py run --collection <name> [--start-stage <stage>] [--end-stage <stage>]
```

Options:
- `--collection, -c`: Collection name (required)
- `--start-stage, -s`: Stage to start from (optional)
- `--end-stage, -e`: Stage to end at (optional)
- `--config`: Path to collections config file (default: config/collections.yaml)

### `list-collections` - List Collections

```bash
python cli.py list-collections [--config <path>]
```

### `status` - Check Collection Status

```bash
python cli.py status --collection <name>
```

### `list-stages` - List Pipeline Stages

```bash
python cli.py list-stages
```

## Pipeline Stages

1. **Ingestion** - Load documents from CSV/Excel files
2. **Validation** - Validate document structure and content
3. **Cleaning** - Normalize text, remove special characters
4. **Embedding** - Generate vector embeddings
5. **Indexing** - Create FAISS, BM25, and ChromaDB indices

## Directory Structure

```
.
├── artifacts/              # Processed collections
│   └── {collection_name}/
│       ├── embeddings.npy
│       ├── faiss.index
│       ├── bm25.pkl
│       ├── chroma/
│       ├── documents.parquet
│       ├── manifest.json
│       └── metrics.json
├── config/
│   └── collections.yaml    # Collection configurations
├── data/                   # Source data files
├── src/
│   ├── pipeline/          # Pipeline orchestration
│   │   ├── orchestrator.py
│   │   ├── stages/        # Pipeline stages
│   │   └── processors/    # Document processors
│   ├── storage/           # Collection management
│   ├── config/            # Configuration loaders
│   └── monitoring/        # Metrics and logging
└── cli.py                 # Command-line interface
```

## Adding New Collections

1. Add source files to `data/` directory
2. Add collection configuration to `config/collections.yaml`
3. Run the pipeline: `python cli.py run --collection <name>`

## Adding New Document Formats

1. Create a new processor class inheriting from `DocumentProcessor`
2. Implement required methods: `supported_formats`, `can_process`, `process`, `validate_schema`
3. Register the processor in `src/pipeline/processors/__init__.py`

Example:

```python
from src.pipeline.processors.base import DocumentProcessor

class PDFProcessor(DocumentProcessor):
    @property
    def supported_formats(self) -> List[str]:
        return ['.pdf']
    
    def can_process(self, file_path: Path) -> bool:
        return file_path.suffix.lower() == '.pdf'
    
    def process(self, file_path: Path, config: ProcessorConfig) -> List[Document]:
        # Implementation
        pass
    
    def validate_schema(self, data: any) -> ValidationResult:
        # Implementation
        pass
```

## Configuration Options

### Collection Config

- `source_files`: List of file paths
- `processor`: Processor type (csv, excel)
- `schema_mapping`: Map source fields to document schema
  - `content`: Field(s) containing main content
  - `metadata`: List of metadata fields
- `embedding_model`: Model name for embeddings
- `chunk_size`: Optional chunking size
- `chunk_overlap`: Optional chunk overlap
- `enabled`: Enable/disable collection
- `delimiter`: CSV delimiter (optional)
- `sheet_name`: Excel sheet name (optional)

### Schema Mapping Examples

**Single content field:**
```yaml
schema_mapping:
  content: text_field
  metadata:
    - field1
    - field2
```

**Multiple content fields (combined):**
```yaml
schema_mapping:
  content:
    - field1
    - field2
    - field3
  metadata:
    - meta_field
```

**Custom metadata mapping:**
```yaml
schema_mapping:
  content: text
  metadata:
    source_field: target_field
    chapter_num: chapter
```

## Monitoring & Metrics

The pipeline tracks:
- Processing time per stage
- Documents processed
- Error rates
- Cache hit/miss rates
- Storage usage

Metrics are saved to `artifacts/{collection}/metrics.json`

## Error Handling

- Intermediate results are persisted after each stage
- Failed stages can be resumed from the last successful stage
- Detailed error logs in `logs/` directory
- Manifest files document all processing steps

## Examples

### Process Bhagavad Gita

```bash
python cli.py run --collection bhagavad_gita
```

### Process Multiple Ramayana Files

```bash
python cli.py run --collection ramayana
```

### Re-run Only Embedding Stage

```bash
python cli.py run --collection bhagavad_gita --start-stage embedding --end-stage embedding
```

### Check Processing Status

```bash
python cli.py status --collection bhagavad_gita
```

## Troubleshooting

### Collection Not Found

Make sure the collection is defined in `config/collections.yaml` and source files exist.

### Import Errors

Install all dependencies:
```bash
pip install pandas numpy pyyaml click sentence-transformers faiss-cpu chromadb rank-bm25
```

### Memory Issues

For large collections, reduce batch size in embedding stage or process in chunks.

### File Not Found

Check that source file paths in `config/collections.yaml` are correct relative to project root.

## Next Steps

1. **Add More Collections** - Configure additional spiritual texts
2. **Implement Features** - Build QA, Search, Analytics features using the data access layer
3. **Optimize Performance** - Enable parallel processing, GPU acceleration
4. **Add Monitoring** - Set up dashboards for pipeline metrics
5. **Deploy** - Containerize and deploy to production

## Support

For issues or questions, check the logs in `logs/` directory or review the manifest files in `artifacts/{collection}/manifest.json`.
