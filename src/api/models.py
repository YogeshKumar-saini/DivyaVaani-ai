"""API models and schemas."""

from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime


class QuestionRequest(BaseModel):
    """Question request model."""
    user_id: str = "default"
    question: str
    preferred_language: str = "en"


class ContextResponse(BaseModel):
    """Context response model."""
    idx: int
    score: float
    verse: str
    text: str
    sanskrit: str
    translation: str


class AnswerResponse(BaseModel):
    """Enhanced answer response model with comprehensive metadata."""
    answer: str
    sources: List[str]
    contexts: List[Dict[str, Any]]
    language: str = 'en'
    confidence_score: float = 0.0
    processing_time: float = 0.0
    model_used: str = ""
    token_count: int = 0
    quality_metrics: Dict[str, Any] = {}
    cross_references: List[str] = []
    timestamp: Optional[str] = None
    user_id: str = ""
    question_hash: str = ""
