"""Text query API routes with service layer integration."""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field, field_validator
from typing import Optional
import time
import re

from src.core.exceptions import APIError
from src.services.text_service import TextService
from src.utils.logger import log, structured_logger
from src.config import settings


class QuestionRequest(BaseModel):
    """Validated question request model."""
    question: str = Field(..., min_length=1, max_length=1000, description="The question to ask")
    user_id: Optional[str] = Field(None, description="User identifier for analytics")
    preferred_language: Optional[str] = Field(None, description="Preferred response language")

    @field_validator('question')
    @classmethod
    def validate_question(cls, v):
        """Validate and sanitize question."""
        if not v or not v.strip():
            raise ValueError("Question cannot be empty")

        # Remove excessive whitespace
        v = re.sub(r'\s+', ' ', v.strip())

        # Check for potentially harmful content (basic check)
        harmful_patterns = [
            r'<script', r'javascript:', r'on\w+\s*=',
            r'union\s+select', r';\s*drop', r'--', r'/\*.*\*/'
        ]

        for pattern in harmful_patterns:
            if re.search(pattern, v, re.IGNORECASE):
                raise ValueError("Invalid question content")

        return v

    @field_validator('preferred_language')
    @classmethod
    def validate_language(cls, v):
        """Validate preferred language."""
        if v is None:
            return v

        allowed_languages = ['en', 'hi', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml', 'pa', 'or']
        if v.lower() not in allowed_languages:
            raise ValueError(f"Unsupported language. Supported: {', '.join(allowed_languages)}")

        return v.lower()


class AnswerResponse(BaseModel):
    """Structured answer response model."""
    answer: str
    confidence: float
    sources: list
    language: str
    processing_time: float
    cached: bool = False


router = APIRouter(tags=["query"])


@router.post("", response_model=AnswerResponse)
async def query(request: Request, query_req: QuestionRequest):
    """Query endpoint for asking questions with service layer integration."""
    try:
        # Use service layer
        text_service = TextService()
        result = await text_service.process_query(
            question=query_req.question,
            user_id=query_req.user_id,
            preferred_language=query_req.preferred_language
        )

        # Log performance
        structured_logger.log_performance(
            operation="text_query_processing",
            duration=result["processing_time"],
            metadata={
                "question_length": len(query_req.question),
                "response_length": len(result["answer"]),
                "language": query_req.preferred_language,
                "cached": result.get("cached", False)
            }
        )

        return AnswerResponse(**result)

    except APIError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        # Log error with context
        structured_logger.log_error(e, {
            "operation": "text_query_processing",
            "question": query_req.question[:100] + "..." if len(query_req.question) > 100 else query_req.question,
            "user_id": query_req.user_id
        })

        # Provide user-friendly error message
        raise HTTPException(
            status_code=500,
            detail="I'm experiencing some technical difficulties right now. Please try your question again, or rephrase it if possible."
        )
