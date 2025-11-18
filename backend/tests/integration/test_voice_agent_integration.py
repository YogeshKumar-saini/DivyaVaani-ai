"""Integration tests for voice agent."""

import pytest
from unittest.mock import Mock, AsyncMock, patch

from src.rag.voice_agent.input_classifier import InputClassifier, InputType
from src.rag.voice_agent.conversation_store import ConversationStore
from src.rag.voice_agent.query_processor import QueryProcessor
from src.rag.voice_agent.command_handler import CommandHandler


class TestEndToEndQueryFlow:
    """Test end-to-end query processing flow."""

    @pytest.mark.asyncio
    async def test_natural_query_flow(self):
        """Test complete flow from natural query to response."""
        # Setup
        conversation_store = ConversationStore()
        mock_qa_system = Mock()
        mock_qa_system.ask = Mock(return_value={
            "answer": "Dharma is your sacred duty and righteous path in life.",
            "sources": ["BG 2.31", "BG 3.35"],
            "language": "en",
            "confidence_score": 0.89
        })

        query_processor = QueryProcessor(mock_qa_system, conversation_store)

        # Execute
        result = await query_processor.process(
            query="What is dharma?",
            language="en",
            user_id="test_user"
        )

        # Verify
        assert result.answer == "Dharma is your sacred duty and righteous path in life."
        assert result.confidence > 0.8
        assert len(result.sources) == 2
        assert conversation_store.get_total_exchanges() == 1

    @pytest.mark.asyncio
    async def test_query_with_conversation_context(self):
        """Test query processing with conversation context."""
        # Setup
        conversation_store = ConversationStore()

        # Add previous exchange
        conversation_store.add_exchange(
            query="What is dharma?",
            response="Dharma is your sacred duty.",
            language="en",
            confidence=0.85,
            processing_time=1.0
        )

        mock_qa_system = Mock()
        mock_qa_system.ask = Mock(return_value={
            "answer": "You can find your dharma through self-reflection.",
            "sources": ["BG 18.47"],
            "language": "en",
            "confidence_score": 0.87
        })

        query_processor = QueryProcessor(mock_qa_system, conversation_store)

        # Execute
        result = await query_processor.process(
            query="How do I find it?",
            language="en",
            user_id="test_user"
        )

        # Verify
        assert result.answer is not None
        assert conversation_store.get_total_exchanges() == 2

        # Verify context was included
        context = conversation_store.get_context_window()
        assert "What is dharma?" in context

    @pytest.mark.asyncio
    async def test_error_handling_in_query_flow(self):
        """Test error handling during query processing."""
        # Setup
        conversation_store = ConversationStore()
        mock_qa_system = Mock()
        mock_qa_system.ask = Mock(side_effect=Exception("QA system error"))

        query_processor = QueryProcessor(mock_qa_system, conversation_store)

        # Execute
        result = await query_processor.process(
            query="What is dharma?",
            language="en",
            user_id="test_user"
        )

        # Verify error handling
        assert result.error is not None
        assert "error" in result.answer.lower()
        assert result.confidence == 0.0


class TestCommandIntegration:
    """Test command integration with conversation store."""

    def test_history_command_integration(self):
        """Test history command with actual conversation data."""
        # Setup
        conversation_store = ConversationStore()
        command_handler = CommandHandler(conversation_store, current_language="en")

        # Add some conversation history
        for i in range(3):
            conversation_store.add_exchange(
                query=f"Question {i}",
                response=f"Answer {i}",
                language="en",
                confidence=0.8 + i * 0.05,
                processing_time=1.0
            )

        # Execute
        result = command_handler.execute("history")

        # Verify
        assert result.success is True
        assert "Question 0" in result.message
        assert "Question 1" in result.message
        assert "Question 2" in result.message
        assert "Statistics" in result.message

    def test_clear_command_integration(self):
        """Test clear command integration."""
        # Setup
        conversation_store = ConversationStore()
        command_handler = CommandHandler(conversation_store, current_language="en")

        # Add conversation history
        conversation_store.add_exchange(
            query="Test question",
            response="Test answer",
            language="en",
            confidence=0.85,
            processing_time=1.0
        )

        assert not conversation_store.is_empty()

        # Execute clear
        result = command_handler.execute("clear")

        # Verify
        assert result.success is True
        assert conversation_store.is_empty()

    def test_language_switching_integration(self):
        """Test language switching affects subsequent operations."""
        # Setup
        conversation_store = ConversationStore()
        command_handler = CommandHandler(conversation_store, current_language="en")

        language_changes = []

        def track_language_change(lang):
            language_changes.append(lang)

        command_handler.set_language_change_callback(track_language_change)

        # Execute language changes
        result1 = command_handler.execute("lang hi")
        assert result1.success is True
        assert command_handler.current_language == "hi"

        result2 = command_handler.execute("lang sa")
        assert result2.success is True
        assert command_handler.current_language == "sa"

        # Verify callbacks were called
        assert language_changes == ["hi", "sa"]


class TestInputClassificationIntegration:
    """Test input classification with command execution."""

    def test_classify_and_execute_commands(self):
        """Test classifying input and executing commands."""
        # Setup
        classifier = InputClassifier()
        conversation_store = ConversationStore()
        command_handler = CommandHandler(conversation_store, current_language="en")

        test_cases = [
            ("/help", True, "help"),
            ("quit", True, "quit"),
            ("/lang en", True, "lang en"),
            ("What is dharma?", False, None),
        ]

        for user_input, should_be_command, expected_cmd in test_cases:
            # Classify
            input_type, processed = classifier.classify(user_input)

            if should_be_command:
                assert input_type == InputType.COMMAND
                # Execute command
                result = command_handler.execute(processed)
                assert result is not None
            else:
                assert input_type == InputType.QUERY

    def test_full_interaction_flow(self):
        """Test a complete interaction flow with multiple inputs."""
        # Setup
        classifier = InputClassifier()
        conversation_store = ConversationStore()
        command_handler = CommandHandler(conversation_store, current_language="en")

        # Simulate user interactions
        interactions = [
            "/help",  # Command
            "What is dharma?",  # Query (would go to QA system)
            "/history",  # Command
            "/lang hi",  # Command
            "How can I find peace?",  # Query
            "/clear",  # Command
            "/quit"  # Command
        ]

        command_count = 0
        query_count = 0

        for user_input in interactions:
            input_type, processed = classifier.classify(user_input)

            if input_type == InputType.COMMAND:
                command_count += 1
                result = command_handler.execute(processed)
                assert result is not None

                if processed == "quit":
                    assert result.should_exit is True
            else:
                query_count += 1
                # In real system, would process through QA system

        assert command_count == 5  # /help, /history, /lang, /clear, /quit
        assert query_count == 2  # Two natural queries


class TestErrorScenarios:
    """Test error handling scenarios."""

    @pytest.mark.asyncio
    async def test_empty_query_handling(self):
        """Test handling of empty queries."""
        conversation_store = ConversationStore()
        mock_qa_system = Mock()
        query_processor = QueryProcessor(mock_qa_system, conversation_store)

        result = await query_processor.process(
            query="",
            language="en",
            user_id="test_user"
        )

        assert result.error is not None
        assert "empty" in result.answer.lower() or "provide" in result.answer.lower()

    @pytest.mark.asyncio
    async def test_invalid_language_handling(self):
        """Test handling of invalid language codes."""
        conversation_store = ConversationStore()
        mock_qa_system = Mock()
        mock_qa_system.ask = Mock(return_value={
            "answer": "Test answer",
            "sources": [],
            "language": "en",
            "confidence_score": 0.8
        })

        query_processor = QueryProcessor(mock_qa_system, conversation_store)

        # Should default to 'en' for invalid language
        result = await query_processor.process(
            query="Test question",
            language="invalid_lang",
            user_id="test_user"
        )

        # Should still process successfully with default language
        assert result.answer == "Test answer"

    def test_invalid_command_handling(self):
        """Test handling of invalid commands."""
        conversation_store = ConversationStore()
        command_handler = CommandHandler(conversation_store, current_language="en")

        result = command_handler.execute("nonexistent_command")

        assert result.success is False
        assert "Unknown command" in result.message
        assert "/help" in result.message  # Should suggest help

    def test_history_with_invalid_limit(self):
        """Test history command with invalid limit."""
        conversation_store = ConversationStore()
        command_handler = CommandHandler(conversation_store, current_language="en")

        # Test with non-numeric limit
        result = command_handler.execute("history abc")
        assert result.success is False
        assert "Invalid limit" in result.message

        # Test with negative limit
        result = command_handler.execute("history -5")
        assert result.success is False
