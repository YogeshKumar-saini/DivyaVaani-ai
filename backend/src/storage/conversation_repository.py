"""Conversation repository for database operations."""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime, timedelta

from src.storage.models import Conversation, Message, ConversationSummary
from src.utils.logger import log


class ConversationRepository:
    """Repository pattern for conversation database operations."""

    def __init__(self, db: Session):
        self.db = db

    # ==================== Conversation Operations ====================

    def create_conversation(
        self,
        user_id: str,
        title: Optional[str] = None,
        language: str = "en"
    ) -> Conversation:
        """Create a new conversation."""
        conversation = Conversation(
            user_id=user_id,
            title=title or "New Conversation",
            language=language
        )
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)
        log.info(f"Created conversation {conversation.id} for user {user_id}")
        return conversation

    def get_conversation(self, conversation_id: str) -> Optional[Conversation]:
        """Get conversation by ID."""
        return self.db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()

    def get_user_conversations(
        self,
        user_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[Conversation]:
        """Get all conversations for a user."""
        return self.db.query(Conversation).filter(
            Conversation.user_id == user_id
        ).order_by(desc(Conversation.updated_at)).limit(limit).offset(offset).all()

    def update_conversation(
        self,
        conversation_id: str,
        **kwargs
    ) -> Optional[Conversation]:
        """Update conversation fields."""
        conversation = self.get_conversation(conversation_id)
        if not conversation:
            return None

        for key, value in kwargs.items():
            if hasattr(conversation, key):
                setattr(conversation, key, value)

        self.db.commit()
        self.db.refresh(conversation)
        return conversation

    def delete_conversation(self, conversation_id: str) -> bool:
        """Delete a conversation and all its messages."""
        conversation = self.get_conversation(conversation_id)
        if not conversation:
            return False

        self.db.delete(conversation)
        self.db.commit()
        log.info(f"Deleted conversation {conversation_id}")
        return True

    def search_conversations(
        self,
        user_id: str,
        query: str,
        limit: int = 20
    ) -> List[Conversation]:
        """Search conversations by title or content."""
        return self.db.query(Conversation).filter(
            Conversation.user_id == user_id,
            Conversation.title.ilike(f"%{query}%")
        ).order_by(desc(Conversation.updated_at)).limit(limit).all()

    # ==================== Message Operations ====================

    def add_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        **metadata
    ) -> Message:
        """Add a message to a conversation."""
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            **metadata
        )
        self.db.add(message)

        # Update conversation metadata
        conversation = self.get_conversation(conversation_id)
        if conversation:
            conversation.total_messages += 1
            conversation.updated_at = datetime.utcnow()

            # Update average confidence if this is an assistant message
            if role == "assistant" and metadata.get("confidence_score"):
                if conversation.avg_confidence == 0:
                    conversation.avg_confidence = metadata["confidence_score"]
                else:
                    # Running average
                    conversation.avg_confidence = (
                        (conversation.avg_confidence * (conversation.total_messages - 1) +
                         metadata["confidence_score"]) / conversation.total_messages
                    )

            # Auto-generate title from first user message
            if not conversation.title or conversation.title == "New Conversation":
                if role == "user" and conversation.total_messages == 1:
                    conversation.title = content[:100] + ("..." if len(content) > 100 else "")

        self.db.commit()
        self.db.refresh(message)
        return message

    def get_conversation_messages(
        self,
        conversation_id: str,
        limit: Optional[int] = None
    ) -> List[Message]:
        """Get all messages in a conversation."""
        query = self.db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at)

        if limit:
            query = query.limit(limit)

        return query.all()

    def get_recent_messages(
        self,
        conversation_id: str,
        count: int = 10
    ) -> List[Message]:
        """Get recent messages from a conversation."""
        return self.db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(desc(Message.created_at)).limit(count).all()

    # ==================== Summary Operations ====================

    def create_or_update_summary(
        self,
        conversation_id: str,
        summary: str,
        key_topics: List[str],
        message_count: int
    ) -> ConversationSummary:
        """Create or update conversation summary."""
        existing = self.db.query(ConversationSummary).filter(
            ConversationSummary.conversation_id == conversation_id
        ).first()

        if existing:
            existing.summary = summary
            existing.key_topics = key_topics
            existing.message_count = message_count
            existing.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(existing)
            return existing
        else:
            summary_obj = ConversationSummary(
                conversation_id=conversation_id,
                summary=summary,
                key_topics=key_topics,
                message_count=message_count
            )
            self.db.add(summary_obj)
            self.db.commit()
            self.db.refresh(summary_obj)
            return summary_obj

    def get_summary(self, conversation_id: str) -> Optional[ConversationSummary]:
        """Get conversation summary."""
        return self.db.query(ConversationSummary).filter(
            ConversationSummary.conversation_id == conversation_id
        ).first()

    # ==================== Analytics ====================

    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get user conversation statistics."""
        total_conversations = self.db.query(func.count(Conversation.id)).filter(
            Conversation.user_id == user_id
        ).scalar()

        total_messages = self.db.query(func.sum(Conversation.total_messages)).filter(
            Conversation.user_id == user_id
        ).scalar() or 0

        avg_confidence = self.db.query(func.avg(Conversation.avg_confidence)).filter(
            Conversation.user_id == user_id,
            Conversation.avg_confidence > 0
        ).scalar() or 0

        # Recent activity (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_conversations = self.db.query(func.count(Conversation.id)).filter(
            Conversation.user_id == user_id,
            Conversation.created_at >= week_ago
        ).scalar()

        return {
            "total_conversations": total_conversations,
            "total_messages": int(total_messages),
            "avg_confidence": round(float(avg_confidence), 3),
            "recent_conversations_7d": recent_conversations
        }
