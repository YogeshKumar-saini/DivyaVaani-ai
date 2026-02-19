"""Server-Sent Events (SSE) streaming endpoint for real-time responses."""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator
from typing import Optional, AsyncGenerator
import json
import asyncio
import re

from src.core.exceptions import APIError
from src.services.text_service import TextService
from src.utils.logger import log, structured_logger
from src.config import settings

router = APIRouter(tags=["streaming"])


class StreamRequest(BaseModel):
    """Validated streaming request model."""
    question: str = Field(..., min_length=1, max_length=1000, description="The question to ask")
    user_id: Optional[str] = Field(None, description="User identifier for analytics")
    preferred_language: Optional[str] = Field(None, description="Preferred response language")
    conversation_history: Optional[str] = Field(None, description="Conversation history for context")

    @field_validator('question')
    @classmethod
    def validate_question(cls, v):
        """Validate and sanitize question."""
        if not v or not v.strip():
            raise ValueError("Question cannot be empty")

        # Remove excessive whitespace
        v = re.sub(r'\s+', ' ', v.strip())

        # Check for potentially harmful content
        harmful_patterns = [
            r'<script', r'javascript:', r'on\w+\s*=',
            r'union\s+select', r';\s*drop', r'--', r'/\*.*\*/'
        ]

        for pattern in harmful_patterns:
            if re.search(pattern, v, re.IGNORECASE):
                raise ValueError("Invalid question content")

        return v

    @field_validator('preferred_language')
    @classmethod
    def validate_language(cls, v):
        """Validate preferred language."""
        if v is None:
            return v

        allowed_languages = ['en', 'hi', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml', 'pa', 'or']
        if v.lower() not in allowed_languages:
            raise ValueError(f"Unsupported language. Supported: {', '.join(allowed_languages)}")

        return v.lower()


async def generate_sse_stream(
    question: str,
    user_id: Optional[str] = None,
    preferred_language: Optional[str] = None,
    conversation_history: Optional[str] = None
) -> AsyncGenerator[str, None]:
    """Generate Server-Sent Events stream for question answering.
    
    SSE Format:
    - event: <event_type>
    - data: <json_data>
    - (blank line)
    """
    try:
        # Send start event
        yield f"event: start\n"
        yield f"data: {json.dumps({'status': 'processing', 'question': question})}\n\n"

        # Initialize text service
        text_service = TextService()
        
        # Send thinking event
        yield f"event: thinking\n"
        yield f"data: {json.dumps({'status': 'retrieving_context'})}\n\n"

        # Process query with streaming
        async for chunk in text_service.process_query_stream(
            question=question,
            user_id=user_id,
            preferred_language=preferred_language,
            conversation_history=conversation_history
        ):
            # Send token event
            if chunk.get('type') == 'token':
                yield f"event: token\n"
                yield f"data: {json.dumps({'token': chunk['content']})}\n\n"
            
            # Send metadata event
            elif chunk.get('type') == 'metadata':
                yield f"event: metadata\n"
                yield f"data: {json.dumps(chunk['data'])}\n\n"
            
            # Send source event
            elif chunk.get('type') == 'source':
                yield f"event: source\n"
                yield f"data: {json.dumps(chunk['data'])}\n\n"

            # Send follow-up event
            elif chunk.get('type') == 'follow_up':
                yield f"event: follow_up\n"
                yield f"data: {json.dumps(chunk['data'])}\n\n"

        # Send completion event
        yield f"event: done\n"
        yield f"data: {json.dumps({'status': 'completed'})}\n\n"

    except APIError as e:
        # Send error event
        yield f"event: error\n"
        yield f"data: {json.dumps({'error': e.message, 'status_code': e.status_code})}\n\n"
        
    except Exception as e:
        # Log error
        structured_logger.log_error(e, {
            "operation": "sse_streaming",
            "question": question[:100]
        })
        
        # Send error event
        yield f"event: error\n"
        yield f"data: {json.dumps({'error': 'An unexpected error occurred', 'status_code': 500})}\n\n"


@router.post("/stream")
async def stream_query(request: Request, stream_req: StreamRequest):
    """Stream responses using Server-Sent Events (SSE).
    
    Returns a stream of events:
    - start: Query processing started
    - thinking: Retrieving context
    - token: Individual response tokens
    - metadata: Response metadata (confidence, sources, etc.)
    - source: Source references
    - done: Processing completed
    - error: Error occurred
    
    Example usage:
    ```javascript
    const eventSource = new EventSource('/text/stream', {
        method: 'POST',
        body: JSON.stringify({question: "What is dharma?"})
    });
    
    eventSource.addEventListener('token', (e) => {
        const data = JSON.parse(e.data);
        console.log(data.token);
    });
    
    eventSource.addEventListener('done', (e) => {
        eventSource.close();
    });
    ```
    """
    try:
        return StreamingResponse(
            generate_sse_stream(
                question=stream_req.question,
                user_id=stream_req.user_id,
                preferred_language=stream_req.preferred_language,
                conversation_history=stream_req.conversation_history
            ),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",  # Disable nginx buffering
            }
        )

    except Exception as e:
        structured_logger.log_error(e, {
            "operation": "stream_query_endpoint",
            "question": stream_req.question[:100]
        })
        raise HTTPException(
            status_code=500,
            detail="Failed to initialize streaming response"
        )


@router.get("/stream/health")
async def stream_health():
    """Health check for streaming service."""
    return {
        "status": "healthy",
        "service": "streaming",
        "supported_events": ["start", "thinking", "token", "metadata", "source", "done", "error"]
    }
