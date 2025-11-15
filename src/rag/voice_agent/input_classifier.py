"""Input classifier for distinguishing commands from natural queries."""

from enum import Enum
from typing import Tuple


class InputType(Enum):
    """Type of user input."""
    COMMAND = "command"
    QUERY = "query"


class InputClassifier:
    """Classifier to distinguish between commands and natural language queries."""

    # Legacy commands that should be treated as commands
    LEGACY_COMMANDS = {'speak', 'listen', 'quit'}

    def __init__(self):
        """Initialize the input classifier."""
        pass

    def classify(self, user_input: str) -> Tuple[InputType, str]:
        """
        Classify user input as either a command or a natural query.

        Args:
            user_input: Raw user input string

        Returns:
            Tuple of (InputType, processed_input)
            - For commands: (InputType.COMMAND, command_string)
            - For queries: (InputType.QUERY, query_text)

        Examples:
            >>> classifier = InputClassifier()
            >>> classifier.classify("/help")
            (InputType.COMMAND, "help")
            >>> classifier.classify("quit")
            (InputType.COMMAND, "quit")
            >>> classifier.classify("What is dharma?")
            (InputType.QUERY, "What is dharma?")
        """
        if not user_input or not user_input.strip():
            return (InputType.QUERY, "")

        stripped_input = user_input.strip()

        # Check if input starts with '/' (slash command)
        if stripped_input.startswith('/'):
            # Remove the leading '/' and return as command
            command = stripped_input[1:].strip()
            return (InputType.COMMAND, command)

        # Check if input is a legacy command (exact match, case-insensitive)
        lower_input = stripped_input.lower()
        if lower_input in self.LEGACY_COMMANDS:
            return (InputType.COMMAND, lower_input)

        # Check if input starts with legacy command followed by space (e.g., "speak hello")
        for legacy_cmd in self.LEGACY_COMMANDS:
            if lower_input.startswith(legacy_cmd + ' '):
                return (InputType.COMMAND, stripped_input)

        # Everything else is treated as a natural query
        return (InputType.QUERY, stripped_input)

    def is_command(self, user_input: str) -> bool:
        """
        Check if user input is a command.

        Args:
            user_input: Raw user input string

        Returns:
            True if input is a command, False otherwise
        """
        input_type, _ = self.classify(user_input)
        return input_type == InputType.COMMAND

    def is_query(self, user_input: str) -> bool:
        """
        Check if user input is a natural query.

        Args:
            user_input: Raw user input string

        Returns:
            True if input is a query, False otherwise
        """
        input_type, _ = self.classify(user_input)
        return input_type == InputType.QUERY
