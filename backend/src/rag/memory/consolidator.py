"""Memory Consolidator — orchestrates promoting STM into LTM & Episodic Memory.

Called when a conversation ends or reaches a message threshold.  It runs the
MemoryExtractor, saves facts to LTM, saves an episodic memory, and updates the
user's memory profile.
"""

from typing import List, Dict, Any, Optional
from collections import Counter

from src.utils.logger import log


class MemoryConsolidator:
    """Promotes short-term / raw conversation data into persistent memory."""

    def __init__(self, extractor=None, ltm=None, episodic=None, memory_repository=None):
        """
        Args:
            extractor: ``MemoryExtractor`` instance
            ltm: ``LongTermMemory`` instance
            episodic: ``EpisodicMemoryManager`` instance
            memory_repository: ``MemoryRepository`` for profile updates
        """
        self._extractor = extractor
        self._ltm = ltm
        self._episodic = episodic
        self._repo = memory_repository

    def set_components(self, extractor, ltm, episodic, memory_repository):
        """Set/replace component references."""
        self._extractor = extractor
        self._ltm = ltm
        self._episodic = episodic
        self._repo = memory_repository

    def consolidate(
        self,
        user_id: str,
        conversation_id: str,
        messages: List[Dict[str, str]],
    ) -> Dict[str, Any]:
        """Run full consolidation pipeline.

        1. Extract structured info via LLM
        2. Save facts → LTM
        3. Save episode → Episodic Memory
        4. Update user memory profile

        Args:
            user_id: User identifier
            conversation_id: Conversation ID being consolidated
            messages: Raw messages list [{role, content}, ...]

        Returns:
            Summary dict of what was consolidated
        """
        if not messages:
            return {"status": "skipped", "reason": "no_messages"}

        result = {
            "conversation_id": conversation_id,
            "status": "success",
            "facts_saved": 0,
            "episode_saved": False,
            "profile_updated": False,
        }

        # Step 1: Extract
        try:
            extracted = self._extractor.extract(messages) if self._extractor else {}
        except Exception as e:
            log.error(f"Extraction failed for conversation {conversation_id}: {e}")
            result["status"] = "partial"
            extracted = {}

        # Step 2: Save facts to LTM
        if self._ltm and extracted.get("facts"):
            try:
                saved_count = self._ltm.save_facts(
                    user_id=user_id,
                    facts=extracted["facts"],
                    source_conversation_id=conversation_id,
                )
                result["facts_saved"] = saved_count
            except Exception as e:
                log.error(f"LTM save failed: {e}")

        # Step 3: Save episodic memory
        if self._episodic and extracted.get("summary"):
            try:
                self._episodic.save_episode(
                    user_id=user_id,
                    conversation_id=conversation_id,
                    summary=extracted.get("summary", ""),
                    themes=extracted.get("themes", []),
                    mood=extracted.get("mood"),
                    key_insights=extracted.get("key_insights"),
                    message_count=len(messages),
                )
                result["episode_saved"] = True
            except Exception as e:
                log.error(f"Episodic save failed: {e}")

        # Step 4: Update user profile
        if self._repo:
            try:
                self._update_profile(user_id, extracted)
                result["profile_updated"] = True
            except Exception as e:
                log.error(f"Profile update failed: {e}")

        log.info(
            f"Consolidation for {conversation_id}: "
            f"{result['facts_saved']} facts, "
            f"episode={'yes' if result['episode_saved'] else 'no'}, "
            f"profile={'yes' if result['profile_updated'] else 'no'}"
        )
        return result

    # ------------------------------------------------------------------
    # Profile update
    # ------------------------------------------------------------------

    def _update_profile(self, user_id: str, extracted: Dict[str, Any]) -> None:
        """Update user memory profile with new data from the consolidated conversation."""
        if not self._repo:
            return

        profile = self._repo.get_memory_profile(user_id)
        new_themes = extracted.get("themes", [])

        # Merge topics
        existing_topics = []
        if profile and profile.top_topics:
            existing_topics = profile.top_topics

        topic_counter: Counter = Counter()
        for topic_entry in existing_topics:
            if isinstance(topic_entry, dict):
                topic_counter[topic_entry.get("topic", "")] += topic_entry.get("count", 1)
            elif isinstance(topic_entry, str):
                topic_counter[topic_entry] += 1

        for theme in new_themes:
            topic_counter[theme] += 1

        top_topics = [
            {"topic": topic, "count": count}
            for topic, count in topic_counter.most_common(15)
            if topic  # skip empty
        ]

        # Determine preferred language from facts
        preferred_language = None
        for fact in extracted.get("facts", []):
            if fact.get("fact_type") == "preference" and "language" in fact.get("content", "").lower():
                content = fact["content"].lower()
                if "hindi" in content:
                    preferred_language = "hi"
                elif "sanskrit" in content:
                    preferred_language = "sa"
                elif "english" in content:
                    preferred_language = "en"

        fact_count = self._repo.get_fact_count(user_id)
        total_conversations = (profile.total_conversations if profile else 0) + 1

        self._repo.upsert_memory_profile(
            user_id=user_id,
            top_topics=top_topics,
            preferred_language=preferred_language or (profile.preferred_language if profile else None),
            total_conversations=total_conversations,
            total_facts=fact_count,
        )
