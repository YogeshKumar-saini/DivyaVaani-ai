"""Voice processing service layer."""

from typing import Optional, Dict, Any, List
import time

from src.core.exceptions import APIError, ProcessingError, ValidationError
from src.rag.voice.speech_to_text import SpeechToTextProcessor
from src.rag.voice.text_to_speech import TextToSpeechProcessor
from src.rag.voice.voice_processor import VoiceProcessor
from src.services.text_service import TextService


class VoiceService:
    """Service layer for voice-based operations."""

    def __init__(
        self,
        stt_provider: str = "groq_whisper",
        tts_provider: str = "gtts",  # gTTS: free, lightweight, Python 3.12 compatible
        stt_api_key: Optional[str] = None,
        tts_api_key: Optional[str] = None
    ):
        self.stt_processor = SpeechToTextProcessor(stt_provider, stt_api_key)
        self.tts_processor = TextToSpeechProcessor(tts_provider, tts_api_key)
        self._voice_processor = None
        self._voice_processor_params = {
            'stt_provider': stt_provider,
            'tts_provider': tts_provider,
            'stt_api_key': stt_api_key,
            'tts_api_key': tts_api_key
        }
        self.text_service = TextService()

    @property
    def voice_processor(self):
        """Lazy initialization of voice processor."""
        if self._voice_processor is None:
            try:
                self._voice_processor = VoiceProcessor(**self._voice_processor_params)
            except Exception as e:
                # Log the error but don't fail - we can still use STT/TTS directly
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Voice processor initialization failed, using STT/TTS directly: {e}")
                self._voice_processor = None
        return self._voice_processor

    async def process_voice_query(
        self,
        audio_data: bytes,
        user_id: Optional[str] = None,
        input_language: str = "auto",
        output_language: str = "auto",
        voice: str = "default"
    ) -> Dict[str, Any]:
        """Process complete voice query: STT → QA → TTS."""
        start_time = time.time()

        try:
            # Step 1: Speech-to-Text (Async)
            transcription = await self.stt_processor.transcribe_audio(audio_data, input_language)

            # Debug logging
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Transcription result: {transcription}")
            logger.info(f"Transcription text: '{transcription.get('text')}'")
            logger.info(f"Transcription text type: {type(transcription.get('text'))}")

            if not transcription.get("text"):
                raise ProcessingError("Speech-to-Text", "Failed to transcribe audio")

            query_text = transcription["text"]

            # Step 2: Process text query
            detected_lang = transcription.get("language", input_language)
            qa_result = await self.text_service.process_query(
                question=query_text,
                user_id=user_id,
                preferred_language=output_language if output_language != "auto" else detected_lang
            )

            # Step 3: Text-to-Speech (Async)
            response_text = qa_result["answer"]
            tts_result = await self.tts_processor.synthesize_speech(
                text=response_text,
                language=output_language if output_language != "auto" else detected_lang,
                voice=voice
            )

            if not tts_result.get("audio_data"):
                raise ProcessingError("Text-to-Speech", "Failed to generate audio")

            return {
                "transcription": transcription,
                "query_text": query_text,
                "response_text": response_text,
                "audio_data": tts_result["audio_data"],
                "audio_format": tts_result.get("format", "mp3"),
                "input_language": detected_lang,
                "output_language": output_language if output_language != "auto" else detected_lang,
                "processing_time": time.time() - start_time,
                "confidence": qa_result.get("confidence", 0.8)
            }

        except (APIError, ProcessingError):
            raise
        except Exception as e:
            raise ProcessingError("Voice Query Processing", str(e))

    async def speech_to_text(
        self,
        audio_data: bytes,
        language: str = "auto",
        user_id: Optional[str] = None,
        mimetype: str = "audio/wav"
    ) -> Dict[str, Any]:
        """Convert speech to text only."""
        try:
            result = await self.stt_processor.transcribe_audio(audio_data, language, mimetype)

            if not result.get("text") and not result.get("error"):
                raise ProcessingError("Speech-to-Text", "Transcription failed")

            return result

        except Exception as e:
            raise ProcessingError("Speech-to-Text", str(e))

    async def text_to_speech(
        self,
        text: str,
        language: str = "en",
        voice: str = "default",
        speed: float = 1.0,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Convert text to speech only."""
        try:
            result = await self.tts_processor.synthesize_speech(text, language, voice, speed)

            if not result.get("audio_data") and not result.get("error"):
                raise ProcessingError("Text-to-Speech", "Audio generation failed")

            return result

        except Exception as e:
            raise ProcessingError("Text-to-Speech", str(e))

    def get_stt_languages(self) -> List[str]:
        """Get supported STT languages."""
        return self.stt_processor.get_supported_languages()

    def get_stt_formats(self) -> List[str]:
        """Get supported STT audio formats."""
        return self.stt_processor.get_supported_formats()

    def get_tts_languages(self) -> List[str]:
        """Get supported TTS languages."""
        return self.tts_processor.get_supported_languages()

    def get_tts_formats(self) -> List[str]:
        """Get supported TTS output formats."""
        return self.tts_processor.get_supported_formats()

    def get_available_voices(self, language: Optional[str] = None) -> Dict[str, List[str]]:
        """Get available voices, optionally filtered by language."""
        if language:
            voices = self.tts_processor.get_available_voices(language)
            return {language: voices}
        else:
            # Return voices for common languages
            return {
                lang: self.tts_processor.get_available_voices(lang)
                for lang in ["en", "hi", "sa"]
            }

    async def health_check(self) -> Dict[str, Any]:
        """Check voice service health."""
        # Check if voice processor is available
        voice_processor_available = self.voice_processor is not None

        if voice_processor_available:
            return self.voice_processor.health_check()
        else:
            # Return health status without voice processor
            return {
                "stt_status": "mock_implementation" if self.stt_processor.client is None else "ready",
                "tts_status": "mock_implementation" if self.tts_processor.client is None else "ready",
                "audio_status": "unavailable",
                "audio_recording": False,
                "audio_playback": False,
                "overall_status": "partial"
            }
