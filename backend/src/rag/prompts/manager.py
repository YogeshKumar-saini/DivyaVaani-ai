"""Prompt manager for coordinating language-specific prompts."""

from typing import List, Dict, Tuple
from .base import BasePrompt
from .english import EnglishPrompt
from .hindi import HindiPrompt
from .sanskrit import SanskritPrompt
from .hybrid import HybridPrompt


class PromptManager:
    """Manager for language-specific prompts."""

    def __init__(self):
        self.prompts = {
            'en': EnglishPrompt(),
            'hi': HindiPrompt(),
            'sa': SanskritPrompt(),
            'hybrid': HybridPrompt(),
            'hinglish': HybridPrompt()  # Alias for hybrid
        }

    def get_prompt(self, language: str, contexts: List[Dict], question: str) -> Tuple[str, str]:
        """Get formatted prompt and context for the specified language.

        Args:
            language: Language code ('en', 'hi', 'sa')
            contexts: List of context dictionaries
            question: User's question

        Returns:
            Tuple of (prompt_template, formatted_context)
        """
        prompt_handler = self.prompts.get(language, self.prompts['en'])  # Default to English

        prompt_template = prompt_handler.get_prompt_template()
        context_text = prompt_handler.format_context(contexts)

        return prompt_template, context_text

    def get_available_languages(self) -> List[str]:
        """Get list of available languages."""
        return list(self.prompts.keys())

    def add_language_support(self, language_code: str, prompt_handler: BasePrompt):
        """Add support for a new language.

        Args:
            language_code: Language code (e.g., 'te' for Telugu)
            prompt_handler: Prompt handler instance for the language
        """
        self.prompts[language_code] = prompt_handler
