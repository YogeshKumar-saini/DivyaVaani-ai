"""Configuration management using pydantic settings."""

import os
from pathlib import Path
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, model_validator


class Settings(BaseModel):
    """Application settings with validation."""

    # Environment
    app_environment: str = Field(default="development")

    # API Keys with validation
    groq_api_key: Optional[str] = Field(default=None)
    gemini_api_key: Optional[str] = Field(default=None)
    openai_api_key: Optional[str] = Field(default=None)
    deepgram_api_key: Optional[str] = Field(default=None)
    cohere_api_key: Optional[str] = Field(default=None)
    huggingface_api_key: Optional[str] = Field(default=None)

    # Paths
    data_path: str = Field(default="data/bhagavad_gita.csv")
    artifact_dir: str = Field(default="artifacts")
    log_dir: str = Field(default="logs")

    # Models
    embedding_model: str = Field(
        default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )
    use_api_embeddings: bool = Field(default=False)
    llm_temperature: float = Field(default=0.3, ge=0.0, le=2.0)
    llm_max_tokens: int = Field(default=500, ge=1, le=4096)

    # Vector stores
    api_host: str = Field(default="0.0.0.0")
    api_port: int = Field(default=5001, ge=1, le=65535)

    # Pinecone Vector Store
    pinecone_api_key: Optional[str] = Field(default=None)
    pinecone_index_name: str = Field(default="divyavaani-verses")
    pinecone_cloud: str = Field(default="aws")
    pinecone_region: str = Field(default="us-east-1")

    # Security
    cors_origins: List[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    enable_rate_limiting: bool = Field(default=True)
    rate_limit_requests: int = Field(default=100, ge=1)
    rate_limit_window: int = Field(default=60, ge=1)

    # Caching
    cache_ttl: int = Field(default=3600, ge=60)
    cache_max_size: int = Field(default=1000, ge=10)

    # Logging
    log_level: str = Field(default="INFO")
    enable_structured_logging: bool = Field(default=True)

    # Monitoring
    enable_metrics: bool = Field(default=True)
    metrics_port: int = Field(default=9090, ge=1, le=65535)

    # Frontend
    next_public_api_base_url: str = Field(default="http://localhost:5001")

    # LiveKit Voice Agent Configuration
    livekit_url: Optional[str] = Field(default=None, description="LiveKit server URL")
    livekit_api_key: Optional[str] = Field(default=None, description="LiveKit API key")
    livekit_api_secret: Optional[str] = Field(default=None, description="LiveKit API secret")

    # Cartesia TTS
    cartesia_api_key: Optional[str] = Field(default=None, description="Cartesia TTS API key")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore",
    }

    @model_validator(mode='before')
    @classmethod
    def parse_cors_origins(cls, values):
        """Parse CORS origins from comma-separated string."""
        if isinstance(values.get('cors_origins'), str):
            values['cors_origins'] = [origin.strip() for origin in values['cors_origins'].split(',')]
        return values

    @field_validator('app_environment')
    @classmethod
    def validate_environment(cls, v):
        """Validate environment value."""
        allowed = ['development', 'staging', 'production']
        if v.lower() not in allowed:
            raise ValueError(f'Environment must be one of: {allowed}')
        return v.lower()

    @field_validator('log_level')
    @classmethod
    def validate_log_level(cls, v):
        """Validate log level."""
        allowed = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if v.upper() not in allowed:
            raise ValueError(f'Log level must be one of: {allowed}')
        return v.upper()

    @property
    def artifact_path(self) -> Path:
        """Get artifact directory as Path object."""
        return Path(self.artifact_dir)

    @property
    def environment(self) -> str:
        """Get environment value."""
        return self.app_environment

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.app_environment == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development."""
        return self.app_environment == "development"

    def ensure_directories(self):
        """Create necessary directories."""
        directories = [
            self.artifact_path,
            Path(self.log_dir),
            Path("cache"),
            Path("cache/embeddings")
        ]

        for directory in directories:
            directory.mkdir(exist_ok=True, parents=True)

    def validate_api_keys(self):
        """Validate that required API keys are present."""
        if self.use_api_embeddings:
            if not any([self.openai_api_key, self.cohere_api_key, self.huggingface_api_key]):
                raise ValueError("API embeddings enabled but no API key provided (OpenAI, Cohere, or Hugging Face)")

        # In production, require at least one LLM API key
        if self.is_production and not self.groq_api_key:
            raise ValueError("Production environment requires Groq API key")


# Initialize settings with validation
try:
    from dotenv import load_dotenv
    load_dotenv()

    settings = Settings()
    settings.ensure_directories()
    settings.validate_api_keys()

except Exception as e:
    print(f"Configuration error: {e}")
    raise
