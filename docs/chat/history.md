# Chat System: History Endpoints

All conversation management endpoints are accessible via `/conversations`.

## 1. Create Conversation
`POST /conversations`

- **Query Parameters**:
  - `user_id`: string (Required)
- **Request Body (JSON)**:
```json
{
  "title": "string (Optional - max 500 chars)",
  "language": "string (Optional - default 'en')"
}
```
- **Success Response (200 OK)**:
```json
{
  "id": "uuid-string",
  "title": "Meditation Guidance",
  "language": "hi",
  "created_at": "ISO-datetime",
  "total_messages": 0,
  "tags": []
}
```

## 2. List User Conversations
`GET /conversations`

- **Query Parameters**:
  - `user_id`: string (Required)
  - `limit`: integer (Default: 50)
  - `offset`: integer (Default: 0)

## 3. Search Conversations
`GET /conversations/search`

Filters conversations for a user by title similarity.

- **Query Parameters**:
  - `user_id`: string (Required)
  - `query`: string (Required - min 1 char)
  - `limit`: integer (Default: 20)

## 4. Get Conversation Details
`GET /conversations/{conversation_id}`

Returns a conversation object, optionally including its messages.

- **Query Parameters**:
  - `include_messages`: boolean (Default: true)
  - `message_limit`: integer (Optional)

## 5. Add Message to Conversation
`POST /conversations/{conversation_id}/messages`

- **Request Body (JSON)**:
```json
{
  "role": "user | assistant",
  "content": "string (Required)",
  "confidence_score": "float (Optional)",
  "sources": "string[] (Optional)"
}
```

## 6. Smart Suggested Questions
`GET /conversations/users/{user_id}/suggested-questions`

Returns 6 personalized questions based on the user's topic distribution.

- **Success Response (200 OK)**:
```json
{
  "questions": [
    { "text": "What is the nature of dharma?", "tag": "Dharma" },
    ...
  ],
  "personalized": true
}
```
