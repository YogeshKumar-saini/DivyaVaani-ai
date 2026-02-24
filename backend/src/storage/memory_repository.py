"""Repository for memory-related database operations (LTM / Episodic / Profile)."""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime

from src.storage.memory_models import MemoryFact, EpisodicMemory, UserMemoryProfile
from src.utils.logger import log


class MemoryRepository:
    """CRUD operations for the persistent memory system."""

    def __init__(self, db: Session):
        self.db = db

    # ==================== MemoryFact Operations ====================

    def save_fact(
        self,
        user_id: str,
        fact_type: str,
        content: str,
        importance: float = 0.5,
        source_conversation_id: Optional[str] = None,
    ) -> MemoryFact:
        """Save a new memory fact."""
        fact = MemoryFact(
            user_id=user_id,
            fact_type=fact_type,
            content=content,
            importance=min(max(importance, 0.0), 1.0),
            source_conversation_id=source_conversation_id,
        )
        self.db.add(fact)
        self.db.commit()
        self.db.refresh(fact)
        log.info(f"Saved memory fact for user {user_id}: {content[:60]}...")
        return fact

    def get_user_facts(
        self,
        user_id: str,
        fact_type: Optional[str] = None,
        active_only: bool = True,
        limit: int = 50,
        offset: int = 0,
    ) -> List[MemoryFact]:
        """Get facts for a user, optionally filtered by type."""
        query = self.db.query(MemoryFact).filter(MemoryFact.user_id == user_id)

        if active_only:
            query = query.filter(MemoryFact.is_active == True)
        if fact_type:
            query = query.filter(MemoryFact.fact_type == fact_type)

        return (
            query.order_by(desc(MemoryFact.importance), desc(MemoryFact.created_at))
            .limit(limit)
            .offset(offset)
            .all()
        )

    def search_facts(self, user_id: str, keywords: List[str], limit: int = 10) -> List[MemoryFact]:
        """Search facts by keyword matching (case-insensitive)."""
        query = self.db.query(MemoryFact).filter(
            MemoryFact.user_id == user_id,
            MemoryFact.is_active == True,
        )

        # OR-match across keywords
        from sqlalchemy import or_

        keyword_filters = [MemoryFact.content.ilike(f"%{kw}%") for kw in keywords]
        if keyword_filters:
            query = query.filter(or_(*keyword_filters))

        return query.order_by(desc(MemoryFact.importance)).limit(limit).all()

    def increment_access(self, fact_id: str) -> None:
        """Increment access count and update last_accessed_at."""
        fact = self.db.query(MemoryFact).filter(MemoryFact.id == fact_id).first()
        if fact:
            fact.access_count += 1
            fact.last_accessed_at = datetime.utcnow()
            self.db.commit()

    def delete_fact(self, fact_id: str) -> bool:
        """Soft-delete a fact."""
        fact = self.db.query(MemoryFact).filter(MemoryFact.id == fact_id).first()
        if not fact:
            return False
        fact.is_active = False
        self.db.commit()
        return True

    def hard_delete_fact(self, fact_id: str) -> bool:
        """Permanently delete a fact."""
        fact = self.db.query(MemoryFact).filter(MemoryFact.id == fact_id).first()
        if not fact:
            return False
        self.db.delete(fact)
        self.db.commit()
        return True

    def get_fact_count(self, user_id: str) -> int:
        """Get total active fact count for a user."""
        return (
            self.db.query(func.count(MemoryFact.id))
            .filter(MemoryFact.user_id == user_id, MemoryFact.is_active == True)
            .scalar()
            or 0
        )

    # ==================== EpisodicMemory Operations ====================

    def save_episodic_memory(
        self,
        user_id: str,
        conversation_id: str,
        summary: str,
        themes: List[str],
        mood: Optional[str] = None,
        key_insights: Optional[List[str]] = None,
        message_count: int = 0,
    ) -> EpisodicMemory:
        """Save an episodic memory for a conversation."""
        # Upsert: if episode for this conversation already exists, update it
        existing = (
            self.db.query(EpisodicMemory)
            .filter(EpisodicMemory.conversation_id == conversation_id)
            .first()
        )

        if existing:
            existing.summary = summary
            existing.themes = themes
            existing.mood = mood
            existing.key_insights = key_insights or []
            existing.message_count = message_count
            self.db.commit()
            self.db.refresh(existing)
            return existing

        episode = EpisodicMemory(
            user_id=user_id,
            conversation_id=conversation_id,
            summary=summary,
            themes=themes,
            mood=mood,
            key_insights=key_insights or [],
            message_count=message_count,
        )
        self.db.add(episode)
        self.db.commit()
        self.db.refresh(episode)
        log.info(f"Saved episodic memory for conversation {conversation_id}")
        return episode

    def get_user_episodes(
        self, user_id: str, limit: int = 20, offset: int = 0
    ) -> List[EpisodicMemory]:
        """Get episodic memories for a user (most recent first)."""
        return (
            self.db.query(EpisodicMemory)
            .filter(EpisodicMemory.user_id == user_id)
            .order_by(desc(EpisodicMemory.created_at))
            .limit(limit)
            .offset(offset)
            .all()
        )

    def search_episodes(
        self, user_id: str, keywords: List[str], limit: int = 5
    ) -> List[EpisodicMemory]:
        """Search episodic memories by keyword matching on summary and themes."""
        from sqlalchemy import or_, cast, String

        query = self.db.query(EpisodicMemory).filter(
            EpisodicMemory.user_id == user_id,
        )

        keyword_filters = []
        for kw in keywords:
            keyword_filters.append(EpisodicMemory.summary.ilike(f"%{kw}%"))
        if keyword_filters:
            query = query.filter(or_(*keyword_filters))

        return query.order_by(desc(EpisodicMemory.created_at)).limit(limit).all()

    def get_episode_count(self, user_id: str) -> int:
        """Get total episode count for a user."""
        return (
            self.db.query(func.count(EpisodicMemory.id))
            .filter(EpisodicMemory.user_id == user_id)
            .scalar()
            or 0
        )

    # ==================== UserMemoryProfile Operations ====================

    def upsert_memory_profile(
        self,
        user_id: str,
        top_topics: Optional[List[Dict]] = None,
        preferred_language: Optional[str] = None,
        spiritual_stage: Optional[str] = None,
        total_conversations: Optional[int] = None,
        total_facts: Optional[int] = None,
        personality_traits: Optional[List[str]] = None,
    ) -> UserMemoryProfile:
        """Create or update user memory profile."""
        profile = (
            self.db.query(UserMemoryProfile)
            .filter(UserMemoryProfile.user_id == user_id)
            .first()
        )

        if profile:
            if top_topics is not None:
                profile.top_topics = top_topics
            if preferred_language is not None:
                profile.preferred_language = preferred_language
            if spiritual_stage is not None:
                profile.spiritual_stage = spiritual_stage
            if total_conversations is not None:
                profile.total_conversations = total_conversations
            if total_facts is not None:
                profile.total_facts = total_facts
            if personality_traits is not None:
                profile.personality_traits = personality_traits
            self.db.commit()
            self.db.refresh(profile)
            return profile

        profile = UserMemoryProfile(
            user_id=user_id,
            top_topics=top_topics or [],
            preferred_language=preferred_language,
            spiritual_stage=spiritual_stage or "seeker",
            total_conversations=total_conversations or 0,
            total_facts=total_facts or 0,
            personality_traits=personality_traits or [],
        )
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def get_memory_profile(self, user_id: str) -> Optional[UserMemoryProfile]:
        """Get user memory profile."""
        return (
            self.db.query(UserMemoryProfile)
            .filter(UserMemoryProfile.user_id == user_id)
            .first()
        )

    # ==================== Bulk Operations ====================

    def clear_user_memory(self, user_id: str) -> Dict[str, int]:
        """Clear ALL memory data for a user. Returns counts of deleted items."""
        facts_deleted = (
            self.db.query(MemoryFact)
            .filter(MemoryFact.user_id == user_id)
            .delete()
        )
        episodes_deleted = (
            self.db.query(EpisodicMemory)
            .filter(EpisodicMemory.user_id == user_id)
            .delete()
        )
        profiles_deleted = (
            self.db.query(UserMemoryProfile)
            .filter(UserMemoryProfile.user_id == user_id)
            .delete()
        )
        self.db.commit()

        log.info(f"Cleared all memory for user {user_id}: {facts_deleted} facts, {episodes_deleted} episodes")
        return {
            "facts_deleted": facts_deleted,
            "episodes_deleted": episodes_deleted,
            "profiles_deleted": profiles_deleted,
        }
