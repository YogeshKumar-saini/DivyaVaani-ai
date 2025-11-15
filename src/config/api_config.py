"""API configuration."""

from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class APIConfig(BaseSettings):
    """Configuration for API settings."""

    # Rate limiting
    rate_limit_requests: int = Field(default=100, description="Requests per window")
    rate_limit_window: int = Field(default=60, description="Rate limit window in seconds")

    # CORS
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8000"],
        description="Allowed CORS origins"
    )

    # Server
    host: str = Field(default="0.0.0.0", description="API host")
    port: int = Field(default=8000, description="API port")

    # Features
    enable_metrics: bool = Field(default=True, description="Enable metrics collection")
    enable_rate_limiting: bool = Field(default=True, description="Enable rate limiting")
    is_production: bool = Field(default=False, description="Production mode")
    is_development: bool = Field(default=True, description="Development mode")

    class Config:
        env_prefix = "API_"
