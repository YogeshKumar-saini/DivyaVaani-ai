"""Memory Manager — orchestrates STM, LTM, and Episodic Memory tiers.

This is the single entry point used by the QA system.  It:
- Maintains a ShortTermMemory per user session (in-memory)
- Queries LongTermMemory and EpisodicMemory from the database
- Exposes a consolidation method to promote conversations into persistent memory

Backward compatible: legacy ``save_context(q, a)`` / ``get_context()`` still work.
"""

from typing import Optional, List, Dict, Any

from .stm import ShortTermMemory
from .ltm import LongTermMemory
from .episodic import EpisodicMemoryManager
from .extractor import MemoryExtractor
from .consolidator import MemoryConsolidator
from src.utils.logger import log


class MemoryManager:
    """Unified manager for the multi-tier memory system."""

    def __init__(
        self,
        memory_type: str = "summary",
        enable_memory: bool = True,
        groq_api_key: str = "",
        max_token_limit: int = 2000,
    ):
        self.enable_memory = enable_memory
        self.groq_api_key = groq_api_key

        # Per-user STM instances (in-memory dict)
        self._user_stms: Dict[str, ShortTermMemory] = {}

        # Persistent memory components (DB-backed, lazily initialised)
        self.ltm = LongTermMemory()
        self.episodic = EpisodicMemoryManager()
        self.extractor = MemoryExtractor(groq_api_key=groq_api_key)
        self.consolidator = MemoryConsolidator(
            extractor=self.extractor,
            ltm=self.ltm,
            episodic=self.episodic,
        )

        # Default STM for backward compatibility (legacy single-user mode)
        self._default_stm = ShortTermMemory(max_messages=10)

    # ------------------------------------------------------------------
    # Repository injection (called once the DB session is available)
    # ------------------------------------------------------------------

    def set_repository(self, memory_repository) -> None:
        """Inject the MemoryRepository so LTM / Episodic can read/write to DB."""
        self.ltm.set_repository(memory_repository)
        self.episodic.set_repository(memory_repository)
        self.consolidator.set_components(
            extractor=self.extractor,
            ltm=self.ltm,
            episodic=self.episodic,
            memory_repository=memory_repository,
        )

    # ------------------------------------------------------------------
    # STM helpers
    # ------------------------------------------------------------------

    def _get_stm(self, user_id: str = "default") -> ShortTermMemory:
        """Get or create STM for a user."""
        if user_id not in self._user_stms:
            self._user_stms[user_id] = ShortTermMemory(max_messages=10)
        return self._user_stms[user_id]

    # ------------------------------------------------------------------
    # Public API — used by the QA system
    # ------------------------------------------------------------------

    def save_message(self, user_id: str, role: str, content: str) -> None:
        """Save a message to STM (called after each Q and A)."""
        if not self.enable_memory:
            return
        stm = self._get_stm(user_id)
        stm.add_message(role, content)

    def get_full_context(
        self,
        user_id: str = "default",
        question: str = "",
    ) -> Optional[str]:
        """Get combined context from all memory tiers.

        Returns a single formatted string combining:
        - STM: recent messages in the current session
        - LTM: relevant persistent facts about the user
        - Episodic: relevant past conversation summaries
        """
        if not self.enable_memory:
            return None

        parts: List[str] = []

        # 1. Short-Term Memory
        try:
            stm = self._get_stm(user_id)
            stm_ctx = stm.get_context()
            if stm_ctx:
                parts.append(stm_ctx)
        except Exception as e:
            log.warning(f"STM context error: {e}")

        # 2. Long-Term Memory
        try:
            ltm_ctx = self.ltm.retrieve_relevant(user_id, question)
            if ltm_ctx:
                parts.append(ltm_ctx)
        except Exception as e:
            log.warning(f"LTM context error: {e}")

        # 3. Episodic Memory
        try:
            ep_ctx = self.episodic.retrieve_relevant_episodes(user_id, question)
            if ep_ctx:
                parts.append(ep_ctx)
        except Exception as e:
            log.warning(f"Episodic context error: {e}")

        if not parts:
            return None

        return "\n".join(parts)

    def consolidate(
        self,
        user_id: str,
        conversation_id: str,
        messages: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        """Consolidate a conversation into persistent memory.

        If ``messages`` is None, uses the user's STM messages.
        """
        if messages is None:
            stm = self._get_stm(user_id)
            messages = stm.get_messages()

        return self.consolidator.consolidate(user_id, conversation_id, messages)

    def clear_stm(self, user_id: str = "default") -> None:
        """Clear STM for a user (e.g. on new conversation)."""
        stm = self._get_stm(user_id)
        stm.clear()

    # ------------------------------------------------------------------
    # Backward compatibility (legacy API)
    # ------------------------------------------------------------------

    def save_context(self, question: str, answer: str) -> None:
        """Legacy: save a Q/A pair to default STM."""
        if not self.enable_memory:
            return
        self._default_stm.add_message("user", question)
        self._default_stm.add_message("assistant", answer)

    def get_context(self) -> Optional[str]:
        """Legacy: get context from default STM only."""
        if not self.enable_memory:
            return None
        return self._default_stm.get_context()

    def clear(self) -> None:
        """Legacy: clear default STM."""
        self._default_stm.clear()

    def get_memory_type(self) -> str:
        """Get current memory type identifier."""
        return "multi_tier" if self.enable_memory else "disabled"

    def is_enabled(self) -> bool:
        """Check if memory is enabled."""
        return self.enable_memory

    # ------------------------------------------------------------------
    # Diagnostics
    # ------------------------------------------------------------------

    def get_status(self, user_id: str = "default") -> Dict[str, Any]:
        """Get memory system status for a user."""
        stm = self._get_stm(user_id)
        return {
            "enabled": self.enable_memory,
            "type": "multi_tier",
            "stm_messages": stm.message_count,
            "ltm_available": self.ltm._repo is not None,
            "episodic_available": self.episodic._repo is not None,
            "active_users": len(self._user_stms),
        }
