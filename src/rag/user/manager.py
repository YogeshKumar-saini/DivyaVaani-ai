"""User profile and behavior management."""

from typing import Dict, Any, Optional


class UserProfileManager:
    """Manages user profiles and personalization."""

    def __init__(self):
        self.user_profiles = {}

    def update_profile(self, user_id: str, question: str, language: str, quality_score: float):
        """Update user profile with interaction data."""
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = {
                "conversation_depth": 0,
                "preferred_complexity": [],
                "topic_interests": {},
                "response_style": [],
                "language_consistency": []
            }

        profile = self.user_profiles[user_id]
        profile["conversation_depth"] += 1
        profile["language_consistency"].append(language)
        profile["preferred_complexity"].append(quality_score)

        # Track topic interests
        question_lower = question.lower()
        topics = ["dharma", "karma", "yoga", "bhakti", "jnana", "detachment", "duty"]
        for topic in topics:
            if topic in question_lower:
                profile["topic_interests"][topic] = profile["topic_interests"].get(topic, 0) + 1

    def should_adapt_response(self, user_id: str) -> bool:
        """Check if response adaptation is needed."""
        if user_id not in self.user_profiles:
            return False

        depth = self.user_profiles[user_id]["conversation_depth"]
        return depth >= 5  # Adapt after 5+ conversations

    def adapt_response(self, answer: str, user_id: str, language: str) -> str:
        """Adapt response based on user profile."""
        if user_id not in self.user_profiles:
            return answer

        profile = self.user_profiles[user_id]
        depth = profile["conversation_depth"]

        if depth < 5:
            return answer

        # Find preferred topic
        topic_interests = profile["topic_interests"]
        top_topic = max(topic_interests, key=topic_interests.get) if topic_interests else None

        adapted_answer = answer

        if language == 'hi' and depth > 10:
            adapted_answer = f"प्रिय साधक, {adapted_answer}"
            if top_topic:
                adapted_answer += f"\n\nआपके {top_topic} विषय में रुचि देखकर मुझे प्रसन्नता हो रही है।"

        elif language == 'en' and depth > 10:
            adapted_answer = f"Dear seeker, {adapted_answer}"
            if top_topic:
                adapted_answer += f"\n\nI see your interest in {top_topic}."

        return adapted_answer

    def get_user_insights(self, user_id: str) -> Dict[str, Any]:
        """Get insights about user behavior."""
        if user_id not in self.user_profiles:
            return {}

        profile = self.user_profiles[user_id]
        return {
            "conversation_depth": profile["conversation_depth"],
            "preferred_language": max(set(profile["language_consistency"]), key=profile["language_consistency"].count) if profile["language_consistency"] else None,
            "avg_quality_score": sum(profile["preferred_complexity"]) / len(profile["preferred_complexity"]) if profile["preferred_complexity"] else 0,
            "top_interests": sorted(profile["topic_interests"].items(), key=lambda x: x[1], reverse=True)[:3]
        }
