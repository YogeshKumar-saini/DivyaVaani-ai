"""Main voice processor combining speech-to-text and text-to-speech."""

import logging
import asyncio
from typing import Optional, Dict, Any, Union
from pathlib import Path

from .speech_to_text import SpeechToTextProcessor
from .text_to_speech import TextToSpeechProcessor
from .audio_handler import AudioHandler
from ..multilingual_qa_system import MultilingualQASystem
from ...retrieval import HybridRetriever
from ...embeddings import EmbeddingGenerator
from ...vectorstore import FAISSStore, BM25Store
from ...config import settings
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

# Global QA system instance and initialization status
_qa_system = None
_qa_system_initializing = False
_qa_system_error = None

async def _get_qa_system():
    """Get or initialize QA system with proper error handling."""
    global _qa_system, _qa_system_initializing, _qa_system_error

    # If already initialized, return it
    if _qa_system is not None:
        return _qa_system

    # If initialization failed before, don't retry
    if _qa_system_error is not None:
        logger.warning(f"QA system initialization previously failed: {_qa_system_error}")
        return None

    # If already initializing, wait (though this is simplified)
    if _qa_system_initializing:
        logger.info("QA system initialization already in progress...")
        return None

    _qa_system_initializing = True

    try:
        logger.info("Initializing QA system for voice processing...")

        # Check if artifacts exist
        df_path = settings.artifact_path / "verses.parquet"
        embeddings_path = settings.artifact_path / "embeddings.npy"
        faiss_path = Path(settings.faiss_index_path)
        bm25_path = settings.artifact_path / "bm25.pkl"

        missing_files = []
        if not df_path.exists():
            missing_files.append(str(df_path))
        if not embeddings_path.exists():
            missing_files.append(str(embeddings_path))
        if not faiss_path.exists():
            missing_files.append(str(faiss_path))
        if not bm25_path.exists():
            missing_files.append(str(bm25_path))

        if missing_files:
            error_msg = f"Missing required artifact files: {', '.join(missing_files)}"
            logger.error(error_msg)
            _qa_system_error = error_msg
            return None

        # Load dataframe
        logger.info("Loading verses data...")
        df = pd.read_parquet(df_path)

        # Load embeddings
        logger.info("Loading embeddings...")
        embeddings = np.load(embeddings_path)

        # Initialize components (without loading heavy models for voice processing)
        logger.info("Initializing retriever components...")
        embedding_generator = EmbeddingGenerator(settings.embedding_model, settings.use_api_embeddings)
        # Don't load the model here to avoid delays in voice processing

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

        # Create QA system with minimal initialization
        logger.info("Creating QA system...")
        _qa_system = MultilingualQASystem(
            retriever=retriever,
            groq_api_key=settings.groq_api_key,
            temperature=settings.llm_temperature,
            max_tokens=settings.llm_max_tokens,
            enable_caching=True,
            cache_size=settings.cache_max_size,
            enable_memory=False,  # Disable memory for voice to reduce complexity
            memory_type="summary"
        )

        logger.info("QA system initialized successfully for voice processing")
        return _qa_system

    except Exception as e:
        error_msg = f"Failed to initialize QA system: {str(e)}"
        logger.error(error_msg)
        _qa_system_error = error_msg
        return None
    finally:
        _qa_system_initializing = False

class VoiceProcessor:
    """Main voice processor for voice-to-voice interactions."""

    def __init__(
        self,
        stt_provider: str = "google",
        tts_provider: str = "google",
        stt_api_key: Optional[str] = None,
        tts_api_key: Optional[str] = None
    ):
        self.stt_processor = SpeechToTextProcessor(stt_provider, stt_api_key)
        self.tts_processor = TextToSpeechProcessor(tts_provider, tts_api_key)
        # Initialize audio handler, but don't fail if audio is not available
        try:
            self.audio_handler = AudioHandler(sample_rate=16000, channels=1)
        except Exception as e:
            logger.warning(f"Audio handler initialization failed, using mock: {e}")
            self.audio_handler = None

    async def process_voice_query(
        self,
        audio_data: bytes,
        input_language: str = "auto",
        output_language: str = "auto",
        voice: str = "default"
    ) -> Dict[str, Any]:
        """Process voice query: speech-to-text, process, text-to-speech.

        Args:
            audio_data: Raw audio bytes of the query
            input_language: Language of input speech
            output_language: Language for output speech
            voice: Voice to use for output

        Returns:
            Dict with transcription, response text, and audio data
        """
        try:
            # Step 1: Transcribe speech to text
            transcription = self.stt_processor.transcribe_audio(audio_data, input_language)

            if not transcription.get("text"):
                return {
                    "error": "Failed to transcribe audio",
                    "transcription": transcription
                }

            query_text = transcription["text"]
            detected_language = transcription.get("language", input_language)

            # Step 2: Process query through QA system
            qa_system = asyncio.run(_get_qa_system())
            if qa_system:
                qa_response = qa_system.ask(query_text, user_id="voice_user")
                response_text = qa_response.get("answer", "I apologize, but I couldn't find an appropriate response.")
            else:
                response_text = f"I heard you ask: '{query_text}'. The QA system is currently initializing."

            # Step 3: Convert response to speech
            output_lang = output_language if output_language != "auto" else detected_language
            speech_result = self.tts_processor.synthesize_speech(
                response_text,
                language=output_lang,
                voice=voice
            )

            # Combine results
            return {
                "transcription": transcription,
                "query_text": query_text,
                "response_text": response_text,
                "audio_response": speech_result,
                "input_language": detected_language,
                "output_language": output_lang,
                "processing_chain": ["stt", "qa", "tts"]
            }

        except Exception as e:
            logger.error(f"Voice processing error: {e}")
            return {
                "error": f"Voice processing failed: {str(e)}",
                "transcription": {},
                "audio_response": {}
            }

    def voice_to_text(self, audio_data: bytes, language: str = "auto") -> Dict[str, Any]:
        """Convert voice to text only."""
        return self.stt_processor.transcribe_audio(audio_data, language)

    def text_to_voice(
        self,
        text: str,
        language: str = "en",
        voice: str = "default",
        speed: float = 1.0
    ) -> Dict[str, Any]:
        """Convert text to voice only."""
        return self.tts_processor.synthesize_speech(text, language, voice, speed)

    def save_voice_response(
        self,
        text: str,
        output_path: Union[str, Path],
        language: str = "en",
        voice: str = "default"
    ) -> Dict[str, Any]:
        """Generate and save voice response to file."""
        return self.tts_processor.save_audio_file(text, output_path, language, voice)

    def get_voice_capabilities(self) -> Dict[str, Any]:
        """Get information about voice processing capabilities."""
        return {
            "speech_to_text": {
                "provider": self.stt_processor.provider,
                "supported_languages": self.stt_processor.get_supported_languages(),
                "supported_formats": self.stt_processor.get_supported_formats()
            },
            "text_to_speech": {
                "provider": self.tts_processor.provider,
                "supported_languages": self.tts_processor.get_supported_languages(),
                "supported_formats": self.tts_processor.get_supported_formats(),
                "available_voices": {
                    lang: self.tts_processor.get_available_voices(lang)
                    for lang in ["en", "hi", "sa"]
                }
            },
            "full_voice_processing": True,
            "supported_workflows": [
                "voice_to_text",
                "text_to_voice",
                "voice_to_voice",
                "voice_query_processing"
            ]
        }

    async def record_and_process_voice_query(
        self,
        input_language: str = "auto",
        output_language: str = "auto",
        voice: str = "default",
        max_duration: float = 30.0
    ) -> Dict[str, Any]:
        """
        Record audio from microphone and process the voice query end-to-end.

        Args:
            input_language: Language of input speech
            output_language: Language for output speech
            voice: Voice to use for output
            max_duration: Maximum recording duration

        Returns:
            Dict with processing results
        """
        try:
            if self.audio_handler is None:
                return {"error": "Audio handler not available"}

            logger.info("🎤 Starting voice recording...")

            # Record audio from microphone
            audio_data = self.audio_handler.record_audio(
                duration=None,  # Use voice activity detection
                max_duration=max_duration
            )

            if audio_data is None:
                return {"error": "Failed to record audio from microphone"}

            logger.info(f"📊 Recorded {len(audio_data)} bytes of audio")

            # Process the recorded audio
            result = await self.process_voice_query(
                audio_data=audio_data,
                input_language=input_language,
                output_language=output_language,
                voice=voice
            )

            # Play the audio response if available
            if result.get("audio_response", {}).get("audio_data"):
                logger.info("🔊 Playing audio response...")
                audio_bytes = result["audio_response"]["audio_data"]
                playback_success = self.audio_handler.play_audio(
                    audio_bytes,
                    sample_rate=result["audio_response"].get("sample_rate", 22050)
                )

                if playback_success:
                    logger.info("✅ Audio response played successfully")
                else:
                    logger.warning("⚠️ Failed to play audio response")

            return result

        except Exception as e:
            logger.error(f"Voice recording/processing error: {e}")
            return {"error": f"Voice interaction failed: {str(e)}"}

    def play_text_response(
        self,
        text: str,
        language: str = "en",
        voice: str = "default",
        speed: float = 1.0
    ) -> bool:
        """
        Convert text to speech and play it through speakers.

        Args:
            text: Text to convert and play
            language: Language for speech
            voice: Voice to use
            speed: Speech speed

        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"🗣️ Converting text to speech: '{text[:50]}...'")

            # Generate speech
            speech_result = self.tts_processor.synthesize_speech(
                text, language, voice, speed
            )

            if not speech_result.get("audio_data"):
                logger.error("Failed to generate speech")
                return False

            # Play the audio
            audio_bytes = speech_result["audio_data"]
            sample_rate = speech_result.get("sample_rate", 22050)

            logger.info("🔊 Playing generated speech...")
            success = self.audio_handler.play_audio(audio_bytes, sample_rate)

            if success:
                logger.info("✅ Speech playback completed")
            else:
                logger.error("❌ Speech playback failed")

            return success

        except Exception as e:
            logger.error(f"Text-to-speech playback error: {e}")
            return False

    def test_voice_system(self) -> Dict[str, Any]:
        """Test the complete voice system."""
        results = {
            "stt_available": self.stt_processor.client is not None,
            "tts_available": self.tts_processor.client is not None,
            "audio_available": self.audio_handler.is_available,
            "audio_test": None,
            "stt_test": None,
            "tts_test": None
        }

        # Test audio system
        try:
            results["audio_test"] = self.audio_handler.test_audio()
        except Exception as e:
            results["audio_test"] = {"error": str(e)}

        # Test STT with mock audio
        try:
            mock_audio = b"mock_audio_data"
            stt_result = self.stt_processor.transcribe_audio(mock_audio)
            results["stt_test"] = {
                "success": bool(stt_result.get("text")),
                "provider": stt_result.get("provider"),
                "text": stt_result.get("text", "")[:50]
            }
        except Exception as e:
            results["stt_test"] = {"error": str(e)}

        # Test TTS
        try:
            tts_result = self.tts_processor.synthesize_speech("Hello world")
            results["tts_test"] = {
                "success": bool(tts_result.get("audio_data")),
                "provider": tts_result.get("provider"),
                "audio_length": len(tts_result.get("audio_data", b""))
            }
        except Exception as e:
            results["tts_test"] = {"error": str(e)}

        return results

    def get_audio_devices(self) -> Dict[str, Any]:
        """Get information about available audio devices."""
        return self.audio_handler.get_audio_devices()

    def health_check(self) -> Dict[str, Any]:
        """Check if voice processing services are healthy."""
        audio_health = self.audio_handler.test_audio() if self.audio_handler.is_available else {"error": "Audio not available"}

        return {
            "stt_status": "mock_implementation" if self.stt_processor.client is None else "ready",
            "tts_status": "mock_implementation" if self.tts_processor.client is None else "ready",
            "audio_status": "ready" if self.audio_handler.is_available else "unavailable",
            "audio_recording": audio_health.get("recording_test", False),
            "audio_playback": audio_health.get("playback_test", False),
            "overall_status": "ready" if (
                self.stt_processor.client is not None and
                self.tts_processor.client is not None and
                self.audio_handler.is_available
            ) else "partial"
        }
