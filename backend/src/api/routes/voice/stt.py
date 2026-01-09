"""Speech-to-text API routes."""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
import time

from src.core.exceptions import APIError
from src.services.voice_service import VoiceService

router = APIRouter(tags=["speech-to-text"])


@router.post("/")
async def speech_to_text(
    audio_file: UploadFile = File(...),
    language: Optional[str] = Form("auto"),
    user_id: Optional[str] = Form(None)
):
    """Convert speech audio to text.

    Accepts audio file, returns transcription.
    """
    start_time = time.time()

    try:
        # Validate audio file
        if not audio_file.filename.lower().endswith(('.wav', '.mp3', '.m4a', '.flac', '.ogg')):
            raise APIError("INVALID_AUDIO_FORMAT", "Supported formats: WAV, MP3, M4A, FLAC, OGG", 400)

        # Read audio data
        audio_data = await audio_file.read()

        # Process through voice service
        voice_service = VoiceService()
        result = await voice_service.speech_to_text(
            audio_data=audio_data,
            language=language,
            user_id=user_id,
            mimetype=audio_file.content_type or "audio/wav"
        )

        return {
            "text": result["text"],
            "confidence": result["confidence"],
            "language": result["language"],
            "duration": result["duration"],
            "processing_time": time.time() - start_time
        }

    except APIError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech-to-text failed: {str(e)}")


@router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages for speech-to-text."""
    voice_service = VoiceService()
    return {
        "supported_languages": voice_service.get_stt_languages(),
        "supported_formats": voice_service.get_stt_formats()
    }
