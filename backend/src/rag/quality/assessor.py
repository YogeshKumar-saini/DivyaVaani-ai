"""Quality assessment for answers."""

import re
from typing import Dict, List, Any


class QualityAssessor:
    """Assesses quality of generated answers."""

    def __init__(self):
        self.quality_patterns = {
            "verse_references": re.compile(r'(?:Chapter|Verse|Shloka|Sloka)\s*\d+'),
            "sanskrit_terms": re.compile(r'\b[A-Z][a-z]*\s*(?:[A-Z][a-z]*\s*)*\b'),
            "spiritual_concepts": re.compile(r'\b(dharma|karma|yoga|bhakti|jnana|atma|brahman| moksha|samadhi)\b', re.IGNORECASE),
            "practical_application": re.compile(r'\b(should|must|practice|apply|implement|follow)\b', re.IGNORECASE)
        }

        self.verse_cross_references = {
            "dharma": ["2.31", "3.8", "3.35", "4.7-8", "18.47"],
            "karma": ["2.47", "3.8", "3.19", "4.17", "6.1"],
            "yoga": ["2.48", "6.23", "8.28", "12.6-7", "18.78"],
            "bhakti": ["7.16", "9.26", "12.6-7", "18.54-55", "18.65"],
            "jnana": ["4.34", "7.2", "13.1-2", "18.50", "18.78"],
            "detachment": ["2.47", "3.19", "6.1", "12.16-17", "18.49"],
            "duty": ["3.8", "3.35", "18.45-47"],
            "mind_control": ["6.5-6", "6.26", "6.35"],
            "divine_qualities": ["16.1-3", "18.42-44"],
            "liberation": ["2.72", "5.24-26", "18.54-55", "18.78"]
        }

    def assess(self, answer: str, contexts: List[Dict]) -> Dict[str, Any]:
        """Assess quality of the answer."""
        quality_metrics = {
            "has_verse_references": bool(self.quality_patterns["verse_references"].search(answer)),
            "spiritual_concept_count": len(self.quality_patterns["spiritual_concepts"].findall(answer)),
            "practical_application_count": len(self.quality_patterns["practical_application"].findall(answer)),
            "answer_length": len(answer.split()),
            "context_count": len(contexts),
            "avg_context_score": sum(ctx.get('score', 0) for ctx in contexts) / len(contexts) if contexts else 0,
            "has_sanskrit_terms": bool(self.quality_patterns["sanskrit_terms"].search(answer)),
            "readability_score": self._calculate_readability(answer)
        }

        # Overall quality score (0-1 scale)
        quality_score = (
            quality_metrics["has_verse_references"] * 0.2 +
            min(quality_metrics["spiritual_concept_count"] / 5, 1) * 0.2 +
            min(quality_metrics["practical_application_count"] / 3, 1) * 0.2 +
            (1 if 20 <= quality_metrics["answer_length"] <= 150 else 0) * 0.15 +
            quality_metrics["avg_context_score"] * 0.15 +
            quality_metrics["readability_score"] * 0.1
        )

        quality_metrics["overall_score"] = round(min(quality_score, 1.0), 3)
        return quality_metrics

    def calculate_confidence(self, contexts: List[Dict], answer: str) -> float:
        """Calculate confidence score."""
        if not contexts:
            return 0.0

        avg_context_score = sum(ctx.get('score', 0) for ctx in contexts) / len(contexts)
        context_bonus = min(len(contexts) * 0.1, 0.3)

        quality_indicators = 0
        quality_indicators += len(self.quality_patterns["verse_references"].findall(answer)) * 0.1
        quality_indicators += len(self.quality_patterns["spiritual_concepts"].findall(answer)) * 0.05
        quality_indicators += len(self.quality_patterns["practical_application"].findall(answer)) * 0.1

        answer_length = len(answer.split())
        length_score = 1.0 if 20 <= answer_length <= 200 else 0.5

        confidence = min(avg_context_score + context_bonus + quality_indicators + length_score, 1.0)
        return round(confidence, 3)

    def find_cross_references(self, question: str, contexts: List[Dict]) -> List[str]:
        """Find related verses for cross-referencing."""
        cross_refs = set()
        question_lower = question.lower()
        context_text = " ".join([ctx.get('text', '') for ctx in contexts]).lower()

        for topic, verses in self.verse_cross_references.items():
            if topic in question_lower or topic in context_text:
                cross_refs.update(verses)

        source_verses = {ctx['verse'] for ctx in contexts}
        related_verses = cross_refs - source_verses

        return sorted(list(related_verses))[:5]

    def extract_teaching_focus(self, text: str) -> str:
        """Extract teaching focus from text."""
        text_lower = text.lower()
        teaching_categories = {
            "dharma": ["duty", "righteous", "righteousness", "moral", "ethical", "obligation"],
            "karma": ["action", "work", "deed", "effort", "performance", "result"],
            "bhakti": ["devotion", "love", "surrender", "worship", "divine", "god"],
            "jnana": ["knowledge", "wisdom", "understanding", "realization", "truth"],
            "yoga": ["union", "discipline", "practice", "meditation", "control"],
            "mind": ["mind", "thought", "intellect", "emotion", "control", "peace"],
            "detachment": ["detachment", "renunciation", "freedom", "liberation", "attachment"],
            "soul": ["soul", "self", "atman", "spirit", "consciousness", "eternal"]
        }

        category_scores = {}
        for category, keywords in teaching_categories.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                category_scores[category] = score

        return max(category_scores, key=category_scores.get) if category_scores else "general"

    def _calculate_readability(self, text: str) -> float:
        """Calculate readability score."""
        sentences = re.split(r'[.!?]+', text)
        words = text.split()

        if not words:
            return 0.0

        avg_words_per_sentence = len(words) / len(sentences) if sentences else 0
        complex_words = sum(1 for word in words if len(word) > 6)

        sentence_score = 1.0 if 10 <= avg_words_per_sentence <= 20 else 0.5
        complexity_score = 1.0 - min(complex_words / len(words), 0.5)

        return round((sentence_score + complexity_score) / 2, 2)
