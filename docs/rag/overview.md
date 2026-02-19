# RAG System: Overview

The Retrieval-Augmented Generation (RAG) engine is the core intelligence of DivyaVaani AI. It bridges the gap between static spiritual knowledge and dynamic user inquiries by retrieving relevant scriptures and using them to ground the AI's responses.

## The Multilingual Orchestrator

The `MultilingualQASystem` class orchestrates the entire Q&A flow. It is designed to handle queries in multiple languages while ensuring the wisdom remains consistent with original spiritual texts.

### Workflow

1. **Language Detection & Preprocessing**: The system identifies the user's language and cleans the inquiry.
2. **Context Retrieval**: The query is converted into a vector and sent to the Pinecone database to find relevant spiritual verses.
3. **Prompt Construction**: Language-aware templates are used to build a prompt that includes the retrieved verses, conversation memory, and the user's question.
4. **LLM Invocation**: The augmented prompt is sent to a high-performance LLM (e.g., Llama-3.1-8b) to generate a spiritual, compassionate response.
5. **Streaming/Caching**: Responses are streamed to the user in real-time and cached for frequent inquiries.

## Multilingual Support

DivyaVaani supports a wide range of languages including:
- **Primary**: English, Hindi, Sanskrit.
- **Regional**: Bengali, Telugu, Tamil, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia.

The system uses language-specific prompt templates to ensure the AI's tone and spiritual terminology are appropriate for the chosen language.
