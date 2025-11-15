# Text API Endpoints

## Overview
Text-based endpoints for Bhagavad Gita question-answering system.

## Endpoints

### POST /text/
Process text questions and receive text responses.

**Request:**
```json
{
  "question": "What is the meaning of dharma?",
  "user_id": "optional_user_id",
  "preferred_language": "en"
}
```

**Response:**
```json
{
  "answer": "Dharma is righteous duty and moral order...",
  "confidence": 0.85,
  "sources": ["Chapter 2, Verse 31"],
  "language": "en",
  "cached": false,
  "processing_time": 1.23
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid request
- `500`: Server error

## Supported Languages
- English (en)
- Hindi (hi)
- Sanskrit (sa)
- Bengali (bn)
- Telugu (te)
- Tamil (ta)
- Marathi (mr)
- Gujarati (gu)
- Kannada (kn)
- Malayalam (ml)
- Punjabi (pa)
- Odia (or)

## Rate Limits
- 100 requests per minute (default)
- Configurable via environment variables
