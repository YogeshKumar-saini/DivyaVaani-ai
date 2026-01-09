# 🕉️ DivyaVaani AI - Spiritual Intelligence Platform

**Bridging Ancient Wisdom with Modern AI Technology**

A comprehensive multilingual AI system for Sanskrit, Hindi, and English spiritual literature, featuring advanced Retrieval-Augmented Generation (RAG), voice processing, and intuitive web interface. Built for profound spiritual inquiry and guidance through sacred texts like the Bhagavad Gita, Upanishads, and other Vedic scriptures.

![DivyaVaani AI](https://github.com/YogeshKumar-saini/DivyaVaani-ai/workflows/CI/CD/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## 🌟 What is DivyaVaani AI?

DivyaVaani AI is an enterprise-grade spiritual intelligence platform that combines:
- **Advanced AI** for understanding complex spiritual concepts
- **Multilingual Support** for Sanskrit, Hindi, and English
- **Voice Interaction** for natural, conversational spiritual guidance
- **Knowledge Base** of authentic spiritual texts and commentaries
- **Modern Web Interface** for accessible spiritual learning

## ✨ Key Features

### 🧠 AI-Powered Spiritual Guidance
- **Advanced RAG Technology**: Retrieval-Augmented Generation using vector embeddings for accurate scriptural responses
- **Contextual Understanding**: Deep semantic analysis of spiritual concepts using transformer models
- **Personalized Responses**: Adaptive answers based on conversation history and user preferences
- **Scriptural References**: Cross-referenced citations with verse numbers, chapters, and translation sources
- **Ethical AI Framework**: Designed with spiritual principles of ahimsa (non-harm), dharma (righteousness), and satya (truth)
- **Quality Assurance**: Response validation against verified spiritual texts with confidence scoring
- **Memory System**: Conversation context preservation using advanced memory management techniques

### 🌍 Multilingual Excellence
- **Sanskrit Language Support**: Authentic Devanagari script processing with transliteration capabilities
- **Hindi Text Processing**: Regional language support with Hindi-English bidirectional translation
- **English Comprehension**: Advanced natural language understanding for contemporary spiritual queries
- **Hybrid Retrieval**: Cross-language knowledge fusion using multilingual embedding models
- **Language Detection**: Automatic language identification for optimal processing
- **Script Conversion**: transliteration between Devanagari, IAST, and Romanized Sanskrit
- **Cultural Context Preservation**: Maintaining spiritual nuances across language boundaries

### 🎤 Voice-First Experience
- **Multi-Provider STT**: Integration with OpenAI Whisper, Google Speech, and Azure Cognitive Services
- **Natural TTS Synthesis**: High-quality text-to-speech with spiritual tone modulation
- **Real-time Processing**: Sub-second voice conversion for seamless conversations
- **Noise Cancellation**: Advanced audio preprocessing for clear voice input in various environments
- **Pronunciation Accuracy**: Specialized models trained on Sanskrit pronunciation patterns
- **Voice Commands**: Natural language voice control for system navigation and queries
- **Audio Playback**: Chapter-wise scripture recitation with adjustable speed and volume

### 📚 Comprehensive Knowledge Base
- **Complete Bhagavad Gita**: All 18 chapters with multiple commentaries (Shankara, Ramanuja, Madhva, modern)
- **Upanishadic Wisdom**: 108+ principal Upanishads with philosophical explanations
- **Epic Literature**: Ramayana and Mahabharata textual analysis and contextual insights
- **Yoga Philosophy**: Patanjali's Yoga Sutras, Hatha Yoga, Raja Yoga texts
- **Bhakti Literature**: Devotional texts and compositions from various saints
- **Modern Commentary**: Contemporary interpretations from spiritual teachers and scholars
- **Document Processing**: Multi-format support (PDF, EPUB, DOC, handwritten manuscripts)
- **Metadata Enrichment**: Automatic categorization, author attribution, and contextual linking

### 🎨 Modern User Interface
- **Progressive Web App**: Installable PWA with offline query caching capabilities
- **Real-time Chat Interface**: Streaming responses with typing indicators and message threading
- **Advanced Analytics**: Live dashboards with query patterns, user engagement, and system health metrics
- **Responsive Grid System**: Adaptive layouts optimized for mobile, tablet, and desktop viewing
- **Accessibility Standards**: WCAG 2.1 AA compliance with screen reader support and keyboard navigation
- **Theme Customization**: Light/dark modes with spiritual color palettes and font choices
- **Interactive Elements**: Drag-drop file uploads, voice recording controls, and progress indicators
- **Search & Discovery**: Advanced filtering, tagging, and recommendation systems for spiritual content

## 🏗️ Architecture Overview

### Frontend (Next.js)
```
Frontend Layer
├── Next.js 15 - React Framework
├── TypeScript - Type Safety
├── Tailwind CSS - Styling
├── shadcn/ui - Component Library
├── Real-time Chat Interface
├── Analytics Dashboard
└── Multilingual Support
```

### Backend (FastAPI)
```
API Layer
├── FastAPI - High Performance
├── Python 3.8+ - Core Language
├── Multimodal Processing
├── RAG System
├── Voice Synthesis
└── Advanced Caching
```

### Data Pipeline
```
Knowledge Processing
├── Multi-format Intake (PDF, CSV, Images)
├── Automated Cleaning & Validation
├── Embedding Generation
├── Vector Storage (Chroma, FAISS)
└── Semantic Retrieval
```

### Infrastructure
```
Scalable Services
├── Docker & Docker Compose
├── Redis Caching
├── File-based Storage
├── Health Monitoring
└── API Documentation
```

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+**
- **Node.js 18+**
- **Docker & Docker Compose** (optional but recommended)
- **Redis** (for caching)

### One-Command Setup
```bash
# Clone repository
git clone https://github.com/YogeshKumar-saini/DivyaVaani-ai.git
cd DivyaVaani-ai

# Quick setup and run
make setup
make run
```

### Using Docker
You can start the entire system (backend, frontend, and redis) using Docker Compose from the root directory:

```bash
# Start all services
docker compose up -d

# Build services
docker compose build
```

The individual services are:
- **Backend API**: http://localhost:8000
- **Frontend App**: http://localhost:3000
- **Redis**: localhost:6379

> [!NOTE]
> Ensure you have your `.env` file set up in the `backend` directory before starting the services.

### Local Development
For local development without Docker:

```bash
# Install dependencies
make install

# Configure environment files
cp backend/.env.example backend/.env
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > frontend/.env.local

# Run development servers
make run
```

### CI/CD Pipeline
The project includes automated CI/CD with GitHub Actions:

- **Continuous Integration**: Tests run on every push and PR
- **Continuous Deployment**: Automatic deployment to production on main branch
- **Docker Integration**: Automated container builds and pushes

**Required Secrets for CD:**
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password
- `SERVER_HOST`: Production server hostname
- `SERVER_USER`: SSH username for deployment
- `SERVER_SSH_KEY`: Private SSH key for deployment

Visit `http://localhost:3000` for the web interface.

## 📦 Detailed Installation

### Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements-api.txt
pip install -r requirements-dev.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys and settings

# Start Redis cache
docker-compose up -d redis

# Run API server
python -m src.api.main
```

### Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

### Environment Variables
```bash
# Backend (.env)
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4
DATABASE_URL=sqlite:///./divyavaani.db
REDIS_URL=redis://localhost:6379
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
LLM_MODEL=minimax/minimax-m2:free
SUPPORTED_LANGUAGES=en,hi,san
DEFAULT_LANGUAGE=en

# Frontend (.env.local)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME="DivyaVaani AI"
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## 🎯 Usage Examples

### Text Query with Full Response
```bash
# Request
curl -X POST "http://localhost:8000/api/v1/text/query" \
     -H "Content-Type: application/json" \
     -d '{
       "question": "What is karma yoga according to Bhagavad Gita?",
       "language": "en",
       "context": "user_background_beginner",
       "include_references": true
     }'

# Response
{
  "answer": "Karma Yoga, as described in the Bhagavad Gita, is the path of selfless action...",
  "references": [
    {
      "text": "Chapter 3, Verse 19: Therefore, without attachment to the results of activities...",
      "source": "Bhagavad Gita",
      "chapter": 3,
      "verse": 19
    }
  ],
  "confidence": 0.95,
  "language": "en",
  "processing_time": 1.2
}
```

### Voice Query Processing
```bash
# Upload audio file (WAV/MP3 format)
curl -X POST "http://localhost:8000/api/v1/voice/query" \
     -H "Content-Type: multipart/form-data" \
     -F "audio=@question.wav" \
     -F "language=en"

# Response includes both transcription and answer
{
  "transcription": "What does Krishna say about detachment?",
  "answer": "Lord Krishna explains that true detachment means performing duties...",
  "audio_response_url": "/api/v1/audio/response_123.mp3",
  "references": [...],
  "processing_time": 2.1
}
```

### Text-to-Speech Synthesis
```bash
curl -X POST "http://localhost:8000/api/v1/voice/tts" \
     -H "Content-Type: application/json" \
     -d '{
       "text": "You must perform your prescribed duty, for action is better than inaction...",
       "language": "en",
       "voice": "spiritual_guide",
       "speed": 1.0
     }'

# Returns audio file URL for playback
```

### Analytics Dashboard
```bash
curl "http://localhost:8000/analytics"

# Response with system metrics
{
  "total_queries": 15420,
  "queries_today": 234,
  "popular_topics": [
    {"topic": "Karma Yoga", "count": 1240},
    {"topic": "Bhakti", "count": 890}
  ],
  "response_times": {
    "average": 1.3,
    "95th_percentile": 2.8
  },
  "system_health": {
    "status": "healthy",
    "uptime": "99.8%",
    "memory_usage": "2.3GB"
  }
}
```

### Advanced Text Analysis
```bash
curl -X POST "http://localhost:8000/api/v1/text/analyze" \
     -H "Content-Type: application/json" \
     -d '{
       "text": "Om Shanti",
       "analysis_type": "semantic",
       "include_pronunciation": true
     }'

# Detailed analysis response
{
  "semantic_analysis": {
    "meaning": "Peace invocation",
    "sanskrit_root": "शान्ति (shanti)",
    "philosophical_context": "Spiritual peace and harmony"
  },
  "pronunciation": {
    "transliteration": "Om Shaan-tee",
    "ipa": "/oʊm ʃɑːnti/",
    "audio_guide": "/audio/pronunciation.mp3"
  }
}
```

## 📖 API Documentation

### Core Endpoints

#### Text Processing
- `POST /api/v1/text/query` - Spiritual text queries
- `POST /api/v1/text/analyze` - Text analysis and insights

#### Voice Processing
- `POST /api/v1/voice/stt` - Convert speech to text
- `POST /api/v1/voice/tts` - Convert text to speech
- `POST /api/v1/voice/query` - Voice-based queries

#### Analytics & Monitoring
- `GET /analytics` - System usage statistics
- `GET /health` - API health status

**Interactive API Docs**: http://localhost:8000/docs

## 🔧 Configuration

### Knowledge Base Setup
```bash
# Add spiritual texts to backend/data/
# Supported formats: PDF, CSV, Excel, Images, Text

# Run data pipeline
cd backend && python scripts/build_pipeline.py

# Embeddings will be generated automatically
# Vectors stored in configured vector database
```

### Custom Models
```bash
# Configure in .env
EMBEDDING_MODEL=all-MiniLM-L6-v2
LLM_MODEL=minimax/minimax-m2:free

# For local models
LOCAL_LLM_MODEL=mistral-7b-instruct
USE_LOCAL_LLM=true
```

### Scaling
```bash
# Multiple API workers
API_WORKERS=8

# Distribute across servers
# Configure Redis cluster for embeddings cache
# Use load balancer for multiple API instances
```

## 🧪 Testing

```bash
# Backend tests
cd backend
python tests/run_complete_test.py
pytest src/api/tests/ -v

# Frontend tests
cd frontend
npm test
npm run test:e2e

# Integration tests
python tests/integration/test_voice_agent_integration.py
```

## 🚀 Deployment

### Production Docker Deployment
```bash
# Build and deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d --build

# Or use Makefile
make deploy-prod

# Scale services
docker-compose up -d --scale api=3 --scale redis=2

# Monitor deployment
docker-compose logs -f api
```

### Cloud Deployment (AWS/GCP/Azure)
```bash
# Using AWS ECS
aws ecs create-cluster --cluster-name divyavaani-cluster
aws ecs register-task-definition --family divyavaani-api --container-definitions file://api-container.json

# Using Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.swarm.yml divyavaani

# Kubernetes deployment
kubectl apply -f kubernetes/
```

### Reverse Proxy Configuration (nginx)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL/TLS Setup
```bash
# Using Let's Encrypt
certbot --nginx -d yourdomain.com

# Or manually with OpenSSL
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```

## 🐛 Troubleshooting

### Common Issues & Solutions

#### API Connection Issues
```bash
# Check if API is running
curl http://localhost:8000/health

# View API logs
docker-compose logs api

# Restart services
docker-compose restart api
```

#### Voice Processing Not Working
- **Check audio format**: Ensure WAV/MP3 format with proper encoding
- **Verify API keys**: Confirm STT/TTS provider credentials in `.env`
- **Audio permissions**: Allow microphone access in browser
- **Network connectivity**: Test internet connection for cloud services

#### Database/Embedding Issues
```bash
# Rebuild vector database
cd backend && python scripts/rebuild_embeddings.py

# Check vector store health
curl http://localhost:8000/health/vectors

# Clear Redis cache if corrupted
docker-compose exec redis redis-cli FLUSHALL
```

#### Frontend Build Issues
```bash
# Clear Next.js cache
cd frontend && rm -rf .next node_modules
npm install && npm run build

# Check Node.js version
node --version  # Should be 18+

# Verify environment variables
cat .env.local
```

#### Performance Problems
- **Monitor resource usage**: `docker stats`
- **Scale API workers**: Set `API_WORKERS=8` in `.env`
- **Enable caching**: Configure Redis properly
- **Optimize queries**: Check for excessive embeddings generation

#### Language Support Issues
- **Sanskrit rendering**: Install Devanagari fonts
- **Encoding problems**: Ensure UTF-8 encoding in all files
- **Transliteration fails**: Check IAST library installation

### Debug Commands
```bash
# Full system status
make status

# Complete log aggregation
docker-compose logs --tail=100 -f

# API performance profiling
curl "http://localhost:8000/debug/profile"

# Database query analysis
python -c "from src.database import inspect_queries; inspect_queries()"
```

### Getting Help
1. **Check documentation**: Visit `/docs` for detailed guides
2. **Run diagnostics**: `make diagnose` for automated troubleshooting
3. **Community support**: Create issue with logs and system info
4. **Email support**: Include error messages and deployment details

## 📊 Performance & Monitoring

### Performance Benchmarks
- **Response Time**:
  - Text queries: < 2s (average 1.3s)
  - Voice queries: < 4s (including STT/TTS)
  - First query: < 8s (cold start)
- **Throughput**: 100 concurrent users
- **Voice Processing**: Sub-second audio conversion
- **Cache Hit Rate**: > 85% for common queries
- **Availability**: 99.9% uptime SLA

### System Requirements
- **CPU**: 4+ cores (8+ recommended for production)
- **RAM**: 8GB minimum (16GB+ recommended)
- **Storage**: 50GB for base knowledge base (scalable)
- **Network**: 100Mbps+ for voice processing

### Monitoring Stack
```bash
# Health checks
GET /health           # System health
GET /health/api       # API service status
GET /health/database  # Database connectivity
GET /health/cache     # Redis status

# Metrics endpoints
GET /metrics          # Prometheus metrics
GET /analytics        # Application analytics
GET /debug/info       # System information

# Log aggregation (ELK Stack)
- Elasticsearch: Document storage
- Logstash: Log processing
- Kibana: Visualization dashboard
```

### Alerting & Notifications
- **Response time > 5s**: Email alert to admin
- **Cache miss rate > 50%**: Performance warning
- **API error rate > 5%**: Critical alert
- **Disk usage > 85%**: Storage warning

## 🤝 Contributing

We welcome contributions to enhance spiritual technology accessibility!

### Development Workflow
1. **Fork & Clone**
   ```bash
   git clone https://github.com/YogeshKumar-saini/DivyaVaani-ai.git
   cd DivyaVaani-ai
   ```

2. **Set up Development Environment**
   ```bash
   make setup  # Backend dependencies
   cd frontend && npm install
   ```

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/spiritual-guidance-enhancement
   ```

4. **Follow Code Standards**
   ```bash
   make lint     # Python linting
   cd frontend && npm run lint  # TypeScript linting
   ```

5. **Add Tests & Documentation**
   ```bash
   make test     # Run all tests
   # Update docs in backend/docs/
   ```

6. **Submit Pull Request**
   ```bash
   git push origin feature/spiritual-guidance-enhancement
   # Create PR with detailed description
   ```

### Guidelines
- **Code Quality**: Follow PEP 8 (Python) and ESLint rules
- **Documentation**: Update READMEs and API docs for changes
- **Testing**: Add tests for new features
- **Accessibility**: Ensure inclusive design principles
- **Cultural Respect**: Handle sacred texts with reverence

## 📄 Project Structure

```
DivyaVaani-ai/
├── README.md                    # This file - Project overview
├── docker-compose.yml           # Container orchestration
├── Makefile                     # Build automation
│
├── backend/                     # Python FastAPI backend
│   ├── src/                     # Source code
│   ├── data/                    # Knowledge base (gitignored)
│   ├── docs/                    # API documentation
│   ├── requirements*.txt        # Dependencies
│   └── tests/                   # Test suites
│
├── frontend/                    # Next.js TypeScript frontend
│   ├── app/                     # Next.js App Router
│   ├── components/              # UI components
│   ├── lib/                     # Utilities
│   ├── public/                  # Static assets
│   └── tests/                   # Frontend tests
│
└── scripts/                     # Utility scripts
```

## 🔒 Security & Privacy

### Data Protection
- **No User Data Storage**: Queries processed in-memory
- **Secure API Communication**: HTTPS encryption
- **Input Sanitization**: All inputs validated and cleaned
- **Rate Limiting**: Prevent abuse and ensure fair usage

### Ethical Considerations
- **Spiritual Accuracy**: Responses verified against scriptures
- **Cultural Respect**: Appropriate handling of sacred content
- **Accessibility**: Inclusive design for all users
- **Transparency**: Open-source for community review

## 📈 Roadmap

### Phase 1: Core Foundation ✅
- [x] Multilingual RAG system
- [x] Voice processing capabilities
- [x] Web interface
- [x] Docker deployment

### Phase 2: Advanced Features 🚧
- [ ] Sanskrit script recognition
- [ ] Personalized spiritual journeys
- [ ] Audio commentary library
- [ ] Advanced meditation guides

### Phase 3: Community & Scale 📋
- [ ] Mobile applications
- [ ] API marketplace
- [ ] Multi-tenant deployment
- [ ] International localization

### Phase 4: Innovation 🔬
- [ ] VR spiritual experiences
- [ ] AI-powered meditation
- [ ] Cross-scriptural analysis
- [ ] Predictive spiritual insights

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

The spiritual texts included are in the public domain and provided for educational purposes.

## 🙏 Acknowledgments

### Sacred Sources
- **Bhagavad Gita**: Divine wisdom of Lord Krishna
- **Vedic Literature**: Ancient Indian scriptures
- **Spiritual Traditions**: Yoga, Vedanta, and modern interpretations

### Technology Partners
- **OpenAI**: Advanced language models
- **Hugging Face**: Open-source ML models
- **Sentence Transformers**: Embedding technology
- **Open-Source Community**: Libraries and tools

### Contributors
Special thanks to contributors who are dedicated to making spiritual wisdom accessible through technology.

## 📞 Support & Community

### Get Help
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Comprehensive guides in `/docs`
- **Discussion Forum**: Join spiritual tech discussions
- **Email Support**: yogeshkumar.saini@email.com

### Community Guidelines
- **Respect**: Honor spiritual traditions and practices
- **Inclusivity**: Welcome seekers from all backgrounds
- **Accuracy**: Contribute verified spiritual knowledge
- **Kindness**: Foster positive learning environment

---

**🕉️ May this technology serve the highest good, bridging eternal wisdom with contemporary understanding. Om Shanti. 🌟**

## 📚 Additional Resources

- [Backend API Documentation](backend/docs/)
- [Frontend Implementation Guide](frontend/README.md)
- [Voice Processing Details](backend/docs/LIVEKIT_README.md)
- [Pipeline Architecture](backend/docs/PIPELINE_README.md)
- [Data Processing Guide](backend/docs/QUICK_START.md)

---

**DivyaVaani AI** - Illuminating the path to spiritual awakening through intelligent technology.
