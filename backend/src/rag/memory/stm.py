"""Short-Term Memory — sliding window of recent messages in the current conversation.

STM keeps the last N messages in a deque and formats them into a prompt-ready
context string.  It is per-conversation and purely in-memory (no DB persistence
for STM since messages are already stored via the conversation repository).
"""

from collections import deque
from typing import Optional, List, Dict, Any


class ShortTermMemory:
    """Sliding-window short-term memory for a single conversation."""

    def __init__(self, max_messages: int = 10):
        """
        Args:
            max_messages: Maximum number of messages to keep (each Q+A = 2 messages).
        """
        self.max_messages = max_messages
        self._messages: deque = deque(maxlen=max_messages)

    def add_message(self, role: str, content: str) -> None:
        """Add a message to STM.

        Args:
            role: "user" or "assistant"
            content: Message text
        """
        self._messages.append({"role": role, "content": content})

    def get_context(self) -> Optional[str]:
        """Get formatted context string from recent messages."""
        if not self._messages:
            return None

        parts = []
        for msg in self._messages:
            prefix = "User" if msg["role"] == "user" else "Assistant"
            parts.append(f"{prefix}: {msg['content']}")

        return "\n\nRECENT CONVERSATION (Short-Term Memory):\n" + "\n".join(parts)

    def get_messages(self) -> List[Dict[str, str]]:
        """Get raw message list."""
        return list(self._messages)

    def get_last_n(self, n: int = 4) -> List[Dict[str, str]]:
        """Get last N messages."""
        messages = list(self._messages)
        return messages[-n:] if len(messages) > n else messages

    def clear(self) -> None:
        """Clear all STM messages."""
        self._messages.clear()

    @property
    def message_count(self) -> int:
        return len(self._messages)
