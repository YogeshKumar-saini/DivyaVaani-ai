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


# ==================== Smart Suggested Questions ====================

# Topic-to-question mapping for personalized suggestions
TOPIC_QUESTIONS = {
    "dharma": [
        {"text": "How can I better understand my dharmic duty in daily life?", "tag": "Dharma"},
        {"text": "What are the different types of dharma mentioned in scriptures?", "tag": "Dharma"},
    ],
    "karma": [
        {"text": "How does the law of karma apply to modern decision-making?", "tag": "Karma"},
        {"text": "Can you explain nishkama karma and its practical application?", "tag": "Karma"},
    ],
    "meditation": [
        {"text": "What meditation technique does the Gita recommend for beginners?", "tag": "Meditation"},
        {"text": "How to deepen my meditation practice according to Yoga Sutras?", "tag": "Meditation"},
    ],
    "peace": [
        {"text": "What does the Gita say about finding peace in adversity?", "tag": "Inner Peace"},
        {"text": "How to cultivate equanimity in relationships?", "tag": "Inner Peace"},
    ],
    "devotion": [
        {"text": "What is the role of bhakti in spiritual liberation?", "tag": "Bhakti"},
        {"text": "How can I practice devotion in everyday actions?", "tag": "Bhakti"},
    ],
    "wisdom": [
        {"text": "What is the difference between knowledge and wisdom in Vedanta?", "tag": "Jnana"},
        {"text": "How does self-inquiry lead to liberation?", "tag": "Jnana"},
    ],
    "liberation": [
        {"text": "What are the paths to moksha described in the Gita?", "tag": "Liberation"},
        {"text": "How to overcome attachment to material desires?", "tag": "Liberation"},
    ],
    "yoga": [
        {"text": "What is the significance of the different yoga paths?", "tag": "Yoga"},
        {"text": "How does Karma Yoga differ from Bhakti Yoga?", "tag": "Yoga"},
    ],
    "mind": [
        {"text": "How to control the restless mind according to Krishna?", "tag": "Mind"},
        {"text": "What techniques help overcome negative thought patterns?", "tag": "Mind"},
    ],
    "duty": [
        {"text": "How to fulfill responsibilities without attachment to results?", "tag": "Duty"},
        {"text": "What does the Gita say about conflict between personal desires and duty?", "tag": "Duty"},
    ],
}

DEFAULT_QUESTIONS = [
    {"text": "What is the nature of dharma and how do I follow it?", "tag": "Dharma"},
    {"text": "How should one handle difficult decisions with equanimity?", "tag": "Equanimity"},
    {"text": "What does the Gita teach about selfless action (Karma Yoga)?", "tag": "Karma Yoga"},
    {"text": "How can I find inner peace amid chaos?", "tag": "Inner Peace"},
    {"text": "What is the path to self-realization according to Vedanta?", "tag": "Vedanta"},
    {"text": "How do I overcome fear and attachment?", "tag": "Liberation"},
]


@router.get("/users/{user_id}/suggested-questions")
async def get_suggested_questions(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get personalized daily questions based on user's chat behavior."""
    import hashlib
    from datetime import date

    try:
        repo = ConversationRepository(db)
        user_topics = repo.get_user_topic_distribution(user_id)

        if not user_topics:
            return {"questions": DEFAULT_QUESTIONS, "personalized": False}

        # Build question pool from user's topics
        question_pool = []
        for topic in user_topics:
            topic_lower = topic.lower()
            for key, questions in TOPIC_QUESTIONS.items():
                if key in topic_lower or topic_lower in key:
                    question_pool.extend(questions)

        # Add some default questions for diversity
        question_pool.extend(DEFAULT_QUESTIONS)

        # Remove duplicates by text
        seen = set()
        unique_questions = []
        for q in question_pool:
            if q["text"] not in seen:
                seen.add(q["text"])
                unique_questions.append(q)

        # Use daily seed for deterministic daily rotation
        daily_seed = hashlib.md5(
            f"{user_id}:{date.today().isoformat()}".encode()
        ).hexdigest()
        seed_int = int(daily_seed[:8], 16)

        import random
        rng = random.Random(seed_int)
        rng.shuffle(unique_questions)

        return {
            "questions": unique_questions[:6],
            "personalized": True
        }
    except Exception as e:
        log.error(f"Failed to get suggested questions: {e}")
        return {"questions": DEFAULT_QUESTIONS, "personalized": False}


# ==================== Daily Summaries ====================

class DailySummaryResponse(BaseModel):
    """Daily summary response."""
    id: str
    user_id: str
    date: str
    summary_text: str
    topics: List[str]
    conversation_count: int
    message_count: int
    mood: Optional[str]
    created_at: str
    updated_at: str


@router.get("/users/{user_id}/daily-summaries", response_model=List[DailySummaryResponse])
async def get_daily_summaries(
    user_id: str,
    start_date: str = Query(..., description="Start date YYYY-MM-DD"),
    end_date: str = Query(..., description="End date YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    """Get daily chat summaries for a user within a date range."""
    try:
        repo = ConversationRepository(db)
        summaries = repo.get_daily_summaries(user_id, start_date, end_date)
        return [DailySummaryResponse(**s.to_dict()) for s in summaries]
    except Exception as e:
        log.error(f"Failed to get daily summaries: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve daily summaries")


@router.post("/users/{user_id}/generate-daily-summary")
async def generate_daily_summary(
    user_id: str,
    date: str = Query(..., description="Date to generate summary for YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    """Generate a daily summary from conversations on a given date."""
    try:
        repo = ConversationRepository(db)
        conversations = repo.get_conversations_for_date(user_id, date)

        if not conversations:
            return {"message": "No conversations found for this date", "generated": False}

        # Collect all messages from the day's conversations
        all_topics = []
        total_messages = 0
        conversation_texts = []

        for conv in conversations:
            messages = repo.get_conversation_messages(conv.id)
            total_messages += len(messages)
            if conv.tags:
                all_topics.extend(conv.tags)

            conv_text = f"Conversation: {conv.title or 'Untitled'}\n"
            for msg in messages[:10]:  # Cap messages per conversation for summary
                conv_text += f"  {msg.role}: {msg.content[:200]}\n"
            conversation_texts.append(conv_text)

        # Build a simple summary from conversation content
        unique_topics = list(set(all_topics))
        topics_str = ", ".join(unique_topics[:5]) if unique_topics else "general spiritual guidance"

        summary_text = (
            f"On this day, you had {len(conversations)} spiritual conversation(s) "
            f"covering {total_messages} messages. "
            f"Topics explored include: {topics_str}. "
        )

        # Add conversation highlights
        for conv in conversations[:3]:
            if conv.title and conv.title != "New Conversation":
                summary_text += f'You explored "{conv.title[:80]}". '

        # Determine mood from topics
        mood_map = {
            "peace": "contemplative", "meditation": "contemplative",
            "karma": "seeking", "dharma": "seeking",
            "liberation": "transcendent", "devotion": "devotional",
        }
        mood = "reflective"
        for topic in unique_topics:
            for key, m in mood_map.items():
                if key in topic.lower():
                    mood = m
                    break

        daily_summary = repo.create_daily_summary(
            user_id=user_id,
            date=date,
            summary_text=summary_text.strip(),
            topics=unique_topics[:10],
            conversation_count=len(conversations),
            message_count=total_messages,
            mood=mood
        )

        return {
            "message": "Daily summary generated successfully",
            "generated": True,
            "summary": DailySummaryResponse(**daily_summary.to_dict())
        }
    except Exception as e:
        log.error(f"Failed to generate daily summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate daily summary")


# ==================== Conversation Context (LTM/STM) ====================

@router.get("/{conversation_id}/context")
async def get_conversation_context(
    conversation_id: str,
    message_count: int = Query(5, ge=1, le=20, description="Number of recent messages for STM"),
    db: Session = Depends(get_db)
):
    """Get conversation context for memory: recent messages (STM) + summary (LTM)."""
    try:
        repo = ConversationRepository(db)
        conversation = repo.get_conversation(conversation_id)

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # STM: Get last N messages
        recent_messages = repo.get_recent_messages(conversation_id, count=message_count)
        recent_messages.reverse()  # Chronological order

        # LTM: Get conversation summary
        summary = repo.get_summary(conversation_id)

        return {
            "conversation_id": conversation_id,
            "title": conversation.title,
            "stm": {
                "messages": [
                    {"role": msg.role, "content": msg.content}
                    for msg in recent_messages
                ]
            },
            "ltm": {
                "summary": summary.summary if summary else None,
                "key_topics": summary.key_topics if summary else [],
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Failed to get conversation context: {e}")
        raise HTTPException(status_code=500, detail="Failed to get conversation context")
