"""Database models for conversation persistence."""

from sqlalchemy import Column, String, Text, DateTime, Float, Integer, JSON, ForeignKey, Index, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import uuid

from .database import Base


class Conversation(Base):
    """Conversation session model."""
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(255), nullable=False, index=True)
    title = Column(String(500), nullable=True)  # Auto-generated from first question
    language = Column(String(10), default="en")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Metadata
    total_messages = Column(Integer, default=0)
    avg_confidence = Column(Float, default=0.0)
    tags = Column(JSON, default=list)  # ["dharma", "karma", etc.]
    
    # Relationships
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_user_created', 'user_id', 'created_at'),
        Index('idx_user_updated', 'user_id', 'updated_at'),
    )

    def to_dict(self):
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "language": self.language,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "total_messages": self.total_messages,
            "avg_confidence": self.avg_confidence,
            "tags": self.tags or []
        }


class Message(Base):
    """Individual message in a conversation."""
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Metadata for assistant messages
    confidence_score = Column(Float, nullable=True)
    model_used = Column(String(100), nullable=True)
    processing_time = Column(Float, nullable=True)
    sources = Column(JSON, nullable=True)  # List of verse references
    quality_score = Column(Float, nullable=True)
    
    # Relationship
    conversation = relationship("Conversation", back_populates="messages")
    
    # Indexes
    __table_args__ = (
        Index('idx_conversation_created', 'conversation_id', 'created_at'),
        Index('idx_role', 'role'),
    )

    def to_dict(self):
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "role": self.role,
            "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "confidence_score": self.confidence_score,
            "model_used": self.model_used,
            "processing_time": self.processing_time,
            "sources": self.sources or [],
            "quality_score": self.quality_score
        }


class ConversationSummary(Base):
    """Summarized conversation for efficient context retrieval."""
    __tablename__ = "conversation_summaries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, unique=True)
    summary = Column(Text, nullable=False)
    key_topics = Column(JSON, default=list)  # ["dharma", "karma", "meditation"]
    message_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Index
    __table_args__ = (
        Index('idx_conversation_id', 'conversation_id'),
    )

    def to_dict(self):
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "summary": self.summary,
            "key_topics": self.key_topics or [],
            "message_count": self.message_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class DailySummary(Base):
    """Auto-generated daily chat summary per user."""
    __tablename__ = "daily_summaries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(255), nullable=False, index=True)
    date = Column(String(10), nullable=False)  # YYYY-MM-DD format
    summary_text = Column(Text, nullable=False)
    topics = Column(JSON, default=list)  # ["dharma", "meditation", ...]
    conversation_count = Column(Integer, default=0)
    message_count = Column(Integer, default=0)
    mood = Column(String(50), nullable=True)  # Overall sentiment: "reflective", "seeking", etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index('idx_daily_user_date', 'user_id', 'date', unique=True),
    )

    def to_dict(self):
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "date": self.date,
            "summary_text": self.summary_text,
            "topics": self.topics or [],
            "conversation_count": self.conversation_count,
            "message_count": self.message_count,
            "mood": self.mood,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class User(Base):
    """User account model - matches existing database schema."""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    display_name = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    google_id = Column(String(255), nullable=True)
    is_email_verified = Column(Boolean, default=False)
    subscription_type = Column(String(20), default="free")
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), nullable=False)
    updated_at = Column(DateTime(timezone=True), nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Password Reset
    reset_pass_token = Column(String(255), nullable=True)
    reset_pass_token_expire = Column(DateTime(timezone=True), nullable=True)

    def to_dict(self):
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login_at": self.last_login_at.isoformat() if self.last_login_at else None
        }

