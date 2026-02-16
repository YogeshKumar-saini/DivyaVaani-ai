"""API models and schemas."""

from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime


class QuestionRequest(BaseModel):
    """Question request model."""
    user_id: str = "default"
    question: str
    preferred_language: Optional[str] = None  # Auto-detect if not provided


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

# Authentication Models

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: str
    is_active: bool
    is_email_verified: bool
    subscription_type: str
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None
    email: Optional[str] = None
