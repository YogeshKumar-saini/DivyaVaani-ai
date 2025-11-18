# 🚀 Scalable Pipeline Architecture - Complete System

## Overview

A **world-class, production-ready document processing pipeline** for spiritual texts that supports multiple collections, intelligent caching, powerful search, and unlimited features.

## ⚡ Quick Start (5 Minutes)

```bash
# 1. Test the system
python test_pipeline.py

# 2. List available collections
python cli.py list-collections

# 3. Process Bhagavad Gita
python cli.py run --collection bhagavad_gita

# 4. Check status
python cli.py status --collection bhagavad_gita

# 5. Try the APIs
python example_usage.py
```

## 🎯 What This System Does

### Before (Old System)
- ❌ Single collection only (Bhagavad Gita)
- ❌ Monolithic pipeline
- ❌ No caching
- ❌ Hard to add new formats
- ❌ Difficult to build multiple features

### After (New System)
- ✅ Multiple collections (Bhagavad Gita, Ramayana, Mahabharata, etc.)
- ✅ Modular pipeline (5 independent stages)
- ✅ Intelligent caching (avoid recomputation)
- ✅ Easy to add formats (CSV, Excel, PDF, etc.)
- ✅ Data access APIs for building features

## 📦 System Components

### 1. Pipeline System
Process documents through 5 stages:
```
Ingestion → Validation → Cleaning → Embedding → Indexing
```

### 2. Document Processors
- **CSV Processor** - Handle CSV files with any schema
- **Excel Processor** - Handle .xlsx and .xls files
- **Extensible** - Easy to add PDF, JSON, XML, etc.

### 3. Collection Management
- Create and manage multiple collections
- Track processing status
- View statistics

### 4. Embedding Service
- Generate vector embeddings
- Intelligent caching
- Batch optimization

### 5. Data Access APIs
- **CollectionAPI** - Access documents
- **RetrievalAPI** - Search across collections
- **Hybrid Search** - Combine vector + BM25

### 6. CLI Tool
- `run` - Process collections
- `list-collections` - Show all collections
- `status` - Check processing status
- `list-stages` - Show pipeline stages

## 📁 Directory Structure

```
.
├── cli.py                      # Command-line interface
├── test_pipeline.py            # System test
├── example_usage.py            # API examples
│
├── config/
│   └── collections.yaml        # Collection configurations
│
├── src/
│   ├── pipeline/              # Pipeline orchestration
│   ├── embeddings/            # Embedding service + cache
│   ├── storage/               # Collection management
│   ├── data_access/           # Data access APIs
│   ├── config/                # Configuration loaders
│   └── monitoring/            # Metrics and logging
│
├── artifacts/                 # Processed collections
│   └── {collection}/
│       ├── embeddings.npy
│       ├── faiss.index
│       ├── bm25.pkl
│       ├── chroma/
│       ├── documents.parquet
│       └── manifest.json
│
└── docs/
    ├── QUICK_START.md
    ├── PIPELINE_README.md
    ├── FINAL_SUMMARY.md
    └── TASK_COMPLETION_STATUS.md
```

## 🎨 Pre-Configured Collections

| Collection | Files | Format | Status |
|-----------|-------|--------|--------|
| Bhagavad Gita | 1 | CSV | ✅ Enabled |
| Ramayana | 5 | CSV | ✅ Enabled |
| Mahabharata | 1 | CSV | ⏸️ Disabled |
| Mahapuranas | 1 | Excel | ⏸️ Disabled |

## 💻 Usage Examples

### CLI Usage

```bash
# Process a collection
python cli.py run --collection bhagavad_gita

# List all collections
python cli.py list-collections

# Check status
python cli.py status --collection bhagavad_gita

# Run specific stages only
python cli.py run --collection ramayana --start-stage cleaning
```

### Python API Usage

#### Access Documents
```python
from src.data_access import CollectionAPI

api = CollectionAPI(artifact_dir="artifacts")

# Get documents
docs = api.get_documents("bhagavad_gita", limit=10)

# Get specific document
doc = api.get_document_by_id("bhagavad_gita", "doc_id")

# Count documents
count = api.count_documents("bhagavad_gita")
```

#### Search Across Collections
```python
from src.data_access import RetrievalAPI
from src.embeddings import EmbeddingService

# Initialize
embedding_service = EmbeddingService(
    model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    enable_cache=True
)

api = RetrievalAPI(
    artifact_dir="artifacts",
    embedding_service=embedding_service
)

# Vector search
results = api.search(
    query="dharma and duty",
    collections=["bhagavad_gita", "ramayana"],
    top_k=5
)

# Hybrid search (vector + BM25)
results = api.hybrid_search(
    query="karma yoga",
    collections=["bhagavad_gita"],
    top_k=5
)
```

## 🔧 Configuration

### Add a New Collection

Edit `config/collections.yaml`:

```yaml
collections:
  my_collection:
    source_files:
      - data/my_file.csv
    processor: csv
    schema_mapping:
      content: text_column
      metadata:
        - author
        - chapter
    embedding_model: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
    enabled: true
```

Then run:
```bash
python cli.py run --collection my_collection
```

## 🎯 Key Features

### ✅ Modular Architecture
- Clean separation of concerns
- Easy to extend and maintain
- Plugin architecture

### ✅ Multi-Collection Support
- Process multiple books independently
- Separate artifacts per collection
- Collection-level configuration

### ✅ Intelligent Caching
- Cache embeddings to avoid recomputation
- Significant performance improvement
- Cache statistics tracking

### ✅ Powerful Search
- Vector similarity (FAISS)
- Text search (BM25)
- Hybrid search (combines both)
- Cross-collection search

### ✅ Production Ready
- Comprehensive error handling
- Metrics and monitoring
- Resumable execution
- Detailed logging

## 📊 Output Artifacts

After processing, each collection has:

```
artifacts/{collection}/
├── embeddings.npy              # Vector embeddings
├── faiss.index                 # FAISS vector index
├── bm25.pkl                    # BM25 text index
├── chroma/                     # ChromaDB collection
├── documents.parquet           # Processed documents
├── manifest.json               # Processing metadata
├── metrics.json                # Performance metrics
└── collection_manifest.json    # Collection info
```

## 🚀 Building Features

Use the data access APIs to build:

### QA System
```python
from src.data_access import RetrievalAPI

# Search for relevant context
results = api.search(query, collections, top_k=5)

# Pass to LLM for answer generation
context = "\n".join([r.content for r in results])
answer = llm.generate(query, context)
```

### Search Engine
```python
# Semantic search
results = api.search(query, collections, top_k=10)

# Display results with scores
for result in results:
    print(f"{result.rank}. {result.content[:100]}...")
    print(f"   Score: {result.score:.4f}")
```

### Analytics Dashboard
```python
from src.storage import CollectionManager

manager = CollectionManager("artifacts")

# Get stats for all collections
for coll in manager.list_collections():
    stats = manager.get_collection_stats(coll.name)
    print(f"{coll.name}: {stats.document_count} docs")
```

## 📚 Documentation

- **QUICK_START.md** - Get started in 5 minutes
- **PIPELINE_README.md** - Complete user guide
- **FINAL_SUMMARY.md** - Comprehensive overview
- **TASK_COMPLETION_STATUS.md** - Implementation status
- **example_usage.py** - Code examples

## 🔍 Troubleshooting

### Collection Not Found
```bash
# Check if collection is configured
python cli.py list-collections

# Verify config file
cat config/collections.yaml
```

### Import Errors
```bash
# Install dependencies
pip install pandas numpy pyyaml click sentence-transformers faiss-cpu chromadb rank-bm25 openpyxl
```

### Processing Errors
```bash
# Check logs in console output
# Review manifest for details
cat artifacts/{collection}/manifest.json
```

## 🎉 Success Metrics

✅ **Modular Pipeline** - 5 independent stages
✅ **Multi-Format Support** - CSV + Excel (extensible)
✅ **Multi-Collection** - Process multiple books
✅ **Intelligent Caching** - Avoid recomputation
✅ **Powerful Search** - Vector + BM25 + Hybrid
✅ **Data Access APIs** - Clean interfaces
✅ **Production Ready** - Error handling, monitoring
✅ **Well Documented** - Complete guides
✅ **CLI Tool** - User-friendly interface
✅ **Extensible** - Easy to add features

## 🆘 Support

1. Check documentation files
2. Run `python test_pipeline.py`
3. Run `python example_usage.py`
4. Review logs and manifests
5. Check `PIPELINE_README.md` for details

## 📝 License

[Your License Here]

## 🙏 Acknowledgments

Built with:
- Python 3.8+
- pandas, numpy
- sentence-transformers
- FAISS, ChromaDB, BM25
- Click, PyYAML

---

## 🎤 LiveKit Voice Agent Integration

### Overview

The system now includes **real-time voice AI capabilities** powered by LiveKit, enabling users to have natural voice conversations with the Bhagavad Gita wisdom through advanced speech-to-speech interaction.

### Architecture

```
User Speech → LiveKit STT (Whisper) → RAG Query → LLM Response → Cartesia TTS → User Audio
```

### Features

- **Real-time Voice Interaction** - Speak naturally and receive immediate audio responses
- **Multilingual Support** - English, Hindi, Sanskrit voice processing
- **Spiritual Context** - Responses framed as divine wisdom from Krishna
- **Integrated RAG** - Direct access to your existing knowledge base
- **Production Ready** - Scalable, monitored, and enterprise-grade

### Setup

1. **Install Dependencies**
```bash
pip install -r requirements-api.txt
```

2. **Configure Environment**
```bash
# Copy and edit .env
cp .env.example .env

# Add your API keys
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
CARTESIA_API_KEY=your_cartesia_api_key
```

3. **Run Voice Agent**
```bash
python src/rag/voice_agent/livekit_agent.py start
```

### Voice Agent Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Speech-to-Text** | OpenAI Whisper | Convert user speech to text |
| **Voice Activity Detection** | Silero VAD | Detect when user is speaking |
| **Language Model** | GPT-4o | Generate contextual responses |
| **Text-to-Speech** | Cartesia Sonic | Convert responses to natural speech |
| **Real-time Transport** | LiveKit | Handle audio streaming and rooms |

### Integration Points

- **RAG Backend** - Uses your existing `MultilingualQASystem`
- **Knowledge Base** - Access to all processed collections
- **Memory Management** - Conversation context across turns
- **Analytics** - Track voice query metrics
- **Caching** - Intelligent response caching

### Usage Examples

#### Start Voice Session
```python
from src.rag.voice_agent.livekit_agent import initialize_system

# Initialize the voice-enabled QA system
qa_system = await initialize_system()

# The agent will connect to LiveKit room and start listening
```

#### Voice Query Processing
```python
# The agent automatically handles:
# 1. Speech recognition
# 2. Query understanding
# 3. RAG retrieval
# 4. Response generation
# 5. Text-to-speech synthesis
```

### Configuration Options

```python
# Voice settings in src/config/voice_config.py
LIVEKIT_URL=your_livekit_server
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_secret
CARTESIA_API_KEY=your_tts_key
STT_MODEL=whisper-1
TTS_VOICE=bf0a246a-8642-498a-9950-80c35e9276b5
```

### Future Enhancements

- **Multilingual Voices** - Hindi and Sanskrit TTS support
- **Conversation Memory** - Maintain context across sessions
- **Session Analytics** - Voice interaction metrics
- **Frontend Integration** - Web SDK for browser-based voice chat
- **Multi-user Rooms** - Group voice discussions

### API Endpoints

The voice agent integrates with existing FastAPI endpoints:

- `POST /voice/` - Voice query processing
- `POST /voice/stt/` - Speech-to-text conversion
- `POST /voice/tts/` - Text-to-speech synthesis

### Monitoring & Analytics

Voice interactions are tracked through the existing analytics system:

```python
# View voice analytics
analytics = qa_system.get_analytics()
print(analytics["voice_interactions"])
```

---

**Status**: ✅ **PRODUCTION READY**

Start processing your collections now:
```bash
python cli.py run --collection bhagavad_gita
```

🎤 **Voice-enabled spiritual guidance ready!**

🚀 **Happy building!**
