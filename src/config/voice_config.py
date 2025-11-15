"""Voice processing configuration."""

from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class VoiceConfig(BaseSettings):
    """Configuration for voice processing."""

    # STT settings
    stt_provider: str = Field(default="google", description="Speech-to-text provider")
    stt_api_key: Optional[str] = Field(default=None, description="STT API key")

    # TTS settings
    tts_provider: str = Field(default="google", description="Text-to-speech provider")
    tts_api_key: Optional[str] = Field(default=None, description="TTS API key")

    # Audio settings
    max_audio_size: int = Field(default=10 * 1024 * 1024, description="Max audio file size in bytes")
    supported_audio_formats: List[str] = Field(
        default=["wav", "mp3", "m4a", "flac", "ogg"],
        description="Supported audio formats"
    )

    # Voice settings
    default_voice: str = Field(default="default", description="Default voice")
    default_speed: float = Field(default=1.0, description="Default speech speed")

    # LiveKit Voice Agent settings
    livekit_url: Optional[str] = Field(default=None, description="LiveKit server URL")
    livekit_api_key: Optional[str] = Field(default=None, description="LiveKit API key")
    livekit_api_secret: Optional[str] = Field(default=None, description="LiveKit API secret")
    cartesia_api_key: Optional[str] = Field(default=None, description="Cartesia TTS API key")
    stt_model: str = Field(default="whisper-1", description="Speech-to-text model")
    tts_voice: str = Field(default="bf0a246a-8642-498a-9950-80c35e9276b5", description="TTS voice ID")

    class Config:
        env_prefix = "VOICE_"
