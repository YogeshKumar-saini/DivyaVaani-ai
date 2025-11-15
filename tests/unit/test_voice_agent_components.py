"""Unit tests for voice agent components."""

import pytest
from datetime import datetime

from src.rag.voice_agent.input_classifier import InputClassifier, InputType
from src.rag.voice_agent.conversation_store import ConversationStore, ConversationExchange
from src.rag.voice_agent.command_handler import CommandHandler


class TestInputClassifier:
    """Tests for InputClassifier."""

    def setup_method(self):
        """Set up test fixtures."""
        self.classifier = InputClassifier()

    def test_classify_slash_command(self):
        """Test classification of slash commands."""
        input_type, processed = self.classifier.classify("/help")
        assert input_type == InputType.COMMAND
        assert processed == "help"

        input_type, processed = self.classifier.classify("/lang en")
        assert input_type == InputType.COMMAND
        assert processed == "lang en"

    def test_classify_legacy_command_quit(self):
        """Test classification of legacy 'quit' command."""
        input_type, processed = self.classifier.classify("quit")
        assert input_type == InputType.COMMAND
        assert processed == "quit"

        input_type, processed = self.classifier.classify("QUIT")
        assert input_type == InputType.COMMAND
        assert processed == "quit"

    def test_classify_legacy_command_speak(self):
        """Test classification of legacy 'speak' command."""
        input_type, processed = self.classifier.classify("speak hello world")
        assert input_type == InputType.COMMAND
        assert processed == "speak hello world"

    def test_classify_legacy_command_listen(self):
        """Test classification of legacy 'listen' command."""
        input_type, processed = self.classifier.classify("listen")
        assert input_type == InputType.COMMAND
        assert processed == "listen"

    def test_classify_natural_query(self):
        """Test classification of natural queries."""
        input_type, processed = self.classifier.classify("What is dharma?")
        assert input_type == InputType.QUERY
        assert processed == "What is dharma?"

        input_type, processed = self.classifier.classify("How can I find peace?")
        assert input_type == InputType.QUERY
        assert processed == "How can I find peace?"

    def test_classify_empty_input(self):
        """Test classification of empty input."""
        input_type, processed = self.classifier.classify("")
        assert input_type == InputType.QUERY
        assert processed == ""

        input_type, processed = self.classifier.classify("   ")
        assert input_type == InputType.QUERY
        assert processed == ""

    def test_is_command(self):
        """Test is_command helper method."""
        assert self.classifier.is_command("/help") is True
        assert self.classifier.is_command("quit") is True
        assert self.classifier.is_command("What is dharma?") is False

    def test_is_query(self):
        """Test is_query helper method."""
        assert self.classifier.is_query("What is dharma?") is True
        assert self.classifier.is_query("/help") is False
        assert self.classifier.is_query("quit") is False


class TestConversationStore:
    """Tests for ConversationStore."""

    def setup_method(self):
        """Set up test fixtures."""
        self.store = ConversationStore(max_history=5, context_window_size=2)

    def test_add_exchange(self):
        """Test adding exchanges to the store."""
        self.store.add_exchange(
            query="What is dharma?",
            response="Dharma is your sacred duty.",
            language="en",
            confidence=0.85,
            processing_time=1.2
        )

        assert self.store.get_total_exchanges() == 1
        assert not self.store.is_empty()

    def test_get_history(self):
        """Test retrieving conversation history."""
        # Add multiple exchanges
        for i in range(3):
            self.store.add_exchange(
                query=f"Question {i}",
                response=f"Answer {i}",
                language="en",
                confidence=0.8,
                processing_time=1.0
            )

        history = self.store.get_history(limit=2)
        assert len(history) == 2
        assert history[0].query == "Question 1"
        assert history[1].query == "Question 2"

    def test_history_limit(self):
        """Test that history respects max_history limit."""
        # Add more exchanges than max_history
        for i in range(10):
            self.store.add_exchange(
                query=f"Question {i}",
                response=f"Answer {i}",
                language="en",
                confidence=0.8,
                processing_time=1.0
            )

        # Should only keep last 5 (max_history)
        assert self.store.get_total_exchanges() == 5

        history = self.store.get_history(limit=10)
        assert len(history) == 5
        assert history[0].query == "Question 5"  # Oldest kept
        assert history[4].query == "Question 9"  # Newest

    def test_get_context_window(self):
        """Test getting context window."""
        # Empty store
        context = self.store.get_context_window()
        assert context == ""

        # Add exchanges
        self.store.add_exchange(
            query="What is dharma?",
            response="Dharma is your sacred duty.",
            language="en",
            confidence=0.85,
            processing_time=1.2
        )

        context = self.store.get_context_window()
        assert "What is dharma?" in context
        assert "Dharma is your sacred duty" in context

    def test_clear(self):
        """Test clearing conversation history."""
        self.store.add_exchange(
            query="Test question",
            response="Test answer",
            language="en",
            confidence=0.8,
            processing_time=1.0
        )

        assert not self.store.is_empty()

        self.store.clear()

        assert self.store.is_empty()
        assert self.store.get_total_exchanges() == 0

    def test_get_last_exchange(self):
        """Test getting the last exchange."""
        assert self.store.get_last_exchange() is None

        self.store.add_exchange(
            query="First question",
            response="First answer",
            language="en",
            confidence=0.8,
            processing_time=1.0
        )

        self.store.add_exchange(
            query="Second question",
            response="Second answer",
            language="en",
            confidence=0.9,
            processing_time=0.8
        )

        last = self.store.get_last_exchange()
        assert last is not None
        assert last.query == "Second question"

    def test_get_statistics(self):
        """Test getting conversation statistics."""
        # Empty store
        stats = self.store.get_statistics()
        assert stats['total_exchanges'] == 0
        assert stats['average_confidence'] == 0.0

        # Add exchanges
        self.store.add_exchange(
            query="Q1", response="A1", language="en",
            confidence=0.8, processing_time=1.0
        )
        self.store.add_exchange(
            query="Q2", response="A2", language="hi",
            confidence=0.9, processing_time=0.5
        )

        stats = self.store.get_statistics()
        assert stats['total_exchanges'] == 2
        assert abs(stats['average_confidence'] - 0.85) < 0.001
        assert abs(stats['average_processing_time'] - 0.75) < 0.001
        assert set(stats['languages_used']) == {'en', 'hi'}


class TestCommandHandler:
    """Tests for CommandHandler."""

    def setup_method(self):
        """Set up test fixtures."""
        self.store = ConversationStore()
        self.handler = CommandHandler(self.store, current_language="en")

    def test_execute_help_command(self):
        """Test /help command."""
        result = self.handler.execute("help")
        assert result.success is True
        assert "DivyaVaani" in result.message
        assert "/help" in result.message

    def test_execute_history_command_empty(self):
        """Test /history command with empty history."""
        result = self.handler.execute("history")
        assert result.success is True
        assert "No conversation history" in result.message

    def test_execute_history_command_with_data(self):
        """Test /history command with conversation data."""
        self.store.add_exchange(
            query="Test question",
            response="Test answer",
            language="en",
            confidence=0.85,
            processing_time=1.0
        )

        result = self.handler.execute("history")
        assert result.success is True
        assert "Test question" in result.message

    def test_execute_history_command_with_limit(self):
        """Test /history command with custom limit."""
        for i in range(5):
            self.store.add_exchange(
                query=f"Q{i}", response=f"A{i}",
                language="en", confidence=0.8, processing_time=1.0
            )

        result = self.handler.execute("history 3")
        assert result.success is True
        assert result.data['exchanges'] == 3

    def test_execute_history_command_invalid_limit(self):
        """Test /history command with invalid limit."""
        result = self.handler.execute("history abc")
        assert result.success is False
        assert "Invalid limit" in result.message

    def test_execute_lang_command_get(self):
        """Test /lang command to get current language."""
        result = self.handler.execute("lang")
        assert result.success is True
        assert "English" in result.message

    def test_execute_lang_command_set_valid(self):
        """Test /lang command to set valid language."""
        result = self.handler.execute("lang hi")
        assert result.success is True
        assert result.data['new_language'] == "hi"
        assert self.handler.current_language == "hi"

    def test_execute_lang_command_set_invalid(self):
        """Test /lang command to set invalid language."""
        result = self.handler.execute("lang xyz")
        assert result.success is False
        assert "Unsupported language" in result.message

    def test_execute_clear_command(self):
        """Test /clear command."""
        self.store.add_exchange(
            query="Test", response="Test",
            language="en", confidence=0.8, processing_time=1.0
        )

        result = self.handler.execute("clear")
        assert result.success is True
        assert self.store.is_empty()

    def test_execute_quit_command(self):
        """Test /quit command."""
        result = self.handler.execute("quit")
        assert result.success is True
        assert result.should_exit is True
        assert "Namaste" in result.message

    def test_execute_speak_command(self):
        """Test legacy 'speak' command."""
        result = self.handler.execute("speak hello world")
        assert result.success is True
        assert "hello world" in result.message

    def test_execute_speak_command_no_text(self):
        """Test legacy 'speak' command without text."""
        result = self.handler.execute("speak")
        assert result.success is False

    def test_execute_listen_command(self):
        """Test legacy 'listen' command."""
        result = self.handler.execute("listen")
        assert result.success is True
        assert "mock" in result.message.lower()

    def test_execute_unknown_command(self):
        """Test unknown command."""
        result = self.handler.execute("unknown_cmd")
        assert result.success is False
        assert "Unknown command" in result.message

    def test_language_change_callback(self):
        """Test language change callback."""
        callback_called = []

        def callback(lang):
            callback_called.append(lang)

        self.handler.set_language_change_callback(callback)
        self.handler.execute("lang hi")

        assert len(callback_called) == 1
        assert callback_called[0] == "hi"
