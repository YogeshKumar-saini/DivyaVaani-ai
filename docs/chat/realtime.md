# Chat System: Real-time Interaction (WebSockets)

DivyaVaani supports low-latency, real-time spiritual dialogues through a dedicated WebSocket service. This is ideal for interactive applications requiring immediate feedback.

## 1. WebSocket Endpoint
`WS /conversation/ws`

The WebSocket connection allows for continuous, stateful communication.

### Connection Parameters
- `user_id`: string (Optional - passed as a query parameter)

### Message Format (JSON)
All messages follow a typed structure:
```json
{
  "type": "text_query",
  "query": "What is the path to peace?"
}
```

### Supported Message Types
- `text_query`: Send a question to the AI.
- `voice_query`: (Upcoming) Send audio data for processing.
- `get_history`: Retrieve the history of the current WebSocket session.
- `clear_history`: Resets the session state.

### Response Types
- `welcome`: Initial greeting upon connection.
- `text_response`: Contains the AI's answer, confidence, and sources.
- `conversation_history`: List of past messages in the session.
- `error`: Technical feedback if something fails.

## 2. REST Alternative
`POST /conversation/text`

A standard REST endpoint that uses the same logic as the WebSocket service but for single-request interactions.

- **Request Body**:
```json
{
  "query": "string",
  "user_id": "string (Optional)",
  "include_sources": "boolean"
}
```

## 3. Session Management
- `DELETE /conversation/sessions/{session_id}`: Forcefully clears a live conversation session from the server's memory.
- `GET /conversation/health`: Returns the count of active real-time sessions and service status.
