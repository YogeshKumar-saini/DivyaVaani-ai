"""Long-Term Memory — persistent user facts stored in the database.

LTM retrieves relevant facts for a given question using keyword matching
and importance/recency weighting.  No extra embedding infrastructure needed.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime

from src.utils.logger import log


class LongTermMemory:
    """Persistent fact-based long-term memory backed by the database."""

    # Common spiritual keywords for tokenisation / matching
    _SPIRITUAL_KEYWORDS = {
        "karma", "dharma", "yoga", "bhakti", "jnana", "moksha", "meditation",
        "vedanta", "gita", "upanishad", "atman", "brahman", "samsara",
        "detachment", "devotion", "liberation", "peace", "duty", "action",
        "self", "soul", "mind", "consciousness", "mantra", "pranayama",
        "chakra", "samadhi", "nirvana", "ahimsa", "satya", "tapas",
        "krishna", "arjuna", "shiva", "vishnu", "hanuman",
    }

    def __init__(self, memory_repository=None):
        """
        Args:
            memory_repository: ``MemoryRepository`` instance (injected with a DB session).
        """
        self._repo = memory_repository

    def set_repository(self, repo) -> None:
        """Set / swap the repository (useful when DB session changes)."""
        self._repo = repo

    # ------------------------------------------------------------------
    # Retrieval
    # ------------------------------------------------------------------

    def retrieve_relevant(
        self,
        user_id: str,
        question: str,
        limit: int = 8,
    ) -> Optional[str]:
        """Retrieve the most relevant LTM facts for a user's question.

        Returns a formatted string ready for prompt injection, or ``None``.
        """
        if not self._repo:
            return None

        try:
            keywords = self._extract_keywords(question)

            if keywords:
                facts = self._repo.search_facts(user_id, keywords, limit=limit)
            else:
                # Fall back to top facts by importance
                facts = self._repo.get_user_facts(user_id, limit=limit)

            if not facts:
                return None

            # Bump access counts
            for f in facts:
                self._repo.increment_access(f.id)

            # Format for prompt
            fact_lines = []
            for f in facts:
                tag = f.fact_type.upper()
                fact_lines.append(f"- [{tag}] {f.content}")

            return (
                "\n\nLONG-TERM MEMORY (What I know about you):\n"
                + "\n".join(fact_lines)
            )
        except Exception as e:
            log.warning(f"LTM retrieval error: {e}")
            return None

    def save_facts(
        self,
        user_id: str,
        facts: List[Dict[str, Any]],
        source_conversation_id: Optional[str] = None,
    ) -> int:
        """Save extracted facts to the database.

        Args:
            facts: List of dicts with keys ``fact_type``, ``content``, ``importance``.
            source_conversation_id: Originating conversation.

        Returns:
            Number of facts saved.
        """
        if not self._repo:
            return 0

        saved = 0
        for fact_data in facts:
            try:
                self._repo.save_fact(
                    user_id=user_id,
                    fact_type=fact_data.get("fact_type", "interest"),
                    content=fact_data["content"],
                    importance=fact_data.get("importance", 0.5),
                    source_conversation_id=source_conversation_id,
                )
                saved += 1
            except Exception as e:
                log.warning(f"Failed to save fact: {e}")

        return saved

    def get_user_summary(self, user_id: str) -> Optional[str]:
        """Generate a human-readable summary of what the AI knows about the user."""
        if not self._repo:
            return None

        try:
            facts = self._repo.get_user_facts(user_id, limit=20)
            if not facts:
                return None

            grouped: Dict[str, List[str]] = {}
            for f in facts:
                grouped.setdefault(f.fact_type, []).append(f.content)

            parts = []
            for category, items in grouped.items():
                parts.append(f"**{category.title()}**: " + "; ".join(items))

            return "\n".join(parts)
        except Exception as e:
            log.warning(f"LTM summary error: {e}")
            return None

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract meaningful keywords from a question for fact retrieval."""
        words = set(text.lower().split())

        # Remove common stop words
        stop_words = {
            "the", "a", "an", "is", "are", "was", "were", "what", "how",
            "why", "when", "where", "who", "which", "do", "does", "did",
            "can", "could", "should", "would", "will", "shall", "may",
            "of", "in", "to", "for", "with", "on", "at", "by", "from",
            "about", "into", "through", "and", "or", "but", "not", "no",
            "this", "that", "these", "those", "i", "me", "my", "you",
            "your", "we", "our", "they", "their", "it", "its", "be",
            "been", "being", "have", "has", "had", "having", "tell",
            "say", "said", "says", "please", "thank", "thanks",
        }

        keywords = [w for w in words if w not in stop_words and len(w) > 2]

        # Boost spiritual keywords
        spiritual_matches = [kw for kw in keywords if kw in self._SPIRITUAL_KEYWORDS]
        if spiritual_matches:
            return spiritual_matches + [kw for kw in keywords if kw not in spiritual_matches][:3]

        return keywords[:6]
