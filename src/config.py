"""Configuration management using pydantic settings."""

from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings."""
    
    # Groq
    groq_api_key: str = Field(default="", env="GROQ_API_KEY")

    # Gemini
    gemini_api_key: str = Field(default="", env="GEMINI_API_KEY")


    # Paths
    data_path: str = Field(default="data/bhagavad_gita.csv", env="DATA_PATH")
    artifact_dir: str = Field(default="artifacts", env="ARTIFACT_DIR")
    
    # Models
    embedding_model: str = Field(
        default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        env="EMBEDDING_MODEL"
    )
    llm_temperature: float = Field(default=0.3, env="LLM_TEMPERATURE")
    llm_max_tokens: int = Field(default=500, env="LLM_MAX_TOKENS")
    
    # Vector stores
    chroma_persist_dir: str = Field(default="artifacts/chroma", env="CHROMA_PERSIST_DIR")
    faiss_index_path: str = Field(default="artifacts/faiss.index", env="FAISS_INDEX_PATH")
    
    # Retrieval
    bm25_top_k: int = Field(default=30, env="BM25_TOP_K")
    faiss_top_k: int = Field(default=30, env="FAISS_TOP_K")
    hybrid_top_k: int = Field(default=8, env="HYBRID_TOP_K")
    
    # API
    api_host: str = Field(default="0.0.0.0", env="API_HOST")
    api_port: int = Field(default=8000, env="API_PORT")

    # Frontend
    next_public_api_base_url: str = Field(default="http://localhost:8000", env="NEXT_PUBLIC_API_BASE_URL")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    @property
    def artifact_path(self) -> Path:
        """Get artifact directory as Path object."""
        return Path(self.artifact_dir)
    
    def ensure_directories(self):
        """Create necessary directories."""
        self.artifact_path.mkdir(exist_ok=True, parents=True)
        Path(self.chroma_persist_dir).mkdir(exist_ok=True, parents=True)


settings = Settings()
