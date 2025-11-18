"""Memory manager for coordinating different memory implementations."""

from typing import Optional
from .base import BaseMemory, MemoryConfig
from .conversation import ConversationMemory
from .contextual import ContextualMemory


class MemoryManager:
    """Manager for different memory implementations."""

    def __init__(
        self,
        memory_type: str = "summary",
        enable_memory: bool = True,
        groq_api_key: str = "",
        max_token_limit: int = 2000
    ):
        self.memory_type = memory_type
        self.enable_memory = enable_memory
        self.groq_api_key = groq_api_key

        if enable_memory:
            config = MemoryConfig(max_token_limit=max_token_limit)
            if memory_type in ["buffer", "summary"]:
                self.memory = ConversationMemory(config, groq_api_key, memory_type)
            elif memory_type == "contextual":
                self.memory = ContextualMemory(config)
            else:
                # Default to buffer memory
                self.memory = ConversationMemory(config, groq_api_key, "buffer")
        else:
            self.memory = None

    def save_context(self, question: str, answer: str) -> None:
        """Save conversation context."""
        if self.memory and self.enable_memory:
            self.memory.save_context(question, answer)

    def get_context(self) -> Optional[str]:
        """Get conversation context for prompt inclusion."""
        if self.memory and self.enable_memory:
            return self.memory.get_context()
        return None

    def clear(self) -> None:
        """Clear all memory."""
        if self.memory:
            self.memory.clear()

    def get_memory_type(self) -> str:
        """Get current memory type."""
        if self.memory:
            return self.memory.get_memory_type()
        return "disabled"

    def is_enabled(self) -> bool:
        """Check if memory is enabled."""
        return self.enable_memory and self.memory is not None
