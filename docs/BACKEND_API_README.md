# DivyaVaani Backend API - Complete Frontend Integration Guide

## 🕉️ Overview

DivyaVaani is an AI-powered spiritual companion that provides wisdom from the Bhagavad Gita through text and voice interactions. This backend serves as the complete API for frontend applications.

## 🚀 Quick Start

### Base URL
```
http://localhost:5001
```

### Health Check
```bash
curl http://localhost:5001/health
```

### Authentication
Currently uses API key authentication via headers (optional for development).

---

## 📋 API Endpoints

### 1. Root Information
**GET** `/`

Returns API information and system status.

**Response:**
```json
{
  "message": "Bhagavad Gita QA System API",
  "version": "1.0.0",
  "features": ["AI-powered responses", "Multi-language support", "Voice integration"],
  "endpoints": {
    "GET /": "API information",
    "POST /text/": "Ask questions about Bhagavad Gita teachings",
    "POST /voice/": "Voice query processing",
    "POST /voice/stt/": "Convert speech to text",
    "POST /voice/tts/": "Convert text to speech",
    "GET /voice/stt/languages": "Get supported STT languages",
    "GET /voice/tts/voices": "Get available TTS voices",
    "GET /health": "Check system status",
    "GET /analytics": "View usage statistics",
    "POST /feedback": "Submit feedback"
  },
  "status": {
    "system_ready": true
  },
  "stats": {
    "total_queries": 0,
    "cache_hits": 0,
    "uptime_seconds": 360
  }
}
```

---

### 2. Text Query (AI Q&A)
**POST** `/text/`

Ask spiritual questions and receive AI-powered responses from Bhagavad Gita wisdom.

**Request:**
```json
{
  "question": "What is dharma?",
  "user_id": "optional_user_id",
  "preferred_language": "en"
}
```

**Parameters:**
- `question` (string, required): The spiritual question to ask
- `user_id` (string, optional): User identifier for personalization
- `preferred_language` (string, optional): Response language (en, hi, sa)

**Response:**
```json
{
  "answer": "My dear friend, I see that you are seeking to understand the concept of dharma. Dharma is not just a set of rules or rituals, but a way of living in harmony with the natural order of the universe...",
  "confidence": 1.0,
  "sources": [
    "Verse 14880",
    "Verse 12675",
    "Verse 220"
  ],
  "language": "en",
  "processing_time": 5.75,
  "cached": false
}
```

**Frontend Example:**
```javascript
async function askQuestion(question, language = 'en') {
  const response = await fetch('/text/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: question,
      preferred_language: language,
      user_id: 'frontend_user_' + Date.now()
    })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return {
    answer: data.answer,
    confidence: data.confidence,
    sources: data.sources,
    language: data.language,
    processingTime: data.processing_time
  };
}
```

---

### 3. Voice Query (Complete Pipeline)
**POST** `/voice/`

Process complete voice queries: speech-to-text → AI processing → text-to-speech.

**Request:** Multipart form data
```
audio_file: [audio file]
user_id: optional_user_id
input_language: auto
output_language: auto
voice: default
```

**Supported Audio Formats:** WAV, MP3, M4A, FLAC, OGG

**Response:** Audio file (MP3) with headers
```
Content-Type: audio/mpeg
X-Processing-Time: 8.45
X-Transcription: "What is the meaning of life?"
X-Response-Text: "According to divine wisdom..."
```

**Frontend Example:**
```javascript
async function processVoiceQuery(audioBlob) {
  const formData = new FormData();
  formData.append('audio_file', audioBlob, 'query.wav');
  formData.append('input_language', 'auto');
  formData.append('output_language', 'en');
  formData.append('voice', 'default');

  const response = await fetch('/voice/', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Voice processing failed: ${response.status}`);
  }

  // Get audio response
  const audioBlob = await response.blob();

  // Get metadata from headers
  const transcription = response.headers.get('X-Transcription');
  const responseText = response.headers.get('X-Response-Text');
  const processingTime = response.headers.get('X-Processing-Time');

  return {
    audio: audioBlob,
    transcription: transcription,
    responseText: responseText,
    processingTime: parseFloat(processingTime)
  };
}
```

---

### 4. Speech-to-Text
**POST** `/voice/stt/`

Convert speech audio to text only.

**Request:** Multipart form data
```
audio_file: [audio file]
language: auto
user_id: optional_user_id
```

**Response:**
```json
{
  "text": "What is the meaning of dharma?",
  "confidence": 0.95,
  "language": "en",
  "duration": 3.2,
  "processing_time": 1.2
}
```

**Frontend Example:**
```javascript
async function speechToText(audioBlob) {
  const formData = new FormData();
  formData.append('audio_file', audioBlob, 'speech.wav');
  formData.append('language', 'auto');

  const response = await fetch('/voice/stt/', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  return {
    text: result.text,
    confidence: result.confidence,
    language: result.language
  };
}
```

---

### 5. Text-to-Speech
**POST** `/voice/tts/`

Convert text to speech audio.

**Request:** Multipart form data
```
text: "Hello, divine wisdom awaits"
language: en
voice: default
speed: 1.0
user_id: optional_user_id
```

**Parameters:**
- `text` (string, required): Text to convert (max 5000 chars)
- `language` (string, optional): Language code (en, hi, sa, etc.)
- `voice` (string, optional): Voice selection
- `speed` (float, optional): Speech speed (0.5 to 2.0)

**Response:** Audio file with headers
```
Content-Type: audio/mpeg
X-Processing-Time: 2.1
X-Text-Length: 25
X-Language: en
X-Voice: default
```

**Frontend Example:**
```javascript
async function textToSpeech(text, language = 'en', voice = 'default') {
  const formData = new FormData();
  formData.append('text', text);
  formData.append('language', language);
  formData.append('voice', voice);
  formData.append('speed', '1.0');

  const response = await fetch('/voice/tts/', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`TTS failed: ${response.status}`);
  }

  const audioBlob = await response.blob();

  // Play audio
  const audio = new Audio(URL.createObjectURL(audioBlob));
  audio.play();

  return audioBlob;
}
```

---

### 6. Supported STT Languages
**GET** `/voice/stt/languages`

Get list of supported languages for speech-to-text.

**Response:**
```json
{
  "supported_languages": [
    "en", "hi", "sa", "bn", "te", "ta", "mr", "gu", "kn", "ml", "pa", "or",
    "en-US", "en-GB", "hi-IN", "bn-IN", "te-IN", "ta-IN", "mr-IN", "gu-IN"
  ],
  "supported_formats": [
    "flac", "wav", "mp3", "m4a", "ogg", "webm", "amr", "awb"
  ]
}
```

---

### 7. Available TTS Voices
**GET** `/voice/tts/voices`

Get list of available voices for text-to-speech.

**Query Parameters:**
- `language` (optional): Filter voices by language

**Response:**
```json
{
  "voices": {
    "en": ["male_default", "female_default", "male_deep", "female_clear"],
    "hi": ["male_hindi", "female_hindi", "male_spiritual", "female_gentle"],
    "sa": ["male_traditional", "female_sacred", "male_vedic", "female_melodious"]
  },
  "supported_languages": [
    "en", "hi", "sa", "bn", "te", "ta", "mr", "gu", "kn", "ml", "pa", "or",
    "en-US", "en-GB", "hi-IN", "bn-IN", "te-IN", "ta-IN", "mr-IN", "gu-IN"
  ],
  "supported_formats": [
    "mp3", "wav", "flac", "ogg", "aac", "m4a", "webm"
  ]
}
```

---

### 8. System Health
**GET** `/health`

Comprehensive system health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1762953156.647,
  "system_ready": true,
  "is_loading": false,
  "components": {
    "qa_system": "loaded",
    "retriever": "available",
    "embeddings": "loaded"
  },
  "components_health": {
    "storage": {
      "status": "healthy",
      "message": "Storage healthy, 272.10 GB free"
    }
  }
}
```

---

### 9. Usage Analytics
**GET** `/analytics`

Get usage statistics and performance metrics.

**Response:**
```json
{
  "analytics": {
    "total_queries": 15,
    "unique_users": 8,
    "popular_questions": {
      "what is dharma?": 3,
      "how to find peace?": 2
    },
    "response_times": [5.75, 6.23, 4.89],
    "avg_response_time": 5.62,
    "cache_hits": 3,
    "cache_misses": 12,
    "error_count": 0
  },
  "cache": {
    "total_entries": 12,
    "hit_rate": 0.2
  }
}
```

---

### 10. Submit Feedback
**POST** `/feedback`

Submit user feedback and suggestions.

**Request:**
```json
{
  "type": "general",
  "content": "Great spiritual guidance!",
  "user_id": "optional_user_id"
}
```

**Response:**
```json
{
  "message": "Thank you for your feedback!",
  "status": "received",
  "timestamp": 1762953156.789
}
```

---

## 🎨 Frontend Integration Examples

### React Component for Text Chat
```jsx
import { useState } from 'react';

function SpiritualChat() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    setLoading(true);
    try {
      const response = await fetch('/text/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="chat-container">
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask your spiritual question..."
      />
      <button onClick={askQuestion} disabled={loading}>
        {loading ? 'Seeking wisdom...' : 'Ask Krishna'}
      </button>
      {answer && (
        <div className="answer">
          <h3>Divine Wisdom:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}
```

### Voice Recording Component
```jsx
import { useState, useRef } from 'react';

function VoiceQuery() {
  const [recording, setRecording] = useState(false);
  const [audioResponse, setAudioResponse] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

      // Send to voice API
      const formData = new FormData();
      formData.append('audio_file', audioBlob);

      const response = await fetch('/voice/', {
        method: 'POST',
        body: formData
      });

      const responseAudioBlob = await response.blob();
      setAudioResponse(URL.createObjectURL(responseAudioBlob));
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div className="voice-query">
      <button
        onClick={recording ? stopRecording : startRecording}
        className={recording ? 'recording' : ''}
      >
        {recording ? '🛑 Stop Recording' : '🎤 Start Voice Query'}
      </button>

      {audioResponse && (
        <audio controls src={audioResponse} autoPlay />
      )}
    </div>
  );
}
```

### Analytics Dashboard
```jsx
import { useEffect, useState } from 'react';

function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetch('/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data.analytics));
  }, []);

  if (!analytics) return <div>Loading analytics...</div>;

  return (
    <div className="analytics">
      <h2>📊 Usage Analytics</h2>
      <div className="stats-grid">
        <div className="stat">
          <h3>Total Queries</h3>
          <p>{analytics.total_queries}</p>
        </div>
        <div className="stat">
          <h3>Unique Users</h3>
          <p>{analytics.unique_users}</p>
        </div>
        <div className="stat">
          <h3>Avg Response Time</h3>
          <p>{analytics.avg_response_time?.toFixed(2)}s</p>
        </div>
        <div className="stat">
          <h3>Cache Hit Rate</h3>
          <p>{(analytics.cache_hits / (analytics.cache_hits + analytics.cache_misses) * 100).toFixed(1)}%</p>
        </div>
      </div>

      <div className="popular-questions">
        <h3>Popular Questions</h3>
        <ul>
          {Object.entries(analytics.popular_questions || {}).map(([question, count]) => (
            <li key={question}>{question} ({count} times)</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

---

## 🔧 Error Handling

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request (invalid input)
- `422`: Validation Error
- `429`: Rate Limited
- `500`: Internal Server Error
- `503`: Service Unavailable (system not ready)

### Error Response Format
```json
{
  "detail": "Error message description"
}
```

### Frontend Error Handling
```javascript
const handleApiCall = async (url, options) => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);

    // Show user-friendly error message
    if (error.message.includes('rate limit')) {
      alert('Too many requests. Please wait a moment.');
    } else if (error.message.includes('system not ready')) {
      alert('System is initializing. Please try again in a moment.');
    } else {
      alert('An error occurred. Please try again.');
    }

    throw error;
  }
};
```

---

## ⚡ Performance Optimization

### Caching Strategy
- Responses are cached for 5-60 minutes based on confidence
- Cache keys include question and language
- Frontend should implement client-side caching for repeated queries

### Rate Limiting
- 100 requests per minute per IP
- 60 requests per minute for root endpoint
- Implement exponential backoff for retries

### Connection Optimization
```javascript
// Use connection pooling
const API_BASE_URL = 'http://localhost:5001';

// Implement request deduplication
const pendingRequests = new Map();

const dedupedFetch = async (url, options) => {
  const key = url + JSON.stringify(options);

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = fetch(url, options);
  pendingRequests.set(key, promise);

  try {
    const result = await promise;
    return result;
  } finally {
    pendingRequests.delete(key);
  }
};
```

---

## 🔒 Security Considerations

### API Key Authentication (Future)
```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`
};
```

### Input Validation
- Questions limited to 1000 characters
- Audio files limited to 10MB
- Rate limiting prevents abuse
- Content filtering for harmful input

### CORS Configuration
```javascript
// CORS is configured for localhost:3000
// Add your domain to CORS_ORIGINS in .env for production
```

---

## 📊 Monitoring & Analytics

### Real-time Metrics
- Response times and success rates
- Cache performance statistics
- User engagement metrics
- Error tracking and alerting

### Health Monitoring
```javascript
const checkSystemHealth = async () => {
  const response = await fetch('/health');
  const health = await response.json();

  if (health.status !== 'healthy') {
    console.warn('System health degraded:', health);
    // Show maintenance message to users
  }

  return health;
};

// Check health every 30 seconds
setInterval(checkSystemHealth, 30000);
```

---

## 🚀 Deployment Considerations

### Environment Variables
```env
# Production settings
API_HOST=0.0.0.0
API_PORT=5001
CORS_ORIGINS=https://yourdomain.com
ENABLE_RATE_LIMITING=true
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=60
```

### Scaling
- Use reverse proxy (nginx) for load balancing
- Implement Redis for distributed caching
- Monitor memory usage and response times
- Set up horizontal scaling for high traffic

### SSL/TLS
```nginx
# nginx configuration for SSL
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🆘 Troubleshooting

### Common Issues

#### 1. "System not ready" error
```javascript
// Wait for system initialization
const waitForSystem = async () => {
  for (let i = 0; i < 30; i++) {
    const health = await fetch('/health').then(r => r.json());
    if (health.system_ready) return true;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error('System failed to initialize');
};
```

#### 2. CORS errors
```javascript
// Ensure frontend domain is in CORS_ORIGINS
// For development: http://localhost:3000
// For production: https://yourdomain.com
```

#### 3. Audio playback issues
```javascript
// Handle different audio formats
const playAudio = async (audioBlob) => {
  const audio = new Audio(URL.createObjectURL(audioBlob));
  audio.onerror = () => {
    console.error('Audio playback failed');
  };
  await audio.play();
};
```

#### 4. Rate limiting
```javascript
// Implement exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message.includes('rate limit') && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      throw error;
    }
  }
};
```

---

## 📞 Support

### API Documentation
- Interactive API docs: `http://localhost:5001/docs` (when running)
- OpenAPI specification available at `/openapi.json`

### Health Checks
- System health: `GET /health`
- Detailed metrics: `GET /analytics`

### Error Reporting
- Use `/feedback` endpoint for bug reports
- Include user_id, error details, and steps to reproduce

---

## 🎊 Ready for Frontend Development!

This comprehensive API documentation provides everything you need to build a beautiful, functional frontend for DivyaVaani. The backend handles all the complex AI processing, multilingual support, and spiritual wisdom delivery - your frontend just needs to provide an intuitive interface for users to connect with divine guidance.

**🕉️ Happy coding! May your frontend bring spiritual wisdom to users worldwide! 🙏🚀✨**
