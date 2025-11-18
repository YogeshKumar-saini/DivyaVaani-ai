"""Audio capture and playback functionality."""

import io
import logging
import threading
import time
from typing import Optional, Callable, Dict, Any, Union
from pathlib import Path

logger = logging.getLogger(__name__)

class AudioHandler:
    """Handle audio capture from microphone and playback to speakers."""

    def __init__(self, sample_rate: int = 16000, channels: int = 1):
        self.sample_rate = sample_rate
        self.channels = channels
        self.stream = None
        self.audio_interface = None
        self.is_recording = False
        self.is_playing = False
        self._initialize_audio()

    def _initialize_audio(self):
        """Initialize audio interface."""
        try:
            import sounddevice as sd
            import soundfile as sf

            # Set default device
            sd.default.samplerate = self.sample_rate
            sd.default.channels = self.channels

            logger.info(f"Audio interface initialized: {self.sample_rate}Hz, {self.channels} channel(s)")
            self.audio_available = True

        except ImportError:
            logger.warning("sounddevice/soundfile not available, audio functionality disabled")
            self.audio_available = False
        except Exception as e:
            logger.error(f"Failed to initialize audio: {e}")
            self.audio_available = False

    def record_audio(
        self,
        duration: Optional[float] = None,
        silence_threshold: float = 0.01,
        max_duration: float = 30.0
    ) -> Optional[bytes]:
        """
        Record audio from microphone.

        Args:
            duration: Fixed recording duration in seconds (None for voice activity detection)
            silence_threshold: Threshold for voice activity detection
            max_duration: Maximum recording duration

        Returns:
            Audio data as bytes, or None if recording failed
        """
        if not self.audio_available:
            logger.warning("Audio recording not available")
            return None

        try:
            import sounddevice as sd
            import numpy as np

            self.is_recording = True
            logger.info("Starting audio recording...")

            # For fixed duration recording
            if duration:
                logger.info(f"Recording for {duration} seconds...")
                audio_data = sd.rec(
                    int(duration * self.sample_rate),
                    samplerate=self.sample_rate,
                    channels=self.channels,
                    dtype=np.float32
                )
                sd.wait()  # Wait for recording to finish

            else:
                # Voice activity detection recording
                logger.info("Recording with voice activity detection...")
                audio_chunks = []
                silence_counter = 0
                max_silence_chunks = int(2.0 * self.sample_rate / 1024)  # 2 seconds of silence

                with sd.InputStream(
                    samplerate=self.sample_rate,
                    channels=self.channels,
                    dtype=np.float32,
                    blocksize=1024
                ) as stream:
                    start_time = time.time()

                    while self.is_recording and (time.time() - start_time) < max_duration:
                        audio_chunk, overflowed = stream.read(1024)
                        audio_chunks.append(audio_chunk)

                        # Check for voice activity
                        rms = np.sqrt(np.mean(audio_chunk**2))
                        if rms > silence_threshold:
                            silence_counter = 0
                        else:
                            silence_counter += 1

                        # Stop if silence detected for too long
                        if silence_counter > max_silence_chunks:
                            logger.info("Silence detected, stopping recording")
                            break

                audio_data = np.concatenate(audio_chunks)

            # Convert to bytes (16-bit PCM)
            audio_data = (audio_data * 32767).astype(np.int16)
            audio_bytes = audio_data.tobytes()

            self.is_recording = False
            logger.info(f"Recording completed: {len(audio_bytes)} bytes")
            return audio_bytes

        except Exception as e:
            logger.error(f"Recording failed: {e}")
            self.is_recording = False
            return None

    def play_audio(self, audio_data: bytes, sample_rate: Optional[int] = None) -> bool:
        """
        Play audio data through speakers.

        Args:
            audio_data: Audio data as bytes
            sample_rate: Sample rate (uses instance default if None)

        Returns:
            True if playback successful, False otherwise
        """
        if not self.audio_available:
            logger.warning("Audio playback not available")
            return False

        try:
            import sounddevice as sd
            import numpy as np

            self.is_playing = True
            playback_rate = sample_rate or self.sample_rate

            # Convert bytes to numpy array
            audio_array = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32)
            audio_array = audio_array / 32767.0  # Normalize to [-1, 1]

            # Reshape if needed
            if len(audio_array.shape) == 1:
                audio_array = audio_array.reshape(-1, 1)

            logger.info(f"Playing audio: {len(audio_array)} samples at {playback_rate}Hz")

            # Play audio
            sd.play(audio_array, samplerate=playback_rate)
            sd.wait()  # Wait for playback to finish

            self.is_playing = False
            logger.info("Audio playback completed")
            return True

        except Exception as e:
            logger.error(f"Playback failed: {e}")
            self.is_playing = False
            return False

    def play_audio_file(self, file_path: Union[str, Path]) -> bool:
        """
        Play audio from file.

        Args:
            file_path: Path to audio file

        Returns:
            True if playback successful, False otherwise
        """
        if not self.audio_available:
            logger.warning("Audio playback not available")
            return False

        try:
            import soundfile as sf

            file_path = Path(file_path)
            if not file_path.exists():
                logger.error(f"Audio file not found: {file_path}")
                return False

            logger.info(f"Playing audio file: {file_path}")

            # Load and play audio file
            audio_data, sample_rate = sf.read(str(file_path))

            # Ensure proper shape
            if len(audio_data.shape) == 1:
                audio_data = audio_data.reshape(-1, 1)

            import sounddevice as sd
            sd.play(audio_data, samplerate=sample_rate)
            sd.wait()

            logger.info("Audio file playback completed")
            return True

        except Exception as e:
            logger.error(f"File playback failed: {e}")
            return False

    def stop_recording(self):
        """Stop current recording."""
        self.is_recording = False
        logger.info("Recording stopped")

    def stop_playback(self):
        """Stop current playback."""
        if self.audio_available:
            try:
                import sounddevice as sd
                sd.stop()
            except Exception as e:
                logger.error(f"Failed to stop playback: {e}")
        self.is_playing = False
        logger.info("Playback stopped")

    def get_audio_devices(self) -> Dict[str, Any]:
        """Get information about available audio devices."""
        if not self.audio_available:
            return {"error": "Audio not available"}

        try:
            import sounddevice as sd

            devices = sd.query_devices()
            default_input = sd.query_devices(kind='input')
            default_output = sd.query_devices(kind='output')

            return {
                "devices": devices,
                "default_input": default_input,
                "default_output": default_output,
                "hostapis": sd.query_hostapis()
            }

        except Exception as e:
            logger.error(f"Failed to query audio devices: {e}")
            return {"error": str(e)}

    def test_audio(self) -> Dict[str, Any]:
        """Test audio input and output."""
        results = {
            "recording_test": False,
            "playback_test": False,
            "devices_available": self.audio_available
        }

        if not self.audio_available:
            return results

        # Test recording (short)
        logger.info("Testing audio recording...")
        try:
            test_audio = self.record_audio(duration=1.0)
            results["recording_test"] = test_audio is not None and len(test_audio) > 0
        except Exception as e:
            logger.error(f"Recording test failed: {e}")

        # Test playback (beep sound)
        logger.info("Testing audio playback...")
        try:
            import numpy as np
            # Generate a short beep
            sample_rate = 44100
            duration = 0.5
            frequency = 440  # A4 note
            t = np.linspace(0, duration, int(sample_rate * duration), False)
            beep = np.sin(frequency * 2 * np.pi * t)
            beep = (beep * 32767).astype(np.int16).tobytes()

            results["playback_test"] = self.play_audio(beep, sample_rate)
        except Exception as e:
            logger.error(f"Playback test failed: {e}")

        return results

    @property
    def is_available(self) -> bool:
        """Check if audio functionality is available."""
        return self.audio_available
