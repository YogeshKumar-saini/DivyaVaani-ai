"""Conversation API routes using existing QA system."""

import asyncio
import json
import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from src.config import settings
from src.services.text_service import TextService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["conversation"])

# Global conversation state
conversation_sessions = {}
text_service = TextService()

class ConversationRequest(BaseModel):
    """Validated conversation request model."""
    query: str = Field(..., min_length=1, max_length=1000, description="The question to ask")
    user_id: Optional[str] = Field(None, description="User identifier for analytics")
    include_sources: bool = Field(False, description="Include source references")

class ConversationResponse(BaseModel):
    """Structured conversation response model."""
    query: str
    answer: str
    confidence: float
    processing_time: float
    sources: Optional[list] = None

@router.websocket("/ws")
async def conversation_websocket(websocket: WebSocket, user_id: Optional[str] = None):
    """WebSocket endpoint for real-time LiveKit-based conversation."""
    await websocket.accept()

    session_id = user_id or f"session_{id(websocket)}"
    conversation_sessions[session_id] = {
        "websocket": websocket,
        "qa_system": None,
        "conversation_history": []
    }

    try:
        # Send welcome message
        welcome_message = {
            "type": "welcome",
            "message": "🕉️ Welcome to DivyaVaani AI - Your spiritual companion powered by Bhagavad Gita wisdom",
            "session_id": session_id
        }
        await websocket.send_json(welcome_message)

        while True:
            # Receive message from client
            data = await websocket.receive_json()

            if data.get("type") == "text_query":
                query = data.get("query", "").strip()
                if not query:
                    continue

                # Add to conversation history
                conversation_sessions[session_id]["conversation_history"].append({
                    "role": "user",
                    "content": query
                })

                try:
                    # Process query using text service
                    response = await text_service.process_query(
                        question=query,
                        user_id=session_id,
                        preferred_language="en"
                    )
                    answer = response.get("answer", "I apologize, but I couldn't find guidance for this question.")

                    # Add to conversation history
                    conversation_sessions[session_id]["conversation_history"].append({
                        "role": "assistant",
                        "content": answer
                    })

                    # Send response
                    response_message = {
                        "type": "text_response",
                        "query": query,
                        "answer": answer,
                        "confidence": response.get("confidence", 0.8),
                        "sources": response.get("sources", [])
                    }
                    await websocket.send_json(response_message)

                except Exception as e:
                    logger.error(f"Error processing query: {e}")
                    error_message = {
                        "type": "error",
                        "message": "I encountered an error while seeking divine guidance. Please try again."
                    }
                    await websocket.send_json(error_message)

            elif data.get("type") == "voice_query":
                # Placeholder for future voice integration
                voice_message = {
                    "type": "voice_response",
                    "message": "Voice conversation feature coming soon. Please use text queries for now."
                }
                await websocket.send_json(voice_message)

            elif data.get("type") == "get_history":
                # Send conversation history
                history_message = {
                    "type": "conversation_history",
                    "history": conversation_sessions[session_id]["conversation_history"]
                }
                await websocket.send_json(history_message)

            elif data.get("type") == "clear_history":
                # Clear conversation history
                conversation_sessions[session_id]["conversation_history"] = []
                clear_message = {
                    "type": "history_cleared",
                    "message": "Conversation history cleared."
                }
                await websocket.send_json(clear_message)

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error for session {session_id}: {e}")
    finally:
        # Cleanup
        if session_id in conversation_sessions:
            del conversation_sessions[session_id]

@router.post("/text", response_model=ConversationResponse)
async def conversation_text_query(request: Request, conv_req: ConversationRequest):
    """REST endpoint for text-based conversation with spiritual guidance."""

    try:
        # Process query using text service
        response = await text_service.process_query(
            question=conv_req.query,
            user_id=conv_req.user_id,
            preferred_language="en"
        )

        result = ConversationResponse(
            query=conv_req.query,
            answer=response.get("answer", "Unable to find spiritual guidance for this question."),
            confidence=response.get("confidence", 0.8),
            processing_time=response.get("processing_time", 0.0),
            sources=response.get("sources", []) if conv_req.include_sources else None
        )

        return result

    except Exception as e:
        logger.error(f"Error in conversation query: {e}")
        raise HTTPException(status_code=500, detail="Failed to process spiritual query")

@router.get("/health")
async def conversation_health():
    """Health check for conversation service."""
    try:
        return {
            "status": "healthy",
            "service": "conversation",
            "text_service_ready": text_service is not None,
            "active_sessions": len(conversation_sessions)
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "conversation",
            "error": str(e)
        }

@router.delete("/sessions/{session_id}")
async def clear_session(session_id: str):
    """Clear a specific conversation session."""
    if session_id in conversation_sessions:
        del conversation_sessions[session_id]
        return {"message": f"Session {session_id} cleared"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")
