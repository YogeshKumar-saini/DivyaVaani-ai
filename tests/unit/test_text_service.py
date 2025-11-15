"""Unit tests for text service."""

import pytest
from unittest.mock import Mock, patch

from src.services.text_service import TextService
from src.core.exceptions import APIError


class TestTextService:
    """Test cases for TextService."""

    def setup_method(self):
        """Setup test fixtures."""
        self.service = TextService()

    def test_process_query_validation(self):
        """Test query validation."""
        # Test empty question
        with pytest.raises(APIError, match="cannot be empty"):
            self.service.process_query("")

        # Test short question
        with pytest.raises(APIError, match="at least 3 characters"):
            self.service.process_query("hi")

    @patch('src.services.text_service.system_state')
    def test_process_query_system_not_ready(self, mock_system_state):
        """Test behavior when system is not ready."""
        mock_system_state.is_ready = False

        with pytest.raises(APIError, match="System not initialized"):
            self.service.process_query("What is dharma?")

    def test_get_query_history_placeholder(self):
        """Test query history retrieval (placeholder implementation)."""
        result = self.service.get_query_history("user123")
        assert result["user_id"] == "user123"
        assert result["history"] == []
        assert result["total_queries"] == 0

    def test_get_popular_questions(self):
        """Test popular questions retrieval."""
        with patch('src.services.text_service.analytics') as mock_analytics:
            mock_analytics.get_stats.return_value = {"popular_questions": ["Q1", "Q2", "Q3"]}

            result = self.service.get_popular_questions(2)
            assert len(result["popular_questions"]) == 2
            assert result["total_analyzed"] == 3
