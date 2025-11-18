"""Language processing utilities."""

from typing import Dict


class LanguageProcessor:
    """Language-specific processing utilities."""

    def __init__(self):
        self.fallback_responses = self._initialize_fallbacks()

    def _initialize_fallbacks(self) -> Dict[str, Dict[str, str]]:
        """Initialize fallback responses for different languages."""
        return {
            'en': {
                "dharma": "The Bhagavad Gita teaches that dharma is our righteous duty aligned with divine order.",
                "karma": "In the Bhagavad Gita, karma refers to action performed with duty and dedication.",
                "yoga": "The Gita presents several paths of yoga. Karma Yoga, Bhakti Yoga, and Jnana Yoga.",
                "default": "The Bhagavad Gita contains profound wisdom for life's questions."
            },
            'hi': {
                "dharma": "भगवद्गीता सिखाती है कि धर्म हमारा धार्मिक कर्तव्य है जो दिव्य आदेश के साथ संरेखित है।",
                "karma": "भगवद्गीता में, कर्म का अर्थ है कर्तव्य और समर्पण के साथ किया गया कार्य।",
                "yoga": "गीता कई योग मार्ग प्रस्तुत करता है। कर्म योग, भक्ति योग, और ज्ञान योग।",
                "default": "भगवद्गीता में जीवन के सभी प्रश्नों के लिए गहरी बुद्धि है।"
            },
            'sa': {
                "dharma": "भगवद्गीता धर्मं शिक्षति यत् धार्मिकं कर्तव्यं दिव्यविन्यासेन सह संरेखितम्।",
                "karma": "भगवद्गीते, कर्म अनुष्ठानं भवति सङ्गतिभक्त्या सह।",
                "yoga": "गीता अनेकानि योगमार्गान् प्रस्तौति। कर्मयोगः, भक्तियोगः, ज्ञानयोगः च।",
                "default": "भगवद्गीता जीवनस्य सर्वेषां प्रश्नानां गहरं ज्ञानं धारयति।"
            },
            'hybrid': {
                "dharma": "Dharma ka matlab hai right action - our divine duty aligned with cosmic order. Krishna teaches this in Bhagavad Gita.",
                "karma": "Karma means action with dedication and surrender. Bhagavad Gita mein Krishna ji explain karte hain ki results ko attach mat karo.",
                "yoga": "Yoga has many paths - Karma Yoga (selfless action), Bhakti Yoga (devotion), and Jnana Yoga (wisdom). Choose what suits your nature.",
                "default": "Bhagavad Gita mein Krishna ji ka wisdom modern life ke liye perfect guide hai. What aspect would you like to explore?"
            }
        }

    def get_fallback_response(self, question_lower: str, language: str) -> str:
        """Get language-specific fallback response."""
        responses = self.fallback_responses.get(language, self.fallback_responses['en'])

        # Check for keywords
        for key, response in responses.items():
            if key != "default" and key in question_lower:
                return response

        return responses["default"]
