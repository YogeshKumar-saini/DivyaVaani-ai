"""Query API routes."""

from fastapi import APIRouter, HTTPException
from src.utils.logger import log
from src.api.cache import response_cache, analytics
from ..models import QuestionRequest, AnswerResponse
import time

# qa_system will be accessed dynamically to avoid circular imports

router = APIRouter(tags=["query"])


@router.post("/", response_model=AnswerResponse)
async def query(request: QuestionRequest):
    """Query endpoint for asking questions."""
    start_time = time.time()

    # Import qa_system dynamically to avoid circular imports
    from src.api.main import qa_system

    if qa_system is None:
        analytics.track_error()
        raise HTTPException(
            status_code=503,
            detail="The Bhagavad Gita QA system is currently loading. Please try again in a moment."
        )

    if not request.question.strip():
        analytics.track_error()
        raise HTTPException(
            status_code=400,
            detail="Please provide a question about the Bhagavad Gita. Your question cannot be empty."
        )

    try:
        # Check cache first
        cached_result = response_cache.get(request.question)
        if cached_result:
            response_time = time.time() - start_time
            analytics.track_query(request.user_id, request.question, response_time, cached=True)
            return cached_result

        # Generate new response with auto-detected language (if preferred_language is None)
        result = qa_system.ask(request.question, request.user_id, request.preferred_language)
        
        # Cache the result
        response_cache.set(request.question, result)

        # Track analytics
        response_time = time.time() - start_time
        analytics.track_query(request.user_id, request.question, response_time, cached=False)

        return result
    except Exception as e:
        analytics.track_error()
        log.error(f"Error processing query: {e}")
        # Provide a user-friendly error message
        raise HTTPException(
            status_code=500,
            detail="I'm experiencing some technical difficulties right now. Please try your question again, or rephrase it if possible."
        )
