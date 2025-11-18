# Bhagavad Gita QA System API - Complete Structure v1.0.0

## Overview

The Bhagavad Gita QA System API provides intelligent question-answering capabilities powered by the Bhagavad Gita wisdom using advanced RAG (Retrieval-Augmented Generation) technology. The API supports both text and voice interactions, with comprehensive analytics, health monitoring, and feedback collection.

**Base URL:** `http://localhost:5001` (development) / Production URL (deployment)

**Version:** 1.0.0

**Authentication:** None required (rate limiting applied)

---

## Core Endpoints

### GET /

**Description:** API information and available endpoints overview.

**Use Cases:**
- Discover available API endpoints
- Get system information and capabilities
- Check API version and status

**Response Format:**
```json
{
  "message": "Bhagavad Gita QA System API",
  "version": "1.0.0",
  "environment": "development",
  "description": "Production-ready intelligent spiritual companion powered by Bhagavad Gita wisdom",
  "features": [
    "AI-powered responses with spiritual guidance",
    "Multi-language support (English, Hindi, etc.)",
    "Response caching for faster answers",
    "Usage analytics and feedback collection",
    "Comprehensive Bhagavad Gita knowledge base",
    "Rate limiting and security",
    "Structured logging and monitoring"
  ],
  "endpoints": {
    "GET /": "API information",
    "POST /text/": "Ask questions about Bhagavad Gita teachings (text)",
    "POST /voice/": "Voice query processing (speech-to-speech)",
    "POST /voice/stt/": "Convert speech to text",
    "POST /voice/tts/": "Convert text to speech",
    "GET /voice/stt/languages": "Get supported STT languages",
    "GET /voice/tts/voices": "Get available TTS voices",
    "GET /health": "Check system status and health",
    "GET /metrics": "View system metrics",
    "GET /analytics": "View usage statistics",
    "POST /feedback": "Submit feedback and suggestions"
  },
  "status": {
    "system_ready": true,
    "environment": "development"
  },
  "stats": {
    "total_queries": 0,
    "unique_users": 0,
    "popular_questions": {},
    "response_times": [],
    "error_count": 0,
    "cache_hits": 0,
    "cache_misses": 0,
    "start_time": "2025-11-14T01:19:38.656121",
    "avg_response_time": 0,
    "min_response_time": 0,
    "max_response_time": 0,
    "top_questions": [],
    "uptime_seconds": 175.758697
  }
}
```

**Rate Limit:** 60 requests per minute

---

### GET /health

**Description:** Comprehensive system health check including storage, collections, and artifacts status.

**Use Cases:**
- Monitor system health and availability
- Check component status before making requests
- Automated health monitoring and alerting

**Response Format:**
```json
{
  "status": "healthy",
  "timestamp": 1763063465.4581409,
  "system_ready": true,
  "is_loading": false,
  "components_health": {
    "storage": {
      "status": "healthy",
      "message": "Storage healthy, 250.60 GB free",
      "details": {
        "free_gb": 250.59985733032227
      }
    },
    "collections": {
      "status": "degraded",
      "message": "No valid collections found",
      "details": {
        "total": 2,
        "valid": 0
      }
    },
    "artifacts": {
      "status": "healthy",
      "message": "All required artifacts present",
      "details": {
        "found": 4,
        "required": 4
      }
    }
  },
  "components": {
    "qa_system": "loaded",
    "retriever": "available",
    "embeddings": "loaded"
  }
}
```

**Status Codes:**
- `200` - Healthy
- `503` - System not ready or degraded

**Rate Limit:** 120 requests per minute

---

### GET /metrics

**Description:** Detailed system performance metrics and request statistics.

**Use Cases:**
- Performance monitoring and optimization
- Request pattern analysis
- System load monitoring
- Debugging and troubleshooting

**Response Format:**
```json
{
  "metrics": {
    "counters": {
      "http_requests_total|endpoint=/health,method=GET,status=200": 1.0,
      "http_requests_total|endpoint=/text/,method=POST,status=200": 1.0
    },
    "gauges": {
      "http_requests_in_progress": 0
    },
    "histograms": {
      "http_request_duration_seconds|endpoint=/health,method=GET": {
        "min": 0.002538442611694336,
        "max": 0.002538442611694336,
        "mean": 0.002538442611694336,
        "count": 1
      }
    },
    "timers": {},
    "total_metrics": 21
  },
  "timestamp": 9340.756
}
```

**Rate Limit:** 30 requests per minute

---

### GET /analytics

**Description:** Usage analytics and query statistics.

**Use Cases:**
- Understand user behavior and popular questions
- Monitor system usage patterns
- Generate reports and insights
- Optimize content and responses

**Response Format:**
```json
{
  "analytics": {
    "total_queries": 2,
    "unique_users": 1,
    "popular_questions": {
      "what is the meaning of life according to bhagavad gita?": 1,
      "this is a mock transcription of the audio input.": 1
    },
    "response_times": [7.521944284439087, 0.949495792388916],
    "error_count": 0,
    "cache_hits": 0,
    "cache_misses": 2,
    "start_time": "2025-11-14T01:19:38.656121",
    "avg_response_time": 4.2357200384140015,
    "min_response_time": 0.949495792388916,
    "max_response_time": 7.521944284439087,
    "top_questions": [
      ["what is the meaning of life according to bhagavad gita?", 1],
      ["this is a mock transcription of the audio input.", 1]
    ],
    "uptime_seconds": 175.758697
  },
  "cache": {
    "total_entries": 2,
    "max_size": 1000,
    "ttl_seconds": 3600
  },
  "system_info": {
    "version": "1.0.0",
    "model": "llama-3.1-8b-instant",
    "environment": "development",
    "features": ["caching", "analytics", "multilingual", "rate_limiting", "structured_logging"]
  }
}
```

**Rate Limit:** 30 requests per minute

---

### POST /feedback

**Description:** Submit user feedback and suggestions.

**Use Cases:**
- Collect user feedback on responses
- Report bugs or issues
- Suggest improvements
- Rate response quality

**Request Format:**
```json
{
  "type": "suggestion|bug|rating|other",
  "content": "Your feedback message here",
  "user_id": "optional_user_identifier",
  "metadata": {
    "question": "The question that prompted this feedback",
    "response_quality": 5
  }
}
```

**Required Fields:**
- `type` (string): Type of feedback
- `content` (string): Feedback content

**Response Format:**
```json
{
  "message": "Thank you for your feedback!",
  "status": "received",
  "timestamp": 9333.737
}
```

**Rate Limit:** 10 requests per minute

---

## Text Query API

### POST /text/

**Description:** Ask questions about Bhagavad Gita teachings using text input. Returns AI-powered answers with spiritual guidance.

**Use Cases:**
- Get answers to questions about Bhagavad Gita philosophy
- Seek spiritual guidance from ancient wisdom
- Learn about Hindu philosophy and teachings
- Research specific verses or concepts

**Request Format:**
```json
{
  "question": "What is the meaning of life according to Bhagavad Gita?",
  "user_id": "optional_user_identifier",
  "preferred_language": "en"
}
```

**Request Parameters:**
- `question` (string, required): The question to ask (1-1000 characters)
- `user_id` (string, optional): User identifier for analytics
- `preferred_language` (string, optional): Response language code (en, hi, bn, te, ta, mr, gu, kn, ml, pa, or)

**Supported Languages:**
- `en` - English
- `hi` - Hindi
- `sa` - Sanskrit
- `bn` - Bengali
- `te` - Telugu
- `ta` - Tamil
- `mr` - Marathi
- `gu` - Gujarati
- `kn` - Kannada
- `ml` - Malayalam
- `pa` - Punjabi
- `or` - Odia

**Response Format:**
```json
{
  "answer": "My dear friend, I sense that you are seeking the essence of life, the purpose that drives us all. According to the Bhagavad Gita, the ultimate goal of life is to realize one's true nature as a spark of the divine. It is to cultivate love, compassion, and wisdom, and to fulfill one's duties with detachment and selflessness.\n\nAs the Gita says, \"Yoga: karmasu kaushalam\" - \"The ultimate goal of life is to perform one's duties with skill and detachment.\" (BG 2.50)\n\nThis means that our lives should be guided by a sense of purpose and duty, but also with a deep understanding that our true identity lies beyond the limitations of our individual selves. By embracing this understanding, we can find peace, happiness, and fulfillment in all aspects of life.\n\nMay this wisdom guide you on your journey, my dear friend.",
  "confidence": 1.0,
  "sources": ["Verse 22731", "Verse 23434", "Verse 14560", "Verse 1922", "Verse 24790", "Verse 3385", "Verse 20878"],
  "language": "en",
  "processing_time": 7.521944284439087,
  "cached": false
}
```

**Response Fields:**
- `answer` (string): AI-generated answer with spiritual guidance
- `confidence` (float): Confidence score (0.0-1.0)
- `sources` (array): List of relevant verse references
- `language` (string): Response language code
- `processing_time` (float): Processing time in seconds
- `cached` (boolean): Whether response was served from cache

**Rate Limit:** 60 requests per minute

---

## Voice APIs

### POST /voice/

**Description:** Complete voice query processing pipeline - speech-to-text, question answering, text-to-speech.

**Use Cases:**
- Voice-based spiritual consultation
- Hands-free Bhagavad Gita queries
- Accessibility for users who prefer voice interaction
- Mobile applications with voice input/output

**Request Format:** Multipart Form Data
```
Content-Type: multipart/form-data

audio_file: [audio file]
user_id: [optional string]
input_language: auto|en|hi|sa|...
output_language: auto|en|hi|sa|...
voice: default|[voice_id]
```

**Supported Audio Formats:** WAV, MP3, M4A, FLAC, WEBM

**Parameters:**
- `audio_file` (file, required): Audio file containing the question
- `user_id` (string, optional): User identifier
- `input_language` (string, optional): Speech language (default: "auto")
- `output_language` (string, optional): Response language (default: "auto")
- `voice` (string, optional): TTS voice to use (default: "default")

**Response:** Audio file (MP3) with custom headers

**Response Headers:**
```
X-Processing-Time: [seconds]
X-Transcription: [url_encoded_transcription]
X-Response-Text: [url_encoded_response_text]
Content-Type: audio/mpeg
Content-Disposition: attachment; filename="response.mp3"
```

**Rate Limit:** 30 requests per minute

---

### POST /voice/stream

**Description:** Streaming voice query processing (future implementation).

**Status:** Not implemented (returns 501 Not Implemented)

**Use Cases:** Real-time voice interaction (planned feature)

---

### GET /voice/stt/languages

**Description:** Get list of supported languages for speech-to-text conversion.

**Use Cases:**
- Check language support before uploading audio
- Build language selection UI
- Validate user language preferences

**Response Format:**
```json
{
  "supported_languages": [
    "en", "hi", "sa", "bn", "te", "ta", "mr", "gu", "kn", "ml", "pa", "or",
    "en-US", "en-GB", "hi-IN", "bn-IN", "te-IN", "ta-IN", "mr-IN", "gu-IN"
  ],
  "supported_formats": ["flac", "wav", "mp3", "m4a", "ogg", "webm", "amr", "awb"]
}
```

**Rate Limit:** 60 requests per minute

---

### POST /voice/stt/

**Description:** Convert speech audio to text transcription.

**Use Cases:**
- Transcribe audio questions before processing
- Convert voice messages to text
- Enable voice search functionality
- Accessibility features for speech-to-text

**Request Format:** Multipart Form Data
```
Content-Type: multipart/form-data

audio_file: [audio file]
language: auto|en|hi|sa|...
user_id: [optional string]
```

**Supported Audio Formats:** WAV, MP3, M4A, FLAC, OGG

**Response Format:**
```json
{
  "text": "What is the meaning of life according to Bhagavad Gita?",
  "confidence": 0.95,
  "language": "en",
  "duration": 3.2,
  "processing_time": 0.8
}
```

**Response Fields:**
- `text` (string): Transcribed text
- `confidence` (float): Transcription confidence (0.0-1.0)
- `language` (string): Detected language
- `duration` (float): Audio duration in seconds
- `processing_time` (float): Processing time in seconds

**Rate Limit:** 60 requests per minute

---

### GET /voice/tts/voices

**Description:** Get list of available text-to-speech voices.

**Use Cases:**
- Build voice selection UI
- Preview available voices
- Customize user experience

**Query Parameters:**
- `language` (optional): Filter voices by language

**Response Format:**
```json
{
  "voices": {
    "en": ["male_default", "female_default", "male_deep", "female_clear"],
    "hi": ["male_hindi", "female_hindi", "male_spiritual", "female_gentle"],
    "sa": ["male_traditional", "female_sacred", "male_vedic", "female_melodious"]
  },
  "supported_languages": ["en", "hi", "sa", "bn", "te", "ta", "mr", "gu", "kn", "ml", "pa", "or", "en-US", "en-GB", "hi-IN", "bn-IN", "te-IN", "ta-IN", "mr-IN", "gu-IN"],
  "supported_formats": ["mp3", "wav", "flac", "ogg", "aac", "m4a", "webm"]
}
```

**Rate Limit:** 60 requests per minute

---

### GET /voice/tts/voices/{language}

**Description:** Get available voices for a specific language.

**Use Cases:**
- Get voices for selected language
- Language-specific voice selection

**Path Parameters:**
- `language` (string): Language code (e.g., "en", "hi", "sa")

**Response Format:**
```json
{
  "language": "en",
  "voices": ["male_default", "female_default", "male_deep", "female_clear"]
}
```

**Rate Limit:** 60 requests per minute

---

### POST /voice/tts/

**Description:** Convert text to speech audio.

**Use Cases:**
- Generate audio responses for text answers
- Create audio content from Bhagavad Gita verses
- Accessibility features for text-to-speech
- Audio book generation

**Request Format:** Form Data
```
Content-Type: application/x-www-form-urlencoded

text: [text to convert]
language: en|hi|sa|...
voice: default|[voice_id]
speed: 1.0
user_id: [optional string]
```

**Parameters:**
- `text` (string, required): Text to convert (1-5000 characters)
- `language` (string, optional): Language code (default: "en")
- `voice` (string, optional): Voice to use (default: "default")
- `speed` (float, optional): Speech speed (0.5-2.0, default: 1.0)
- `user_id` (string, optional): User identifier

**Response:** Audio file with custom headers

**Response Headers:**
```
X-Processing-Time: [seconds]
X-Text-Length: [character_count]
X-Language: [language]
X-Voice: [voice]
Content-Type: audio/mpeg
Content-Disposition: attachment; filename="tts_output.mp3"
```

**Supported Audio Formats:** MP3, WAV, FLAC, OGG, AAC, M4A, WEBM

**Rate Limit:** 60 requests per minute

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "detail": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `501` - Not Implemented
- `503` - Service Unavailable

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Core endpoints:** 30-120 requests per minute
- **Query endpoints:** 30-60 requests per minute
- **Feedback:** 10 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1634567890
```

## Authentication & Security

- **Current Version:** No authentication required
- **Rate Limiting:** Applied to all endpoints
- **CORS:** Configured for cross-origin requests
- **Input Validation:** Comprehensive validation on all inputs
- **Security Headers:** Basic security headers applied

## Data Models

### QuestionRequest
```python
{
  "question": str,  # 1-1000 characters
  "user_id": Optional[str],
  "preferred_language": Optional[str]  # Language code
}
```

### AnswerResponse
```python
{
  "answer": str,
  "confidence": float,  # 0.0-1.0
  "sources": List[str],
  "language": str,
  "processing_time": float,
  "cached": bool
}
```

### FeedbackRequest
```python
{
  "type": str,  # suggestion|bug|rating|other
  "content": str,
  "user_id": Optional[str],
  "metadata": Optional[Dict]
}
```

## Version History

### v1.0.0 (Current)
- Initial release with core functionality
- Text and voice query support
- Comprehensive analytics and monitoring
- Rate limiting and security features
- Multi-language support
- Response caching
- Health monitoring

---

*For technical support or questions, please use the `/feedback` endpoint or check the system logs.*
