# Voice API Endpoints

## Overview
Voice-based endpoints for speech-to-text, text-to-speech, and voice query processing.

## Endpoints

### POST /voice/
Complete voice query processing: speech-to-text → QA → text-to-speech.

**Request:** Multipart form data
- `audio_file`: Audio file (WAV, MP3, M4A, FLAC)
- `user_id`: Optional user identifier
- `input_language`: Input speech language (default: "auto")
- `output_language`: Output speech language (default: "auto")
- `voice`: Voice selection (default: "default")

**Response:** Audio file (MP3) with metadata headers
- `X-Transcription`: Transcribed text
- `X-Response-Text`: Generated response text
- `X-Processing-Time`: Total processing time

### POST /voice/stt/
Speech-to-text conversion only.

**Request:** Multipart form data
- `audio_file`: Audio file
- `language`: Language code (default: "auto")
- `user_id`: Optional user identifier

**Response:**
```json
{
  "text": "Transcribed text...",
  "confidence": 0.95,
  "language": "en",
  "duration": 2.5,
  "processing_time": 0.8
}
```

### GET /voice/stt/languages
Get supported languages for speech-to-text.

**Response:**
```json
{
  "supported_languages": ["en", "hi", "sa", ...],
  "supported_formats": ["wav", "mp3", "m4a", "flac", "ogg"]
}
```

### POST /voice/tts/
Text-to-speech conversion only.

**Request:** Form data
- `text`: Text to convert (max 5000 chars)
- `language`: Language code (default: "en")
- `voice`: Voice selection
- `speed`: Speech speed 0.5-2.0 (default: 1.0)
- `user_id`: Optional user identifier

**Response:** Audio file with metadata headers

### GET /voice/tts/voices
Get available voices.

**Query Parameters:**
- `language`: Filter by language (optional)

**Response:**
```json
{
  "voices": {
    "en": ["male_default", "female_default"],
    "hi": ["male_hindi", "female_hindi"]
  },
  "supported_languages": ["en", "hi", "sa"],
  "supported_formats": ["mp3", "wav", "flac"]
}
```

## Audio Formats
- **Input:** WAV, MP3, M4A, FLAC, OGG
- **Output:** MP3 (default), WAV, FLAC

## File Size Limits
- Maximum audio file size: 10MB (configurable)
- Text input limit: 5000 characters

## Error Responses
```json
{
  "detail": "Error message",
  "code": "ERROR_CODE",
  "status_code": 400
}
```

## Rate Limits
- Text endpoints: 100 requests/minute
- Voice endpoints: 50 requests/minute (higher processing cost)
