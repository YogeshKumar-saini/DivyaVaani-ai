"""FastAPI application for the QA system."""

import numpy as np
import pandas as pd
import hashlib
import json
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Dict, Any
from pathlib import Path
from src.config import settings
from src.embeddings import EmbeddingGenerator
from src.vectorstore import FAISSStore, BM25Store
from src.retrieval import HybridRetriever
from src.rag.multilingual_qa_system import MultilingualQASystem
from src.utils.logger import log
from .cache import response_cache, analytics
from .routes.query import router as query_router


# Initialize FastAPI app
app = FastAPI(
    title="Bhagavad Gita QA System",
    description="Question-answering system for Bhagavad Gita using RAG",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
static_path = Path(__file__).parent.parent.parent / "static"
if static_path.exists():
    app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

# Include routers
app.include_router(query_router, prefix="/query", tags=["query"])

# Global variables for loaded models
qa_system = None


def load_system():
    """Load all components of the QA system."""
    global qa_system
    
    if qa_system is not None:
        return
    
    log.info("Loading QA system components...")
    
    try:
        # Load dataframe
        df_path = settings.artifact_path / "verses.parquet"
        df = pd.read_parquet(df_path)
        log.info(f"Loaded {len(df)} verses")
        
        # Load embeddings
        embeddings_path = settings.artifact_path / "embeddings.npy"
        embeddings = np.load(embeddings_path)
        log.info(f"Loaded embeddings with shape {embeddings.shape}")
        
        # Initialize components
        embedding_generator = EmbeddingGenerator(settings.embedding_model)
        embedding_generator.load_model()
        
        faiss_store = FAISSStore(settings.faiss_index_path)
        faiss_store.load()
        
        bm25_store = BM25Store(str(settings.artifact_path / "bm25.pkl"))
        bm25_store.load()
        
        # Create retriever
        retriever = HybridRetriever(
            faiss_store=faiss_store,
            bm25_store=bm25_store,
            embedding_generator=embedding_generator,
            dataframe=df,
            embeddings=embeddings
        )
        
        # Create enhanced multilingual QA system with world-class features
        qa_system = MultilingualQASystem(
            retriever=retriever,
            groq_api_key=settings.groq_api_key,
            temperature=settings.llm_temperature,
            max_tokens=settings.llm_max_tokens,
            enable_caching=True,  # Enable intelligent caching
            cache_size=1000,      # Cache up to 1000 responses
            enable_memory=True,   # Enable conversation memory
            memory_type="summary" # Use summary memory for efficiency
        )
        
        log.info("QA system loaded successfully")
        
    except Exception as e:
        log.error(f"Error loading QA system: {e}")
        raise


@app.on_event("startup")
async def startup_event():
    """Load system on startup."""
    load_system()


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Bhagavad Gita QA System API",
        "version": "1.0.0",
        "description": "An intelligent spiritual companion powered by Bhagavad Gita wisdom",
        "features": [
            "AI-powered responses with spiritual guidance",
            "Multi-language support (English, Hindi, etc.)",
            "Response caching for faster answers",
            "Usage analytics and feedback collection",
            "Comprehensive Bhagavad Gita knowledge base"
        ],
        "endpoints": {
            "GET /web": "Access the web interface",
            "POST /query": "Ask questions about Bhagavad Gita teachings",
            "GET /health": "Check system status",
            "GET /analytics": "View usage statistics",
            "POST /feedback": "Submit feedback and suggestions"
        },
        "stats": analytics.get_stats()
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "system_loaded": qa_system is not None}


@app.get("/web")
async def web_interface():
    """Serve the web interface."""
    return FileResponse(str(static_path / "index.html"), media_type="text/html")


@app.get("/analytics")
async def get_analytics():
    """Get usage analytics."""
    stats = analytics.get_stats()
    cache_stats = response_cache.stats()

    return {
        "analytics": stats,
        "cache": cache_stats,
        "system_info": {
            "version": "1.0.0",
            "model": "llama-3.1-8b-instant",
            "features": ["caching", "analytics", "multilingual"]
        }
    }


@app.post("/feedback")
async def submit_feedback(feedback: Dict[str, Any]):
    """Submit user feedback."""
    # In a real implementation, this would store feedback in a database
    log.info(f"Feedback received: {feedback}")
    return {"message": "Thank you for your feedback!", "status": "received"}





if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.api.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=False  # Disable reload to prevent hanging
    )
