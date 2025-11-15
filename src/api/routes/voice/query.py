"""Voice query API routes - speech-to-speech processing."""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import Optional
import time
import io

from src.core.exceptions import APIError
from src.services.voice_service import VoiceService

router = APIRouter(tags=["voice-query"])


@router.post("/", response_class=FileResponse)
async def voice_query(
    audio_file: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
    input_language: Optional[str] = Form("auto"),
    output_language: Optional[str] = Form("auto"),
    voice: Optional[str] = Form("default")
):
    """Process voice query: speech-to-text, QA, text-to-speech.

    Accepts audio file, returns audio response.
    """
    start_time = time.time()

    try:
        # Validate audio file
        if not audio_file.filename.lower().endswith(('.wav', '.mp3', '.m4a', '.flac', '.webm')):
            raise APIError("INVALID_AUDIO_FORMAT", "Supported formats: WAV, MP3, M4A, FLAC, WEBM", 400)

        # Read audio data
        audio_data = await audio_file.read()

        # Process through voice service
        voice_service = VoiceService()
        result = await voice_service.process_voice_query(
            audio_data=audio_data,
            user_id=user_id,
            input_language=input_language,
            output_language=output_language,
            voice=voice
        )

        # Save audio to temporary file
        import tempfile
        import os

        with tempfile.NamedTemporaryFile(mode='wb', suffix='.mp3', delete=False) as temp_file:
            temp_file.write(result["audio_data"])
            temp_path = temp_file.name

        # Sanitize header values to prevent HTTP header errors
        import urllib.parse

        transcription_text = result.get("transcription", {}).get("text", "")
        response_text = result.get("response_text", "")

        # URL encode to handle special characters and newlines
        safe_transcription = urllib.parse.quote(transcription_text, safe='')
        safe_response_text = urllib.parse.quote(response_text, safe='')

        # Return audio response
        return FileResponse(
            path=temp_path,
            media_type="audio/mpeg",
            filename="response.mp3",
            headers={
                "X-Processing-Time": str(time.time() - start_time),
                "X-Transcription": safe_transcription,
                "X-Response-Text": safe_response_text
            },
            background=lambda: os.unlink(temp_path)  # Cleanup after sending
        )

    except APIError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice processing failed: {str(e)}")


@router.post("/stream")
async def voice_query_stream(
    audio_file: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
    input_language: Optional[str] = Form("auto"),
    output_language: Optional[str] = Form("auto"),
    voice: Optional[str] = Form("default")
):
    """Streaming voice query processing (future implementation)."""
    raise HTTPException(status_code=501, detail="Streaming not yet implemented")
