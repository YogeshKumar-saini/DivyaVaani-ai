"""Text-to-speech processing for voice output."""

import io
import logging
import os
from typing import Optional, Dict, Any, Union
from pathlib import Path

logger = logging.getLogger(__name__)

class TextToSpeechProcessor:
    """Text-to-speech processor using various providers."""

    def __init__(self, provider: str = "google", api_key: Optional[str] = None):
        self.provider = provider
        self.api_key = api_key
        self.client = None
        self._initialize_client()

    def _initialize_client(self):
        """Initialize the text-to-speech client."""
        try:
            if self.provider == "google":
                # Google Text-to-Speech
                try:
                    from google.cloud import texttospeech
                    from google.oauth2 import service_account

                    # Try to get credentials from environment or service account file
                    credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
                    if credentials_path and Path(credentials_path).exists():
                        credentials = service_account.Credentials.from_service_account_file(credentials_path)
                        self.client = texttospeech.TextToSpeechClient(credentials=credentials)
                    else:
                        # Try to use default credentials
                        self.client = texttospeech.TextToSpeechClient()

                    logger.info("Google Text-to-Speech client initialized successfully")
                except ImportError:
                    logger.error("google-cloud-texttospeech not installed, falling back to mock")
                    self.client = None
                except Exception as e:
                    logger.error(f"Failed to initialize Google TTS client: {e}")
                    self.client = None

            elif self.provider == "cartesia":
                # Cartesia TTS
                try:
                    import requests
                    self.api_key = os.getenv('CARTESIA_API_KEY') or self.api_key
                    if self.api_key:
                        self.client = "cartesia"  # Use string to indicate Cartesia client
                        logger.info("Cartesia Text-to-Speech client initialized successfully")
                    else:
                        logger.error("Cartesia API key not found")
                        self.client = None
                except ImportError:
                    logger.error("requests not available for Cartesia, falling back to mock")
                    self.client = None
                except Exception as e:
                    logger.error(f"Failed to initialize Cartesia TTS client: {e}")
                    self.client = None

            elif self.provider == "azure":
                # Azure Speech Services (placeholder)
                logger.warning("Azure TTS not implemented, using mock")
                self.client = None
            elif self.provider == "elevenlabs":
                # ElevenLabs (placeholder)
                logger.warning("ElevenLabs TTS not implemented, using mock")
                self.client = None
            elif self.provider == "openai":
                # OpenAI TTS
                try:
                    from openai import OpenAI
                    self.api_key = os.getenv('OPENAI_API_KEY') or self.api_key
                    if self.api_key:
                        self.client = OpenAI(api_key=self.api_key)
                        logger.info("OpenAI TTS client initialized successfully")
                    else:
                        logger.error("OpenAI API key not found")
                        self.client = None
                except ImportError:
                    logger.error("openai not installed, falling back to mock")
                    self.client = None
                except Exception as e:
                    logger.error(f"Failed to initialize OpenAI TTS client: {e}")
                    self.client = None
            else:
                logger.warning(f"Unknown provider {self.provider}, using mock implementation")
                self.client = None
        except Exception as e:
            logger.error(f"Failed to initialize {self.provider} client: {e}")
            self.client = None

    async def synthesize_speech(
        self,
        text: str,
        language: str = "en",
        voice: str = "default",
        speed: float = 1.0
    ) -> Dict[str, Any]:
        """Convert text to speech (Async).

        Args:
            text: Text to convert to speech
            language: Language code
            voice: Voice identifier
            speed: Speech speed (0.5 to 2.0)

        Returns:
            Dict with audio data and metadata
        """
        try:
            if self.client is None:
                # Return mock audio data for development
                return self._get_mock_audio(text, language, voice, speed)

            if self.provider == "openai":
                # OpenAI TTS implementation (Async wrapper or todo)
                return self._synthesize_openai_speech(text, language, voice, speed)
            elif self.client == "cartesia":
                # Cartesia TTS implementation
                return await self._synthesize_cartesia_speech(text, language, voice, speed)
            else:
                # Google TTS implementation
                return self._synthesize_google_speech(text, language, voice, speed)

        except Exception as e:
            logger.error(f"Text-to-speech error: {e}")
            return self._get_mock_audio(text, language, voice, speed, str(e))

    def _get_mock_audio(self, text, language, voice, speed, error=None):
        mock_audio = b"mock_audio_data_would_be_here"
        return {
            "audio_data": mock_audio,
            "format": "mp3",
            "sample_rate": 22050,
            "language": language,
            "voice": voice,
            "speed": speed,
            "duration": len(text.split()) * 0.3,
            "provider": "mock",
            "error": error
        }

    async def _synthesize_cartesia_speech(
        self,
        text: str,
        language: str = "en",
        voice: str = "default",
        speed: float = 1.0
    ) -> Dict[str, Any]:
        """Synthesize speech using Cartesia API via Async HTTP."""
        try:
            import httpx

            # Map voice settings for Cartesia
            voice_id = self._map_cartesia_voice(language, voice)

            # Cartesia API endpoint
            url = "https://api.cartesia.ai/tts/bytes"

            headers = {
                "Cartesia-Version": "2024-06-10",
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }

            payload = {
                "model_id": "sonic-english",  # Use Sonic English model for high quality
                "transcript": text,
                "voice": {
                    "mode": "id",
                    "id": voice_id
                },
                "output_format": {
                    "container": "mp3",
                    "encoding": "mp3",
                    "sample_rate": 44100
                },
                "language": self._map_cartesia_language(language)
            }

            # Make Async API request
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload, headers=headers)
            
            if response.status_code != 200:
                # Fallback on auth error
                if response.status_code == 401:
                    logger.warning("Cartesia Unauthorized. Falling back to mock.")
                    return self._get_mock_audio(text, language, voice, speed, "Cartesia Auth Failed")
                response.raise_for_status()

            audio_data = response.content

            return {
                "audio_data": audio_data,
                "format": "mp3",
                "sample_rate": 44100,
                "language": language,
                "voice": voice,
                "speed": speed,
                "duration": len(text.split()) * 0.25,  # Cartesia is faster
                "provider": "cartesia",
                "audio_length": len(audio_data)
            }

        except Exception as e:
            logger.error(f"Cartesia TTS error: {e}")
            raise

    def _synthesize_google_speech(
        self,
        text: str,
        language: str = "en",
        voice: str = "default",
        speed: float = 1.0
    ) -> Dict[str, Any]:
        """Synthesize speech using Google Cloud TTS."""
        try:
            from google.cloud import texttospeech

            # Map language and voice
            language_code, voice_name, voice_gender = self._map_voice_settings(language, voice)

            # Set the text input
            synthesis_input = texttospeech.SynthesisInput(text=text)

            # Build the voice request
            voice_config = texttospeech.VoiceSelectionParams(
                language_code=language_code,
                name=voice_name,
                ssml_gender=voice_gender,
            )

            # Select the type of audio file
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=speed,
                pitch=0.0,  # Neutral pitch
            )

            # Perform the text-to-speech request
            response = self.client.synthesize_speech(
                input=synthesis_input,
                voice=voice_config,
                audio_config=audio_config
            )

            # Return the audio content
            return {
                "audio_data": response.audio_content,
                "format": "mp3",
                "sample_rate": 22050,  # Google TTS default
                "language": language,
                "voice": voice,
                "speed": speed,
                "duration": len(text.split()) * 0.3,  # Rough estimate
                "provider": "google",
                "audio_length": len(response.audio_content)
            }

        except Exception as e:
            logger.error(f"Google TTS error: {e}")
            raise

    def _synthesize_openai_speech(
        self,
        text: str,
        language: str = "en",
        voice: str = "default",
        speed: float = 1.0
    ) -> Dict[str, Any]:
        """Synthesize speech using OpenAI TTS."""
        try:
            # Map voice settings for OpenAI
            openai_voice = self._map_openai_voice(language, voice)

            # Call OpenAI TTS API
            response = self.client.audio.speech.create(
                model="tts-1",  # Use tts-1 for faster, cost-effective generation
                voice=openai_voice,
                input=text,
                speed=speed,
                response_format="mp3"
            )

            # Get audio data
            audio_data = b""
            for chunk in response.iter_bytes():
                audio_data += chunk

            return {
                "audio_data": audio_data,
                "format": "mp3",
                "sample_rate": 22050,  # OpenAI TTS default
                "language": language,
                "voice": voice,
                "speed": speed,
                "duration": len(text.split()) * 0.3,  # Rough estimate
                "provider": "openai",
                "audio_length": len(audio_data)
            }

        except Exception as e:
            logger.error(f"OpenAI TTS error: {e}")
            raise

    def _map_openai_voice(self, language: str, voice: str) -> str:
        """Map language and voice settings to OpenAI TTS voice names."""
        # OpenAI TTS supports these voices: alloy, echo, fable, onyx, nova, shimmer
        # Map our voice preferences to OpenAI voices
        voice_map = {
            "default": "alloy",  # neutral male voice
            "male_default": "alloy",
            "female_default": "nova",
            "male_deep": "onyx",  # deep male voice
            "female_clear": "shimmer",
            "male_hindi": "alloy",
            "female_hindi": "nova",
            "male_spiritual": "onyx",
            "female_gentle": "shimmer",
            "male_traditional": "echo",
            "female_sacred": "fable",
            "male_vedic": "onyx",
            "female_melodious": "nova"
        }

        return voice_map.get(voice, "alloy")

    def _map_voice_settings(self, language: str, voice: str) -> tuple:
        """Map language and voice settings to Google TTS parameters."""
        # Language code mapping
        language_map = {
            "en": "en-US",
            "hi": "hi-IN",
            "sa": "sa-IN",
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
            "hi-IN": "hi-IN"
        }

        language_code = language_map.get(language, "en-US")

        # Voice mapping with gender
        voice_configs = {
            "en-US": {
                "default": ("en-US-Neural2-D", texttospeech.SsmlVoiceGender.MALE),
                "male_default": ("en-US-Neural2-D", texttospeech.SsmlVoiceGender.MALE),
                "female_default": ("en-US-Neural2-F", texttospeech.SsmlVoiceGender.FEMALE),
                "male_deep": ("en-US-Neural2-C", texttospeech.SsmlVoiceGender.MALE),
                "female_clear": ("en-US-Neural2-E", texttospeech.SsmlVoiceGender.FEMALE),
            },
            "hi-IN": {
                "default": ("hi-IN-Neural2-D", texttospeech.SsmlVoiceGender.MALE),
                "male_hindi": ("hi-IN-Neural2-D", texttospeech.SsmlVoiceGender.MALE),
                "female_hindi": ("hi-IN-Neural2-A", texttospeech.SsmlVoiceGender.FEMALE),
                "male_spiritual": ("hi-IN-Neural2-C", texttospeech.SsmlVoiceGender.MALE),
                "female_gentle": ("hi-IN-Neural2-B", texttospeech.SsmlVoiceGender.FEMALE),
            },
            "sa-IN": {
                "default": ("hi-IN-Neural2-D", texttospeech.SsmlVoiceGender.MALE),  # Use Hindi voices for Sanskrit
                "male_traditional": ("hi-IN-Neural2-C", texttospeech.SsmlVoiceGender.MALE),
                "female_sacred": ("hi-IN-Neural2-A", texttospeech.SsmlVoiceGender.FEMALE),
                "male_vedic": ("hi-IN-Neural2-D", texttospeech.SsmlVoiceGender.MALE),
                "female_melodious": ("hi-IN-Neural2-B", texttospeech.SsmlVoiceGender.FEMALE),
            }
        }

        # Get voice config for language
        lang_voices = voice_configs.get(language_code, voice_configs["en-US"])
        voice_name, voice_gender = lang_voices.get(voice, lang_voices["default"])

        return language_code, voice_name, voice_gender

    def _map_cartesia_voice(self, language: str, voice: str) -> str:
        """Map language and voice settings to Cartesia voice IDs."""
        # Cartesia voice mapping - using high-quality voices
        voice_map = {
            "en": {
                "default": "a0e99841-438c-4a64-b679-ae501e7d6091",  # Michael
                "male_default": "a0e99841-438c-4a64-b679-ae501e7d6091",  # Michael
                "female_default": "b826c5e2-0e3b-4fd5-8dd1-01aeb0b8e23a",  # Sarah
                "male_deep": "c45bc5a7-8277-4d76-9757-1f6b51e9b74b",  # David
                "female_clear": "b826c5e2-0e3b-4fd5-8dd1-01aeb0b8e23a",  # Sarah
            },
            "hi": {
                "default": "a0e99841-438c-4a64-b679-ae501e7d6091",  # Michael (fallback)
                "male_hindi": "a0e99841-438c-4a64-b679-ae501e7d6091",  # Michael
                "female_hindi": "b826c5e2-0e3b-4fd5-8dd1-01aeb0b8e23a",  # Sarah
                "male_spiritual": "c45bc5a7-8277-4d76-9757-1f6b51e9b74b",  # David
                "female_gentle": "b826c5e2-0e3b-4fd5-8dd1-01aeb0b8e23a",  # Sarah
            },
            "sa": {
                "default": "c45bc5a7-8277-4d76-9757-1f6b51e9b74b",  # David (traditional)
                "male_traditional": "c45bc5a7-8277-4d76-9757-1f6b51e9b74b",  # David
                "female_sacred": "b826c5e2-0e3b-4fd5-8dd1-01aeb0b8e23a",  # Sarah
                "male_vedic": "a0e99841-438c-4a64-b679-ae501e7d6091",  # Michael
                "female_melodious": "b826c5e2-0e3b-4fd5-8dd1-01aeb0b8e23a",  # Sarah
            }
        }

        # Get voice config for language
        lang_voices = voice_map.get(language, voice_map["en"])
        return lang_voices.get(voice, lang_voices["default"])

    def _map_cartesia_language(self, language: str) -> str:
        """Map language codes to Cartesia language format."""
        language_map = {
            "en": "en",
            "hi": "en",  # Cartesia primarily supports English, fallback for other languages
            "sa": "en",
            "bn": "en",
            "te": "en",
            "ta": "en",
            "mr": "en",
            "gu": "en",
            "kn": "en",
            "ml": "en",
            "pa": "en",
            "or": "en",
            "en-US": "en",
            "en-GB": "en",
            "hi-IN": "en",
            "bn-IN": "en",
            "te-IN": "en",
            "ta-IN": "en",
            "mr-IN": "en",
            "gu-IN": "en"
        }
        return language_map.get(language, "en")

    def save_audio_file(
        self,
        text: str,
        output_path: Union[str, Path],
        language: str = "en",
        voice: str = "default",
        speed: float = 1.0
    ) -> Dict[str, Any]:
        """Convert text to speech and save to file.

        Args:
            text: Text to convert
            output_path: Path to save audio file
            language: Language code
            voice: Voice identifier
            speed: Speech speed

        Returns:
            Dict with file info and metadata
        """
        try:
            result = self.synthesize_speech(text, language, voice, speed)

            if result.get("audio_data"):
                output_path = Path(output_path)
                with open(output_path, 'wb') as f:
                    f.write(result["audio_data"])

                result["file_path"] = str(output_path)
                result["file_size"] = len(result["audio_data"])

            return result

        except Exception as e:
            logger.error(f"File save error: {e}")
            return {
                "error": f"Failed to save audio file: {str(e)}",
                "provider": self.provider
            }

    def get_supported_languages(self) -> list:
        """Get list of supported languages."""
        return [
            "en", "hi", "sa", "bn", "te", "ta", "mr", "gu", "kn", "ml", "pa", "or",
            "en-US", "en-GB", "hi-IN", "bn-IN", "te-IN", "ta-IN", "mr-IN", "gu-IN"
        ]

    def get_available_voices(self, language: str = "en") -> list:
        """Get list of available voices for a language."""
        # Mock voice list - in real implementation would query the TTS service
        voice_sets = {
            "en": ["male_default", "female_default", "male_deep", "female_clear"],
            "hi": ["male_hindi", "female_hindi", "male_spiritual", "female_gentle"],
            "sa": ["male_traditional", "female_sacred", "male_vedic", "female_melodious"]
        }

        return voice_sets.get(language, ["default"])

    def get_supported_formats(self) -> list:
        """Get list of supported output formats."""
        return [
            "mp3", "wav", "flac", "ogg", "aac", "m4a", "webm"
        ]
