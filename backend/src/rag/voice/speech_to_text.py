"""Speech-to-text processing for voice input."""

import io
import logging
import os
from typing import Optional, Dict, Any
from pathlib import Path

logger = logging.getLogger(__name__)

class SpeechToTextProcessor:
    """Speech-to-text processor using various providers."""

    def __init__(self, provider: str = "google", api_key: Optional[str] = None):
        self.provider = provider
        self.api_key = api_key
        self.client = None
        self._initialize_client()

    def _initialize_client(self):
        """Initialize the speech-to-text client."""
        try:
            if self.provider == "google":
                # Google Speech-to-Text
                try:
                    from google.cloud import speech_v1p1beta1 as speech
                    from google.oauth2 import service_account

                    # Try to get credentials from environment or service account file
                    credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
                    if credentials_path and Path(credentials_path).exists():
                        credentials = service_account.Credentials.from_service_account_file(credentials_path)
                        self.client = speech.SpeechClient(credentials=credentials)
                    else:
                        # Try to use default credentials
                        self.client = speech.SpeechClient()

                    logger.info("Google Speech-to-Text client initialized successfully")
                except ImportError:
                    logger.error("google-cloud-speech not installed, falling back to mock")
                    self.client = None
                except Exception as e:
                    logger.error(f"Failed to initialize Google Speech client: {e}")
                    self.client = None

            elif self.provider == "azure":
                # Azure Speech Services (placeholder)
                logger.warning("Azure STT not implemented, using mock")
                self.client = None
            elif self.provider == "whisper":
                # OpenAI Whisper
                try:
                    from openai import OpenAI
                    self.api_key = os.getenv('OPENAI_API_KEY') or self.api_key
                    if self.api_key:
                        self.client = OpenAI(api_key=self.api_key)
                        logger.info("OpenAI Whisper client initialized successfully")
                    else:
                        logger.error("OpenAI API key not found")
                        self.client = None
                except ImportError:
                    logger.error("openai not installed, falling back to mock")
                    self.client = None
                except Exception as e:
                    logger.error(f"Failed to initialize OpenAI Whisper client: {e}")
                    self.client = None
            elif self.provider == "deepgram":
                 # Deepgram - For development, force mock implementation
                logger.info("Deepgram STT configured for development (using mock)")
                self.client = None  # Force mock implementation
            else:
                logger.warning(f"Unknown provider {self.provider}, using mock implementation")
                self.client = None
        except Exception as e:
            logger.error(f"Failed to initialize {self.provider} client: {e}")
            self.client = None

    async def transcribe_audio(self, audio_data: bytes, language: str = "auto", mimetype: str = "audio/wav") -> Dict[str, Any]:
        """Transcribe audio data to text.

        Args:
            audio_data: Raw audio bytes
            language: Language code or 'auto'
            mimetype: Audio MIME type (required for Deepgram)

        Returns:
            Dict with transcription results
        """
        try:
            if self.client is None:
                # Return mock transcription for development
                return {
                    "text": "This is a mock transcription of the audio input.",
                    "confidence": 0.95,
                    "language": language if language != "auto" else "en",
                    "duration": 2.5,
                    "provider": "mock"
                }

            if self.provider == "whisper":
                return await self._transcribe_whisper(audio_data, language)
            elif self.provider == "deepgram":
                return await self._transcribe_deepgram(audio_data, language, mimetype)
            else:
                # Google Speech-to-Text implementation
                return await self._transcribe_google(audio_data, language)

        except Exception as e:
            logger.error(f"Speech-to-text error: {e}")
            # Fallback to mock on error
            return {
                "text": "This is a mock transcription of the audio input.",
                "confidence": 0.95,
                "language": language if language != "auto" else "en",
                "duration": 2.5,
                "provider": "mock",
                "error": str(e)
            }

    async def _transcribe_deepgram(self, audio_data: bytes, language: str = "auto", mimetype: str = "audio/wav") -> Dict[str, Any]:
        """Transcribe audio using Deepgram API via HTTP requests."""
        try:
            import requests

            url = "https://api.deepgram.com/v1/listen"
            
            # Map language to Deepgram format (e.g., 'en' -> 'en-US')
            # Deepgram often auto-detects but explicit is better for known inputs
            # Default mapping to 'en-US' if unknown, or allow 'auto' if supported (Deepgram calls it 'detect_language=true')
            
            params = {
                "smart_format": "true",
                "punctuate": "true",
            }
            
            if language == "auto":
                params["detect_language"] = "true"
            else:
                # Basic mapping
                lang_map = {
                    "en": "en-US", "hi": "hi", "sa": "en", # Sanskrit not directly listed, maybe Hindi or generic
                    "en-US": "en-US", "hi-IN": "hi"
                }
                params["language"] = lang_map.get(language, "en-US")

            headers = {
                "Authorization": f"Token {self.api_key}",
                "Content-Type": "audio/wav" # Defaulting to wav or generic bytes
            }
            
            # If valid audio bytes are passed, requests handles them as body
            response = requests.post(url, headers=headers, params=params, data=audio_data, timeout=10)
            
            if response.status_code != 200:
                raise Exception(f"Deepgram API error: {response.status_code} - {response.text}")
            
            result = response.json()
            
            # Parse response
            # Expected format: results -> channels -> [0] -> alternatives -> [0] -> transcript
            transcript = result.get('results', {}).get('channels', [{}])[0].get('alternatives', [{}])[0].get('transcript', '')
            confidence = result.get('results', {}).get('channels', [{}])[0].get('alternatives', [{}])[0].get('confidence', 0.0)
            
            meta_lang = result.get('results', {}).get('channels', [{}])[0].get('detected_language', language)

            return {
                "text": transcript,
                "confidence": confidence,
                "language": meta_lang,
                "duration": result.get('metadata', {}).get('duration', 0.0),
                "provider": "deepgram",
                "is_final": True
            }

        except Exception as e:
            logger.error(f"Deepgram transcription error: {e}")
            raise

    async def _transcribe_whisper(self, audio_data: bytes, language: str = "auto") -> Dict[str, Any]:
        """Transcribe audio using OpenAI Whisper."""
        try:
            import tempfile
            import os

            # Save audio data to temporary file
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_path = temp_file.name

            try:
                # Prepare the audio file for Whisper
                with open(temp_path, 'rb') as audio_file:
                    # Map language code for Whisper
                    whisper_language = None if language == "auto" else self._map_whisper_language(language)

                    # Call Whisper API
                    response = self.client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        language=whisper_language,
                        response_format="json"
                    )

                # Extract transcription
                transcription_text = response.text.strip()

                return {
                    "text": transcription_text,
                    "confidence": 0.95,  # Whisper doesn't provide confidence scores
                    "language": language if language != "auto" else "en",
                    "duration": len(audio_data) / (16000 * 2),  # Rough estimate
                    "provider": "whisper",
                    "is_final": True
                }

            finally:
                # Clean up temporary file
                os.unlink(temp_path)

        except Exception as e:
            logger.error(f"Whisper transcription error: {e}")
            raise

    async def _transcribe_google(self, audio_data: bytes, language: str = "auto") -> Dict[str, Any]:
        """Transcribe audio using Google Speech-to-Text."""
        try:
            from google.cloud import speech_v1p1beta1 as speech

            # Configure audio settings
            audio = speech.RecognitionAudio(content=audio_data)

            # Map language codes
            language_code = self._map_language_code(language)

            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                language_code=language_code,
                enable_automatic_punctuation=True,
                enable_word_time_offsets=False,
                model="latest_long",  # Use latest long-form model
            )

            # Perform the transcription
            response = self.client.recognize(config=config, audio=audio)

            # Process results
            if response.results:
                # Get the most confident result
                result = response.results[0]
                alternative = result.alternatives[0]

                return {
                    "text": alternative.transcript,
                    "confidence": alternative.confidence,
                    "language": language_code,
                    "duration": len(audio_data) / (16000 * 2),  # Rough estimate
                    "provider": "google",
                    "is_final": True
                }
            else:
                return {
                    "text": "",
                    "confidence": 0.0,
                    "language": language_code,
                    "duration": len(audio_data) / (16000 * 2),
                    "provider": "google",
                    "error": "No speech detected"
                }

        except Exception as e:
            logger.error(f"Google transcription error: {e}")
            raise

    def _map_language_code(self, language: str) -> str:
        """Map language codes to Google Speech format."""
        language_map = {
            "auto": "en-US",  # Default to English
            "en": "en-US",
            "hi": "hi-IN",
            "sa": "sa-IN",  # Sanskrit
            "bn": "bn-IN",
            "te": "te-IN",
            "ta": "ta-IN",
            "mr": "mr-IN",
            "gu": "gu-IN",
            "kn": "kn-IN",
            "ml": "ml-IN",
            "pa": "pa-IN",
            "or": "or-IN",
            "en-US": "en-US",
            "en-GB": "en-GB",
            "hi-IN": "hi-IN",
            "bn-IN": "bn-IN",
            "te-IN": "te-IN",
            "ta-IN": "ta-IN",
            "mr-IN": "mr-IN",
            "gu-IN": "gu-IN"
        }
        return language_map.get(language, "en-US")

    def _map_whisper_language(self, language: str) -> str:
        """Map language codes to Whisper format."""
        # Whisper uses ISO 639-1 language codes
        language_map = {
            "en": "en",
            "hi": "hi",
            "sa": "sa",  # Sanskrit
            "bn": "bn",
            "te": "te",
            "ta": "ta",
            "mr": "mr",
            "gu": "gu",
            "kn": "kn",
            "ml": "ml",
            "pa": "pa",
            "or": "or",
            "en-US": "en",
            "en-GB": "en",
            "hi-IN": "hi",
            "bn-IN": "bn",
            "te-IN": "te",
            "ta-IN": "ta",
            "mr-IN": "mr",
            "gu-IN": "gu"
        }
        return language_map.get(language, "en")

    def transcribe_file(self, audio_path: Path, language: str = "auto") -> Dict[str, Any]:
        """Transcribe audio from file.

        Args:
            audio_path: Path to audio file
            language: Language code or 'auto'

        Returns:
            Dict with transcription results
        """
        try:
            with open(audio_path, 'rb') as f:
                audio_data = f.read()
            return self.transcribe_audio(audio_data, language)
        except Exception as e:
            logger.error(f"File transcription error: {e}")
            return {
                "text": "",
                "confidence": 0.0,
                "language": language,
                "error": f"File read error: {str(e)}",
                "provider": self.provider
            }

    def get_supported_languages(self) -> list:
        """Get list of supported languages."""
        # Common languages supported by most STT services
        return [
            "en", "hi", "sa", "bn", "te", "ta", "mr", "gu", "kn", "ml", "pa", "or",
            "en-US", "en-GB", "hi-IN", "bn-IN", "te-IN", "ta-IN", "mr-IN", "gu-IN"
        ]

    def get_supported_formats(self) -> list:
        """Get list of supported audio formats."""
        return [
            "flac", "wav", "mp3", "m4a", "ogg", "webm", "amr", "awb"
        ]
        """Get list of supported audio formats."""
