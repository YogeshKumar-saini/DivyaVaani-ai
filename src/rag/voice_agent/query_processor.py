"""Query processor for handling natural language queries."""

import time
import logging
from dataclasses import dataclass
from typing import Optional, Dict, Any

from src.rag.multilingual_qa_system import MultilingualQASystem
from .conversation_store import ConversationStore

logger = logging.getLogger(__name__)


@dataclass
class QueryResult:
    """Result of processing a natural language query."""
    answer: str
    sources: list
    language: str
    confidence: float
    processing_time: float
    error: Optional[str] = None


class QueryProcessor:
    """Process natural language queries through the RAG system."""

    def __init__(
        self,
        qa_system: MultilingualQASystem,
        conversation_store: ConversationStore
    ):
        """
        Initialize the query processor.

        Args:
            qa_system: Initialized MultilingualQASystem instance
            conversation_store: ConversationStore for history tracking
        """
        self.qa_system = qa_system
        self.conversation_store = conversation_store

    async def process(
        self,
        query: str,
        language: str = "auto",
        user_id: str = "cli_user"
    ) -> QueryResult:
        """
        Process a natural language query.

        Args:
            query: User's query text
            language: Preferred language (or "auto" for detection)
            user_id: User identifier for tracking

        Returns:
            QueryResult with answer and metadata
        """
        start_time = time.time()

        try:
            # Validate query
            if not query or not query.strip():
                return QueryResult(
                    answer="Please provide a question.",
                    sources=[],
                    language=language if language != "auto" else "en",
                    confidence=0.0,
                    processing_time=0.0,
                    error="Empty query"
                )

            query = query.strip()

            # Validate language
            valid_languages = ['en', 'hi', 'sa', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'auto']
            if language not in valid_languages:
                logger.warning(f"Invalid language '{language}', defaulting to 'en'")
                language = "en"

            # Get conversation context
            context = self.conversation_store.get_context_window()

            # Process query through QA system
            logger.info(f"Processing query: {query[:50]}...")

            # Call QA system
            preferred_lang = language if language != "auto" else "en"
            qa_response = self.qa_system.ask(
                question=query,
                user_id=user_id,
                preferred_language=preferred_lang
            )

            # Extract response data
            answer = qa_response.get("answer", "I apologize, but I couldn't generate a response.")
            sources = qa_response.get("sources", [])
            response_language = qa_response.get("language", preferred_lang)
            confidence = qa_response.get("confidence_score", 0.0)

            processing_time = time.time() - start_time

            # Create result
            result = QueryResult(
                answer=answer,
                sources=sources,
                language=response_language,
                confidence=confidence,
                processing_time=processing_time,
                error=qa_response.get("error")
            )

            # Store exchange in conversation history
            self.conversation_store.add_exchange(
                query=query,
                response=answer,
                language=response_language,
                confidence=confidence,
                processing_time=processing_time
            )

            logger.info(f"Query processed successfully in {processing_time:.2f}s")
            return result

        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"Query processing error: {e}")

            return QueryResult(
                answer="I apologize, but I encountered an error processing your question. Please try again.",
                sources=[],
                language=language if language != "auto" else "en",
                confidence=0.0,
                processing_time=processing_time,
                error=str(e)
            )

    def format_result_for_display(self, result: QueryResult) -> str:
        """
        Format query result for CLI display.

        Args:
            result: QueryResult to format

        Returns:
            Formatted string for display
        """
        if result.error and not result.answer:
            return f"❌ Error: {result.error}"

        output_parts = []

        # Answer
        output_parts.append(f"\n🤖 Krishna:")
        output_parts.append(result.answer)

        # Sources
        if result.sources:
            sources_str = ", ".join(result.sources[:5])  # Show first 5 sources
            output_parts.append(f"\n📚 Sources: {sources_str}")

        # Metadata
        confidence_emoji = "🟢" if result.confidence > 0.7 else "🟡" if result.confidence > 0.5 else "🔴"
        metadata = f"⚡ {confidence_emoji} Confidence: {result.confidence:.2f} | Time: {result.processing_time:.2f}s"
        output_parts.append(metadata)

        return "\n".join(output_parts)
