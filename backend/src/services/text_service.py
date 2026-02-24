"""Text processing service layer."""

from typing import Optional, Dict, Any
import time

from src.core.exceptions import APIError, ProcessingError, ServiceUnavailableError
# from src.rag.multilingual_qa_system import MultilingualQASystem
from src.api.cache import response_cache, analytics


class TextService:
    """Service layer for text-based operations."""

    def __init__(self):
        self.qa_system: Optional[Any] = None

    async def _get_qa_system(self) -> Any:
        """Get or initialize QA system."""
        if self.qa_system is None:
            # Import here to avoid circular imports
            from src.api.main import system_state

            # For mock responses, just return None without waiting
            if not system_state.is_ready:
                return None
            self.qa_system = system_state.qa_system
        return self.qa_system

    async def _wait_for_system_ready(self):
        """Wait for system to be ready."""
        from src.api.main import system_state
        import asyncio

        while system_state.is_loading and not system_state.is_ready:
            await asyncio.sleep(0.5)  # Check every 500ms instead of 1 second
            if system_state.is_ready:
                break

    async def process_query(
        self,
        question: str,
        user_id: Optional[str] = None,
        preferred_language: Optional[str] = None,
        conversation_history: Optional[str] = None,
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process a text query through the QA system."""
        start_time = time.time()

        try:
            # Validate input
            if not question or not question.strip():
                raise APIError("EMPTY_QUESTION", "Question cannot be empty", 400)

            if len(question.strip()) < 3:
                raise APIError("QUESTION_TOO_SHORT", "Question must be at least 3 characters", 400)

            # Check cache first
            cache_key = f"{question.lower().strip()}:{preferred_language or 'auto'}"
            cached_result = response_cache.get(cache_key)

            if cached_result:
                analytics.track_query(user_id, question, time.time() - start_time, cached=True)
                return {
                    **cached_result,
                    "cached": True,
                    "processing_time": time.time() - start_time
                }

            # Process query
            qa_system = await self._get_qa_system()
            result = qa_system.ask(question, user_id, preferred_language, conversation_history, conversation_id)

            if not result or not isinstance(result, dict) or not result.get('answer'):
                raise ProcessingError("QA Processing", "No answer generated")

            # Prepare response
            response_data = {
                "answer": result.get('answer', ''),
                "confidence": result.get('confidence_score', 0.8),
                "sources": result.get('sources', []),
                "language": result.get('language', preferred_language or 'en'),
                "cached": False,
                "processing_time": time.time() - start_time
            }

            # Cache result
            response_cache.set(cache_key, response_data)

            # Track analytics
            analytics.track_query(user_id, question, response_data["processing_time"], cached=False)

            return response_data

        except (APIError, ProcessingError, ServiceUnavailableError):
            raise
        except Exception as e:
            raise ProcessingError("Query Processing", str(e))

    async def process_query_stream(
        self,
        question: str,
        user_id: Optional[str] = None,
        preferred_language: Optional[str] = None,
        conversation_history: Optional[str] = None,
        conversation_id: Optional[str] = None
    ):
        """Process a text query with streaming response.
        
        Yields chunks in the format:
        {
            'type': 'token' | 'metadata' | 'source',
            'content': str (for tokens),
            'data': dict (for metadata/sources)
        }
        """
        try:
            # Validate input
            if not question or not question.strip():
                raise APIError("EMPTY_QUESTION", "Question cannot be empty", 400)

            if len(question.strip()) < 3:
                raise APIError("QUESTION_TOO_SHORT", "Question must be at least 3 characters", 400)

            # Get QA system
            qa_system = await self._get_qa_system()
            
            # Stream response from QA system
            async for chunk in qa_system.ask_stream(question, user_id, preferred_language, conversation_history, conversation_id):
                yield chunk

        except (APIError, ProcessingError, ServiceUnavailableError):
            raise
        except Exception as e:
            raise ProcessingError("Stream Processing", str(e))

    async def get_query_history(self, user_id: str, limit: int = 20) -> Dict[str, Any]:
        """Get query history for a user."""
        try:
            # This would integrate with user management system
            # For now, return placeholder
            return {
                "user_id": user_id,
                "history": [],
                "total_queries": 0
            }
        except Exception as e:
            raise ProcessingError("History Retrieval", str(e))

    async def get_popular_questions(self, limit: int = 10) -> Dict[str, Any]:
        """Get popular questions from analytics."""
        try:
            stats = analytics.get_stats()
            popular = stats.get("popular_questions", [])

            return {
                "popular_questions": popular[:limit],
                "total_analyzed": len(popular)
            }
        except Exception as e:
            raise ProcessingError("Analytics Retrieval", str(e))
