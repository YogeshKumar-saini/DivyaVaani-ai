# Voice Services: Text-to-Speech (TTS)

The TTS endpoint synthesizes written text into spiritual, high-quality audio.

## 1. Text-to-Speech
`POST /voice/tts`

- **Content-Type**: `application/x-www-form-urlencoded`
- **Request Parameters**:
  - `text`: string (Required - max 5000 chars)
  - `language`: string (Optional - default 'en')
  - `voice`: string (Optional - e.g., 'default', 'serene', 'calm')
  - `speed`: float (Optional - 0.5 to 2.0. Default: 1.0)
  - `user_id`: string (Optional)

- **Success Response (200 OK)**:
  - Returns a binary stream of `audio/mpeg` (mp3).
- **Headers**:
  - `X-Processing-Time`: float
  - `X-Text-Length`: integer
  - `X-Language`: string
  - `X-Voice`: string

## 2. Available Voices
`GET /voice/tts/voices`

Returns the list of available voices and supported languages for synthesis.

- **Query Parameters**:
  - `language`: string (Optional filter)

- **Success Response (200 OK)**:
```json
{
  "voices": [
    { "id": "default", "name": "Standard Male", "language": "en" },
    { "id": "serene", "name": "Serene Female", "language": "en" }
  ],
  "supported_languages": ["en", "hi", ...],
  "supported_formats": ["mp3", "wav"]
}
```
