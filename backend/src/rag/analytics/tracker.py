"""Analytics tracking for system usage."""

from typing import Dict, Any
from datetime import datetime


class AnalyticsTracker:
    """Tracks system analytics and usage patterns."""

    def __init__(self):
        self.reset()

    def reset(self):
        """Reset analytics data."""
        self.analytics = {
            "total_queries": 0,
            "language_distribution": {"en": 0, "hi": 0, "sa": 0},
            "average_response_time": 0.0,
            "cache_hit_rate": 0.0,
            "error_count": 0,
            "quality_scores": [],
            "popular_topics": {},
            "user_sessions": {}
        }

    def track_query(self, language: str, processing_time: float, quality_score: float,
                   question: str, user_id: str, cached: bool = False):
        """Track a query."""
        self.analytics["total_queries"] += 1
        self.analytics["language_distribution"][language] += 1

        # Update average response time
        current_avg = self.analytics["average_response_time"]
        total_queries = self.analytics["total_queries"]
        self.analytics["average_response_time"] = (
            (current_avg * (total_queries - 1)) + processing_time
        ) / total_queries

        # Track quality scores
        self.analytics["quality_scores"].append(quality_score)
        if len(self.analytics["quality_scores"]) > 1000:
            self.analytics["quality_scores"] = self.analytics["quality_scores"][-1000:]

        # Track popular topics
        question_lower = question.lower()
        topics = ["dharma", "karma", "yoga", "bhakti", "jnana", "detachment", "duty"]
        for topic in topics:
            if topic in question_lower:
                self.analytics["popular_topics"][topic] = self.analytics["popular_topics"].get(topic, 0) + 1

        # Track user sessions
        if user_id not in self.analytics["user_sessions"]:
            self.analytics["user_sessions"][user_id] = {
                "query_count": 0,
                "first_seen": datetime.now(),
                "languages_used": set()
            }
        self.analytics["user_sessions"][user_id]["query_count"] += 1
        self.analytics["user_sessions"][user_id]["languages_used"].add(language)

    def track_error(self):
        """Track an error."""
        self.analytics["error_count"] += 1

    def get_analytics(self) -> Dict[str, Any]:
        """Get comprehensive analytics."""
        analytics_copy = self.analytics.copy()

        analytics_copy["avg_quality_score"] = (
            sum(self.analytics["quality_scores"]) / len(self.analytics["quality_scores"])
            if self.analytics["quality_scores"] else 0
        )

        analytics_copy["top_topics"] = sorted(
            self.analytics["popular_topics"].items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]

        return analytics_copy
