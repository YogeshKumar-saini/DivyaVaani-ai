# Voice Services: Speech-to-Text (STT)

The STT endpoint converts spoken audio into written text.

## 1. Speech-to-Text
`POST /voice/stt`

- **Content-Type**: `multipart/form-data`
- **Request Parameters**:
  - `audio_file`: binary (Required - WAV, MP3, M4A, FLAC, OGG)
  - `language`: string (Optional - e.g., 'en', 'hi', 'auto'. Default: 'auto')
  - `user_id`: string (Optional - for analytics)

- **Success Response (200 OK)**:
```json
{
  "text": "How can I find peace?",
  "confidence": 0.98,
  "language": "en",
  "duration": 2.5,
  "processing_time": 0.45
}
```

## 2. Supported Languages
`GET /voice/stt/languages`

Returns the list of languages and audio formats supported by the current STT engine.

- **Success Response (200 OK)**:
```json
{
  "supported_languages": ["en", "hi", "bn", ...],
  "supported_formats": ["wav", "mp3", "m4a", "flac", "ogg"]
}
```
