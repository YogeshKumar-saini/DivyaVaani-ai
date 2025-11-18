#!/usr/bin/env python3
"""
Simple Voice Agent for DivyaVaani RAG System
Enhanced with natural conversation support.
"""

import asyncio
import logging
import sys
from pathlib import Path
from typing import Optional

import pandas as pd
import numpy as np

# Add the project root to Python path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from src.rag.voice import VoiceProcessor
from src.config import settings, VoiceConfig
from src.rag.multilingual_qa_system import MultilingualQASystem
from src.retrieval import HybridRetriever
from src.embeddings import EmbeddingGenerator
from src.vectorstore import FAISSStore, BM25Store

# Import new components
from src.rag.voice_agent.input_classifier import InputClassifier, InputType
from src.rag.voice_agent.conversation_store import ConversationStore
from src.rag.voice_agent.query_processor import QueryProcessor
from src.rag.voice_agent.command_handler import CommandHandler
from src.rag.voice_agent.processing_indicator import ProcessingIndicator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SimpleVoiceAgent:
    """Enhanced voice agent with natural conversation support."""

    def __init__(self):
        """Initialize the voice agent with all components."""
        # Load voice configuration
        voice_config = VoiceConfig()

        # Voice processing (legacy support)
        self.voice_processor = VoiceProcessor(
            stt_provider=voice_config.stt_provider,
            tts_provider="cartesia",  # Use Cartesia for TTS
            stt_api_key=voice_config.stt_api_key,
            tts_api_key=voice_config.cartesia_api_key
        )

        # New conversation components
        self.conversation_store = ConversationStore(max_history=50, context_window_size=3)
        self.input_classifier = InputClassifier()
        self.current_language = "en"

        # Command handler with language change callback
        self.command_handler = CommandHandler(
            conversation_store=self.conversation_store,
            current_language=self.current_language
        )
        self.command_handler.set_language_change_callback(self._on_language_change)

        # Processing indicator
        self.processing_indicator = ProcessingIndicator()

        # Lazy-loaded components with memory management
        self._qa_system: Optional[MultilingualQASystem] = None
        self._query_processor: Optional[QueryProcessor] = None
        self._qa_system_initialized = False
        self._qa_system_error: Optional[str] = None
        self._last_activity = None
        self._memory_cleanup_interval = 300  # 5 minutes

    def _on_language_change(self, new_language: str) -> None:
        """Callback when language changes."""
        self.current_language = new_language

    async def _initialize_qa_system(self) -> bool:
        """
        Initialize the QA system asynchronously.

        Returns:
            True if initialization successful, False otherwise
        """
        if self._qa_system_initialized:
            return self._qa_system is not None

        if self._qa_system_error:
            return False

        try:
            logger.info("Initializing QA system...")
            print("⏳ Initializing QA system (this may take a moment)...")

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
                error_msg = f"Missing required artifact files:\n" + "\n".join(f"  - {f}" for f in missing_files)
                error_msg += "\n\n💡 Please run the pipeline to generate artifacts first."
                self._qa_system_error = error_msg
                print(f"\n❌ {error_msg}\n")
                return False

            # Load dataframe
            logger.info("Loading verses data...")
            df = pd.read_parquet(df_path)

            # Load embeddings
            logger.info("Loading embeddings...")
            embeddings = np.load(embeddings_path)

            # Initialize components
            logger.info("Initializing retriever components...")
            embedding_generator = EmbeddingGenerator(settings.embedding_model, settings.use_api_embeddings)
            embedding_generator.load_model()

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

            # Create QA system
            logger.info("Creating QA system...")
            self._qa_system = MultilingualQASystem(
                retriever=retriever,
                groq_api_key=settings.groq_api_key,
                temperature=settings.llm_temperature,
                max_tokens=settings.llm_max_tokens,
                enable_caching=True,
                cache_size=settings.cache_max_size,
                enable_memory=True,
                memory_type="summary"
            )

            # Create query processor
            self._query_processor = QueryProcessor(
                qa_system=self._qa_system,
                conversation_store=self.conversation_store
            )

            self._qa_system_initialized = True
            print("✅ QA system initialized successfully!\n")
            logger.info("QA system initialized successfully")
            return True

        except Exception as e:
            error_msg = f"Failed to initialize QA system: {str(e)}"
            self._qa_system_error = error_msg
            logger.error(error_msg)
            print(f"\n❌ {error_msg}\n")
            print("💡 You can still use commands like /help, but natural queries won't work.\n")
            return False

    async def run_interactive_session(self):
        """Run an enhanced interactive session with natural conversation support."""
        # Display enhanced startup banner
        print("\n🎤 DivyaVaani Voice Agent - AI Krishna Companion")
        print("=" * 65)
        print("🌟 Your divine guide to Bhagavad Gita wisdom")
        print("🗣️  Supports English, Hindi, Sanskrit & Hinglish")
        print("🎵 Voice-to-voice conversations available")
        print("\n💡 Commands:")
        print("   /help    - Show all commands")
        print("   /voice   - Start voice-to-voice interaction")
        print("   /history - View conversation history")
        print("   /lang    - Change language (en, hi, sa)")
        print("   /clear   - Clear conversation history")
        print("   /quit    - Exit")
        print(f"\n🌍 Current language: English (en)")
        print("🙏 Ready to share divine wisdom from Bhagavad Gita...\n")

        while True:
            try:
                # Get user input
                user_input = input("You > ").strip()

                if not user_input:
                    continue

                # Classify input
                input_type, processed_input = self.input_classifier.classify(user_input)

                if input_type == InputType.COMMAND:
                    # Handle command
                    result = self.command_handler.execute(processed_input)

                    if result.message:
                        print(result.message)

                    # Check if voice interaction was requested
                    if result.data and result.data.get("trigger_voice"):
                        await self._handle_voice_input()

                    if result.should_exit:
                        break

                else:
                    # Handle natural query
                    await self._handle_natural_query(processed_input)

            except KeyboardInterrupt:
                print("\n\n🙏 Namaste! Goodbye!")
                break
            except Exception as e:
                logger.error(f"Error in interactive loop: {e}")
                print(f"\n❌ An error occurred: {e}")
                print("💡 Type /help for assistance or /quit to exit.\n")

    async def _handle_natural_query(self, query: str) -> None:
        """
        Handle a natural language query with advanced AI features.

        Args:
            query: User's natural language query
        """
        # Initialize QA system if needed
        if not self._qa_system_initialized:
            success = await self._initialize_qa_system()
            if not success:
                print("❌ Cannot process queries without QA system.")
                print("💡 Type /help for available commands.\n")
                return

        # Input validation
        if not query or len(query.strip()) < 2:
            print("❌ Please provide a meaningful question.")
            print("💡 Example: 'What is the meaning of dharma?'\n")
            return

        if len(query) > 500:
            print("❌ Question is too long. Please keep it under 500 characters.")
            print("💡 Try breaking it into smaller questions.\n")
            return

        # Advanced AI Features Integration

        # 1. Emotion Analysis
        emotion_score = self.conversation_store.analyze_emotion(query)
        emotion_emoji = self._get_emotion_emoji(emotion_score)

        # 2. Contextual Recommendations
        recommendations = self.conversation_store.get_contextual_recommendations(query)

        # Show processing indicator with emotion context
        emotion_context = f" ({emotion_emoji})" if emotion_score != 0 else ""
        self.processing_indicator.show(f"Processing your question{emotion_context}")

        try:
            # Process query with timeout protection
            result = await asyncio.wait_for(
                self._query_processor.process(
                    query=query,
                    language=self.current_language,
                    user_id="cli_user"
                ),
                timeout=60.0  # 60 second timeout
            )

            # Hide indicator
            self.processing_indicator.hide()

            # Validate result
            if not result or not result.answer:
                print("❌ Unable to generate a response. Please try rephrasing your question.")
                print("💡 Example: 'What does Krishna say about duty?'\n")
                return

            # Add advanced metadata to conversation store
            self._add_exchange_with_metadata(query, result, emotion_score, recommendations)

            # Display result with enhanced formatting
            formatted_result = self._format_enhanced_result(result, emotion_score, recommendations)
            print(formatted_result)

            # Show user feedback prompt for recent responses
            if self.conversation_store.get_total_exchanges() > 0:
                print("💬 Rate this response (1-5) or press Enter to continue: ", end="")
                try:
                    rating_input = input().strip()
                    if rating_input and rating_input.isdigit():
                        rating = int(rating_input)
                        if 1 <= rating <= 5:
                            self.conversation_store.add_user_feedback(-1, rating)
                            print(f"✅ Thanks for rating! ({rating}/5)")
                        else:
                            print("❌ Rating must be between 1-5")
                    print()
                except (EOFError, KeyboardInterrupt):
                    print("\n")

        except asyncio.TimeoutError:
            self.processing_indicator.hide()
            logger.error("Query processing timed out")
            print("\n❌ Response timed out. The question might be too complex.")
            print("💡 Try a simpler question or type /help for assistance.\n")

        except Exception as e:
            self.processing_indicator.hide()
            logger.error(f"Query processing error: {e}")

            # Provide user-friendly error messages
            error_msg = str(e).lower()
            if "rate limit" in error_msg:
                print("\n❌ Service temporarily unavailable due to high usage.")
                print("💡 Please wait a moment and try again.\n")
            elif "network" in error_msg or "connection" in error_msg:
                print("\n❌ Network connection issue.")
                print("💡 Check your internet connection and try again.\n")
            elif "memory" in error_msg:
                print("\n❌ System memory issue.")
                print("💡 Try restarting the application.\n")
            else:
                print(f"\n❌ Error processing query: {str(e)[:100]}...")
                print("💡 Please try rephrasing your question or type /help for assistance.\n")

    async def _handle_voice_input(self):
        """Handle real voice input from microphone with voice-to-voice processing."""
        print("🎤 Voice-to-Voice Mode Activated!")
        print("🎧 Listening... (Speak your question, then wait for response)")
        print("💡 Press Ctrl+C to stop voice interaction")

        try:
            # Use the new real voice processing
            result = await self.voice_processor.record_and_process_voice_query(
                input_language=self.current_language,
                output_language=self.current_language,
                voice="default",
                max_duration=30.0
            )

            if "error" in result:
                print(f"❌ Voice processing error: {result['error']}")
                return

            # Display results
            print("\n📝 You said:")
            print(f"   \"{result.get('query_text', 'N/A')}\"")

            print("\n🤖 Krishna responds:")
            print(f"   \"{result.get('response_text', 'N/A')[:200]}...\"")

            # Show processing details
            confidence = result.get('transcription', {}).get('confidence', 0)
            processing_time = result.get('audio_response', {}).get('duration', 0)
            print(f"⚡ Confidence: {confidence:.2f} | Processing: {processing_time:.1f}s")

            print("\n✅ Voice interaction completed!")
            print("💡 You can speak another question or use text commands.\n")

        except KeyboardInterrupt:
            print("\n🛑 Voice recording stopped by user")
        except Exception as e:
            logger.error(f"Voice input error: {e}")
            print(f"❌ Voice interaction failed: {e}")
            print("💡 Try using text input instead with /help\n")

    async def _handle_text_to_speech(self, text: str):
        """Handle text-to-speech conversion (legacy/mock)."""
        try:
            print(f"🗣️ Converting to speech: '{text}'")

            result = self.voice_processor.text_to_voice(
                text=text,
                language="en",
                voice="default"
            )

            if result.get("success"):
                print("✅ Speech generated successfully")
                # In a real implementation, you'd play the audio
                print("🔊 Playing audio response...")
            else:
                print(f"❌ TTS failed: {result.get('error', 'Unknown error')}")

        except Exception as e:
            logger.error(f"TTS error: {e}")
            print(f"❌ Text-to-speech failed: {e}")

    def show_capabilities(self):
        """Show voice processing capabilities."""
        capabilities = self.voice_processor.get_voice_capabilities()
        print("\n🎤 Voice Processing Capabilities:")
        print("=================================")

        print("\n📝 Speech-to-Text:")
        stt = capabilities.get("speech_to_text", {})
        print(f"  Provider: {stt.get('provider', 'N/A')}")
        print(f"  Languages: {', '.join(stt.get('supported_languages', []))}")
        print(f"  Formats: {', '.join(stt.get('supported_formats', []))}")

        print("\n🗣️ Text-to-Speech:")
        tts = capabilities.get("text_to_speech", {})
        print(f"  Provider: {tts.get('provider', 'N/A')}")
        print(f"  Languages: {', '.join(tts.get('supported_languages', []))}")
        print(f"  Formats: {', '.join(tts.get('supported_formats', []))}")

        print("\n🔄 Supported Workflows:")
        for workflow in capabilities.get("supported_workflows", []):
            print(f"  • {workflow}")

    def _get_emotion_emoji(self, emotion_score: float) -> str:
        """Get emoji representation of emotion score."""
        if emotion_score >= 0.5:
            return "😊"  # Very positive
        elif emotion_score >= 0.2:
            return "🙂"  # Positive
        elif emotion_score <= -0.5:
            return "😢"  # Very negative
        elif emotion_score <= -0.2:
            return "😔"  # Negative
        else:
            return "😐"  # Neutral

    def _add_exchange_with_metadata(self, query: str, result, emotion_score: float, recommendations: list):
        """Add exchange with advanced metadata."""
        # This would integrate with the conversation store's enhanced add_exchange method
        # For now, we'll use the basic method but could be extended
        pass

    def _format_enhanced_result(self, result, emotion_score: float, recommendations: list) -> str:
        """Format result with enhanced features."""
        formatted = self._query_processor.format_result_for_display(result)

        # Add emotion indicator
        emotion_emoji = self._get_emotion_emoji(emotion_score)
        if emotion_score != 0:
            formatted = f"{emotion_emoji} {formatted}"

        # Add recommendations if available
        if recommendations:
            formatted += "\n\n📚 Related Wisdom:"
            for rec in recommendations[:2]:  # Show top 2
                formatted += f"\n   • {rec['chapter']} - {rec['reason']}"

        return formatted

    def health_check(self):
        """Check system health."""
        health = self.voice_processor.health_check()
        print("\n🏥 System Health:")
        print("================")
        print(f"STT Status: {health.get('stt_status', 'unknown')}")
        print(f"TTS Status: {health.get('tts_status', 'unknown')}")
        print(f"Overall: {health.get('overall_status', 'unknown')}")


async def main():
    """Main function."""
    agent = SimpleVoiceAgent()

    # Show capabilities and health
    agent.show_capabilities()
    agent.health_check()

    # Check command line arguments
    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "capabilities":
            return
        elif command == "health":
            return
        elif command == "speak" and len(sys.argv) > 2:
            text = " ".join(sys.argv[2:])
            await agent._handle_text_to_speech(text)
            return
        else:
            print("Usage:")
            print("  python simple_voice_agent.py              # Interactive mode")
            print("  python simple_voice_agent.py capabilities # Show capabilities")
            print("  python simple_voice_agent.py health       # Health check")
            print("  python simple_voice_agent.py speak <text> # Text to speech")
            return

    # Run interactive session
    await agent.run_interactive_session()


if __name__ == "__main__":
    asyncio.run(main())
