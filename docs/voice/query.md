# Voice Services: Voice Query (Speech-to-Speech)

The Voice Query endpoint is a fully orchestrated speech-to-speech service that accepts an audio question and returns a synthesized audio spiritual answer.

## 1. Voice Query (Synchronous)
`POST /voice`

- **Content-Type**: `multipart/form-data`
- **Request Parameters**:
  - `audio_file`: binary (Required - WAV, MP3, M4A, FLAC, WEBM)
  - `user_id`: string (Optional - for spiritual growth tracking)
  - `input_language`: string (Optional - e.g., 'hi', 'en', 'auto'. Default: 'auto')
  - `output_language`: string (Optional - e.g., 'hi', 'en', 'auto'. Default: 'auto')
  - `voice`: string (Optional - specific persona to use for response)

- **Success Response (200 OK)**:
  - Returns a binary stream of `audio/mpeg` (mp3).
- **Headers**:
  - `X-Processing-Time`: float (Total pipeline duration)
  - `X-Transcription`: URL-encoded string (What the user said)
  - `X-Response-Text`: URL-encoded string (The spiritual guidance generated)

- **Workflow**:
  1. Transcription of the input audio.
  2. Multi-tradition scripture retrieval (RAG).
  3. LLM response generation.
  4. Audio synthesis of the response.
  5. Cleanup of temporary audio artifacts.

## 2. Voice Query (Streaming)
`POST /voice/stream`

- **Status**: *Not yet implemented (Planned feature)*
- **Objective**: Real-time voice interaction with ultra-low latency.
