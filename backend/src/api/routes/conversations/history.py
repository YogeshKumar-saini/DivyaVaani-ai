"""Conversation history API endpoints."""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.orm import Session

from src.storage import get_db, Conversation, Message
from src.storage.conversation_repository import ConversationRepository
from src.utils.logger import log

router = APIRouter(tags=["conversations"])


# ==================== Request/Response Models ====================

class ConversationCreate(BaseModel):
    """Create conversation request."""
    title: Optional[str] = Field(None, max_length=500)
    language: str = Field("en", max_length=10)


class MessageCreate(BaseModel):
    """Add message request."""
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., min_length=1)
    confidence_score: Optional[float] = None
    model_used: Optional[str] = None
    processing_time: Optional[float] = None
    sources: Optional[List[str]] = None
    quality_score: Optional[float] = None


class ConversationResponse(BaseModel):
    """Conversation response."""
    id: str
    user_id: str
    title: Optional[str]
    language: str
    created_at: str
    updated_at: str
    total_messages: int
    avg_confidence: float
    tags: List[str]


class MessageResponse(BaseModel):
    """Message response."""
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: str
    confidence_score: Optional[float]
    model_used: Optional[str]
    processing_time: Optional[float]
    sources: Optional[List[str]]
    quality_score: Optional[float]


class ConversationWithMessages(ConversationResponse):
    """Conversation with messages."""
    messages: List[MessageResponse]


# ==================== Endpoints ====================

@router.post("", response_model=ConversationResponse)
async def create_conversation(
    user_id: str = Query(..., description="User identifier"),
    conv_create: ConversationCreate = ConversationCreate(),
    db: Session = Depends(get_db)
):
    """Create a new conversation."""
    try:
        repo = ConversationRepository(db)
        conversation = repo.create_conversation(
            user_id=user_id,
            title=conv_create.title,
            language=conv_create.language
        )
        return ConversationResponse(**conversation.to_dict())
    except Exception as e:
        log.error(f"Failed to create conversation: {e}")
        raise HTTPException(status_code=500, detail="Failed to create conversation")


@router.get("", response_model=List[ConversationResponse])
async def get_user_conversations(
    user_id: str = Query(..., description="User identifier"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get all conversations for a user."""
    try:
        repo = ConversationRepository(db)
        conversations = repo.get_user_conversations(user_id, limit, offset)
        return [ConversationResponse(**conv.to_dict()) for conv in conversations]
    except Exception as e:
        log.error(f"Failed to get conversations: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve conversations")


@router.get("/{conversation_id}", response_model=ConversationWithMessages)
async def get_conversation(
    conversation_id: str,
    include_messages: bool = Query(True, description="Include messages in response"),
    message_limit: Optional[int] = Query(None, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get a specific conversation with optional messages."""
    try:
        repo = ConversationRepository(db)
        conversation = repo.get_conversation(conversation_id)
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        conv_dict = conversation.to_dict()
        
        if include_messages:
            messages = repo.get_conversation_messages(conversation_id, limit=message_limit)
            conv_dict["messages"] = [MessageResponse(**msg.to_dict()) for msg in messages]
        else:
            conv_dict["messages"] = []
        
        return ConversationWithMessages(**conv_dict)
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Failed to get conversation: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve conversation")


@router.post("/{conversation_id}/messages", response_model=MessageResponse)
async def add_message(
    conversation_id: str,
    message: MessageCreate,
    db: Session = Depends(get_db)
):
    """Add a message to a conversation."""
    try:
        repo = ConversationRepository(db)
        
        # Verify conversation exists
        if not repo.get_conversation(conversation_id):
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Create message
        msg = repo.add_message(
            conversation_id=conversation_id,
            role=message.role,
            content=message.content,
            confidence_score=message.confidence_score,
            model_used=message.model_used,
            processing_time=message.processing_time,
            sources=message.sources,
            quality_score=message.quality_score
        )
        
        return MessageResponse(**msg.to_dict())
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Failed to add message: {e}")
        raise HTTPException(status_code=500, detail="Failed to add message")


@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    conversation_id: str,
    limit: Optional[int] = Query(None, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get messages from a conversation."""
    try:
        repo = ConversationRepository(db)
        
        # Verify conversation exists
        if not repo.get_conversation(conversation_id):
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        messages = repo.get_conversation_messages(conversation_id, limit=limit)
        return [MessageResponse(**msg.to_dict()) for msg in messages]
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Failed to get messages: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve messages")


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    """Delete a conversation and all its messages."""
    try:
        repo = ConversationRepository(db)
        
        if not repo.delete_conversation(conversation_id):
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return {"message": "Conversation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Failed to delete conversation: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete conversation")


@router.get("/users/{user_id}/stats")
async def get_user_stats(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get user conversation statistics."""
    try:
        repo = ConversationRepository(db)
        stats = repo.get_user_stats(user_id)
        return stats
    except Exception as e:
        log.error(f"Failed to get user stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve statistics")


@router.get("/search")
async def search_conversations(
    user_id: str = Query(..., description="User identifier"),
    query: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Search conversations by title."""
    try:
        repo = ConversationRepository(db)
        conversations = repo.search_conversations(user_id, query, limit)
        return [ConversationResponse(**conv.to_dict()) for conv in conversations]
    except Exception as e:
        log.error(f"Failed to search conversations: {e}")
        raise HTTPException(status_code=500, detail="Failed to search conversations")
