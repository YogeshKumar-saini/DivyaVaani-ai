"""Text processing configuration."""

from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class TextConfig(BaseSettings):
    """Configuration for text processing."""

    # Query validation
    min_question_length: int = Field(default=3, description="Minimum question length")
    max_question_length: int = Field(default=1000, description="Maximum question length")

    # Supported languages
    supported_languages: List[str] = Field(
        default=["en", "hi", "bn", "te", "ta", "mr", "gu", "kn", "ml", "pa", "or"],
        description="Supported languages for text processing"
    )

    # Response settings
    max_response_length: int = Field(default=2000, description="Maximum response length")
    default_language: str = Field(default="en", description="Default response language")

    # Cache settings
    cache_ttl: int = Field(default=3600, description="Cache TTL in seconds")

    class Config:
        env_prefix = "TEXT_"
