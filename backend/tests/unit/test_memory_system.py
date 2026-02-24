"""Unit tests for the multi-tier memory system (STM / LTM / Episodic / Extractor / Consolidator)."""

import pytest
import os
import sys
from unittest.mock import MagicMock, patch, PropertyMock
from datetime import datetime

# Ensure imports resolve
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))


# ═══════════════════════════════════════════════════════════════════════════════
# 1. ShortTermMemory Tests
# ═══════════════════════════════════════════════════════════════════════════════

class TestShortTermMemory:
    """Tests for the sliding-window short-term memory."""

    def setup_method(self):
        from src.rag.memory.stm import ShortTermMemory
        self.stm = ShortTermMemory(max_messages=4)

    def test_add_and_get_context(self):
        self.stm.add_message("user", "What is karma?")
        self.stm.add_message("assistant", "Karma is the law of cause and effect.")

        ctx = self.stm.get_context()
        assert ctx is not None
        assert "User: What is karma?" in ctx
        assert "Assistant: Karma is the law of cause and effect." in ctx
        assert "Short-Term Memory" in ctx

    def test_empty_context_returns_none(self):
        assert self.stm.get_context() is None

    def test_sliding_window(self):
        # Add 5 messages to a window of size 4
        self.stm.add_message("user", "msg1")
        self.stm.add_message("assistant", "reply1")
        self.stm.add_message("user", "msg2")
        self.stm.add_message("assistant", "reply2")
        self.stm.add_message("user", "msg3")  # This should push msg1 out

        messages = self.stm.get_messages()
        assert len(messages) == 4
        assert messages[0]["content"] == "reply1"  # msg1 was dropped
        assert messages[-1]["content"] == "msg3"

    def test_clear(self):
        self.stm.add_message("user", "test")
        self.stm.clear()
        assert self.stm.message_count == 0
        assert self.stm.get_context() is None

    def test_get_last_n(self):
        self.stm.add_message("user", "a")
        self.stm.add_message("assistant", "b")
        self.stm.add_message("user", "c")

        last2 = self.stm.get_last_n(2)
        assert len(last2) == 2
        assert last2[0]["content"] == "b"
        assert last2[1]["content"] == "c"

    def test_message_count(self):
        assert self.stm.message_count == 0
        self.stm.add_message("user", "test")
        assert self.stm.message_count == 1


# ═══════════════════════════════════════════════════════════════════════════════
# 2. LongTermMemory Tests
# ═══════════════════════════════════════════════════════════════════════════════

class TestLongTermMemory:
    """Tests for the persistent fact-based LTM."""

    def setup_method(self):
        from src.rag.memory.ltm import LongTermMemory
        self.ltm = LongTermMemory()
        self.mock_repo = MagicMock()
        self.ltm.set_repository(self.mock_repo)

    def test_retrieve_relevant_with_keywords(self):
        # Mock facts from DB
        mock_fact = MagicMock()
        mock_fact.id = "f1"
        mock_fact.fact_type = "interest"
        mock_fact.content = "User is interested in karma yoga"
        self.mock_repo.search_facts.return_value = [mock_fact]

        result = self.ltm.retrieve_relevant("user1", "Tell me about karma")
        assert result is not None
        assert "karma yoga" in result
        assert "INTEREST" in result
        self.mock_repo.search_facts.assert_called_once()
        self.mock_repo.increment_access.assert_called_once_with("f1")

    def test_retrieve_relevant_no_repo(self):
        ltm_no_repo = __import__('src.rag.memory.ltm', fromlist=['LongTermMemory']).LongTermMemory()
        assert ltm_no_repo.retrieve_relevant("user1", "test") is None

    def test_retrieve_relevant_no_facts(self):
        self.mock_repo.search_facts.return_value = []
        self.mock_repo.get_user_facts.return_value = []
        result = self.ltm.retrieve_relevant("user1", "random question")
        assert result is None

    def test_save_facts(self):
        facts = [
            {"fact_type": "interest", "content": "Likes meditation", "importance": 0.8},
            {"fact_type": "preference", "content": "Prefers Hindi", "importance": 0.6},
        ]
        count = self.ltm.save_facts("user1", facts, source_conversation_id="conv1")
        assert count == 2
        assert self.mock_repo.save_fact.call_count == 2

    def test_get_user_summary(self):
        mock_fact1 = MagicMock()
        mock_fact1.fact_type = "interest"
        mock_fact1.content = "Karma Yoga"
        mock_fact2 = MagicMock()
        mock_fact2.fact_type = "preference"
        mock_fact2.content = "Hindi responses"
        self.mock_repo.get_user_facts.return_value = [mock_fact1, mock_fact2]

        summary = self.ltm.get_user_summary("user1")
        assert summary is not None
        assert "Karma Yoga" in summary
        assert "Hindi responses" in summary

    def test_extract_keywords(self):
        keywords = self.ltm._extract_keywords("What is karma and dharma in the Gita?")
        # Should contain spiritual keywords
        assert "karma" in keywords
        assert "dharma" in keywords


# ═══════════════════════════════════════════════════════════════════════════════
# 3. EpisodicMemoryManager Tests
# ═══════════════════════════════════════════════════════════════════════════════

class TestEpisodicMemoryManager:
    """Tests for the episodic memory manager."""

    def setup_method(self):
        from src.rag.memory.episodic import EpisodicMemoryManager
        self.episodic = EpisodicMemoryManager()
        self.mock_repo = MagicMock()
        self.episodic.set_repository(self.mock_repo)

    def test_save_episode(self):
        self.episodic.save_episode(
            user_id="user1",
            conversation_id="conv1",
            summary="Discussed karma yoga",
            themes=["karma", "yoga"],
            mood="contemplative",
            key_insights=["Nishkama karma"],
            message_count=10,
        )
        self.mock_repo.save_episodic_memory.assert_called_once()

    def test_retrieve_relevant_episodes(self):
        mock_episode = MagicMock()
        mock_episode.themes = ["karma", "dharma"]
        mock_episode.mood = "seeking"
        mock_episode.summary = "User asked about karma and its effects"
        self.mock_repo.search_episodes.return_value = [mock_episode]

        result = self.episodic.retrieve_relevant_episodes("user1", "Tell me about karma")
        assert result is not None
        assert "karma" in result.lower()
        assert "Episodic Memory" in result

    def test_retrieve_no_repo(self):
        from src.rag.memory.episodic import EpisodicMemoryManager
        ep = EpisodicMemoryManager()
        assert ep.retrieve_relevant_episodes("user1", "test") is None


# ═══════════════════════════════════════════════════════════════════════════════
# 4. MemoryExtractor Tests
# ═══════════════════════════════════════════════════════════════════════════════

class TestMemoryExtractor:
    """Tests for the LLM-based memory extractor."""

    def setup_method(self):
        from src.rag.memory.extractor import MemoryExtractor
        self.extractor = MemoryExtractor(groq_api_key="test-key")

    def test_empty_messages(self):
        result = self.extractor.extract([])
        assert result["summary"] == ""
        assert result["themes"] == []
        assert result["facts"] == []

    def test_rule_based_fallback(self):
        messages = [
            {"role": "user", "content": "Tell me about karma and meditation"},
            {"role": "assistant", "content": "Karma is the law of cause and effect. Meditation helps calm the mind."},
        ]
        result = self.extractor._rule_based_extract(messages)
        assert "karma" in result["themes"]
        assert "meditation" in result["themes"]
        assert len(result["facts"]) > 0
        assert result["mood"] == "seeking"

    @patch('langchain_groq.ChatGroq')
    def test_llm_extraction(self, mock_groq_class):
        """Test LLM extraction with a mocked Groq response."""
        import json
        mock_response = MagicMock()
        mock_response.content = json.dumps({
            "summary": "User asked about karma",
            "themes": ["karma"],
            "mood": "contemplative",
            "key_insights": ["Karma is action"],
            "facts": [{"fact_type": "interest", "content": "Interested in karma", "importance": 0.7}],
        })
        mock_llm = MagicMock()
        mock_llm.invoke.return_value = mock_response
        mock_groq_class.return_value = mock_llm

        messages = [{"role": "user", "content": "What is karma?"}]
        result = self.extractor.extract(messages)

        assert result["summary"] == "User asked about karma"
        assert "karma" in result["themes"]
        assert len(result["facts"]) == 1

    def test_clean_json_response(self):
        raw = "```json\n{\"key\": \"value\"}\n```"
        cleaned = self.extractor._clean_json_response(raw)
        assert cleaned == '{"key": "value"}'


# ═══════════════════════════════════════════════════════════════════════════════
# 5. MemoryConsolidator Tests
# ═══════════════════════════════════════════════════════════════════════════════

class TestMemoryConsolidator:
    """Tests for the consolidation pipeline."""

    def setup_method(self):
        from src.rag.memory.consolidator import MemoryConsolidator
        self.mock_extractor = MagicMock()
        self.mock_ltm = MagicMock()
        self.mock_episodic = MagicMock()
        self.mock_repo = MagicMock()

        self.consolidator = MemoryConsolidator(
            extractor=self.mock_extractor,
            ltm=self.mock_ltm,
            episodic=self.mock_episodic,
            memory_repository=self.mock_repo,
        )

    def test_consolidate_empty_messages(self):
        result = self.consolidator.consolidate("user1", "conv1", [])
        assert result["status"] == "skipped"

    def test_consolidate_full_pipeline(self):
        self.mock_extractor.extract.return_value = {
            "summary": "Discussion about karma",
            "themes": ["karma"],
            "mood": "contemplative",
            "key_insights": ["Nishkama karma is key"],
            "facts": [{"fact_type": "interest", "content": "Karma Yoga", "importance": 0.8}],
        }
        self.mock_ltm.save_facts.return_value = 1
        self.mock_repo.get_memory_profile.return_value = None
        self.mock_repo.get_fact_count.return_value = 1

        messages = [
            {"role": "user", "content": "What is karma?"},
            {"role": "assistant", "content": "Karma is the law of cause and effect."},
        ]

        result = self.consolidator.consolidate("user1", "conv1", messages)

        assert result["status"] == "success"
        assert result["facts_saved"] == 1
        assert result["episode_saved"] == True
        assert result["profile_updated"] == True
        self.mock_extractor.extract.assert_called_once()
        self.mock_ltm.save_facts.assert_called_once()
        self.mock_episodic.save_episode.assert_called_once()
        self.mock_repo.upsert_memory_profile.assert_called_once()


# ═══════════════════════════════════════════════════════════════════════════════
# 6. MemoryManager Integration Tests
# ═══════════════════════════════════════════════════════════════════════════════

class TestMemoryManager:
    """Tests for the unified MemoryManager."""

    def setup_method(self):
        from src.rag.memory.manager import MemoryManager
        self.manager = MemoryManager(enable_memory=True, groq_api_key="test-key")

    def test_save_and_get_stm(self):
        self.manager.save_message("user1", "user", "What is dharma?")
        self.manager.save_message("user1", "assistant", "Dharma is duty and righteousness.")

        ctx = self.manager.get_full_context("user1", "dharma related question")
        assert ctx is not None
        assert "What is dharma?" in ctx

    def test_disabled_memory(self):
        from src.rag.memory.manager import MemoryManager
        disabled = MemoryManager(enable_memory=False)
        disabled.save_message("user1", "user", "test")
        assert disabled.get_full_context("user1") is None

    def test_clear_stm(self):
        self.manager.save_message("user1", "user", "test")
        self.manager.clear_stm("user1")
        # After clearing, STM context should be None (but LTM/Episodic may still have data)
        # Since we haven't set up a repo, LTM and Episodic won't return anything
        assert self.manager.get_full_context("user1") is None

    def test_legacy_api(self):
        self.manager.save_context("What is yoga?", "Yoga is union with the divine.")
        ctx = self.manager.get_context()
        assert ctx is not None
        assert "What is yoga?" in ctx

    def test_get_status(self):
        status = self.manager.get_status("user1")
        assert status["enabled"] == True
        assert status["type"] == "multi_tier"
        assert "stm_messages" in status

    def test_memory_type(self):
        assert self.manager.get_memory_type() == "multi_tier"

    def test_per_user_isolation(self):
        self.manager.save_message("user1", "user", "karma question")
        self.manager.save_message("user2", "user", "yoga question")

        ctx1 = self.manager.get_full_context("user1", "karma")
        ctx2 = self.manager.get_full_context("user2", "yoga")

        assert "karma question" in ctx1
        assert "yoga question" not in ctx1
        assert "yoga question" in ctx2
        assert "karma question" not in ctx2


# ═══════════════════════════════════════════════════════════════════════════════
# Run with: python -m pytest tests/unit/test_memory_system.py -v
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
