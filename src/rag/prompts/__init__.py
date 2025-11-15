"""Prompt management module for multilingual Q&A system."""

from .manager import PromptManager
from .base import BasePrompt
from .english import EnglishPrompt
from .hindi import HindiPrompt
from .sanskrit import SanskritPrompt
from .hybrid import HybridPrompt

__all__ = ['PromptManager', 'BasePrompt', 'EnglishPrompt', 'HindiPrompt', 'SanskritPrompt', 'HybridPrompt']
