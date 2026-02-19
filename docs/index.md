# DivyaVaani AI: Universal Spiritual Guidance

DivyaVaani AI is a production-ready, intelligent spiritual companion powered by wisdom from all global spiritual traditions (Bhagavad Gita, Vedas, Upanishads, etc.). It uses an advanced RAG (Retrieval-Augmented Generation) pipeline to provide accurate, multi-language guidance.

## Core Features

- **Universal Spiritual Wisdom**: Integrated knowledge base from diverse spiritual texts.
- **Multi-language Support**: Native support for English, Hindi, and several Indian regional languages.
- **Multimodal Interaction**: Supports text, voice-to-voice, and streaming real-time chat.
- **Intelligent Memory**: Short-Term Memory (STM) for conversation flow and Long-Term Memory (LTM) for daily insights.
- **Advanced RAG**: Semantic retrieval using Pinecone vector database and Llama-3.1 LLM.

## System Architecture

DivyaVaani is built with a decoupled architecture:

- **Frontend**: Next.js (TypeScript) with a premium, responsive UI.
- **Backend**: FastAPI (Python) orchestrating AI services, retrieval, and auth.
- **Vector Database**: Pinecone for low-latency semantic search across spiritual verses.
- **Primary Database**: SQL-based persistence for user data and conversation history.

## Documentation Modules

- [**Authentication**](./auth/overview.md): User registration and Google OAuth.
- [**Chat & History**](./chat/overview.md): Real-time chat, memory, and persistence.
- [**Real-time Interaction**](./chat/realtime.md): WebSocket-based spiritual dialogues.
- [**Voice Services**](./voice/overview.md): STT, TTS, and Speech-to-Speech orchestration.
- [**Analytics & Insights**](./analytics/overview.md): System metrics and spiritual growth tracking.
- [**RAG System**](./rag/overview.md): Technical details of retrieval and QA logic.
