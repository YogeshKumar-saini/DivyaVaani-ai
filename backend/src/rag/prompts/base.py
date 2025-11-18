"""Base prompt classes for multilingual Q&A system."""

from abc import ABC, abstractmethod
from typing import List, Dict, Tuple


class BasePrompt(ABC):
    """Abstract base class for language-specific prompts."""

    @abstractmethod
    def get_prompt_template(self) -> str:
        """Get the prompt template for this language."""
        pass

    @abstractmethod
    def format_context(self, contexts: List[Dict]) -> str:
        """Format contexts for this language."""
        pass

    def get_system_message(self) -> str:
        """Get system message for the language."""
        return "You are Krishna, the divine teacher from the Bhagavad Gita. Provide spiritually profound, practically applicable wisdom."


class PromptTemplate:
    """Template for generating prompts."""

    def __init__(self, template: str):
        self.template = template

    def format(self, **kwargs) -> str:
        """Format the template with given parameters."""
        return self.template.format(**kwargs)
