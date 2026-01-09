"""Refactored Multilingual Q&A System - Main orchestrator using modular components."""

import os
import hashlib
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict

from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from src.retrieval import HybridRetriever
from src.utils.logger import log

# Import modular components
from .prompts import PromptManager
from .memory import MemoryManager
from .cache import CacheManager
from .language import LanguageDetector, LanguageProcessor
from .quality import QualityAssessor
from .analytics import AnalyticsTracker
from .user import UserProfileManager


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
    """Refactored Multilingual Q&A System - Main orchestrator using modular components."""

    def __init__(
        self,
        retriever: HybridRetriever,
        groq_api_key: Optional[str] = None,
        gemini_api_key: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 500,
        enable_caching: bool = True,
        cache_size: int = 1000,
        enable_memory: bool = True,
        memory_type: str = "summary"
    ):
        self.retriever = retriever
        self.groq_api_key = groq_api_key
        self.gemini_api_key = gemini_api_key
        self.temperature = temperature
        self.max_tokens = max_tokens

        # Initialize modular components
        self.prompt_manager = PromptManager()
        self.memory_manager = MemoryManager(memory_type=memory_type, enable_memory=enable_memory, groq_api_key=groq_api_key)
        self.cache_manager = CacheManager(enable_caching=enable_caching, cache_size=cache_size)
        self.language_detector = LanguageDetector()
        self.language_processor = LanguageProcessor()
        self.quality_assessor = QualityAssessor()
        self.analytics_tracker = AnalyticsTracker()
        self.user_profile_manager = UserProfileManager()

        # Set API key only if provided
        if self.groq_api_key:
            os.environ["GROQ_API_KEY"] = self.groq_api_key
        if self.gemini_api_key:
            os.environ["GOOGLE_API_KEY"] = self.gemini_api_key

    def _generate_question_hash(self, question: str, language: str, user_id: str) -> str:
        """Generate a unique hash for question caching."""
        content = f"{question.lower().strip()}_{language}_{user_id}"
        return hashlib.sha256(content.encode()).hexdigest()
    
    def ask(self, question: str, user_id: str = "default", preferred_language: str = "en") -> Dict[str, Any]:
        """Refactored Q&A method using modular components."""
        start_time = datetime.now()

        try:
            # Input validation
            if not question or not question.strip():
                raise ValueError("Question cannot be empty")
            question = question.strip()
            if len(question) > 1000:
                raise ValueError("Question too long (max 1000 characters)")

            log.info(f"Processing question from user {user_id}: {question[:50]}...")

            # Detect language using modular component
            language = preferred_language if preferred_language in ['en', 'hi', 'sa'] else self.language_detector.detect(question)
            log.info(f"Using language: {language}")

            # Generate question hash
            question_hash = self._generate_question_hash(question, language, user_id)

            # Check cache using modular component
            cached_response = self.cache_manager.get(question_hash)
            if cached_response:
                processing_time = (datetime.now() - start_time).total_seconds()
                self.analytics_tracker.track_query(language, processing_time, cached_response.quality_metrics.get("overall_score", 0.5), question, user_id, cached=True)
                log.info(f"Cache hit for question hash: {question_hash[:8]}...")
                return cached_response.to_dict()

            # Retrieve contexts
            contexts = self.retriever.retrieve(question, top_k=7)

            # Handle no contexts found
            if not contexts:
                fallback_answer = self.language_processor.get_fallback_response(question.lower(), language)
                processing_time = (datetime.now() - start_time).total_seconds()

                fallback_response = QAResponse(
                    answer=fallback_answer,
                    sources=[], contexts=[],
                    language=language, confidence_score=0.3,
                    processing_time=processing_time, model_used="fallback",
                    token_count=len(fallback_answer.split()),
                    quality_metrics={"overall_score": 0.3, "is_fallback": True},
                    cross_references=[], user_id=user_id, question_hash=question_hash
                )

                self.cache_manager.set(question_hash, fallback_response, ttl_seconds=300)
                self.analytics_tracker.track_query(language, processing_time, 0.3, question, user_id)
                return fallback_response.to_dict()

            # Get memory context
            memory_context = self.memory_manager.get_context()

            # Get language-specific prompt and context
            prompt_template, context_text = self.prompt_manager.get_prompt(language, contexts, question)

            # Include memory context
            if memory_context:
                context_text += memory_context

            # Generate answer with fallback logic
            try:
                # Primary: Try Groq
                try:
                    llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=self.temperature, max_tokens=self.max_tokens)
                    system_content = (
                        "You are Krishna, the divine teacher and guide from the Bhagavad Gita. "
                        "Your purpose is to provide wisdom that leads to peace, clarity, and right action (Dharma). "
                        "Answer the user's question with profound yet practical spiritual insight, drawing directly from the provided context (verses). "
                        "Tone: Compassionate, authoritative, calm, and uplifting. "
                        "Structure: Start with a direct answer, then support it with the verse's wisdom, and end with a practical application. "
                        "If the context doesn't fully answer the question, use your general knowledge of the Gita but mention that the specific verse might be different."
                    )
                    system_message = SystemMessage(content=system_content)
                    messages = [system_message, HumanMessage(content=prompt_template.format(context=context_text, question=question))]
                    
                    response = llm.invoke(messages)
                    answer = response.content.strip()
                    model_used = "llama-3.1-8b-instant"

                except Exception as e_groq:
                    log.warning(f"Groq API failed: {e_groq}. Trying Gemini fallback...")
                    
                    # Secondary: Try Gemini
                    if self.gemini_api_key:
                        try:
                            llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=self.temperature, max_tokens=self.max_tokens)
                            system_message = SystemMessage(content=system_content) # Use same enhanced prompt
                            messages = [system_message, HumanMessage(content=prompt_template.format(context=context_text, question=question))]
                            
                            response = llm.invoke(messages)
                            answer = response.content.strip()
                            model_used = "gemini-pro"
                        except Exception as e_gemini:
                            log.warning(f"Gemini API failed: {e_gemini}. Using static fallback.")
                            raise e_gemini # Re-raise to trigger static fallback
                    else:
                        log.warning("Gemini API key not configured. Using static fallback.")
                        raise e_groq # Re-raise to trigger static fallback

            except Exception as e:
                log.warning(f"All LLM providers failed: {e}. Using fallback response.")
                answer = self.language_processor.get_fallback_response(question.lower(), language)
                # Append a note about the API key
                answer += "\n\n(Note: This is a fallback response because the AI API keys are invalid or missing. Please configure valid GROQ_API_KEY or GEMINI_API_KEY in .env to get AI-generated responses.)"
                model_used = "fallback"

            processing_time = (datetime.now() - start_time).total_seconds()

            # Quality assessment using modular component
            quality_metrics = self.quality_assessor.assess(answer, contexts)
            confidence_score = self.quality_assessor.calculate_confidence(contexts, answer)

            # Find cross-references
            cross_references = self.quality_assessor.find_cross_references(question, contexts)

            # Format response data
            sources = [ctx['verse'] for ctx in contexts]
            formatted_contexts = self._format_contexts(contexts)

            # Create response object
            qa_response = QAResponse(
                answer=answer, sources=sources, contexts=formatted_contexts,
                language=language, confidence_score=confidence_score,
                processing_time=processing_time, model_used=model_used,
                token_count=len(answer.split()) + len(prompt_template.split()) * 0.3,
                quality_metrics=quality_metrics, cross_references=cross_references,
                user_id=user_id, question_hash=question_hash
            )

            # Update memory
            self.memory_manager.save_context(question, answer)

            # Cache response
            ttl_seconds = 3600 if confidence_score > 0.7 else 1800
            self.cache_manager.set(question_hash, qa_response, ttl_seconds=ttl_seconds)

            # Update user profile and adapt response
            self.user_profile_manager.update_profile(user_id, question, language, quality_metrics["overall_score"])
            if self.user_profile_manager.should_adapt_response(user_id):
                adapted_answer = self.user_profile_manager.adapt_response(answer, user_id, language)
                qa_response.answer = adapted_answer

            # Track analytics
            self.analytics_tracker.track_query(language, processing_time, quality_metrics["overall_score"], question, user_id)

            log.info(f"Generated answer for user {user_id} in {language} (confidence: {confidence_score:.2f})")
            return qa_response.to_dict()

        except ValueError as ve:
            log.error(f"Validation error: {ve}")
            self.analytics_tracker.track_error()
            return {
                "answer": f"Invalid input: {str(ve)}",
                "sources": [], "contexts": [], "language": "en",
                "error": "validation_error"
            }

        except Exception as e:
            with open("debug_error.log", "a") as f:
                f.write(f"DEBUG: Critical error in QA system: {e}\n")
                import traceback
                traceback.print_exc(file=f)
            log.error(f"Critical error in QA system: {e}")
            self.analytics_tracker.track_error()

            processing_time = (datetime.now() - start_time).total_seconds()
            error_response = QAResponse(
                answer="I apologize, but I encountered an error. The Bhagavad Gita teaches us that even in challenging moments, we can find wisdom.",
                sources=[], contexts=[], language="en", confidence_score=0.0,
                processing_time=processing_time, model_used="error_fallback",
                token_count=50, quality_metrics={"overall_score": 0.0, "error_occurred": True},
                cross_references=[], user_id=user_id, question_hash=""
            )
            return error_response.to_dict()

    def _format_contexts(self, contexts: List[Dict]) -> List[Dict]:
        """Format contexts for response."""
        formatted = []
        for ctx in contexts:
            formatted.append({
                "verse": ctx['verse'],
                "score": round(ctx.get('score', 0), 3),
                "relevance": "high" if ctx.get('score', 0) > 0.8 else "medium" if ctx.get('score', 0) > 0.6 else "low",
                "summary": ctx['text'][:250] + "..." if len(ctx['text']) > 250 else ctx['text'],
                "sanskrit": ctx.get('sanskrit', ''),
                "translation": ctx.get('translation', ''),
                "hindi_translation": ctx.get('hindi_translation', ''),
                "chapter": ctx.get('chapter', ''),
                "teaching_focus": self.quality_assessor.extract_teaching_focus(ctx['text'])
            })
        return formatted

    def get_analytics(self) -> Dict[str, Any]:
        """Get analytics from modular component."""
        analytics = self.analytics_tracker.get_analytics()
        if self.cache_manager.is_enabled():
            analytics["cache_performance"] = self.cache_manager.get_stats()
        return analytics
