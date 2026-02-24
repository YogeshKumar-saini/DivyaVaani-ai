"""Memory API routes — manage user memory (LTM, Episodic, Profile)."""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from src.storage.database import get_db
from src.storage.memory_repository import MemoryRepository
from src.storage.conversation_repository import ConversationRepository
from src.rag.memory import MemoryExtractor, MemoryConsolidator, LongTermMemory, EpisodicMemoryManager
from src.utils.logger import log

router = APIRouter(tags=["memory"])


# ==================== Response Models ====================

class MemoryFactResponse(BaseModel):
    id: str
    user_id: str
    fact_type: str
    content: str
    importance: float
    access_count: int
    last_accessed_at: Optional[str]
    source_conversation_id: Optional[str]
    created_at: Optional[str]
    is_active: bool


class EpisodicMemoryResponse(BaseModel):
    id: str
    user_id: str
    conversation_id: str
    summary: str
    themes: List[str]
    mood: Optional[str]
    key_insights: List[str]
    message_count: int
    created_at: Optional[str]


class MemoryProfileResponse(BaseModel):
    user_id: str
    top_topics: List[Dict]
    preferred_language: Optional[str]
    spiritual_stage: str
    total_conversations: int
    total_facts: int
    personality_traits: List[str]
    created_at: Optional[str]
    last_updated_at: Optional[str]


class MemoryOverviewResponse(BaseModel):
    user_id: str
    profile: Optional[MemoryProfileResponse]
    fact_count: int
    episode_count: int
    memory_status: str


# ==================== Endpoints ====================

@router.get("/user/{user_id}", response_model=MemoryOverviewResponse)
async def get_user_memory_overview(
    user_id: str,
    db: Session = Depends(get_db),
):
    """Get an overview of a user's memory (profile + counts)."""
    try:
        repo = MemoryRepository(db)
        profile = repo.get_memory_profile(user_id)
        fact_count = repo.get_fact_count(user_id)
        episode_count = repo.get_episode_count(user_id)

        profile_data = None
        if profile:
            profile_data = MemoryProfileResponse(
                user_id=profile.user_id,
                top_topics=profile.top_topics or [],
                preferred_language=profile.preferred_language,
                spiritual_stage=profile.spiritual_stage or "seeker",
                total_conversations=profile.total_conversations,
                total_facts=profile.total_facts,
                personality_traits=profile.personality_traits or [],
                created_at=profile.created_at.isoformat() if profile.created_at else None,
                last_updated_at=profile.last_updated_at.isoformat() if profile.last_updated_at else None,
            )

        status = "active" if (fact_count > 0 or episode_count > 0) else "empty"

        return MemoryOverviewResponse(
            user_id=user_id,
            profile=profile_data,
            fact_count=fact_count,
            episode_count=episode_count,
            memory_status=status,
        )
    except Exception as e:
        log.error(f"Failed to get memory overview for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve memory overview")


@router.get("/user/{user_id}/facts", response_model=List[MemoryFactResponse])
async def get_user_facts(
    user_id: str,
    fact_type: Optional[str] = Query(None, description="Filter by fact type"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Get memory facts for a user."""
    try:
        repo = MemoryRepository(db)
        facts = repo.get_user_facts(user_id, fact_type=fact_type, limit=limit, offset=offset)
        return [MemoryFactResponse(**f.to_dict()) for f in facts]
    except Exception as e:
        log.error(f"Failed to get facts for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve memory facts")


@router.delete("/user/{user_id}/facts/{fact_id}")
async def delete_user_fact(
    user_id: str,
    fact_id: str,
    db: Session = Depends(get_db),
):
    """Delete (soft-delete) a specific memory fact."""
    try:
        repo = MemoryRepository(db)
        deleted = repo.delete_fact(fact_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Fact not found")
        return {"message": "Fact deleted successfully", "fact_id": fact_id}
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Failed to delete fact {fact_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete fact")


@router.get("/user/{user_id}/episodes", response_model=List[EpisodicMemoryResponse])
async def get_user_episodes(
    user_id: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Get episodic memories for a user."""
    try:
        repo = MemoryRepository(db)
        episodes = repo.get_user_episodes(user_id, limit=limit, offset=offset)
        return [EpisodicMemoryResponse(**ep.to_dict()) for ep in episodes]
    except Exception as e:
        log.error(f"Failed to get episodes for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve episodic memories")


@router.post("/consolidate/{conversation_id}")
async def consolidate_conversation(
    conversation_id: str,
    user_id: str = Query(..., description="User identifier"),
    db: Session = Depends(get_db),
):
    """Manually trigger memory consolidation for a conversation.

    This extracts facts, creates an episodic memory, and updates the user profile.
    """
    try:
        # Get conversation messages
        conv_repo = ConversationRepository(db)
        conversation = conv_repo.get_conversation(conversation_id)

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        messages_objs = conv_repo.get_conversation_messages(conversation_id)
        if not messages_objs:
            return {"status": "skipped", "reason": "no_messages", "conversation_id": conversation_id}

        messages = [{"role": m.role, "content": m.content} for m in messages_objs]

        # Run consolidation
        mem_repo = MemoryRepository(db)
        import os
        extractor = MemoryExtractor(groq_api_key=os.getenv("GROQ_API_KEY", ""))
        ltm = LongTermMemory(memory_repository=mem_repo)
        episodic = EpisodicMemoryManager(memory_repository=mem_repo)
        consolidator = MemoryConsolidator(
            extractor=extractor, ltm=ltm, episodic=episodic, memory_repository=mem_repo
        )

        result = consolidator.consolidate(user_id, conversation_id, messages)
        return result

    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Failed to consolidate conversation {conversation_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to consolidate conversation memory")


@router.delete("/user/{user_id}")
async def clear_user_memory(
    user_id: str,
    db: Session = Depends(get_db),
):
    """Clear ALL memory data for a user (facts, episodes, profile)."""
    try:
        repo = MemoryRepository(db)
        result = repo.clear_user_memory(user_id)
        return {
            "message": f"All memory cleared for user {user_id}",
            **result,
        }
    except Exception as e:
        log.error(f"Failed to clear memory for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear user memory")


@router.get("/user/{user_id}/summary")
async def get_user_memory_summary(
    user_id: str,
    db: Session = Depends(get_db),
):
    """Get a human-readable summary of what the AI knows about a user."""
    try:
        mem_repo = MemoryRepository(db)
        ltm = LongTermMemory(memory_repository=mem_repo)
        summary = ltm.get_user_summary(user_id)

        if not summary:
            return {"user_id": user_id, "summary": "No memories stored yet.", "has_memory": False}

        return {"user_id": user_id, "summary": summary, "has_memory": True}
    except Exception as e:
        log.error(f"Failed to get memory summary for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get memory summary")
