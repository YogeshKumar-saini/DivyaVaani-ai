"""Conversation store for managing chat history and context."""

from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional


@dataclass
class ConversationExchange:
    """A single query-response exchange in the conversation."""
    timestamp: datetime
    query: str
    response: str
    language: str
    confidence: float
    processing_time: float
    sources: Optional[List[dict]] = None
    user_feedback: Optional[dict] = None
    related_verses: Optional[List[dict]] = None
    emotion_score: Optional[float] = None

    def __str__(self) -> str:
        """Format exchange for display."""
        time_str = self.timestamp.strftime("%H:%M:%S")
        return f"[{time_str}] You: {self.query}\n   Krishna: {self.response[:100]}..."


class ConversationStore:
    """Store and manage conversation history for the current session."""

    def __init__(self, max_history: int = 50, context_window_size: int = 3):
        """
        Initialize the conversation store.

        Args:
            max_history: Maximum number of exchanges to keep in history
            context_window_size: Number of recent exchanges to include in context
        """
        self.max_history = max_history
        self.context_window_size = context_window_size
        self._exchanges: List[ConversationExchange] = []
        self._user_preferences = {}
        self._analytics_data = {
            "topics_discussed": {},
            "response_ratings": [],
            "language_usage": {},
            "query_types": {},
            "session_start": datetime.now()
        }

    def add_exchange(
        self,
        query: str,
        response: str,
        language: str,
        confidence: float = 0.0,
        processing_time: float = 0.0
    ) -> None:
        """
        Add a query-response exchange to the history.

        Args:
            query: User's query text
            response: System's response text
            language: Language of the exchange
            confidence: Confidence score of the response (0.0 to 1.0)
            processing_time: Time taken to process the query in seconds
        """
        exchange = ConversationExchange(
            timestamp=datetime.now(),
            query=query,
            response=response,
            language=language,
            confidence=confidence,
            processing_time=processing_time
        )

        self._exchanges.append(exchange)

        # Trim history if it exceeds max_history
        if len(self._exchanges) > self.max_history:
            self._exchanges = self._exchanges[-self.max_history:]

    def get_history(self, limit: int = 10) -> List[ConversationExchange]:
        """
        Get recent conversation history.

        Args:
            limit: Maximum number of exchanges to return

        Returns:
            List of recent ConversationExchange objects (most recent last)
        """
        if limit <= 0:
            return []

        return self._exchanges[-limit:] if len(self._exchanges) > limit else self._exchanges.copy()

    def get_context_window(self) -> str:
        """
        Get formatted context from recent exchanges for query processing.

        Returns:
            Formatted string containing recent conversation context
        """
        if not self._exchanges:
            return ""

        recent_exchanges = self._exchanges[-self.context_window_size:]

        context_parts = []
        for exchange in recent_exchanges:
            context_parts.append(f"Previous question: {exchange.query}")
            context_parts.append(f"Previous answer: {exchange.response[:200]}")

        context = "\n".join(context_parts)
        return f"\n\nRecent conversation context:\n{context}\n"

    def clear(self) -> None:
        """Clear all conversation history."""
        self._exchanges.clear()

    def get_total_exchanges(self) -> int:
        """Get total number of exchanges in history."""
        return len(self._exchanges)

    def is_empty(self) -> bool:
        """Check if conversation history is empty."""
        return len(self._exchanges) == 0

    def get_last_exchange(self) -> Optional[ConversationExchange]:
        """Get the most recent exchange, or None if history is empty."""
        return self._exchanges[-1] if self._exchanges else None

    def get_statistics(self) -> dict:
        """
        Get statistics about the conversation.

        Returns:
            Dictionary with conversation statistics
        """
        if not self._exchanges:
            return {
                "total_exchanges": 0,
                "average_confidence": 0.0,
                "average_processing_time": 0.0,
                "languages_used": []
            }

        total_confidence = sum(ex.confidence for ex in self._exchanges)
        total_time = sum(ex.processing_time for ex in self._exchanges)
        languages = list(set(ex.language for ex in self._exchanges))

        return {
            "total_exchanges": len(self._exchanges),
            "average_confidence": total_confidence / len(self._exchanges),
            "average_processing_time": total_time / len(self._exchanges),
            "languages_used": languages
        }

    # Advanced Features Implementation

    def add_user_feedback(self, exchange_index: int, rating: int, comment: str = "") -> bool:
        """
        Add user feedback to a specific exchange.

        Args:
            exchange_index: Index of the exchange (from end, -1 is most recent)
            rating: Rating from 1-5 (1=poor, 5=excellent)
            comment: Optional user comment

        Returns:
            True if feedback added successfully, False otherwise
        """
        if not self._exchanges or exchange_index >= len(self._exchanges):
            return False

        # Convert negative index to positive
        if exchange_index < 0:
            actual_index = len(self._exchanges) + exchange_index
        else:
            actual_index = exchange_index

        if actual_index < 0 or actual_index >= len(self._exchanges):
            return False

        feedback = {
            "rating": max(1, min(5, rating)),  # Clamp to 1-5
            "comment": comment.strip(),
            "timestamp": datetime.now()
        }

        self._exchanges[actual_index].user_feedback = feedback
        self._analytics_data["response_ratings"].append(feedback["rating"])
        return True

    def get_contextual_recommendations(self, current_query: str) -> List[dict]:
        """
        Get contextual recommendations based on conversation history.

        Args:
            current_query: Current user query

        Returns:
            List of recommended verses/topics
        """
        if not self._exchanges:
            return []

        # Analyze conversation patterns
        topics_discussed = set()
        for exchange in self._exchanges[-5:]:  # Last 5 exchanges
            topics = self._extract_topics(exchange.query)
            topics_discussed.update(topics)

        # Find related verses based on topics
        recommendations = []

        # Bhagavad Gita chapter mappings for common topics
        topic_mappings = {
            "dharma": ["Chapter 2: Karma Yoga", "Chapter 3: Karma Yoga"],
            "karma": ["Chapter 3: Karma Yoga", "Chapter 4: Jnana Karma Sanyasa Yoga"],
            "yoga": ["Chapter 6: Dhyana Yoga", "Chapter 12: Bhakti Yoga"],
            "meditation": ["Chapter 6: Dhyana Yoga"],
            "wisdom": ["Chapter 4: Jnana Karma Sanyasa Yoga", "Chapter 18: Moksha Sanyasa Yoga"],
            "peace": ["Chapter 2: Sankhya Yoga", "Chapter 12: Bhakti Yoga"],
            "love": ["Chapter 12: Bhakti Yoga"],
            "duty": ["Chapter 3: Karma Yoga"],
            "mind": ["Chapter 6: Dhyana Yoga"],
            "soul": ["Chapter 2: Sankhya Yoga", "Chapter 15: Purushottama Yoga"]
        }

        for topic in topics_discussed:
            if topic in topic_mappings:
                for chapter in topic_mappings[topic][:2]:  # Limit to 2 recommendations per topic
                    recommendations.append({
                        "topic": topic,
                        "chapter": chapter,
                        "reason": f"Related to your interest in {topic}"
                    })

        return recommendations[:3]  # Return top 3 recommendations

    def analyze_emotion(self, query: str) -> float:
        """
        Analyze emotional content of user query.

        Args:
            query: User query text

        Returns:
            Emotion score from -1 (very negative) to +1 (very positive)
        """
        query_lower = query.lower()

        # Positive emotion indicators
        positive_words = [
            'happy', 'joy', 'peace', 'love', 'grateful', 'thank', 'wonderful',
            'beautiful', 'amazing', 'great', 'good', 'excellent', 'blessed',
            'enlightened', 'wise', 'understanding', 'clear', 'hope', 'faith'
        ]

        # Negative emotion indicators
        negative_words = [
            'sad', 'angry', 'frustrated', 'confused', 'lost', 'pain', 'suffering',
            'worried', 'anxious', 'afraid', 'scared', 'depressed', 'hopeless',
            'alone', 'lonely', 'tired', 'exhausted', 'overwhelmed', 'stressed'
        ]

        # Crisis indicators (strongly negative)
        crisis_words = [
            'die', 'death', 'suicide', 'kill', 'end', 'give up', 'no hope',
            'can\'t', 'impossible', 'trapped', 'stuck', 'broken', 'destroyed'
        ]

        positive_score = sum(1 for word in positive_words if word in query_lower)
        negative_score = sum(1 for word in negative_words if word in query_lower)
        crisis_score = sum(2 for word in crisis_words if word in query_lower)  # Double weight

        total_negative = negative_score + crisis_score

        if positive_score == 0 and total_negative == 0:
            return 0.0  # Neutral

        # Calculate weighted score
        total_score = positive_score - total_negative
        max_possible = max(positive_score + total_negative, 1)  # Avoid division by zero

        return max(-1.0, min(1.0, total_score / max_possible))

    def get_personalized_insights(self) -> dict:
        """
        Generate personalized insights based on conversation history.

        Returns:
            Dictionary with personalized insights and recommendations
        """
        if not self._exchanges:
            return {"insights": [], "recommendations": []}

        insights = []
        recommendations = []

        # Analyze language preferences
        languages = [ex.language for ex in self._exchanges]
        if len(set(languages)) > 1:
            insights.append("🌍 You explore wisdom in multiple languages")
            recommendations.append("Consider deepening your study in your preferred language")

        # Analyze topic interests
        all_topics = []
        for exchange in self._exchanges:
            all_topics.extend(self._extract_topics(exchange.query))

        topic_counts = {}
        for topic in all_topics:
            topic_counts[topic] = topic_counts.get(topic, 0) + 1

        if topic_counts:
            top_topic = max(topic_counts.items(), key=lambda x: x[1])
            insights.append(f"🧘 Your primary interest is in {top_topic[0]}")
            recommendations.append(f"Explore Chapter {self._get_chapter_for_topic(top_topic[0])} for deeper understanding")

        # Analyze emotional journey
        emotion_scores = [ex.emotion_score for ex in self._exchanges if ex.emotion_score is not None]
        if emotion_scores:
            avg_emotion = sum(emotion_scores) / len(emotion_scores)
            if avg_emotion > 0.3:
                insights.append("✨ You show positive spiritual engagement")
            elif avg_emotion < -0.3:
                insights.append("🤝 You're seeking guidance during challenging times")
                recommendations.append("Consider regular meditation and self-reflection")

        # Analyze response quality feedback
        ratings = self._analytics_data.get("response_ratings", [])
        if ratings:
            avg_rating = sum(ratings) / len(ratings)
            if avg_rating >= 4.5:
                insights.append("⭐ You find our conversations very helpful")
            elif avg_rating >= 3.5:
                insights.append("👍 You generally find our guidance useful")
            else:
                insights.append("💭 We're working to better serve your spiritual needs")

        return {
            "insights": insights,
            "recommendations": recommendations,
            "topic_interests": topic_counts,
            "emotional_journey": emotion_scores[-5:] if emotion_scores else []  # Last 5 emotions
        }

    def get_analytics_dashboard(self) -> dict:
        """
        Get comprehensive analytics dashboard data.

        Returns:
            Dictionary with detailed analytics
        """
        if not self._exchanges:
            return {"error": "No conversation data available"}

        # Basic statistics
        stats = self.get_statistics()

        # Enhanced analytics
        analytics = {
            "conversation_metrics": stats,
            "temporal_patterns": self._analyze_temporal_patterns(),
            "quality_metrics": self._analyze_response_quality(),
            "engagement_metrics": self._analyze_engagement(),
            "learning_insights": self.get_personalized_insights(),
            "session_duration": (datetime.now() - self._analytics_data["session_start"]).total_seconds()
        }

        return analytics

    def _extract_topics(self, query: str) -> List[str]:
        """Extract spiritual topics from user query."""
        topics = []
        query_lower = query.lower()

        spiritual_keywords = {
            'dharma': ['dharma', 'righteousness', 'duty', 'moral'],
            'karma': ['karma', 'action', 'deed', 'work'],
            'yoga': ['yoga', 'union', 'practice', 'discipline'],
            'meditation': ['meditation', 'dhyana', 'contemplation', 'focus'],
            'enlightenment': ['enlightenment', 'moksha', 'liberation', 'freedom'],
            'soul': ['soul', 'atman', 'self', 'spirit'],
            'god': ['god', 'divine', 'krishna', 'supreme'],
            'mind': ['mind', 'thought', 'consciousness', 'awareness'],
            'peace': ['peace', 'shanti', 'calm', 'tranquility'],
            'love': ['love', 'bhakti', 'devotion', 'compassion'],
            'wisdom': ['wisdom', 'jnana', 'knowledge', 'understanding'],
            'truth': ['truth', 'satya', 'reality', 'authentic']
        }

        for topic, keywords in spiritual_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                topics.append(topic)

        return topics

    def _get_chapter_for_topic(self, topic: str) -> str:
        """Get recommended Bhagavad Gita chapter for a topic."""
        chapter_map = {
            'dharma': '2-3 (Karma Yoga)',
            'karma': '3 (Karma Yoga)',
            'yoga': '6 (Dhyana Yoga)',
            'meditation': '6 (Dhyana Yoga)',
            'enlightenment': '4 (Jnana Karma Sanyasa)',
            'soul': '2 (Sankhya Yoga)',
            'god': '11 (Vishwarupa Darshana)',
            'mind': '6 (Dhyana Yoga)',
            'peace': '2 (Sankhya Yoga)',
            'love': '12 (Bhakti Yoga)',
            'wisdom': '4 (Jnana Karma Sanyasa)',
            'truth': '10 (Vibhuti Yoga)'
        }
        return chapter_map.get(topic, '2 (Sankhya Yoga)')

    def _analyze_temporal_patterns(self) -> dict:
        """Analyze conversation patterns over time."""
        if not self._exchanges:
            return {}

        # Group by hour of day
        hourly_distribution = {}
        for exchange in self._exchanges:
            hour = exchange.timestamp.hour
            hourly_distribution[hour] = hourly_distribution.get(hour, 0) + 1

        # Calculate session patterns
        time_gaps = []
        for i in range(1, len(self._exchanges)):
            gap = (self._exchanges[i].timestamp - self._exchanges[i-1].timestamp).total_seconds()
            time_gaps.append(gap)

        return {
            "hourly_distribution": hourly_distribution,
            "average_time_between_queries": sum(time_gaps) / len(time_gaps) if time_gaps else 0,
            "total_session_time": (self._exchanges[-1].timestamp - self._exchanges[0].timestamp).total_seconds()
        }

    def _analyze_response_quality(self) -> dict:
        """Analyze response quality metrics."""
        if not self._exchanges:
            return {}

        confidences = [ex.confidence for ex in self._exchanges]
        processing_times = [ex.processing_time for ex in self._exchanges]

        return {
            "confidence_distribution": {
                "high": len([c for c in confidences if c >= 0.8]),
                "medium": len([c for c in confidences if 0.6 <= c < 0.8]),
                "low": len([c for c in confidences if c < 0.6])
            },
            "processing_time_stats": {
                "average": sum(processing_times) / len(processing_times),
                "fastest": min(processing_times),
                "slowest": max(processing_times)
            },
            "feedback_ratings": self._analytics_data.get("response_ratings", [])
        }

    def _analyze_engagement(self) -> dict:
        """Analyze user engagement patterns."""
        if not self._exchanges:
            return {}

        # Query length analysis
        query_lengths = [len(ex.query.split()) for ex in self._exchanges]

        # Language switching
        languages = [ex.language for ex in self._exchanges]
        language_switches = sum(1 for i in range(1, len(languages)) if languages[i] != languages[i-1])

        # Topic diversity
        all_topics = []
        for ex in self._exchanges:
            all_topics.extend(self._extract_topics(ex.query))
        unique_topics = len(set(all_topics))

        return {
            "average_query_length": sum(query_lengths) / len(query_lengths),
            "language_switches": language_switches,
            "topic_diversity": unique_topics,
            "follow_up_questions": self._count_follow_up_questions()
        }

    def _count_follow_up_questions(self) -> int:
        """Count follow-up questions in conversation."""
        follow_up_indicators = ['also', 'what about', 'tell me more', 'explain', 'why', 'how']
        count = 0

        for exchange in self._exchanges:
            query_lower = exchange.query.lower()
            if any(indicator in query_lower for indicator in follow_up_indicators):
                count += 1

        return count
