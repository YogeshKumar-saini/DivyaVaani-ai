"""Base memory classes for conversational context management."""

from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any


class BaseMemory(ABC):
    """Abstract base class for memory implementations."""

    @abstractmethod
    def save_context(self, question: str, answer: str) -> None:
        """Save conversation context."""
        pass

    @abstractmethod
    def get_context(self) -> Optional[str]:
        """Get relevant conversation context."""
        pass

    @abstractmethod
    def clear(self) -> None:
        """Clear all memory."""
        pass

    @abstractmethod
    def get_memory_type(self) -> str:
        """Get memory type identifier."""
        pass


class MemoryConfig:
    """Configuration for memory systems."""

    def __init__(
        self,
        max_token_limit: int = 2000,
        memory_key: str = "chat_history",
        return_messages: bool = True
    ):
        self.max_token_limit = max_token_limit
        self.memory_key = memory_key
        self.return_messages = return_messages
