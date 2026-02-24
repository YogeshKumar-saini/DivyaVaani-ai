"""Text-to-speech API routes."""

from fastapi import APIRouter, HTTPException, Form
from fastapi.responses import FileResponse
from typing import Optional
import time
import io

from src.core.exceptions import APIError
from src.services.voice_service import VoiceService

router = APIRouter(tags=["text-to-speech"])


@router.post("", response_class=FileResponse)
async def text_to_speech(
    text: str = Form(..., min_length=1, max_length=5000),
    language: Optional[str] = Form("en"),
    voice: Optional[str] = Form("default"),
    speed: Optional[float] = Form(1.0),
    user_id: Optional[str] = Form(None)
):
    """Convert text to speech audio.

    Accepts text, returns audio file.
    """
    start_time = time.time()

    try:
        # Validate inputs
        if speed < 0.5 or speed > 2.0:
            raise APIError("INVALID_SPEED", "Speed must be between 0.5 and 2.0", 400)

        # Process through voice service
        voice_service = VoiceService()
        result = await voice_service.text_to_speech(
            text=text,
            language=language,
            voice=voice,
            speed=speed,
            user_id=user_id
        )

        # Save audio to temporary file
        import tempfile
        import os

        audio_format = result.get('format', 'mp3')
        media_type_map = {
            "mp3": "audio/mpeg",
            "wav": "audio/wav",
            "ogg": "audio/ogg",
            "webm": "audio/webm",
            "m4a": "audio/mp4",
            "mp4": "audio/mp4",
        }
        media_type = media_type_map.get(audio_format.lower(), "application/octet-stream")
        with tempfile.NamedTemporaryFile(mode='wb', suffix=f'.{audio_format}', delete=False) as temp_file:
            temp_file.write(result["audio_data"])
            temp_path = temp_file.name

        # Return audio response
        from starlette.background import BackgroundTask
        return FileResponse(
            path=temp_path,
            media_type=media_type,
            filename=f"tts_output.{audio_format}",
            headers={
                "X-Processing-Time": str(time.time() - start_time),
                "X-Text-Length": str(len(text)),
                "X-Language": language,
                "X-Voice": voice
            },
            background=BackgroundTask(os.unlink, temp_path)  # Cleanup after sending
        )

    except APIError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text-to-speech failed: {str(e)}")


@router.get("/voices")
async def get_available_voices(language: Optional[str] = None):
    """Get list of available voices, optionally filtered by language."""
    voice_service = VoiceService()
    voices = voice_service.get_available_voices(language)
    return {
        "voices": voices,
        "supported_languages": voice_service.get_tts_languages(),
        "supported_formats": voice_service.get_tts_formats()
    }


@router.get("/voices/{language}")
async def get_voices_for_language(language: str):
    """Get available voices for a specific language."""
    voice_service = VoiceService()
    voices = voice_service.get_available_voices(language)
    return {
        "language": language,
        "voices": voices
    }
