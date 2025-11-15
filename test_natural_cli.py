#!/usr/bin/env python3
"""Test script for natural CLI conversation."""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from src.rag.voice_agent.input_classifier import InputClassifier, InputType
from src.rag.voice_agent.conversation_store import ConversationStore
from src.rag.voice_agent.command_handler import CommandHandler


async def test_components():
    """Test individual components."""
    print("🧪 Testing Natural CLI Components")
    print("=" * 60)

    # Test 1: InputClassifier
    print("\n1️⃣ Testing InputClassifier...")
    classifier = InputClassifier()

    test_inputs = [
        "/help",
        "quit",
        "speak hello world",
        "What is dharma?",
        "/lang hi",
        "How can I find peace?",
        "/history",
        ""
    ]

    for inp in test_inputs:
        input_type, processed = classifier.classify(inp)
        print(f"   Input: '{inp}' → {input_type.value}: '{processed}'")

    # Test 2: ConversationStore
    print("\n2️⃣ Testing ConversationStore...")
    store = ConversationStore()

    store.add_exchange(
        query="What is dharma?",
        response="Dharma is your sacred duty...",
        language="en",
        confidence=0.85,
        processing_time=1.2
    )

    store.add_exchange(
        query="How do I find peace?",
        response="Peace comes from within...",
        language="en",
        confidence=0.92,
        processing_time=0.8
    )

    print(f"   Total exchanges: {store.get_total_exchanges()}")
    print(f"   Statistics: {store.get_statistics()}")

    history = store.get_history(limit=2)
    print(f"   History entries: {len(history)}")

    # Test 3: CommandHandler
    print("\n3️⃣ Testing CommandHandler...")
    handler = CommandHandler(store, current_language="en")

    test_commands = [
        "help",
        "history",
        "lang",
        "lang hi",
        "clear",
        "unknown_command"
    ]

    for cmd in test_commands:
        result = handler.execute(cmd)
        status = "✅" if result.success else "❌"
        print(f"   {status} Command '{cmd}': {result.success}")

    print("\n✅ All component tests completed!")


if __name__ == "__main__":
    asyncio.run(test_components())
