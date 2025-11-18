"""Voice-based API routes."""

from .query import router as voice_query_router
from .stt import router as stt_router
from .tts import router as tts_router

__all__ = ["voice_query_router", "stt_router", "tts_router"]
