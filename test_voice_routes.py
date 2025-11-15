#!/usr/bin/env python3
"""
Test script for voice routes without starting the full server.
"""

import asyncio
import sys
from pathlib import Path

# Add the project root to Python path
sys.path.insert(0, str(Path(__file__).parent))

from src.services.voice_service import VoiceService
from src.config import VoiceConfig
import pytest


@pytest.mark.asyncio
async def test_voice_routes():
    """Test voice service functionality."""
    print("🧪 Testing Voice Routes")
    print("=" * 50)

    # Initialize voice config and service
    voice_config = VoiceConfig()
    voice_service = VoiceService(
        stt_provider=voice_config.stt_provider,
        tts_provider=voice_config.tts_provider,
        stt_api_key=voice_config.stt_api_key,
        tts_api_key=voice_config.tts_api_key
    )

    print("✅ Voice service initialized")

    # Test 1: STT Languages
    print("\n📝 Testing STT Languages...")
    try:
        languages = voice_service.get_stt_languages()
        formats = voice_service.get_stt_formats()
        print(f"✅ STT Languages: {len(languages)} supported")
        print(f"✅ STT Formats: {formats}")
    except Exception as e:
        print(f"❌ STT Languages failed: {e}")

    # Test 2: TTS Voices
    print("\n🗣️ Testing TTS Voices...")
    try:
        voices = voice_service.get_available_voices()
        languages = voice_service.get_tts_languages()
        formats = voice_service.get_tts_formats()
        print(f"✅ TTS Languages: {len(languages)} supported")
        print(f"✅ TTS Formats: {formats}")
        print(f"✅ Available voices: {len(voices)} language groups")
    except Exception as e:
        print(f"❌ TTS Voices failed: {e}")

    # Test 3: STT Processing (mock audio)
    print("\n🎧 Testing STT Processing...")
    try:
        mock_audio = b"mock_audio_data_for_testing"
        result = await voice_service.speech_to_text(
            audio_data=mock_audio,
            language="en",
            user_id="test_user"
        )
        print(f"✅ STT Processing: {result.get('text', 'mock response')}")
    except Exception as e:
        print(f"❌ STT Processing failed: {e}")

    # Test 4: TTS Processing
    print("\n🔊 Testing TTS Processing...")
    try:
        test_text = "Hello, this is a test of the voice system."
        result = await voice_service.text_to_speech(
            text=test_text,
            language="en",
            voice="default",
            user_id="test_user"
        )
        print(f"✅ TTS Processing: Generated {len(result.get('audio_data', b''))} bytes")
    except Exception as e:
        print(f"❌ TTS Processing failed: {e}")

    # Test 5: Voice Query Processing (full pipeline)
    print("\n🎯 Testing Voice Query Processing...")
    try:
        mock_audio = b"mock_audio_data_what_is_dharma"
        result = await voice_service.process_voice_query(
            audio_data=mock_audio,
            user_id="test_user",
            input_language="en",
            output_language="en"
        )
        print("✅ Voice Query Processing completed")
        print(f"   - Transcription: {result.get('query_text', 'N/A')[:50]}...")
        print(f"   - Response: {result.get('response_text', 'N/A')[:50]}...")
        print(f"   - Audio generated: {len(result.get('audio_data', b''))} bytes")
    except Exception as e:
        print(f"❌ Voice Query Processing failed: {e}")

    # Test 6: Health Check
    print("\n🏥 Testing Health Check...")
    try:
        health = await voice_service.health_check()
        print(f"✅ Health Check: STT={health.get('stt_status')}, TTS={health.get('tts_status')}")
    except Exception as e:
        print(f"❌ Health Check failed: {e}")

    print("\n🎉 Voice Routes Testing Complete!")
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(test_voice_routes())
