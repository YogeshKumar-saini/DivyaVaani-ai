"""Database models for the persistent memory system (LTM / STM / Episodic)."""

from sqlalchemy import Column, String, Text, DateTime, Float, Integer, JSON, ForeignKey, Index, Boolean
from sqlalchemy.sql import func
from datetime import datetime
import uuid

from .database import Base


class MemoryFact(Base):
    """A single extracted fact about a user (LTM).

    Examples:
        - "User is deeply interested in Karma Yoga"
        - "User prefers responses in Hindi"
        - "User is going through a spiritual transition"
    """
    __tablename__ = "memory_facts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(255), nullable=False, index=True)

    # Fact classification
    fact_type = Column(String(50), nullable=False)  # preference | interest | spiritual_insight | personal | behavioral
    content = Column(Text, nullable=False)
    importance = Column(Float, default=0.5)  # 0.0 - 1.0

    # Usage tracking (for relevance decay / boosting)
    access_count = Column(Integer, default=0)
    last_accessed_at = Column(DateTime(timezone=True), nullable=True)

    # Provenance
    source_conversation_id = Column(String(36), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    is_active = Column(Boolean, default=True)

    __table_args__ = (
        Index('idx_mf_user_type', 'user_id', 'fact_type'),
        Index('idx_mf_user_importance', 'user_id', 'importance'),
        Index('idx_mf_user_active', 'user_id', 'is_active'),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "fact_type": self.fact_type,
            "content": self.content,
            "importance": self.importance,
            "access_count": self.access_count,
            "last_accessed_at": self.last_accessed_at.isoformat() if self.last_accessed_at else None,
            "source_conversation_id": self.source_conversation_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "is_active": self.is_active,
        }


class EpisodicMemory(Base):
    """A summarised memory of an entire conversation (Episodic Memory)."""
    __tablename__ = "episodic_memories"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(255), nullable=False, index=True)
    conversation_id = Column(String(36), nullable=False, unique=True)

    summary = Column(Text, nullable=False)
    themes = Column(JSON, default=list)          # ["karma", "meditation", "peace"]
    mood = Column(String(50), nullable=True)      # "contemplative", "seeking", etc.
    key_insights = Column(JSON, default=list)     # ["Learned about nishkama karma", ...]
    message_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        Index('idx_em_user_created', 'user_id', 'created_at'),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "conversation_id": self.conversation_id,
            "summary": self.summary,
            "themes": self.themes or [],
            "mood": self.mood,
            "key_insights": self.key_insights or [],
            "message_count": self.message_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class UserMemoryProfile(Base):
    """Aggregate memory profile for a user — updated after each consolidation."""
    __tablename__ = "user_memory_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(255), nullable=False, unique=True, index=True)

    top_topics = Column(JSON, default=list)          # [{"topic": "karma", "count": 12}, ...]
    preferred_language = Column(String(10), nullable=True)
    spiritual_stage = Column(String(50), default="seeker")  # seeker | practitioner | advanced
    total_conversations = Column(Integer, default=0)
    total_facts = Column(Integer, default=0)
    personality_traits = Column(JSON, default=list)  # ["reflective", "curious"]

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "top_topics": self.top_topics or [],
            "preferred_language": self.preferred_language,
            "spiritual_stage": self.spiritual_stage,
            "total_conversations": self.total_conversations,
            "total_facts": self.total_facts,
            "personality_traits": self.personality_traits or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_updated_at": self.last_updated_at.isoformat() if self.last_updated_at else None,
        }
