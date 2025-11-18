"""Contextual memory for storing relevant information."""

from typing import Optional, List, Dict, Any
from collections import deque

from .base import BaseMemory, MemoryConfig


class ContextualMemory(BaseMemory):
    """Simple contextual memory using deque for recent context."""

    def __init__(self, config: MemoryConfig, max_items: int = 10):
        self.config = config
        self.max_items = max_items
        self.context_queue = deque(maxlen=max_items)

    def save_context(self, question: str, answer: str) -> None:
        """Save conversation context."""
        self.context_queue.append({
            'question': question,
            'answer': answer,
            'timestamp': self._get_timestamp()
        })

    def get_context(self) -> Optional[str]:
        """Get recent conversation context."""
        if not self.context_queue:
            return None

        # Get last 3 exchanges
        recent_items = list(self.context_queue)[-3:]
        context_parts = []

        for item in recent_items:
            context_parts.append(f"Previous Q: {item['question']}")
            context_parts.append(f"Previous A: {item['answer']}")

        if context_parts:
            return "\n\nRECENT CONVERSATION CONTEXT:\n" + "\n".join(context_parts)

        return None

    def clear(self) -> None:
        """Clear all memory."""
        self.context_queue.clear()

    def get_memory_type(self) -> str:
        """Get memory type identifier."""
        return "contextual"

    def _get_timestamp(self) -> str:
        """Get current timestamp."""
        from datetime import datetime
        return datetime.now().isoformat()
