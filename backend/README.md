# DivyaVaani AI - Multilingual RAG System

A comprehensive multilingual AI system for Sanskrit, Hindi, and English text understanding and generation, featuring advanced RAG capabilities, voice processing, and multilingual support.

## 📁 Complete Project Structure

```
DivyaVaani-ai/
├── 📄 README.md                          # This file - Complete project documentation
├── 📄 .env                               # Environment variables (development)
├── 📄 .env.example                       # Environment variables template
├── 📄 .gitignore                         # Git ignore rules
├── 📄 Makefile                           # Build automation commands
├── 📄 requirements-api.txt               # API dependencies
├── 📄 requirements-dev.txt               # Development dependencies
├── 📄 docker-compose.yml                 # Docker containerization
├── 📄 .env                               # Environment variables (development)
├── 📄 .env.example                       # Environment variables template
├── 📁 tests/                             # Test files
│   ├── 📄 run_complete_test.py           # Complete test runner
│   ├── 📄 test_advanced_features.py      # Advanced features tests
│   └── 📄 test_api_routes.py             # API routes tests
├── 📁 cache/                            # Cache directory
│   └── (cached data files)

├── 📁 config/                           # Configuration files
│   ├── 📄 collections.py                # Database collections config
│   ├── 📄 text_config.py               # Text processing config
│   └── 📄 voice_config.py              # Voice processing config

├── 📁 data/                             # Knowledge base data
│   ├── 📄 18_Mahapuranas_DataSet.xlsx   # Mahapuranas dataset
│   ├── 📄 database_metadata.xlsx        # Database metadata
│   ├── 📄 train_data.csv                # Training data
│   ├── 📄 train.csv                     # Training dataset
│   ├── 📄 sample_vedic.csv              # Sample Vedic texts
│   ├── 📄 bhagavad_gita_verses.csv      # Bhagavad Gita verses
│   ├── 📄 bhagavad_gita.csv             # Bhagavad Gita data
│   ├── 📄 mahabharat_1-2.csv            # Mahabharata data
│   ├── 📄 aranyakanda.csv               # Aranyakanda (Ramayana)
│   ├── 📄 ayodhyakand.csv               # Ayodhyakanda (Ramayana)
│   ├── 📄 balakanda.csv                 # Balakanda (Ramayana)
│   ├── 📄 kishkindakanda.csv            # Kishkindakanda (Ramayana)
│   ├── 📄 sundarakanda.csv              # Sundarakanda (Ramayana)
│   ├── 📄 amrita.pdf                    # Amrita text
│   ├── 📄 anger.pdf                     # Anger management
│   ├── 📄 autobio.pdf                   # Autobiography
│   ├── 📄 bgita.pdf                     # Bhagavad Gita
│   ├── 📄 Brahma_Sutra.pdf             # Brahma Sutra
│   ├── 📄 brahmacharya.pdf             # Brahmacharya
│   ├── 📄 chida80.pdf                   # Chidananda text
│   ├── 📄 easysteps.pdf                 # Easy steps guide
│   ├── 📄 essence_yoga.pdf              # Essence of Yoga
│   ├── 📄 gita_busy.pdf                 # Gita for busy people
│   ├── 📄 god_exists.pdf                # Does God exist
│   ├── 📄 greatguru.pdf                 # Great Guru
│   ├── 📄 gurudevaki.pdf                # Gurudevaki
│   ├── 📄 gurutattva.pdf                # Guru Tattva
│   ├── 📄 hinduismbk.pdf                # Hinduism book
│   ├── 📄 inspiringthoughts.pdf         # Inspiring thoughts
│   ├── 📄 kundalini.pdf                 # Kundalini
│   ├── 📄 lightpower.pdf                # Light and Power
│   ├── 📄 lordkrishna.pdf               # Lord Krishna
│   ├── 📄 manage.pdf                    # Management
│   ├── 📄 mind.pdf                      # Mind
│   ├── 📄 modernsage.pdf                # Modern Sage
│   ├── 📄 monk.pdf                      # Monk
│   ├── 📄 pranayama.pdf                 # Pranayama
│   ├── 📄 saintsivananda.pdf            # Saints of Sivananda
│   ├── 📄 selfknowledge.pdf             # Self Knowledge
│   └── 📄 sivananda_dls.pdf             # Sivananda Daily Lesson

├── 📁 docs/                             # Documentation
│   ├── 📄 BACKEND_API_README.md         # Backend API documentation
│   ├── 📄 LIVEKIT_README.md             # LiveKit integration guide
│   ├── 📄 PIPELINE_README.md            # Pipeline documentation
│   ├── 📄 QUICK_START.md                # Quick start guide
│   ├── 📄 README_NEW_SYSTEM.md          # New system documentation
│   ├── 📄 FRONTEND_FIXES.md             # Frontend fixes
│   ├── 📄 VOICE_CLI_USAGE.md            # Voice CLI usage
│   ├── 📁 api/                          # API documentation
│   │   ├── 📄 text_endpoints.md         # Text API endpoints
│   │   └── 📄 voice_endpoints.md        # Voice API endpoints

├── 📁 examples/                         # Code examples
│   └── (example implementations)


├── 📁 notebook/                         # Jupyter notebooks
│   └── (notebook files)

├── 📁 scripts/                          # Automation scripts
│   ├── 📄 build.py                      # Build script
│   └── 📄 run_api.py                    # API runner script

├── 📁 src/                              # Source code
│   ├── 📄 __init__.py                   # Package initialization
│   ├── 📁 api/                          # API layer
│   │   ├── 📄 __init__.py               # Package initialization
│   │   ├── 📄 cache.py                  # API caching
│   │   ├── 📄 main.py                   # FastAPI main application
│   │   ├── 📄 models.py                 # Data models
│   │   └── 📁 routes/                   # API routes
│   │       ├── 📄 __init__.py           # Package initialization
│   │       ├── 📁 text/                 # Text processing routes
│   │       │   ├── 📄 __init__.py       # Package initialization
│   │       │   └── 📄 query.py          # Text query endpoint
│   │       └── 📁 voice/                # Voice processing routes
│   │           ├── 📄 __init__.py       # Package initialization
│   │           ├── 📄 query.py          # Voice query endpoint
│   │           ├── 📄 stt.py            # Speech-to-text endpoint
│   │           └── 📄 tts.py            # Text-to-speech endpoint
│   ├── 📁 config/                       # Configuration management
│   │   ├── 📄 __init__.py               # Package initialization
│   │   ├── 📄 api_config.py             # API configuration
│   │   ├── 📄 collections.py            # Collections config
│   │   ├── 📄 text_config.py            # Text processing config
│   │   └── 📄 voice_config.py           # Voice processing config
│   ├── 📁 core/                         # Core functionality
│   │   └── 📄 exceptions.py             # Custom exceptions
│   ├── 📁 data/                         # Data processing
│   │   ├── 📄 __init__.py               # Package initialization
│   │   └── 📄 loader.py                 # Data loader
│   ├── 📁 embeddings/                   # Embedding generation
│   │   ├── 📄 __init__.py               # Package initialization
│   │   ├── 📄 cache.py                  # Embedding cache
│   │   ├── 📄 clip_processor.py         # CLIP processor
│   │   ├── 📄 distributed_cache.py      # Distributed caching
│   │   ├── 📄 generator.py              # Embedding generator
│   │   ├── 📄 multimodal_fusion.py      # Multimodal fusion
│   │   └── 📄 service.py                # Embedding service
│   ├── 📁 monitoring/                   # System monitoring
│   │   ├── 📄 __init__.py               # Package initialization
│   │   ├── 📄 health.py                 # Health checks
│   │   └── 📄 metrics.py                # Metrics collection
│   ├── 📁 pipeline/                     # Data processing pipeline
│   │   ├── 📄 __init__.py               # Package initialization
│   │   ├── 📄 build_pipeline.py         # Pipeline builder
│   │   ├── 📄 models.py                 # Pipeline models
│   │   ├── 📄 orchestrator.py           # Pipeline orchestrator
│   │   ├── 📁 processors/               # File processors
│   │   │   ├── 📄 __init__.py           # Package initialization
│   │   │   ├── 📄 base.py               # Base processor
│   │   │   ├── 📄 code_processor.py     # Code file processor
│   │   │   ├── 📄 csv_processor.py      # CSV processor
│   │   │   ├── 📄 excel_processor.py    # Excel processor
│   │   │   ├── 📄 image_processor.py    # Image processor
│   │   │   ├── 📄 pdf_processor.py      # PDF processor
│   │   │   ├── 📄 registry.py           # Processor registry
│   │   │   └── 📄 table_processor.py    # Table processor
│   │   └── 📁 stages/                   # Pipeline stages
│   │       ├── 📄 __init__.py           # Package initialization
│   │       ├── 📄 base.py               # Base stage
│   │       ├── 📄 cleaning.py           # Data cleaning
│   │       ├── 📄 embedding.py          # Embedding generation
│   │       ├── 📄 indexing.py           # Indexing stage
│   │       ├── 📄 ingestion.py          # Data ingestion
│   │       └── 📄 validation.py         # Data validation
│   ├── 📁 rag/                          # RAG system
│   │   ├── 📄 __init__.py               # Package initialization
│   │   ├── 📄 multilingual_qa_system.py # Multilingual QA system
│   │   ├── 📄 qa_system.py              # Core QA system
│   │   ├── 📁 analytics/                # Analytics
│   │   │   ├── 📄 __init__.py           # Package initialization
│   │   │   └── 📄 tracker.py            # Analytics tracker
│   │   ├── 📁 cache/                    # RAG caching
│   │   │   ├── 📄 __init__.py           # Package initialization
│   │   │   ├── 📄 base.py               # Base cache
│   │   │   ├── 📄 manager.py            # Cache manager
│   │   │   ├── 📄 memory_cache.py       # Memory cache
│   │   │   └── 📄 redis_cache.py        # Redis cache
│   │   ├── 📁 language/                 # Language processing
│   │   │   ├── 📄 __init__.py           # Package initialization
│   │   │   ├── 📄 detector.py           # Language detector
│   │   │   └── 📄 processor.py          # Language processor
│   │   ├── 📁 memory/                   # Conversation memory
│   │   │   ├── 📄 __init__.py           # Package initialization
│   │   │   ├── 📄 base.py               # Base memory
│   │   │   ├── 📄 contextual.py         # Contextual memory
│   │   │   ├── 📄 conversation.py       # Conversation memory
│   │   │   └── 📄 manager.py            # Memory manager
│   │   ├── 📁 prompts/                  # Prompt management
│   │   │   ├── 📄 __init__.py           # Package initialization
│   │   │   ├── 📄 base.py               # Base prompt
│   │   │   ├── 📄 english.py            # English prompts
│   │   │   ├── 📄 hindi.py              # Hindi prompts
│   │   │   ├── 📄 hybrid.py             # Hybrid prompts
│   │   │   ├── 📄 manager.py            # Prompt manager
│   │   │   └── 📄 sanskrit.py           # Sanskrit prompts
│   │   ├── 📁 quality/                  # Quality assessment
│   │   │   ├── 📄 __init__.py           # Package initialization
│   │   │   └── 📄 assessor.py           # Quality assessor
│   │   ├── 📁 user/                     # User management
│   │   │   ├── 📄 __init__.py           # Package initialization
│   │   │   └── 📄 manager.py            # User manager
│   │   └── 📁 voice/                    # Voice processing
│   │       ├── 📄 __init__.py           # Package initialization
│   │       ├── 📄 speech_to_text.py     # Speech-to-text
│   │       ├── 📄 text_to_speech.py     # Text-to-speech
│   │       └── 📄 voice_processor.py    # Voice processor
│   ├── 📁 retrieval/                    # Information retrieval
│   │   ├── 📄 __init__.py               # Package initialization
│   │   └── 📄 hybrid_retriever.py       # Hybrid retriever
│   ├── 📁 security/                     # Security features
│   │   ├── 📄 __init__.py               # Package initialization
│   │   └── 📄 auth.py                   # Authentication
│   └── 📁 services/                     # Business services
│       ├── 📄 __init__.py               # Package initialization
│       └── 📄 text_service.py           # Text processing service

└── 📁 tests/                            # Test directory
    └── (test files)
```

## 🏗️ Architecture Overview

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Library**: Custom component library with shadcn/ui
- **Styling**: Tailwind CSS + PostCSS
- **Features**:
  - Multilingual chat interface
  - Language selector
  - Real-time messaging
  - Analytics dashboard
  - Search history
  - System status monitoring

### Backend (Python)
- **Framework**: FastAPI
- **Language**: Python 3.8+
- **Architecture**: Microservices with modular design
- **Key Components**:
  - RAG (Retrieval-Augmented Generation) system
  - Multilingual processing (Sanskrit, Hindi, English)
  - Voice processing (STT/TTS)
  - Embedding generation and caching
  - Data pipeline processing

### Data Layer
- **Formats Supported**: PDF, CSV, Excel, Images, Text
- **Knowledge Base**: Sanskrit scriptures, Vedic texts, spiritual content
- **Cache**: Redis + Memory cache for performance
- **Storage**: File-based with database metadata

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- Docker (optional)
- Redis (for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DivyaVaani-ai
   ```

2. **Backend Setup**
   ```bash
   # Install Python dependencies
   pip install -r requirements-api.txt
   pip install -r requirements-dev.txt

   # Set up environment variables
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install

   # Set up environment variables
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Services**
   ```bash
   # Start Redis (if using Docker)
   docker-compose up -d redis

   # Start the backend API
   python -m src.api.main

   # Start the frontend (in another terminal)
   cd frontend && npm run dev
   ```

### Using Docker
```bash
# Start all services with Docker
docker-compose up -d
```

## 📚 Key Features

### 1. Multilingual RAG System
- **Sanskrit**: Ancient Vedic texts, Upanishads, Bhagavad Gita
- **Hindi**: Modern interpretations and translations
- **English**: Contemporary explanations and insights
- **Hybrid**: Cross-language knowledge retrieval

### 2. Voice Processing
- **Speech-to-Text**: Multi-language voice input
- **Text-to-Speech**: Natural voice synthesis
- **Voice Queries**: Conversational AI with voice commands

### 3. Data Pipeline
- **Multi-format Support**: PDF, CSV, Excel, Images
- **Automated Processing**: Pipeline-based data ingestion
- **Quality Validation**: Data cleaning and validation stages
- **Embedding Generation**: Vector representations for semantic search

### 4. Caching & Performance
- **Redis Cache**: Distributed caching for embeddings
- **Memory Cache**: Fast local caching
- **Query Optimization**: Intelligent query routing and caching

### 5. User Interface
- **Modern Chat**: Real-time messaging interface
- **Analytics Dashboard**: Usage analytics and insights
- **Multi-language Support**: Interface in multiple languages
- **Responsive Design**: Mobile and desktop optimized

## 🔧 Configuration

### Environment Variables
```bash
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4

# Database Configuration
DATABASE_URL=sqlite:///./divyavaani.db
REDIS_URL=redis://localhost:6379

# Model Configuration
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
LLM_MODEL=minimax/minimax-m2:free

# Language Support
SUPPORTED_LANGUAGES=en,hi,san
DEFAULT_LANGUAGE=en

# Voice Configuration
STT_PROVIDER=openai
TTS_PROVIDER=openai
```

### Custom Data
Add your knowledge base files to the `data/` directory (ignored by git):
- PDF files for documents
- CSV files for structured data
- Excel files for tabular data
- Images for visual content

Note: The `data/` directory is gitignored to avoid committing large files.

## 🧪 Testing

Run the complete test suite:
```bash
python tests/run_complete_test.py
```

Run specific tests:
```bash
# API tests
pytest src/api/tests/

# RAG system tests
pytest src/rag/tests/

# Frontend tests
cd frontend && npm test
```

## 📖 API Documentation

Once the API is running, visit:
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints
- `POST /api/v1/text/query` - Text-based queries
- `POST /api/v1/voice/query` - Voice-based queries
- `POST /api/v1/voice/stt` - Speech-to-text conversion
- `POST /api/v1/voice/tts` - Text-to-speech conversion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript strict mode for frontend
- Write comprehensive tests
- Update documentation for new features
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Sanskrit texts from various digitized sources
- OpenAI for language models
- Sentence Transformers for embeddings
- The open-source community for tools and libraries

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the implementation guides

---

**DivyaVaani AI** - Bridging ancient wisdom with modern technology 🌟
