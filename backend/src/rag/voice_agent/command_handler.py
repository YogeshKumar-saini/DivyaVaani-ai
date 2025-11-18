"""Command handler for system commands."""

import logging
from dataclasses import dataclass
from typing import Optional, Any, Callable

from .conversation_store import ConversationStore

logger = logging.getLogger(__name__)


@dataclass
class CommandResult:
    """Result of executing a command."""
    success: bool
    message: str
    data: Optional[dict] = None
    should_exit: bool = False


class CommandHandler:
    """Handle system commands in the voice agent CLI."""

    def __init__(
        self,
        conversation_store: ConversationStore,
        current_language: str = "en"
    ):
        """
        Initialize the command handler.

        Args:
            conversation_store: ConversationStore for history access
            current_language: Current language setting
        """
        self.conversation_store = conversation_store
        self.current_language = current_language
        self._language_change_callback: Optional[Callable[[str], None]] = None

    def set_language_change_callback(self, callback: Callable[[str], None]) -> None:
        """Set callback to be called when language changes."""
        self._language_change_callback = callback

    def execute(self, command: str) -> CommandResult:
        """
        Execute a system command.

        Args:
            command: Command string (without leading '/')

        Returns:
            CommandResult with execution status and message
        """
        # Parse command and arguments
        parts = command.strip().split(maxsplit=1)
        cmd_name = parts[0].lower()
        args = parts[1] if len(parts) > 1 else ""

        # Route to appropriate handler
        if cmd_name == "help":
            return self._handle_help()
        elif cmd_name == "history":
            return self._handle_history(args)
        elif cmd_name == "lang":
            return self._handle_lang(args)
        elif cmd_name == "clear":
            return self._handle_clear()
        elif cmd_name == "quit" or cmd_name == "exit":
            return self._handle_quit()
        elif cmd_name == "speak":
            return self._handle_speak(args)
        elif cmd_name == "listen":
            return self._handle_listen()
        elif cmd_name == "voice":
            return self._handle_voice()
        elif cmd_name == "stats":
            return self._handle_stats()
        elif cmd_name == "analytics":
            return self._handle_analytics()
        else:
            return CommandResult(
                success=False,
                message=f"Unknown command: '{cmd_name}'. Type '/help' for available commands."
            )

    def _handle_help(self) -> CommandResult:
        """Handle /help command."""
        help_text = """
🎤 DivyaVaani Voice Agent - Help
================================

💬 Natural Conversation:
   Just type your question naturally! No commands needed.
   Example: "What is the meaning of dharma?"
   Example: "How can I find inner peace?"

📋 Available Commands:
   /help              Show this help message
   /voice             Start voice-to-voice interaction (speak & listen)
   /stats             Show conversation statistics
   /analytics         Show detailed analytics dashboard
   /history [limit]   Show conversation history (default: 10)
   /lang [code]       Get or set language (en, hi, sa, etc.)
   /clear             Clear conversation history
   /quit              Exit the application

🗣️ Legacy Commands:
   speak <text>       Convert text to speech (mock)
   listen             Record voice input (mock)
   quit               Exit the application

🌍 Supported Languages:
   en - English       hi - Hindi         sa - Sanskrit
   bn - Bengali       te - Telugu        ta - Tamil
   mr - Marathi       gu - Gujarati      kn - Kannada
   ml - Malayalam     pa - Punjabi       or - Odia

💡 Tips:
   - Ask follow-up questions for deeper understanding
   - Use /history to review previous conversations
   - Switch languages anytime with /lang <code>
   - Your conversation context is maintained automatically

🙏 Namaste! Ask me anything about spiritual wisdom from the Bhagavad Gita.
"""
        return CommandResult(
            success=True,
            message=help_text.strip()
        )

    def _handle_history(self, args: str) -> CommandResult:
        """Handle /history command."""
        # Parse limit argument
        limit = 10  # default
        if args:
            try:
                limit = int(args.strip())
                if limit <= 0:
                    return CommandResult(
                        success=False,
                        message="History limit must be a positive number."
                    )
            except ValueError:
                return CommandResult(
                    success=False,
                    message=f"Invalid limit: '{args}'. Please provide a number."
                )

        # Get history
        exchanges = self.conversation_store.get_history(limit)

        if not exchanges:
            return CommandResult(
                success=True,
                message="📜 No conversation history yet. Start by asking a question!"
            )

        # Format history
        history_lines = [
            f"\n📜 Conversation History (Last {len(exchanges)} exchanges)",
            "=" * 60
        ]

        for i, exchange in enumerate(exchanges, 1):
            time_str = exchange.timestamp.strftime("%H:%M:%S")
            confidence_emoji = "🟢" if exchange.confidence > 0.7 else "🟡" if exchange.confidence > 0.5 else "🔴"

            history_lines.append(f"\n{i}. [{time_str}] {confidence_emoji}")
            history_lines.append(f"   You: {exchange.query}")

            # Truncate long responses
            response_preview = exchange.response[:150]
            if len(exchange.response) > 150:
                response_preview += "..."
            history_lines.append(f"   Krishna: {response_preview}")

        # Add statistics
        stats = self.conversation_store.get_statistics()
        history_lines.append(f"\n📊 Statistics:")
        history_lines.append(f"   Total exchanges: {stats['total_exchanges']}")
        history_lines.append(f"   Average confidence: {stats['average_confidence']:.2f}")
        history_lines.append(f"   Average time: {stats['average_processing_time']:.2f}s")

        return CommandResult(
            success=True,
            message="\n".join(history_lines),
            data={"exchanges": len(exchanges)}
        )

    def _handle_lang(self, args: str) -> CommandResult:
        """Handle /lang command."""
        valid_languages = {
            'en': 'English', 'hi': 'Hindi', 'sa': 'Sanskrit',
            'bn': 'Bengali', 'te': 'Telugu', 'ta': 'Tamil',
            'mr': 'Marathi', 'gu': 'Gujarati', 'kn': 'Kannada',
            'ml': 'Malayalam', 'pa': 'Punjabi', 'or': 'Odia'
        }

        if not args:
            # Show current language
            lang_name = valid_languages.get(self.current_language, self.current_language)
            return CommandResult(
                success=True,
                message=f"🌍 Current language: {lang_name} ({self.current_language})"
            )

        # Set new language
        new_lang = args.strip().lower()

        if new_lang not in valid_languages:
            available = ", ".join(f"{code} ({name})" for code, name in valid_languages.items())
            return CommandResult(
                success=False,
                message=f"❌ Unsupported language: '{new_lang}'\n\nAvailable languages:\n{available}"
            )

        # Update language
        old_lang = self.current_language
        self.current_language = new_lang

        # Call callback if set
        if self._language_change_callback:
            self._language_change_callback(new_lang)

        lang_name = valid_languages[new_lang]
        return CommandResult(
            success=True,
            message=f"✅ Language changed from {valid_languages.get(old_lang, old_lang)} to {lang_name}",
            data={"old_language": old_lang, "new_language": new_lang}
        )

    def _handle_clear(self) -> CommandResult:
        """Handle /clear command."""
        exchanges_count = self.conversation_store.get_total_exchanges()

        if exchanges_count == 0:
            return CommandResult(
                success=True,
                message="📜 Conversation history is already empty."
            )

        self.conversation_store.clear()

        return CommandResult(
            success=True,
            message=f"✅ Cleared {exchanges_count} conversation exchanges."
        )

    def _handle_quit(self) -> CommandResult:
        """Handle /quit command."""
        stats = self.conversation_store.get_statistics()

        farewell_message = "🙏 Namaste! Thank you for seeking wisdom.\n"

        if stats['total_exchanges'] > 0:
            farewell_message += f"\n📊 Session Summary:"
            farewell_message += f"\n   Questions asked: {stats['total_exchanges']}"
            farewell_message += f"\n   Average confidence: {stats['average_confidence']:.2f}"
            farewell_message += f"\n   Languages used: {', '.join(stats['languages_used'])}"

        farewell_message += "\n\nMay the teachings of the Bhagavad Gita guide you. Goodbye! 🙏"

        return CommandResult(
            success=True,
            message=farewell_message,
            should_exit=True
        )

    def _handle_speak(self, args: str) -> CommandResult:
        """Handle legacy 'speak' command."""
        if not args:
            return CommandResult(
                success=False,
                message="Please provide text to speak. Usage: speak <text>"
            )

        return CommandResult(
            success=True,
            message=f"🗣️ Text-to-speech (mock): '{args}'\n🔊 Audio would be played here...",
            data={"text": args, "mode": "mock"}
        )

    def _handle_listen(self) -> CommandResult:
        """Handle legacy 'listen' command."""
        return CommandResult(
            success=True,
            message="🎧 Voice input (mock): Listening...\n💡 Tip: In mock mode, voice input is simulated.",
            data={"mode": "mock"}
        )

    def _handle_voice(self) -> CommandResult:
        """Handle /voice command - triggers voice-to-voice interaction."""
        return CommandResult(
            success=True,
            message="🎤 Voice-to-Voice Mode:\n💡 Speak your question after pressing Enter.\n🎧 The system will listen, process, and respond with voice.\n\n⚠️  Note: Requires microphone and speakers to be available.\n   Use Ctrl+C to stop voice recording.",
            data={"mode": "voice_interaction", "trigger_voice": True}
        )

    def _handle_stats(self) -> CommandResult:
        """Handle /stats command - shows system statistics."""
        stats = self.conversation_store.get_statistics()

        stats_message = f"""
📊 System Statistics
{'='*40}

🗣️  Conversations:
   Total exchanges: {stats['total_exchanges']}
   Average confidence: {stats['average_confidence']:.2f}
   Average response time: {stats['average_processing_time']:.2f}s

🌍 Languages used: {', '.join(stats['languages_used']) if stats['languages_used'] else 'None'}

💾 Memory status: {'Active' if stats['total_exchanges'] > 0 else 'Empty'}
"""

        return CommandResult(
            success=True,
            message=stats_message.strip(),
            data=stats
        )

    def _handle_analytics(self) -> CommandResult:
        """Handle /analytics command - shows detailed analytics dashboard."""
        analytics = self.conversation_store.get_analytics_dashboard()

        if analytics.get("error"):
            return CommandResult(
                success=False,
                message=f"❌ Analytics not available: {analytics['error']}"
            )

        # Format analytics dashboard
        dashboard = f"""
📈 Advanced Analytics Dashboard
{'='*50}

🕐 Session Overview:
   Duration: {analytics['session_duration']:.0f} seconds
   Start time: {analytics['conversation_metrics'].get('session_start', 'N/A')}

🗣️ Conversation Metrics:
   Total exchanges: {analytics['conversation_metrics']['total_exchanges']}
   Average confidence: {analytics['conversation_metrics']['average_confidence']:.2f}
   Average response time: {analytics['conversation_metrics']['average_processing_time']:.2f}s
   Languages used: {', '.join(analytics['conversation_metrics']['languages_used'])}

⏰ Temporal Patterns:
   Average time between queries: {analytics['temporal_patterns']['average_time_between_queries']:.1f}s
   Total session time: {analytics['temporal_patterns']['total_session_time']:.0f}s
"""

        # Add quality metrics if available
        if 'quality_metrics' in analytics:
            dashboard += f"""
⭐ Response Quality:
   High confidence (>0.8): {analytics['quality_metrics']['confidence_distribution']['high']}
   Medium confidence (0.6-0.8): {analytics['quality_metrics']['confidence_distribution']['medium']}
   Low confidence (<0.6): {analytics['quality_metrics']['confidence_distribution']['low']}
   Average response time: {analytics['quality_metrics']['processing_time_stats']['average']:.2f}s
"""

        # Add engagement metrics if available
        if 'engagement_metrics' in analytics:
            dashboard += f"""
🎯 User Engagement:
   Average query length: {analytics['engagement_metrics']['average_query_length']:.1f} words
   Language switches: {analytics['engagement_metrics']['language_switches']}
   Topic diversity: {analytics['engagement_metrics']['topic_diversity']} unique topics
   Follow-up questions: {analytics['engagement_metrics']['follow_up_questions']}
"""

        # Add personalized insights if available
        if 'learning_insights' in analytics:
            insights = analytics['learning_insights']
            if insights['insights']:
                dashboard += f"""
🧠 Personalized Insights:
"""
                for insight in insights['insights'][:3]:  # Show top 3
                    dashboard += f"   • {insight}\n"

        return CommandResult(
            success=True,
            message=dashboard.strip(),
            data=analytics
        )
