"""Memory Extractor — uses LLM to extract structured facts from conversation messages.

Given a list of messages, the extractor calls the LLM with a structured prompt
and parses the output into facts, themes, mood, and summary.
"""

import json
import os
from typing import List, Dict, Any, Optional

from src.utils.logger import log


# Extraction prompt — asks the LLM to produce a JSON payload
_EXTRACTION_PROMPT = """You are a memory extraction system for a spiritual guidance AI called DivyaVaani.
Analyze the following conversation and extract structured information.

CONVERSATION:
{conversation_text}

Extract the following in strict JSON format (no markdown, no code fences):
{{
  "summary": "A 2-3 sentence summary of what was discussed",
  "themes": ["list", "of", "main", "spiritual", "themes"],
  "mood": "one word describing the user's overall emotional tone (e.g. contemplative, seeking, confused, devoted, peaceful)",
  "key_insights": ["list of key spiritual insights or learnings from this conversation"],
  "facts": [
    {{
      "fact_type": "preference|interest|spiritual_insight|personal|behavioral",
      "content": "what we learned about the user",
      "importance": 0.5
    }}
  ]
}}

Rules for facts extraction:
- PREFERENCE: language preference, response style, depth of explanation wanted
- INTEREST: spiritual topics the user is interested in
- SPIRITUAL_INSIGHT: user's understanding level or spiritual realisations
- PERSONAL: personal context the user shared (e.g. going through difficulty)
- BEHAVIORAL: how the user interacts (asks follow-ups, prefers examples, etc.)
- Importance: 0.1 (trivial) to 1.0 (very important)
- Extract 3-8 facts maximum
- Focus on durable, reusable knowledge — skip ephemeral details

Return ONLY the JSON object, nothing else."""


class MemoryExtractor:
    """Extracts structured memory from conversation messages using LLM."""

    def __init__(self, groq_api_key: Optional[str] = None):
        self.groq_api_key = groq_api_key or os.getenv("GROQ_API_KEY", "")

    def extract(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """Extract structured memory from a conversation.

        Args:
            messages: List of dicts with ``role`` and ``content`` keys.

        Returns:
            Dict with keys: summary, themes, mood, key_insights, facts
        """
        if not messages:
            return self._empty_result()

        conversation_text = self._format_messages(messages)

        try:
            return self._call_llm(conversation_text)
        except Exception as e:
            log.warning(f"LLM extraction failed, using rule-based fallback: {e}")
            return self._rule_based_extract(messages)

    # ------------------------------------------------------------------
    # LLM Call
    # ------------------------------------------------------------------

    def _call_llm(self, conversation_text: str) -> Dict[str, Any]:
        """Call Groq LLM for extraction."""
        from langchain_groq import ChatGroq
        from langchain_core.messages import HumanMessage

        llm = ChatGroq(
            model_name="llama-3.1-8b-instant",
            temperature=0.1,
            max_tokens=1000,
            groq_api_key=self.groq_api_key,
        )

        prompt = _EXTRACTION_PROMPT.format(conversation_text=conversation_text)
        response = llm.invoke([HumanMessage(content=prompt)])
        raw = response.content.strip()

        # Parse JSON — handle LLM wrapping it in markdown fences
        raw = self._clean_json_response(raw)
        parsed = json.loads(raw)

        # Validate structure
        return {
            "summary": parsed.get("summary", ""),
            "themes": parsed.get("themes", []),
            "mood": parsed.get("mood", "neutral"),
            "key_insights": parsed.get("key_insights", []),
            "facts": parsed.get("facts", []),
        }

    # ------------------------------------------------------------------
    # Rule-based Fallback
    # ------------------------------------------------------------------

    def _rule_based_extract(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """Fallback extraction when LLM is unavailable."""
        user_messages = [m["content"] for m in messages if m.get("role") == "user"]
        all_text = " ".join(user_messages).lower()

        # Extract themes via keyword matching
        theme_keywords = {
            "karma": "karma", "dharma": "dharma", "yoga": "yoga",
            "meditation": "meditation", "bhakti": "bhakti", "devotion": "devotion",
            "gita": "bhagavad_gita", "peace": "peace", "moksha": "liberation",
            "detach": "detachment", "mind": "mind_control", "duty": "duty",
            "jnana": "jnana", "vedanta": "vedanta", "mantra": "mantra",
        }

        themes = []
        for keyword, theme in theme_keywords.items():
            if keyword in all_text:
                themes.append(theme)

        # Build simple summary
        first_q = user_messages[0][:100] if user_messages else ""
        summary = f"Conversation about {', '.join(themes[:3]) or 'spiritual guidance'}. Started with: {first_q}"

        # Build simple facts
        facts = []
        for theme in themes[:5]:
            facts.append({
                "fact_type": "interest",
                "content": f"User showed interest in {theme}",
                "importance": 0.4,
            })

        return {
            "summary": summary,
            "themes": themes,
            "mood": "seeking",
            "key_insights": [],
            "facts": facts,
        }

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _format_messages(self, messages: List[Dict[str, str]]) -> str:
        """Format messages for the extraction prompt."""
        parts = []
        for msg in messages:
            role = msg.get("role", "user").capitalize()
            content = msg.get("content", "")
            # Truncate very long messages
            if len(content) > 500:
                content = content[:500] + "..."
            parts.append(f"{role}: {content}")
        return "\n".join(parts)

    def _clean_json_response(self, raw: str) -> str:
        """Strip markdown code fences from LLM response."""
        raw = raw.strip()
        if raw.startswith("```json"):
            raw = raw[7:]
        elif raw.startswith("```"):
            raw = raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3]
        return raw.strip()

    def _empty_result(self) -> Dict[str, Any]:
        return {
            "summary": "",
            "themes": [],
            "mood": "neutral",
            "key_insights": [],
            "facts": [],
        }
