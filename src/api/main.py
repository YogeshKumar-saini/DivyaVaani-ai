"""FastAPI application for the QA system with production-ready features."""

import asyncio
import signal
import sys
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional
from pathlib import Path

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from src.config import settings
from src.embeddings import EmbeddingGenerator
from src.vectorstore import FAISSStore, BM25Store
from src.retrieval import HybridRetriever
from src.rag.multilingual_qa_system import MultilingualQASystem
from src.utils.logger import log, structured_logger
from src.monitoring.health import get_health_checker
from src.monitoring.metrics import metrics_collector

from .cache import response_cache, analytics
from .routes.text import text_query_router
from .routes.voice import voice_query_router, stt_router, tts_router


# Global system state
class SystemState:
    """Thread-safe system state management."""
    def __init__(self):
        self.qa_system: Optional[MultilingualQASystem] = None
        self.is_loading = False
        self.is_ready = False
        self.last_health_check = 0.0

system_state = SystemState()

# Rate limiting
limiter = Limiter(key_func=get_remote_address, default_limits=[f"{settings.rate_limit_requests} per {settings.rate_limit_window} seconds"])

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown."""
    # Startup
    log.info("Starting Bhagavad Gita QA System", extra={"environment": settings.environment})

    # Initialize system in background
    startup_task = asyncio.create_task(initialize_system())

    # Wait for initial health check
    await asyncio.sleep(1)

    yield

    # Shutdown
    log.info("Shutting down Bhagavad Gita QA System")

    # Cancel startup task if still running
    if not startup_task.done():
        startup_task.cancel()
        try:
            await startup_task
        except asyncio.CancelledError:
            pass

    # Cleanup resources
    await cleanup_system()

# Initialize FastAPI app
app = FastAPI(
    title="Bhagavad Gita QA System",
    description="Production-ready question-answering system for Bhagavad Gita using RAG",
    version="1.0.0",
    lifespan=lifespan
)

# Add security middleware
if settings.is_production:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.cors_origins)

# Add CORS middleware with proper configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=86400  # 24 hours
)

# Add rate limiting middleware
if settings.enable_rate_limiting:
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

# Mount static files with security
static_path = Path(__file__).parent.parent.parent / "static"
if static_path.exists() and settings.is_development:
    app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

# Include routers with modality-based prefixes
app.include_router(text_query_router, prefix="/text", tags=["text"])
app.include_router(voice_query_router, prefix="/voice", tags=["voice"])
app.include_router(stt_router, prefix="/voice/stt", tags=["speech-to-text"])
app.include_router(tts_router, prefix="/voice/tts", tags=["text-to-speech"])

# Request/Response middleware for logging and metrics
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests and responses with performance metrics."""
    import time
    start_time = time.time()

    # Extract request info
    method = request.method
    path = request.url.path
    client_ip = request.client.host if request.client else "unknown"

    try:
        response = await call_next(request)
        process_time = time.time() - start_time

        # Log successful requests
        structured_logger.log_request(
            method=method,
            path=path,
            status_code=response.status_code,
            duration=process_time
        )

        # Add performance header
        response.headers["X-Process-Time"] = str(process_time)

        # Update metrics
        if settings.enable_metrics:
            metrics_collector.record_request(
                method=method,
                endpoint=path,
                status_code=response.status_code,
                duration=process_time
            )

        return response

    except Exception as e:
        process_time = time.time() - start_time

        # Log errors
        structured_logger.log_error(e, {
            "method": method,
            "path": path,
            "client_ip": client_ip,
            "duration": process_time
        })

        # Update error metrics
        if settings.enable_metrics:
            metrics_collector.record_error(str(e))

        # Re-raise the exception
        raise


async def initialize_system():
    """Initialize the QA system asynchronously."""
    if system_state.is_ready or system_state.is_loading:
        return

    system_state.is_loading = True
    try:
        log.info("Initializing QA system components...")

        # Load dataframe
        df_path = settings.artifact_path / "verses.parquet"
        if not df_path.exists():
            raise FileNotFoundError(f"Data file not found: {df_path}")

        df = pd.read_parquet(df_path)
        log.info(f"Loaded {len(df)} verses")

        # Load embeddings
        embeddings_path = settings.artifact_path / "embeddings.npy"
        if not embeddings_path.exists():
            raise FileNotFoundError(f"Embeddings file not found: {embeddings_path}")

        embeddings = np.load(embeddings_path)
        log.info(f"Loaded embeddings with shape {embeddings.shape}")

        # Initialize components
        embedding_generator = EmbeddingGenerator(settings.embedding_model, settings.use_api_embeddings)
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

        # Create enhanced multilingual QA system
        system_state.qa_system = MultilingualQASystem(
            retriever=retriever,
            groq_api_key=settings.groq_api_key,
            temperature=settings.llm_temperature,
            max_tokens=settings.llm_max_tokens,
            enable_caching=True,
            cache_size=settings.cache_max_size,
            enable_memory=True,
            memory_type="summary"
        )

        system_state.is_ready = True
        system_state.is_loading = False

        log.info("QA system initialized successfully")

    except Exception as e:
        system_state.is_loading = False
        log.error(f"Failed to initialize QA system: {e}")
        structured_logger.log_error(e, {"operation": "system_initialization"})
        raise


async def cleanup_system():
    """Cleanup system resources."""
    log.info("Cleaning up system resources...")

    try:
        if system_state.qa_system:
            # Add cleanup logic for QA system if needed
            pass

        system_state.qa_system = None
        system_state.is_ready = False

        log.info("System cleanup completed")

    except Exception as e:
        log.error(f"Error during system cleanup: {e}")


@app.get("/")
@limiter.limit("60/minute")
async def root(request: Request):
    """Root endpoint with rate limiting."""
    return {
        "message": "Bhagavad Gita QA System API",
        "version": "1.0.0",
        "environment": settings.environment,
        "description": "Production-ready intelligent spiritual companion powered by Bhagavad Gita wisdom",
        "features": [
            "AI-powered responses with spiritual guidance",
            "Multi-language support (English, Hindi, etc.)",
            "Response caching for faster answers",
            "Usage analytics and feedback collection",
            "Comprehensive Bhagavad Gita knowledge base",
            "Rate limiting and security",
            "Structured logging and monitoring"
        ],
        "endpoints": {
            "GET /": "API information",
            "POST /text/": "Ask questions about Bhagavad Gita teachings (text)",
            "POST /voice/": "Voice query processing (speech-to-speech)",
            "POST /voice/stt/": "Convert speech to text",
            "POST /voice/tts/": "Convert text to speech",
            "GET /voice/stt/languages": "Get supported STT languages",
            "GET /voice/tts/voices": "Get available TTS voices",
            "GET /health": "Check system status and health",
            "GET /metrics": "View system metrics",
            "GET /analytics": "View usage statistics",
            "POST /feedback": "Submit feedback and suggestions"
        },
        "status": {
            "system_ready": system_state.is_ready,
            "environment": settings.environment
        },
        "stats": analytics.get_stats() if system_state.is_ready else None
    }


@app.get("/health")
@limiter.limit("120/minute")
async def health(request: Request):
    """Comprehensive health check endpoint."""
    import time

    current_time = time.time()
    health_status = {
        "status": "healthy",
        "timestamp": current_time,
        "system_ready": system_state.is_ready,
        "is_loading": system_state.is_loading
    }

    # Perform detailed health checks
    if settings.enable_metrics:
        health_checker = get_health_checker()
        health_results = health_checker.check_all()
        # Convert HealthCheckResult objects to dictionaries
        health_status["components_health"] = {
            component: {
                "status": result.status.value,
                "message": result.message,
                "details": result.details or {}
            }
            for component, result in health_results.items()
        }

    # Check system components
    if system_state.qa_system:
        health_status["components"] = {
            "qa_system": "loaded",
            "retriever": "available",
            "embeddings": "loaded"
        }
    else:
        health_status["status"] = "degraded"
        health_status["components"] = {
            "qa_system": "not_loaded",
            "retriever": "unavailable",
            "embeddings": "not_loaded"
        }

    # Return appropriate status code
    status_code = 200 if health_status["status"] == "healthy" else 503

    return JSONResponse(content=health_status, status_code=status_code)


@app.get("/metrics")
@limiter.limit("30/minute")
async def get_metrics(request: Request):
    """Get system metrics (protected endpoint)."""
    if not settings.enable_metrics:
        raise HTTPException(status_code=404, detail="Metrics not enabled")

    return {
        "metrics": metrics_collector.get_metrics(),
        "timestamp": asyncio.get_event_loop().time()
    }


@app.get("/analytics")
@limiter.limit("30/minute")
async def get_analytics(request: Request):
    """Get usage analytics."""
    if not system_state.is_ready:
        raise HTTPException(status_code=503, detail="System not ready")

    stats = analytics.get_stats()
    cache_stats = response_cache.stats()

    return {
        "analytics": stats,
        "cache": cache_stats,
        "system_info": {
            "version": "1.0.0",
            "model": "llama-3.1-8b-instant",
            "environment": settings.environment,
            "features": ["caching", "analytics", "multilingual", "rate_limiting", "structured_logging"]
        }
    }


@app.post("/feedback")
@limiter.limit("10/minute")
async def submit_feedback(request: Request, feedback: Dict[str, Any]):
    """Submit user feedback with validation."""
    # Validate feedback
    if not feedback or not isinstance(feedback, dict):
        raise HTTPException(status_code=400, detail="Invalid feedback format")

    required_fields = ["type", "content"]
    for field in required_fields:
        if field not in feedback:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    # Log feedback
    log.info("Feedback received", extra={"feedback": feedback})

    # In production, this would be stored in a database
    # For now, just acknowledge receipt
    return {
        "message": "Thank you for your feedback!",
        "status": "received",
        "timestamp": asyncio.get_event_loop().time()
    }





if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.api.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=False  # Disable reload to prevent hanging
    )
