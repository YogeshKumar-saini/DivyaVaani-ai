"""Memory management module for conversational context.

Multi-tier memory system:
- STM (Short-Term Memory): sliding window of recent messages
- LTM (Long-Term Memory): persistent user facts
- Episodic Memory: conversation-level summaries
- MemoryExtractor: LLM-based structured extraction
- MemoryConsolidator: promotes STM → LTM + Episodic
"""

from .manager import MemoryManager
from .base import BaseMemory
from .stm import ShortTermMemory
from .ltm import LongTermMemory
from .episodic import EpisodicMemoryManager
from .extractor import MemoryExtractor
from .consolidator import MemoryConsolidator

# Legacy imports for backward compatibility
from .conversation import ConversationMemory
from .contextual import ContextualMemory

__all__ = [
    'MemoryManager',
    'BaseMemory',
    'ShortTermMemory',
    'LongTermMemory',
    'EpisodicMemoryManager',
    'MemoryExtractor',
    'MemoryConsolidator',
    'ConversationMemory',
    'ContextualMemory',
]
