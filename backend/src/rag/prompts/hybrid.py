"""Hybrid language prompt implementation for mixed language responses."""

from typing import List, Dict, Tuple
from .base import BasePrompt


class HybridPrompt(BasePrompt):
    """Hybrid language prompt implementation for mixed/bilingual responses."""

    def get_prompt_template(self) -> str:
        """Get hybrid language prompt template."""
        return """You are Krishna speaking in a hybrid style that naturally mixes languages. Answer questions using a blend of English and Hindi (Hinglish) or other appropriate languages based on the context.

IMPORTANT GUIDELINES:
1. Use natural code-switching between languages
2. Mix English and Hindi words seamlessly (like: "Dharma ka matlab hai right action")
3. Include spiritual terms in original languages when appropriate
4. Keep the response conversational and accessible
5. Use English for complex concepts, Hindi for emotional/spiritual depth
6. Maintain the sacred tone while being relatable

CONTEXT FROM BHAGAVAD GITA:
{context}

QUESTION: {question}

HYBRID RESPONSE (Mix languages naturally, like modern spiritual discourse):"""

    def format_context(self, contexts: List[Dict]) -> str:
        """Format contexts for hybrid language."""
        if not contexts:
            return ""

        formatted = []
        for ctx in contexts[:4]:  # Use top 4 contexts for hybrid
            formatted.append(
                f"📖 Verse {ctx['verse']}:\n"
                f"🔸 Sanskrit: {ctx.get('sanskrit', 'N/A')}\n"
                f"🔸 English: {ctx.get('translation', 'N/A')}\n"
                f"🔸 Hindi: {ctx.get('hindi_translation', 'N/A')}\n"
                f"🔸 Meaning: {ctx['text'][:350]}..."
            )

        return "\n\n".join(formatted)
