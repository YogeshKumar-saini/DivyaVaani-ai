#!/usr/bin/env python3
"""Test language detection for Hindi queries."""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.rag.multilingual_qa_system import MultilingualQASystem

def test_detection():
    """Test language detection with various inputs."""

    # Create a dummy QA system just to access the detection method
    # We'll pass dummy parameters since we only need the detection method
    class DummyRetriever:
        pass

    qa_system = MultilingualQASystem.__new__(MultilingualQASystem)
    qa_system.SANSKRIT_PATTERNS = [
        'कृष्ण', 'अर्जुन', 'कर्म', 'योग', 'धर्म', 'अधर्म', 'भगवान', 'परमात्मा',
        'ब्रह्म', 'ब्रह्मा', 'शिव', 'विष्णु', 'गीता', 'श्लोक', 'चरण', 'मंत्र',
        'सृष्टि', 'आत्मा', 'प्रकृति', 'लोक', 'मोक्ष', 'संसार', 'कलि', 'सत्य',
        'असत्य', 'सर्व', 'भगवद्गीता', 'भगवत', 'कृष्णाय', 'कृष्णेन', 'कृष्णस्य'
    ]

    qa_system.HINDI_PATTERNS = [
        r'[\u0900-\u097F]',  # Devanagari script
        'क्यों', 'क्यूं', 'क्योकि', 'क्या', 'कौन', 'कहाँ', 'कैसे',
        'भगवान', 'श्री', 'कृष्ण', 'कृष्णा', 'भगवद्गीता', 'श्लोक',
        'धर्म', 'कर्म', 'योग', 'युद्ध', 'कर्तव्य', 'करना', 'मत',
        'हो', 'है', 'हैं', 'हूँ', 'साथ', 'में', 'से', 'को', 'का',
        'और', 'या', 'पर', 'के', 'की', 'ने', 'तो', 'भी', 'जो', 'जब'
    ]

    test_cases = [
        "kon hia dev in hindhi",  # User's example with typos
        "who is god in hindi",
        "कौन है देव हिंदी में",
        "what is dharma",
        "धर्म क्या है",
        "कृष्ण कौन हैं",
        "who is krishna",
        "भगवद्गीता क्या है",
        "what is bhagavad gita",
        "कर्म योग क्या है",
        "what is karma yoga",
        "dharma hi satya hai kya me sahi hu srikrishna kya kahenge"  # New Hinglish example
    ]

    print("Testing language detection:")
    print("=" * 50)

    for test_text in test_cases:
        detected = qa_system._detect_language(test_text)
        print(f"Text: '{test_text}'")
        print(f"Detected: {detected}")
        print("-" * 30)

if __name__ == "__main__":
    test_detection()
