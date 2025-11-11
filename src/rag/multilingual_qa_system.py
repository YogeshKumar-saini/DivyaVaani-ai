"""World-class multilingual Q&A system using advanced RAG with comprehensive spiritual guidance."""

import os
import re
import json
import hashlib
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage
from langchain.memory import ConversationBufferMemory, ConversationSummaryBufferMemory
from src.retrieval import HybridRetriever
from src.utils.logger import log


@dataclass
class QAResponse:
    """Structured response with comprehensive metadata."""
    answer: str
    sources: List[str]
    contexts: List[Dict]
    language: str
    confidence_score: float = 0.0
    processing_time: float = 0.0
    model_used: str = ""
    token_count: int = 0
    quality_metrics: Dict[str, Any] = None
    cross_references: List[str] = None
    timestamp: datetime = None
    user_id: str = ""
    question_hash: str = ""

    def __post_init__(self):
        if self.quality_metrics is None:
            self.quality_metrics = {}
        if self.cross_references is None:
            self.cross_references = []
        if self.timestamp is None:
            self.timestamp = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data


@dataclass
class CacheEntry:
    """Cache entry with TTL support."""
    response: QAResponse
    created_at: datetime
    ttl_seconds: int = 3600  # 1 hour default

    @property
    def is_expired(self) -> bool:
        """Check if cache entry has expired."""
        return datetime.now() - self.created_at > timedelta(seconds=self.ttl_seconds)


class ResponseCache:
    """Advanced caching system with TTL and analytics."""

    def __init__(self, max_size: int = 1000):
        self.cache: Dict[str, CacheEntry] = {}
        self.max_size = max_size
        self.hits = 0
        self.misses = 0

    def get(self, key: str) -> Optional[QAResponse]:
        """Get cached response if valid."""
        if key in self.cache:
            entry = self.cache[key]
            if not entry.is_expired:
                self.hits += 1
                return entry.response
            else:
                del self.cache[key]  # Remove expired entry

        self.misses += 1
        return None

    def set(self, key: str, response: QAResponse, ttl_seconds: int = 3600):
        """Cache response with TTL."""
        if len(self.cache) >= self.max_size:
            # Remove oldest entries (simple LRU approximation)
            oldest_key = min(self.cache.keys(),
                           key=lambda k: self.cache[k].created_at)
            del self.cache[oldest_key]

        self.cache[key] = CacheEntry(response, datetime.now(), ttl_seconds)

    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total_requests = self.hits + self.misses
        hit_rate = self.hits / total_requests if total_requests > 0 else 0

        return {
            "total_entries": len(self.cache),
            "max_size": self.max_size,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": round(hit_rate, 3),
            "active_entries": len([e for e in self.cache.values() if not e.is_expired])
        }

    def clear_expired(self):
        """Remove all expired entries."""
        expired_keys = [k for k, v in self.cache.items() if v.is_expired]
        for key in expired_keys:
            del self.cache[key]


class MultilingualQASystem:
    """Multilingual question-answering system with RAG."""
    
    # Common Sanskrit words and patterns
    SANSKRIT_PATTERNS = [
        'कृष्ण', 'अर्जुन', 'कर्म', 'योग', 'धर्म', 'अधर्म', 'भगवान', 'परमात्मा',
        'ब्रह्म', 'ब्रह्मा', 'शिव', 'विष्णु', 'गीता', 'श्लोक', 'चरण', 'मंत्र',
        'सृष्टि', 'आत्मा', 'प्रकृति', 'लोक', 'मोक्ष', 'संसार', 'कलि', 'सत्य',
        'असत्य', 'सर्व', 'भगवद्गीता', 'भगवत', 'कृष्णाय', 'कृष्णेन', 'कृष्णस्य'
    ]
    
    # Common Hindi words and patterns
    HINDI_PATTERNS = [
        r'[\u0900-\u097F]',  # Devanagari script
        'क्यों', 'क्यूं', 'क्योकि', 'क्या', 'कौन', 'कहाँ', 'कैसे',
        'भगवान', 'श्री', 'कृष्ण', 'कृष्णा', 'भगवद्गीता', 'श्लोक',
        'धर्म', 'कर्म', 'योग', 'युद्ध', 'कर्तव्य', 'करना', 'मत',
        'हो', 'है', 'हैं', 'हूँ', 'साथ', 'में', 'से', 'को', 'का',
        'और', 'या', 'पर', 'के', 'की', 'ने', 'तो', 'भी', 'जो', 'जब'
    ]
    
    def __init__(
        self,
        retriever: HybridRetriever,
        groq_api_key: str,
        temperature: float = 0.3,
        max_tokens: int = 500,
        enable_caching: bool = True,
        cache_size: int = 1000,
        enable_memory: bool = True,
        memory_type: str = "summary"  # "buffer" or "summary"
    ):
        self.retriever = retriever
        self.groq_api_key = groq_api_key
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.enable_caching = enable_caching
        self.enable_memory = enable_memory

        # Initialize caching system
        self.cache = ResponseCache(max_size=cache_size) if enable_caching else None

        # Initialize conversation memory
        if enable_memory:
            if memory_type == "summary":
                try:
                    self.memory = ConversationSummaryBufferMemory(
                        llm=ChatGroq(model_name="llama-3.1-8b-instant", temperature=0.1, groq_api_key=groq_api_key),
                        max_token_limit=2000,
                        memory_key="chat_history",
                        return_messages=True
                    )
                except Exception as e:
                    log.warning(f"Failed to initialize summary memory: {e}. Using buffer memory instead.")
                    self.memory = ConversationBufferMemory(
                        memory_key="chat_history",
                        return_messages=True
                    )
            else:
                self.memory = ConversationBufferMemory(
                    memory_key="chat_history",
                    return_messages=True
                )
        else:
            self.memory = None

        # Analytics tracking
        self.analytics = {
            "total_queries": 0,
            "language_distribution": {"en": 0, "hi": 0, "sa": 0},
            "average_response_time": 0.0,
            "cache_hit_rate": 0.0,
            "error_count": 0,
            "quality_scores": [],
            "popular_topics": {},
            "user_sessions": {}
        }

        # User behavior adaptation
        self.user_behavior = {
            "conversation_depth": {},  # Track depth of conversations per user
            "preferred_complexity": {},  # Simple vs detailed responses
            "topic_interests": {},  # Topics users frequently ask about
            "response_style": {},  # Polite, direct, philosophical, etc.
            "language_consistency": {}  # How consistent they are with language choice
        }

        # Quality assessment patterns
        self.quality_patterns = {
            "verse_references": re.compile(r'(?:Chapter|Verse|Shloka|Sloka)\s*\d+'),
            "sanskrit_terms": re.compile(r'\b[A-Z][a-z]*\s*(?:[A-Z][a-z]*\s*)*\b'),
            "spiritual_concepts": re.compile(r'\b(dharma|karma|yoga|bhakti|jnana|atma|brahman| moksha|samadhi)\b', re.IGNORECASE),
            "practical_application": re.compile(r'\b(should|must|practice|apply|implement|follow)\b', re.IGNORECASE)
        }

        # Cross-reference mapping for verses
        self.verse_cross_references = {
            # Key teachings and their related verses
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

        # Set API key
        os.environ["GROQ_API_KEY"] = self.groq_api_key

    def _generate_question_hash(self, question: str, language: str, user_id: str) -> str:
        """Generate a unique hash for question caching."""
        content = f"{question.lower().strip()}_{language}_{user_id}"
        return hashlib.sha256(content.encode()).hexdigest()

    def _calculate_confidence_score(self, contexts: List[Dict], answer: str) -> float:
        """Calculate confidence score based on context relevance and answer quality."""
        if not contexts:
            return 0.0

        # Base score from context scores
        avg_context_score = sum(ctx.get('score', 0) for ctx in contexts) / len(contexts)

        # Bonus for multiple high-quality contexts
        context_bonus = min(len(contexts) * 0.1, 0.3)

        # Quality indicators in answer
        quality_indicators = 0
        quality_indicators += len(self.quality_patterns["verse_references"].findall(answer)) * 0.1
        quality_indicators += len(self.quality_patterns["spiritual_concepts"].findall(answer)) * 0.05
        quality_indicators += len(self.quality_patterns["practical_application"].findall(answer)) * 0.1

        # Length appropriateness (not too short, not too long)
        answer_length = len(answer.split())
        length_score = 1.0 if 20 <= answer_length <= 200 else 0.5

        confidence = min(avg_context_score + context_bonus + quality_indicators + length_score, 1.0)
        return round(confidence, 3)

    def _assess_answer_quality(self, answer: str, contexts: List[Dict]) -> Dict[str, Any]:
        """Comprehensive quality assessment of the generated answer."""
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

    def _calculate_readability(self, text: str) -> float:
        """Simple readability score based on sentence structure and word complexity."""
        sentences = re.split(r'[.!?]+', text)
        words = text.split()

        if not words:
            return 0.0

        avg_words_per_sentence = len(words) / len(sentences) if sentences else 0
        complex_words = sum(1 for word in words if len(word) > 6)

        # Ideal readability: 10-20 words per sentence, not too many complex words
        sentence_score = 1.0 if 10 <= avg_words_per_sentence <= 20 else 0.5
        complexity_score = 1.0 - min(complex_words / len(words), 0.5)

        return round((sentence_score + complexity_score) / 2, 2)

    def _find_cross_references(self, question: str, contexts: List[Dict]) -> List[str]:
        """Find related verses and teachings for cross-referencing."""
        cross_refs = set()

        # Extract key topics from question and contexts
        question_lower = question.lower()
        context_text = " ".join([ctx.get('text', '') for ctx in contexts]).lower()

        # Check for topic matches
        for topic, verses in self.verse_cross_references.items():
            if topic in question_lower or topic in context_text:
                cross_refs.update(verses)

        # Add verses that are contextually related but not already in sources
        source_verses = {ctx['verse'] for ctx in contexts}
        related_verses = cross_refs - source_verses

        return sorted(list(related_verses))[:5]  # Limit to 5 cross-references

    def _update_analytics(self, language: str, processing_time: float, quality_score: float,
                         question: str, user_id: str):
        """Update system analytics."""
        self.analytics["total_queries"] += 1
        self.analytics["language_distribution"][language] += 1

        # Update average response time
        current_avg = self.analytics["average_response_time"]
        total_queries = self.analytics["total_queries"]
        self.analytics["average_response_time"] = (
            (current_avg * (total_queries - 1)) + processing_time
        ) / total_queries

        # Update quality scores
        self.analytics["quality_scores"].append(quality_score)
        if len(self.analytics["quality_scores"]) > 1000:  # Keep last 1000 scores
            self.analytics["quality_scores"] = self.analytics["quality_scores"][-1000:]

        # Track popular topics
        question_lower = question.lower()
        for topic in self.verse_cross_references.keys():
            if topic in question_lower:
                self.analytics["popular_topics"][topic] = self.analytics["popular_topics"].get(topic, 0) + 1

        # Track user sessions
        if user_id not in self.analytics["user_sessions"]:
            self.analytics["user_sessions"][user_id] = {
                "query_count": 0,
                "first_seen": datetime.now(),
                "languages_used": set()
            }
        self.analytics["user_sessions"][user_id]["query_count"] += 1
        self.analytics["user_sessions"][user_id]["languages_used"].add(language)

    def get_analytics(self) -> Dict[str, Any]:
        """Get comprehensive system analytics."""
        analytics_copy = self.analytics.copy()

        # Calculate additional metrics
        if self.cache:
            cache_stats = self.cache.get_stats()
            analytics_copy["cache_performance"] = cache_stats

        analytics_copy["avg_quality_score"] = (
            sum(self.analytics["quality_scores"]) / len(self.analytics["quality_scores"])
            if self.analytics["quality_scores"] else 0
        )

        analytics_copy["top_topics"] = sorted(
            self.analytics["popular_topics"].items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]

        return analytics_copy

    def _detect_language(self, text: str) -> str:
        """Detect if the text is in Sanskrit, Hindi, or English."""
        text_lower = text.lower()
        words = text_lower.split()

        # Check for explicit language requests first (more flexible matching)
        hindi_indicators = ['hindi', 'hindhi', 'हिंदी', 'हिन्दी']
        sanskrit_indicators = ['sanskrit', 'sanskrit', 'संस्कृत', 'संस्कृतम्']
        english_indicators = ['english', 'angrezi']

        # Check for language requests with flexible matching
        for indicator in hindi_indicators:
            if f'in {indicator}' in text_lower or f'{indicator} explain' in text_lower or f'{indicator} mein' in text_lower or indicator in text_lower:
                return 'hi'

        for indicator in sanskrit_indicators:
            if f'in {indicator}' in text_lower or f'{indicator} explain' in text_lower or indicator in text_lower:
                return 'sa'

        for indicator in english_indicators:
            if f'in {indicator}' in text_lower or f'{indicator} explain' in text_lower or indicator in text_lower:
                return 'en'

        # Check for Devanagari script first
        devanagari_pattern = r'[\u0900-\u097F]'
        if re.search(devanagari_pattern, text):
            # Check for Sanskrit-specific patterns
            sanskrit_word_count = sum(1 for word in self.SANSKRIT_PATTERNS if word in text_lower)
            
            # Sanskrit-specific words that indicate classical Sanskrit
            classical_sanskrit_indicators = [
                'आमुक्तये', 'परमेश्वराय', 'नारायणाय', 'हराय', 'विष्णवे', 'शिवाय',
                'ब्रह्मणे', 'ऋते', 'हि', 'च', 'यत्', 'तत्', 'यथा', 'तथा', 'इति',
                'भगवान्', 'परमात्मा', 'सर्वेश्वर', 'सर्वव्यापक', 'अनन्त', 'अपरिमित'
            ]
            
            classical_sanskrit_count = sum(1 for word in classical_sanskrit_indicators if word in text)
            
            # If many Sanskrit-specific words or classical indicators, likely Sanskrit
            if sanskrit_word_count >= 3 or classical_sanskrit_count >= 2:
                return 'sa'
            # Otherwise, likely Hindi
            else:
                return 'hi'

        # Enhanced Hindi/Urdu detection in Roman script (expanded for Hinglish)
        hindi_roman_words = [
            # Common Hindi words and Hinglish patterns
            'kya', 'hai', 'hain', 'tha', 'thi', 'the', 'ka', 'ki', 'ke', 'ko', 'se', 'mein', 'main', 'me',
            'aur', 'ya', 'par', 'jo', 'jab', 'kar', 'raha', 'rahi', 'rahe', 'hota', 'hoti', 'hote', 'hu',
            'ban', 'banaya', 'banaye', 'karta', 'karti', 'karte', 'samajh', 'padh', 'likh', 'sun',
            'dekh', 'khao', 'pee', 'chal', 'baith', 'so', 'uth', 'aa', 'ja', 'jana', 'ana', 'dena', 'lena',
            'khana', 'peena', 'padhai', 'likhai', 'padega', 'karega', 'hogaya', 'hogayi', 'hogaye',
            'rahta', 'rahti', 'rahte', 'banata', 'banati', 'banate', 'samajhta', 'samajhti', 'samajhte',
            'padhta', 'padhti', 'padhte', 'likhta', 'likhti', 'likhte', 'sunta', 'sunti', 'sunte',
            'dekhta', 'dekhti', 'dekhte', 'khata', 'khati', 'khaate', 'peeta', 'peeti', 'peete',
            'chalta', 'chali', 'chalte', 'baitha', 'baithi', 'baithte', 'soya', 'soyi', 'soye',
            'utha', 'uthi', 'uthe', 'aaya', 'aayi', 'aaye', 'gaya', 'gayi', 'gaye', 'aana', 'jaana',
            'dena', 'lena', 'pyaar', 'mohabbat', 'ishq', 'zindagi', 'jaan', 'dil', 'rooh',
            'sab', 'sabse', 'sahi', 'galat', 'achha', 'bura', 'pasand', '花हद', 'दिल', 'जान',
            # Hinglish specific words
            'kahenge', 'kahunga', 'kahungi', 'kahoge', 'kahogi', 'kahega', 'kahegi',
            'karunga', 'karungi', 'karoge', 'karogi', 'karega', 'karegi',
            'jaunga', 'jaungi', 'jaoge', 'jaogi', 'jaega', 'jaegi',
            'aunga', 'aungi', 'aoge', 'aogi', 'aega', 'aegi',
            'rahega', 'rahegi', 'rahege', 'rahein', 'rahein',
            'sahenge', 'sahunga', 'sahungi', 'sahoge', 'sahogi', 'sahega', 'sahegi'
        ]

        # Sanskrit transliterated words that could be English spiritual terms
        sanskrit_transliteration = [
            'krishna', 'arjuna', 'bhagavad', 'gita', 'dharma', 'karma', 'yoga',
            'brahma', 'shiva', 'vishnu', 'atman', 'paramatma', 'moksha',
            'samsara', 'satya', 'asura', 'kali', 'loka', 'shloka', 'mantra',
            'srushti', 'prakriti', 'sanskrit', 'hindu', 'vedic', 'upanishad'
        ]

        # Count word matches
        hindi_word_count = sum(1 for word in words if word in hindi_roman_words)
        sanskrit_transliteration_count = sum(1 for word in words if word in sanskrit_transliteration)
        
        # Context analysis - if the text contains multiple Sanskrit terms with Hindi grammar
        has_hindi_grammar = any(word in words for word in ['kya', 'hai', 'kar', 'raha', 'hota'])
        has_sanskrit_spiritual_terms = sanskrit_transliteration_count >= 2
        
        # Enhanced detection logic
        if has_hindi_grammar and has_sanskrit_spiritual_terms:
            return 'hi'  # Hindi with Sanskrit terms
        elif hindi_word_count >= 2:
            return 'hi'  # Clear Hindi content
        elif sanskrit_transliteration_count >= 4 and not has_hindi_grammar:
            return 'sa'  # Multiple Sanskrit terms without Hindi grammar
        else:
            return 'en'  # Default to English for general queries
    
    def _get_language_specific_prompt(self, language: str, contexts: List[Dict], question: str) -> str:
        """Get language-specific prompt and format contexts accordingly."""
        
        if language == 'sa':
            # Sanskrit-specific prompt
            prompt_template = """You are Krishna speaking in Sanskrit. Answer ALL questions in classical Sanskrit language only. Use proper Sanskrit grammar and traditional spiritual terminology.

IMPORTANT: Your entire response must be in Sanskrit. Do not use English words. Use Sanskrit equivalents for all concepts.

भगवद्गीतायाः संदर्भः:
{context}

प्रश्नः: {question}

कृष्णस्य उत्तरम् (सर्वं संस्कृतेन):"""

            # Rich context with full information
            context_text = "\n\n".join([
                f"[{ctx['verse']}]\nसंस्कृतम्: {ctx.get('sanskrit', 'N/A')}\nआङ्ग्लम्: {ctx.get('translation', 'N/A')}\nव्याख्या: {ctx['text'][:400]}..."
                for ctx in contexts[:5]  # Use top 5 contexts for better coverage
            ])
            
        elif language == 'hi':
            # Hindi-specific prompt with enhanced politeness and verse explanations
            prompt_template = """आप भगवान श्रीकृष्ण हैं, जो भगवद्गीता में अर्जुन को दिव्य ज्ञान प्रदान कर रहे हैं। आपका उत्तर अत्यंत विनम्र, प्रेमपूर्ण और ज्ञानवर्धक होना चाहिए।

महत्वपूर्ण निर्देश:
1. आपका पूरा उत्तर हिंदी भाषा में होना चाहिए - कोई अंग्रेजी शब्द न हो।
2. उत्तर में भगवद्गीता के श्लोकों का उल्लेख करें और उनका स्पष्टीकरण दें।
3. उत्तर बहुत ही विनम्र और प्रेमपूर्ण शैली में दें, जैसे एक गुरु अपने शिष्य से बात कर रहा हो।
4. व्यावहारिक जीवन में इन शिक्षाओं को लागू करने के बारे में बताएं।
5. उत्तर संक्षिप्त लेकिन सम्पूर्ण हो - 200 शब्दों के अंदर।

प्रासंगिक भगवद्गीता संदर्भ:
{context}

प्रश्न: {question}

श्रीकृष्ण का दिव्य उत्तर (पूर्ण हिंदी में, विनम्र और ज्ञानपूर्ण):"""

            # Enhanced context with verses and explanations
            context_text = "\n\n".join([
                f"📖 श्लोक {ctx['verse']}:\n🔸 संस्कृत: {ctx.get('sanskrit', 'N/A')}\n🔸 हिंदी अनुवाद: {ctx.get('hindi_translation', 'N/A')}\n🔸 व्याख्या: {ctx['text'][:300]}..."
                for ctx in contexts[:4]  # Use top 4 contexts for better coverage
            ])
            
        else:
            # Concise English prompt as Krishna
            prompt_template = """You are Krishna speaking to Arjuna and seekers. Answer as the divine teacher from Bhagavad Gita.

CONTEXT:
{context}

QUESTION: {question}

RESPONSE: Provide a clear, concise answer (under 200 words) with verse references and practical wisdom."""

            # Concise context with essential information only
            context_text = "\n\n".join([
                f"[{ctx['verse']}] {ctx['text'][:200]}..."
                for ctx in contexts[:3]  # Use top 3 contexts only
            ])
        
        return prompt_template, context_text
    
    def _get_language_specific_fallback(self, question_lower: str, language: str) -> str:
        """Get language-specific fallback response."""
        
        if language == 'sa':
            # Sanskrit fallback responses
            fallback_responses = {
                "dharma": "भगवद्गीता धर्मं शिक्षति यत् धार्मिकं कर्तव्यं दिव्यविन्यासेन सह संरेखितम्। यथा कृष्णोऽध्याय 3, श्लोक 8 मध्ये वर्णयति: 'स्वनिर्धारितानि कर्तव्यानि संपादयेत्, यतः कर्माकर्मणः श्रेष्ठम्।' एतत् सूचयति यत् निष्ठया निष्फलनिष्ठया च जीवने स्वभूमिकां पूर्णं कर्तव्यम्।",
                "karma": "भगवद्गीते, कर्म अनुष्ठानं भवति सङ्गतिभक्त्या सह। कृष्णोऽध्याय 2, श्लोक 47 मध्ये शिक्षति: 'स्वनिर्धारितानि कर्तव्यानि कर्तुं तव अधिकारः फलेषु न।' एतत् सूचयति यत् निष्फलनिष्ठया कार्यं कर्तव्यम्।",
                "yoga": "गीता अनेकानि योगमार्गान् प्रस्तौति। कर्मयोगः (कर्मयोगः) निष्कामकर्तव्यं, भक्तियोगः (भक्तियोगः) दिव्ये प्रेमभक्तिं, ज्ञानयोगः (ज्ञानयोगः) बुद्ध्याध्यात्मिकं बोधं च अन्वितानि सन्ति।",
                "war": "कृष्णस्य युद्धसम्बन्धिन्यः शिक्षण्यः गहरावध्यात्मिक्यः। अध्याय 2, श्लोक 31 मध्ये: 'योद्धारूपेण स्वकर्तव्यं दृष्ट्वा, न कम्पितव्यम्। निश्चितं, योद्धायै, धर्मोत्थापनाय युद्धादन्यत् श्रेयः नास्ति।' धर्मस्य रक्षा युद्धं धार्मिकं भवति।",
                "enemy": "कृष्णो शिक्षति यत् अस्माकं महत्तमः शत्रुः अन्तरेव - स्वीयं मनः, इन्द्रियाणि, इच्छानि च। अध्याय 6, श्लोक 6: 'मनो जितवतां मित्रं, अजितवतां शत्रुरिव।'",
                "duty": "स्वधर्मः (स्वकीयं कर्तव्यं) कृष्णस्य शिक्षणाय मूलकेन्द्रम्। अध्याय 3, श्लोक 35: 'स्वप्राकृतिकं कर्तव्यं कर्तुं श्रेष्ठं, दोषैः सहितं, परधर्मस्यापि श्रेष्ठत्वे सति।'",
                "defence": "सत्यस्य, न्यायस्य, दुर्बलानां च धार्मिकं रक्षा पवित्रं कर्तव्यम्। कृष्णोऽर्जुनं व्यक्तिगतलाभाय न, धर्मपुनर्स्थापनाय निर्दोषाणां रक्षायै च लड़ितुं प्रेरयति।",
                "kill": "कृष्णो शिक्षति यत् धर्मस्य, निर्दोषाणां च रक्षायै न्यायसंगतं कार्यं पवित्रं कर्तव्यम्। अध्याय 11, श्लोक 34 मध्ये कृष्णो घोषयति यत् कस्यचित् योद्धा दिव्येच्छया पुरा पराजिता, अर्जुनो दिव्यन्यायस्य उपकरणेन कार्यं कर्तुं शक्नोति।",
                "righteous": "गीते न्यायसंगतं कार्यं (धर्मः) व्यक्तिगतैरिच्छैः परिणामैश्च सह सहबन्धनरहितेन कर्तव्येन भवति। निर्दोषाणां रक्षा, सत्यस्य उन्नयनं, महत् भलं च अन्वितानि।",
            }
            
            # Check for Sanskrit keywords
            for key, response in fallback_responses.items():
                if key in question_lower:
                    return response
            
            return "भगवद्गीता जीवनस्य सर्वेषां प्रश्नानां गहरं ज्ञानं धारयति। कृष्णस्य अर्जुनाय शिक्षण्यः अस्माकं समक्षे आगच्छन्ति मूलभूत-चुनौत्यः - कर्तव्यविरुद्ध इच्छा, कर्मविरुद्ध अकर्म, आध्यात्मिकपूर्णतायाश्च मार्गः। कृष्णस्य ज्ञानस्य कां विशिष्टां दिशां ज्ञातुमिच्छसि?"
            
        elif language == 'hi':
            # Hindi fallback responses
            fallback_responses = {
                "dharma": "भगवद्गीता सिखाती है कि धर्म हमारा धार्मिक कर्तव्य है जो दिव्य आदेश के साथ संरेखित है। जैसा कि कृष्ण जी ने अध्याय 3, श्लोक 8 में समझाया: 'अपने निर्धारित कर्तव्यों का पालन करो, क्योंकि कर्म कर्म से बेहतर है।' इसका मतलब है कि हमें जीवन में अपनी भूमिका समर्पण और फलों से जुड़ाव के बिना निभाना चाहिए।",
                "karma": "भगवद्गीता में, कर्म का अर्थ है कर्तव्य और समर्पण के साथ किया गया कार्य। कृष्ण जी ने अध्याय 2, श्लोक 47 में सिखाया: 'आपके पास अपने निर्धारित कर्तव्यों को करने का अधिकार है, लेकिन अपने कर्म के फलों के लिए नहीं।' इसका मतलब है कि हमें परिणामों से जुड़ाव के बिना कार्य करना चाहिए।",
                "yoga": "गीता कई योग मार्ग प्रस्तुत करता है। कर्म योग (कर्म योग) में निस्वार्थ कर्तव्य, भक्ति योग (भक्ति योग) में दिव्य के प्रति प्रेमभक्ति, और ज्ञान योग (ज्ञान योग) में बुद्धि के माध्यम से आध्यात्मिक समझ शामिल है।",
                "war": "कृष्ण जी की युद्ध की शिक्षाएं गहराई से आध्यात्मिक हैं। अध्याय 2, श्लोक 31 में: 'अपने योद्धा के कर्तव्य को देखते हुए, आपको हिलना नहीं चाहिए। वास्तव में, एक योद्धा के लिए, धर्म की रक्षा के लिए लड़ाई से बेहतर कोई काम नहीं।' जब यह धर्म की रक्षा करता है तो युद्ध धार्मिक बन जाता है।",
                "enemy": "कृष्ण जी सिखाते हैं कि हमारा सबसे बड़ा शत्रु भीतर है - हमारा अपना मन, इंद्रियां और इच्छाएं। अध्याय 6, श्लोक 6: 'जिन्होंने मन पर विजय पाई है, उनके लिए यह मित्र है। जिन्होंने ऐसा नहीं किया, उनके लिए मन शत्रु की तरह काम करता है।'",
                "duty": "स्वधर्म (अपना कर्तव्य) कृष्ण जी की शिक्षा का केंद्र है। अध्याय 3, श्लोक 35: 'यह अपने प्राकृतिक निर्धारित कर्तव्य को करना बेहतर है, हालांकि इसमें दोष हों, बजाय दूसरे के निर्धारित कर्तव्य को करने के, हालांकि वह पूरी तरह से हो।'",
                "love": "गीता में प्रेम का सर्वोच्च रूप भक्ति है - दिव्य के प्रति शुद्ध भक्ति। यह प्रेम व्यक्तिगत इच्छाओं से आगे जाता है और आत्मा को सार्वभौमिक चेतना से जोड़ता है।",
                "defence": "सच्चाई, न्याय और निर्बलों की न्यायसंगत रक्षा एक पवित्र कर्तव्य है। कृष्ण जी अर्जुन को व्यक्तिगत लाभ के लिए नहीं, बल्कि धर्म को बहाल करने और निर्दोषों की रक्षा करने के लिए लड़ने के लिए कहते हैं।",
                "kill": "कृष्ण जी सिखाते हैं कि धर्म और निर्दोषों की रक्षा के लिए न्यायसंगत कार्य एक पवित्र कर्तव्य है। अध्याय 11, श्लोक 34 में कृष्ण जी घोषणा करते हैं कि कुछ योद्धाओं को पहले से ही दिव्य इच्छा से हरा दिया गया है, और अर्जुन को दिव्य न्याय के उपकरण के रूप में कार्य करना चाहिए। मुख्य बात प्रेरणा है - व्यक्तिगत नफरत या लालच के बजाय धर्म (न्यायसंगतता) के लिए किया गया कार्य।",
                "righteous": "गीता में न्यायसंगत कार्य (धर्म) का अर्थ है व्यक्तिगत इच्छाओं और परिणामों से जुड़ाव के बिना किया गया कर्तव्य। इसमें निर्दोषों की रक्षा, सच्चाई को बनाए रखना और बड़े भले के लिए सेवा शामिल है। ऐसा कार्य आत्मा को शुद्ध करता है और आध्यात्मिक विकास की ओर ले जाता है।",
            }
            
            # Check for Hindi keywords
            for key, response in fallback_responses.items():
                if key in question_lower:
                    return response
            
            return "भगवद्गीता में जीवन के सभी प्रश्नों के लिए गहरी बुद्धि है। कृष्ण जी की अर्जुन को शिक्षा हमारे सामने आने वाली मौलिक चुनौतियों को संबोधित करती है - कर्तव्य बनाम इच्छा, कर्म बनाम अकर्म, और आध्यात्मिक पूर्ति का मार्ग। आप कृष्ण जी की बुद्धि के किस विशिष्ट पहलू को समझना चाहते हैं?"
        
        else:
            # English fallback responses
            fallback_responses = {
                "dharma": "The Bhagavad Gita teaches that dharma is our righteous duty aligned with divine order. As Krishna explains in Chapter 3, Verse 8: 'Perform your prescribed duties, for action is superior to inaction.' This means fulfilling our role in life with dedication and without attachment to results.",
                "karma": "In the Bhagavad Gita, karma refers to action performed with duty and dedication. Krishna teaches in Chapter 2, Verse 47: 'You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions.' This means we should act without attachment to outcomes.",
                "yoga": "The Gita presents several paths of yoga. Karma Yoga (action yoga) involves performing duty selflessly, Bhakti Yoga (devotion yoga) focuses on loving devotion to the divine, and Jnana Yoga (knowledge yoga) seeks spiritual understanding through wisdom.",
                "war": "Krishna's teachings about war are deeply spiritual. In Chapter 2, Verse 31: 'Considering your duty as a warrior, you should not waver. Indeed, for a warrior, there is no better engagement than fighting for upholding of righteousness.' War becomes righteous when it protects dharma.",
                "enemy": "Krishna teaches that our greatest enemy is within - our own mind, senses, and desires. Chapter 6, Verse 6: 'For those who have conquered the mind, it is their friend. For those who have failed to do so, the mind works like an enemy.'",
                "duty": "Swa-dharma (one's own duty) is central to Krishna's teaching. Chapter 3, Verse 35: 'It is far better to perform one's natural prescribed duty, though tinged with faults, than to perform another's prescribed duty, though perfectly.'",
                "love": "The highest form of love in the Gita is bhakti - pure devotion to the divine. This love transcends personal desires and connects the soul with the universal consciousness.",
                "defence": "Righteous defense of truth, justice, and the vulnerable is a sacred duty. Krishna urges Arjuna to fight not for personal gain, but to restore dharma and protect the innocent.",
                "kill": "Krishna teaches that righteous action for the protection of dharma and the innocent is a sacred duty. In Chapter 11, Verse 34, Krishna declares that certain warriors have already been defeated by divine will, and Arjuna must act as an instrument of divine justice. The key is motivation - action done for dharma (righteousness) rather than personal hatred or greed.",
                "righteous": "Righteous action (dharma) in the Gita refers to duty performed with detachment from personal desires and outcomes. This includes protecting the innocent, upholding truth, and serving the greater good. Such action purifies the soul and leads to spiritual growth.",
            }
            
            # Check for English keywords
            for key, response in fallback_responses.items():
                if key in question_lower:
                    return response
            
            return "The Bhagavad Gita contains profound wisdom for all of life's questions. Krishna's teachings to Arjuna address the fundamental challenges we face - duty vs. desire, action vs. inaction, and the path to spiritual fulfillment. What specific aspect of Krishna's wisdom would you like to explore?"
    
    def ask(self, question: str, user_id: str = "default", preferred_language: str = "en") -> Dict[str, Any]:
        """Advanced multilingual Q&A with comprehensive spiritual guidance and analytics."""
        start_time = datetime.now()

        try:
            # Input validation and sanitization
            if not question or not question.strip():
                raise ValueError("Question cannot be empty")

            question = question.strip()
            if len(question) > 1000:
                raise ValueError("Question too long (max 1000 characters)")

            log.info(f"Processing question from user {user_id}: {question[:50]}...")

            # Determine language
            if preferred_language and preferred_language in ['en', 'hi', 'sa']:
                language = preferred_language
                log.info(f"Using preferred language: {language}")
            else:
                language = self._detect_language(question)
                log.info(f"Auto-detected language: {language}")

            # Check cache first
            question_hash = self._generate_question_hash(question, language, user_id)
            cached_response = self.cache.get(question_hash) if self.cache else None

            if cached_response:
                log.info(f"Cache hit for question hash: {question_hash[:8]}...")
                processing_time = (datetime.now() - start_time).total_seconds()

                # Update analytics for cache hit
                self._update_analytics(language, processing_time, cached_response.quality_metrics.get("overall_score", 0.5), question, user_id)

                return cached_response.to_dict()

            # Retrieve relevant contexts with enhanced retrieval
            contexts = self.retriever.retrieve(question, top_k=7)  # Increased for better coverage

            if not contexts:
                # Enhanced fallback with analytics
                question_lower = question.lower()
                fallback_answer = self._get_language_specific_fallback(question_lower, language)

                processing_time = (datetime.now() - start_time).total_seconds()

                # Create comprehensive fallback response
                fallback_response = QAResponse(
                    answer=fallback_answer,
                    sources=[],
                    contexts=[],
                    language=language,
                    confidence_score=0.3,  # Lower confidence for fallback
                    processing_time=processing_time,
                    model_used="fallback",
                    token_count=len(fallback_answer.split()),
                    quality_metrics={"overall_score": 0.3, "is_fallback": True},
                    cross_references=[],
                    user_id=user_id,
                    question_hash=question_hash
                )

                # Cache fallback response with shorter TTL
                if self.cache:
                    self.cache.set(question_hash, fallback_response, ttl_seconds=300)  # 5 minutes

                # Update analytics
                self._update_analytics(language, processing_time, 0.3, question, user_id)

                log.info(f"Generated fallback answer for user {user_id}")
                return fallback_response.to_dict()

            # Add conversation memory context if enabled
            memory_context = ""
            if self.memory:
                try:
                    # Get relevant conversation history
                    memory_vars = self.memory.load_memory_variables({})
                    if memory_vars.get("chat_history"):
                        # Extract last 3 exchanges for context
                        recent_history = memory_vars["chat_history"][-6:]  # Last 3 Q&A pairs
                        memory_context = "\n\nRECENT CONVERSATION CONTEXT:\n" + "\n".join([
                            f"Previous Q: {msg.content}" if hasattr(msg, 'content') else str(msg)
                            for msg in recent_history
                        ])
                except Exception as mem_e:
                    log.warning(f"Memory retrieval failed: {mem_e}")

            # Get enhanced language-specific prompt
            prompt_template, context_text = self._get_language_specific_prompt(language, contexts, question)

            # Include memory context in prompt if available
            if memory_context:
                context_text += memory_context

            # Generate answer using Groq with enhanced parameters
            llm = ChatGroq(
                model_name="llama-3.1-8b-instant",
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )

            formatted_prompt = prompt_template.format(context=context_text, question=question)

            # Add system message for better context
            system_message = SystemMessage(content="You are Krishna, the divine teacher from the Bhagavad Gita. Provide spiritually profound, practically applicable wisdom that helps seekers understand and apply eternal teachings in modern life.")
            messages = [system_message, HumanMessage(content=formatted_prompt)]

            response = llm.invoke(messages)
            answer = response.content.strip()

            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()

            # Comprehensive quality assessment
            quality_metrics = self._assess_answer_quality(answer, contexts)
            confidence_score = self._calculate_confidence_score(contexts, answer)

            # Find cross-references
            cross_references = self._find_cross_references(question, contexts)

            # Estimate token count (rough approximation)
            token_count = len(answer.split()) + len(formatted_prompt.split()) * 0.3

            # Extract and format sources
            sources = [ctx['verse'] for ctx in contexts]

            # Enhanced context formatting with more details
            formatted_contexts = []
            for ctx in contexts:
                formatted_contexts.append({
                    "verse": ctx['verse'],
                    "score": round(ctx.get('score', 0), 3),
                    "relevance": "high" if ctx.get('score', 0) > 0.8 else "medium" if ctx.get('score', 0) > 0.6 else "low",
                    "summary": ctx['text'][:250] + "..." if len(ctx['text']) > 250 else ctx['text'],
                    "sanskrit": ctx.get('sanskrit', ''),
                    "translation": ctx.get('translation', ''),
                    "hindi_translation": ctx.get('hindi_translation', ''),
                    "chapter": ctx.get('chapter', ''),
                    "teaching_focus": self._extract_teaching_focus(ctx['text'])
                })

            # Create comprehensive response object
            qa_response = QAResponse(
                answer=answer,
                sources=sources,
                contexts=formatted_contexts,
                language=language,
                confidence_score=confidence_score,
                processing_time=processing_time,
                model_used="llama-3.1-8b-instant",
                token_count=int(token_count),
                quality_metrics=quality_metrics,
                cross_references=cross_references,
                user_id=user_id,
                question_hash=question_hash
            )

            # Update conversation memory if enabled
            if self.memory:
                try:
                    self.memory.save_context(
                        {"input": question},
                        {"output": answer}
                    )
                except Exception as mem_e:
                    log.warning(f"Memory save failed: {mem_e}")

            # Cache the response
            if self.cache:
                ttl_seconds = 3600 if confidence_score > 0.7 else 1800  # Higher confidence = longer cache
                self.cache.set(question_hash, qa_response, ttl_seconds=ttl_seconds)

            # Update user behavior tracking
            self._update_user_behavior(user_id, question, language, quality_metrics["overall_score"])

            # Adapt response based on user behavior (after 5+ conversations)
            if self.user_behavior["conversation_depth"].get(user_id, 0) >= 5:
                adapted_answer = self._adapt_response_for_user(answer, user_id, language)
                qa_response.answer = adapted_answer

            # Update analytics
            self._update_analytics(language, processing_time, quality_metrics["overall_score"], question, user_id)

            log.info(f"Generated world-class answer for user {user_id} in {language} "
                    f"(confidence: {confidence_score:.2f}, quality: {quality_metrics['overall_score']:.2f})")

            return qa_response.to_dict()

        except ValueError as ve:
            log.error(f"Validation error: {ve}")
            self.analytics["error_count"] += 1
            return {
                "answer": f"Invalid input: {str(ve)}",
                "sources": [],
                "contexts": [],
                "language": "en",
                "error": "validation_error"
            }

        except Exception as e:
            log.error(f"Critical error in QA system: {e}")
            self.analytics["error_count"] += 1

            # Return structured error response
            processing_time = (datetime.now() - start_time).total_seconds()
            error_response = QAResponse(
                answer="I apologize, but I encountered an error while processing your question. "
                      "The Bhagavad Gita teaches us that even in challenging moments, we can find wisdom. "
                      "Please try rephrasing your question or contact support if the issue persists.",
                sources=[],
                contexts=[],
                language="en",
                confidence_score=0.0,
                processing_time=processing_time,
                model_used="error_fallback",
                token_count=50,
                quality_metrics={"overall_score": 0.0, "error_occurred": True},
                cross_references=[],
                user_id=user_id,
                question_hash=""
            )

            return error_response.to_dict()

    def _extract_teaching_focus(self, text: str) -> str:
        """Extract the main teaching focus from context text."""
        text_lower = text.lower()

        # Define teaching categories and their keywords
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

        # Count matches for each category
        category_scores = {}
        for category, keywords in teaching_categories.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                category_scores[category] = score

        # Return highest scoring category, or "general" if none found
        if category_scores:
            return max(category_scores, key=category_scores.get)
        return "general"

    def _update_user_behavior(self, user_id: str, question: str, language: str, quality_score: float):
        """Update user behavior tracking for personalization."""
        # Initialize user behavior data if not exists
        if user_id not in self.user_behavior["conversation_depth"]:
            self.user_behavior["conversation_depth"][user_id] = 0
            self.user_behavior["preferred_complexity"][user_id] = []
            self.user_behavior["topic_interests"][user_id] = {}
            self.user_behavior["response_style"][user_id] = []
            self.user_behavior["language_consistency"][user_id] = []

        # Update conversation depth
        self.user_behavior["conversation_depth"][user_id] += 1

        # Track topic interests
        question_lower = question.lower()
        for topic in self.verse_cross_references.keys():
            if topic in question_lower:
                self.user_behavior["topic_interests"][user_id][topic] = self.user_behavior["topic_interests"][user_id].get(topic, 0) + 1

        # Track language consistency
        self.user_behavior["language_consistency"][user_id].append(language)

        # Track response quality feedback (simulated)
        self.user_behavior["preferred_complexity"][user_id].append(quality_score)

    def _adapt_response_for_user(self, answer: str, user_id: str, language: str) -> str:
        """Adapt response based on user behavior patterns."""
        if user_id not in self.user_behavior["conversation_depth"]:
            return answer

        depth = self.user_behavior["conversation_depth"][user_id]
        if depth < 5:
            return answer  # Not enough data for adaptation

        # Analyze user preferences
        topic_interests = self.user_behavior["topic_interests"][user_id]
        language_consistency = self.user_behavior["language_consistency"][user_id]
        quality_scores = self.user_behavior["preferred_complexity"][user_id]

        # Determine preferred topics
        if topic_interests:
            top_topic = max(topic_interests, key=topic_interests.get)
        else:
            top_topic = None

        # Check language consistency (last 5 interactions)
        recent_languages = language_consistency[-5:]
        consistent_language = max(set(recent_languages), key=recent_languages.count) if recent_languages else language

        # Average quality score
        avg_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 0.5

        # Adapt based on patterns
        adapted_answer = answer

        if language == 'hi':
            # Add personalized touches for Hindi responses
            if depth > 10:
                adapted_answer = f"प्रिय साधक, {adapted_answer}"  # Add respectful greeting

            if top_topic and top_topic in ['dharma', 'karma', 'yoga']:
                adapted_answer += f"\n\nआपके {top_topic} विषय में रुचि देखकर मुझे प्रसन्नता हो रही है। इस मार्ग पर आगे बढ़ने के लिए मैं हमेशा आपके साथ हूं।"

        elif language == 'en':
            if depth > 10:
                adapted_answer = f"Dear seeker, {adapted_answer}"

            if top_topic and top_topic in ['dharma', 'karma', 'yoga']:
                adapted_answer += f"\n\nI see your interest in {top_topic}. May this wisdom guide you further on your spiritual journey."

        # If user has been consistent with one language, reinforce it
        if consistent_language != language and len(set(language_consistency[-3:])) == 1:
            if language == 'hi':
                adapted_answer += "\n\n(आप हिंदी में पूछ रहे हैं, इसलिए मैं हिंदी में ही उत्तर दे रहा हूं।)"
            elif language == 'en':
                adapted_answer += "\n\n(You have been asking in English, so I continue in English.)"

        return adapted_answer
