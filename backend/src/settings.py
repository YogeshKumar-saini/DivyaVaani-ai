"""Configuration management using pydantic settings."""

import os
from pathlib import Path
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, model_validator


class Settings(BaseModel):
    """Application settings with validation."""

    # Environment
    app_environment: str = Field(default="development")

    # AWS S3 Settings
    aws_access_key_id: Optional[str] = Field(default_factory=lambda: os.getenv("AWS_ACCESS_KEY_ID"))
    aws_secret_access_key: Optional[str] = Field(default_factory=lambda: os.getenv("AWS_SECRET_ACCESS_KEY"))
    aws_region: str = Field(default_factory=lambda: os.getenv("AWS_REGION", "us-east-1"))
    s3_bucket_name: str = Field(default_factory=lambda: os.getenv("S3_BUCKET_NAME", "divyawaani"))

    # API Keys with validation
    groq_api_key: Optional[str] = Field(default_factory=lambda: os.getenv("GROQ_API_KEY"))
    gemini_api_key: Optional[str] = Field(default_factory=lambda: os.getenv("GEMINI_API_KEY"))
    openai_api_key: Optional[str] = Field(default_factory=lambda: os.getenv("OPENAI_API_KEY"))
    deepgram_api_key: Optional[str] = Field(default_factory=lambda: os.getenv("DEEPGRAM_API_KEY"))
    cohere_api_key: Optional[str] = Field(default_factory=lambda: os.getenv("COHERE_API_KEY"))
    huggingface_api_key: Optional[str] = Field(default_factory=lambda: os.getenv("HUGGINGFACE_API_KEY"))

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
    api_port: int = Field(default_factory=lambda: int(os.getenv("API_PORT", 8000)), ge=1, le=65535)

    # Pinecone Vector Store
    pinecone_api_key: Optional[str] = Field(default=None)
    pinecone_index_name: str = Field(default="divyavaani-verses")
    pinecone_cloud: str = Field(default="aws")
    pinecone_region: str = Field(default="us-east-1")

    # Security
    cors_origins: List[str] = Field(
        default_factory=lambda: os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8081,http://127.0.0.1:8081,http://localhost:19006,http://127.0.0.1:19006,https://divya-vaani-ai.vercel.app",
        ).split(",")
    )
    
    # Auth
    secret_key: str = Field(default="09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=30)
    google_client_id: Optional[str] = Field(default_factory=lambda: os.getenv("GOOGLE_CLIENT_ID") or "8832500585-r2p759jqaka789gr0v2l3dnahs2rpc8c.apps.googleusercontent.com")

    enable_rate_limiting: bool = Field(default=True)
    rate_limit_requests: int = Field(default=100, ge=1)
    rate_limit_window: int = Field(default=60, ge=1)

    # Email Settings  (reads SMTP_* first, falls back to MAIL_* for compatibility)
    mail_username: Optional[str] = Field(
        default_factory=lambda: os.getenv("SMTP_USER") or os.getenv("MAIL_USERNAME")
    )
    mail_password: Optional[str] = Field(
        default_factory=lambda: os.getenv("SMTP_PASS") or os.getenv("MAIL_PASSWORD")
    )
    mail_from: Optional[str] = Field(
        default_factory=lambda: (
            os.getenv("EMAIL_FROM") or os.getenv("MAIL_FROM")
        )
    )
    mail_port: int = Field(
        default_factory=lambda: int(
            os.getenv("SMTP_PORT") or os.getenv("MAIL_PORT") or 587
        )
    )
    mail_server: Optional[str] = Field(
        default_factory=lambda: os.getenv("SMTP_HOST") or os.getenv("MAIL_SERVER")
    )
    mail_starttls: bool = Field(
        default_factory=lambda: (
            os.getenv("MAIL_STARTTLS", "true").lower() == "true"
        )
    )
    mail_ssl_tls: bool = Field(
        default_factory=lambda: (
            os.getenv("MAIL_SSL_TLS", "false").lower() == "true"
        )
    )
    use_credentials: bool = Field(
        default_factory=lambda: (
            os.getenv("USE_CREDENTIALS", "true").lower() == "true"
        )
    )
    validate_certs: bool = Field(
        default_factory=lambda: (
            os.getenv("VALIDATE_CERTS", "true").lower() == "true"
        )
    )
    # Derived: sender display name for emails
    email_from_name: str = Field(
        default_factory=lambda: os.getenv("EMAIL_FROM_NAME", "Kirata")
    )

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
    next_public_api_base_url: str = Field(default="http://localhost:8000")
    frontend_url: str = Field(default="http://localhost:3000")

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
    
    # robustly load .env from project root or backend directory
    # Current file is in backend/src/settings.py
    # .env is in backend/.env
    current_dir = Path(__file__).resolve().parent
    backend_dir = current_dir.parent
    env_path = backend_dir / ".env"
    
    # Load env file with override=True to ensure file values take precedence
    load_dotenv(dotenv_path=env_path, override=True)
    
    # Double check if GOOGLE_CLIENT_ID is loaded
    if not os.getenv("GOOGLE_CLIENT_ID"):
        print(f"WARNING: GOOGLE_CLIENT_ID not found in environment. Checked path: {env_path}")
    else:
        print(f"Configuration loaded. Google Client ID: ...{os.getenv('GOOGLE_CLIENT_ID')[-10:] if os.getenv('GOOGLE_CLIENT_ID') else 'None'}")

    settings = Settings()
    settings.ensure_directories()
    settings.validate_api_keys()

except Exception as e:
    print(f"Configuration error: {e}")
    raise
