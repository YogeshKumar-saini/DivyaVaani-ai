"""Episodic Memory — conversation-level memories stored in the database.

Each episode represents the summary, themes, mood, and insights of an
entire conversation.  Relevant episodes can be retrieved to provide
cross-conversation context for the AI.
"""

from typing import Optional, List, Dict, Any

from src.utils.logger import log


class EpisodicMemoryManager:
    """Manages episodic memories (conversation summaries) in the DB."""

    def __init__(self, memory_repository=None):
        self._repo = memory_repository

    def set_repository(self, repo) -> None:
        self._repo = repo

    def save_episode(
        self,
        user_id: str,
        conversation_id: str,
        summary: str,
        themes: List[str],
        mood: Optional[str] = None,
        key_insights: Optional[List[str]] = None,
        message_count: int = 0,
    ) -> None:
        """Save an episodic memory for a conversation."""
        if not self._repo:
            return

        try:
            self._repo.save_episodic_memory(
                user_id=user_id,
                conversation_id=conversation_id,
                summary=summary,
                themes=themes,
                mood=mood,
                key_insights=key_insights,
                message_count=message_count,
            )
        except Exception as e:
            log.warning(f"Failed to save episodic memory: {e}")

    def retrieve_relevant_episodes(
        self,
        user_id: str,
        question: str,
        limit: int = 3,
    ) -> Optional[str]:
        """Retrieve episodic memories relevant to the current question.

        Returns formatted context string or None.
        """
        if not self._repo:
            return None

        try:
            keywords = self._extract_keywords(question)
            if not keywords:
                # Fall back to most recent episodes
                episodes = self._repo.get_user_episodes(user_id, limit=limit)
            else:
                episodes = self._repo.search_episodes(user_id, keywords, limit=limit)

            if not episodes:
                return None

            parts = []
            for ep in episodes:
                themes_str = ", ".join(ep.themes) if ep.themes else "general"
                mood_str = f" (mood: {ep.mood})" if ep.mood else ""
                parts.append(f"- [{themes_str}]{mood_str}: {ep.summary}")

            return (
                "\n\nPAST CONVERSATION MEMORIES (Episodic Memory):\n"
                + "\n".join(parts)
            )
        except Exception as e:
            log.warning(f"Episodic retrieval error: {e}")
            return None

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract keywords from text for episode search."""
        stop_words = {
            "the", "a", "an", "is", "are", "was", "what", "how", "why",
            "when", "where", "who", "which", "do", "does", "can", "could",
            "should", "would", "will", "of", "in", "to", "for", "with",
            "on", "at", "by", "from", "about", "and", "or", "but", "not",
            "i", "me", "my", "you", "your", "we", "our", "it", "be",
            "have", "has", "had", "tell", "please", "thank",
        }
        words = text.lower().split()
        return [w for w in words if w not in stop_words and len(w) > 2][:6]
