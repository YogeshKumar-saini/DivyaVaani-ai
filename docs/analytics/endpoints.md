# Analytics & Insights: Endpoints

## 1. System Analytics
`GET /analytics`

Returns high-level system usage statistics and cache performance.

- **Success Response (200 OK)**:
```json
{
  "analytics": {
    "total_questions": 1250,
    "unique_users": 180,
    "top_languages": ["en", "hi", "ta"],
    "avg_confidence": 0.92
  },
  "cache": {
    "hits": 450,
    "misses": 800,
    "hit_rate": "36.0%"
  }
}
```

## 2. System Metrics
`GET /metrics`

Prometheus-style endpoint for detailed performance tracking.

- **Success Response (200 OK)**:
```json
{
  "metrics": {
    "requests_total": 5400,
    "latency_avg": 0.85,
    "llm_token_count": 850000
  },
  "timestamp": 1708365600
}
```

## 3. Health Status
`GET /health`

Comprehensive check of all system dependencies.

- **Success Response (200 OK)**:
```json
{
  "status": "healthy",
  "system_ready": true,
  "components_health": {
    "database": { "status": "UP", "message": "Connected" },
    "pinecone": { "status": "UP", "message": "Index reachable" }
  }
}
```

## 4. Personal Chat Insights (Daily Summaries)
`GET /conversations/users/{user_id}/daily-summaries`

Retrievesaggregated spiritual summaries for a user within a date range.

- **Query Parameters**:
  - `start_date`: YYYY-MM-DD (Required)
  - `end_date`: YYYY-MM-DD (Required)

- **Success Response (200 OK)**:
```json
[
  {
    "id": "uuid-string",
    "date": "2026-02-19",
    "summary_text": "On this day, you explored the nature of selfless action and equanimity...",
    "topics": ["Karma", "Yoga", "Mind Control"],
    "conversation_count": 3,
    "message_count": 24,
    "mood": "contemplative"
  }
]
```

## 5. Trigger Insight Generation
`POST /conversations/users/{user_id}/generate-daily-summary`

Manually triggers the generation of a daily summary for a specific date.

- **Query Parameters**:
  - `date`: YYYY-MM-DD (Required)
```json
{
  "message": "Daily summary generated successfully",
  "generated": true,
  "summary": { ... }
}
```
