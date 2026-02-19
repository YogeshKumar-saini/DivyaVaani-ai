# Analytics & Insights: Overview

DivyaVaani AI provides a dual-layered analytics system that monitors both technical system health and user spiritual progression.

## 1. System Metrics (SRE)
For developers and administrators, the system exposes real-time operational data:
- **Performance Monitoring**: Tracking processing times for QA, STT, and TTS.
- **Error Tracking**: Identifying failures in LLM providers, database connections, or RAG retrieval.
- **Resource Usage**: Monitoring token consumption and cache hit rates.
- **Health Checks**: Comprehensive monitoring of all sub-components (Database, Pinecone, Embedding Models).

## 2. Chat Insights (Spiritual Growth)
For logged-in users, the system provides personalized insights based on their spiritual dialogues:
- **Daily Summaries**: Aggregated recaps of a day's conversations, identifying key themes and dominant "moods" (e.g., contemplative, seeking, reflective).
- **Topic Clustering**: Visualizing the spiritual topics explored over time (e.g., Dharma, Karma, Meditation).
- **Interactive Calor Map**: A calendar-based visualization of spiritual engagement intensity.
- **Long-Term Memory (LTM)**: These insights serve as the foundation for the system's long-term recall, allowing DivyaVaani to understand the user's journey more deeply over months and years.

## Workflow

1. **Query Cycle**: Every chat interaction is tracked by the `AnalyticsTracker`.
2. **Periodic Aggregation**: Background tasks (or user triggers) aggregate raw messages into `DailySummary` records.
3. **Visualization**: The "Chat Insights" dashboard on the frontend fetches this aggregated data to present a holistic view of the user's spiritual journey.
