# Chat System: Overview

DivyaVaani's chat system is designed to provide a persistent, personalized spiritual dialogue. It manages conversation history, intelligent memory, and context-aware suggestions.

## Key Features

### 1. Persistent Conversations
All chat sessions are saved to the database, allowing users to resume spiritual dialogues across different devices or sessions. Conversations include:
- **Auto-generated Titles**: Summarizes the starting topic of the chat.
- **Language Persistence**: Remembers the preferred language for each specific session.
- **Metadata Tracking**: Captures confidence scores and processing times for quality monitoring.

### 2. Conversation Sidebar & Search
Users can easily navigate their spiritual journey via the sidebar:
- **Grouped by Date**: Organize past sessions into "Today", "Previous 7 Days", etc.
- **Real-time Search**: Search through conversation titles to find specific past insights.
- **Continuation Mode**: Selecting a past conversation from the sidebar enables seamless continuation from where the user left off.

### 3. Smart Sample Questions
The system analyzes the distribution of topics in a user's past conversations to suggest personalized questions daily.
- **Deterministic Rotation**: Suggested questions change every 24 hours based on an MD5 seed of the user's ID and the current date.
- **Topic Mapping**: If a user frequently asks about "Karma", the system prioritizes high-quality Karma-related questions in the welcome screen.

### 4. Interactive Streaming
Responses are delivered via **Server-Sent Events (SSE)**, providing a "thinking" state, real-time token streaming, and source citations as they are retrieved from the knowledge base.
