# Voice Services: Overview

DivyaVaani AI features a high-performance voice processing pipeline that enables users to interact with spiritual wisdom using natural speech. The system supports full speech-to-speech orchestration as well as individual speech-to-text and text-to-speech components.

## The Voice Pipeline

When a user speaks to DivyaVaani, the following pipeline is executed:

1. **Speech-to-Text (STT)**: The raw audio is processed (using Deepgram or Gemini) to extract the linguistic content and detect the input language.
2. **Spiritual QA (RAG)**: The transcribed text is sent to the heart of the system—the Multilingual QA module. It retrieves relevant spiritual verses and generates a wise response.
3. **Text-to-Speech (TTS)**: The generated textual response is converted back into a calm, spiritual voice (using Cartesia or Google TTS).
4. **Streaming/Delivery**: The final audio is delivered back to the user, often accompanied by metadata like the transcription and the original verses.

## Key Capabilities

- **Automatic Language Detection**: Seamlessly switch between English, Hindi, and other supported languages without changing settings.
- **Low Latency**: Optimized for real-time interaction with efficient audio encoding and background processing.
- **Voice Selection**: Choose from multiple spiritual personas and voices tailored to different languages.
- **Support for Multiple Formats**: Accepts WAV, MP3, M4A, FLAC, and WebM audio uploads.
