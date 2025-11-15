"""Language detection implementation."""

import re
from typing import Dict, List


class LanguageDetector:
    """Language detection for spiritual texts."""

    def __init__(self):
        # Common Sanskrit words and patterns
        self.sanskrit_patterns = [
            'कृष्ण', 'अर्जुन', 'कर्म', 'योग', 'धर्म', 'अधर्म', 'भगवान', 'परमात्मा',
            'ब्रह्म', 'ब्रह्मा', 'शिव', 'विष्णु', 'गीता', 'श्लोक', 'चरण', 'मंत्र',
            'सृष्टि', 'आत्मा', 'प्रकृति', 'लोक', 'मोक्ष', 'संसार', 'कलि', 'सत्य',
            'असत्य', 'सर्व', 'भगवद्गीता', 'भगवत', 'कृष्णाय', 'कृष्णेन', 'कृष्णस्य'
        ]

        # Common Hindi words and patterns
        self.hindi_patterns = [
            r'[\u0900-\u097F]',  # Devanagari script
            'क्यों', 'क्यूं', 'क्योकि', 'क्या', 'कौन', 'कहाँ', 'कैसे',
            'भगवान', 'श्री', 'कृष्ण', 'कृष्णा', 'भगवद्गीता', 'श्लोक',
            'धर्म', 'कर्म', 'योग', 'युद्ध', 'कर्तव्य', 'करना', 'मत',
            'हो', 'है', 'हैं', 'हूँ', 'साथ', 'में', 'से', 'को', 'का',
            'और', 'या', 'पर', 'के', 'की', 'ने', 'तो', 'भी', 'जो', 'जब'
        ]

        # Hinglish patterns (expanded)
        self.hinglish_patterns = [
            # Basic Hindi words in Roman script
            'kya', 'hai', 'hain', 'tha', 'thi', 'the', 'ka', 'ki', 'ke', 'ko', 'se', 'mein', 'main', 'me',
            'aur', 'ya', 'par', 'jo', 'jab', 'kar', 'raha', 'rahi', 'rahe', 'hota', 'hoti', 'hote', 'hu',
            'ban', 'banaya', 'banaye', 'karta', 'karti', 'karte', 'samajh', 'padh', 'likh', 'sun',
            'dekh', 'khao', 'pee', 'chal', 'baith', 'so', 'uth', 'aa', 'ja', 'jana', 'ana', 'dena', 'lena',
            'khana', 'peena', 'padhai', 'likhai', 'padega', 'karega', 'hogaya', 'hogayi', 'hogaye',
            'rahta', 'rahti', 'rahte', 'banata', 'banati', 'banate', 'samajhta', 'samajhti', 'samajhte',
            'padhta', 'padhti', 'padhte', 'likhta', 'likhti', 'likhte', 'sunta', 'sunti', 'sunte',
            'dekhta', 'dekhti', 'dekhte', 'khata', 'khati', 'khaate', 'peeta', 'peeti', 'peete',
            'chalta', 'chali', 'chalte', 'baitha', 'baithi', 'baithte', 'soya', 'soyi', 'soye',
            'utha', 'uthi', 'uthe', 'aaya', 'aayi', 'aaye', 'gaya', 'gayi', 'gaye', 'aana', 'jaana',
            'dena', 'lena', 'pyaar', 'mohabbat', 'ishq', 'zindagi', 'jaan', 'dil', 'rooh',
            'sab', 'sabse', 'sahi', 'galat', 'achha', 'bura', 'pasand', 'दिल', 'जान',
            'kahenge', 'kahunga', 'kahungi', 'kahoge', 'kahogi', 'kahega', 'kahegi',
            'karunga', 'karungi', 'karoge', 'karogi', 'karega', 'karegi',
            'jaunga', 'jaungi', 'jaoge', 'jaogi', 'jaega', 'jaegi',
            'aunga', 'aungi', 'aoge', 'aogi', 'aega', 'aegi',
            'rahega', 'rahegi', 'rahege', 'rahein', 'rahein',
            'sahenge', 'sahunga', 'sahungi', 'sahoge', 'sahogi', 'sahega', 'sahegi',
            # Common spiritual Hinglish
            'mujhe', 'marna', 'marne', 'marnaa', 'marna hai', 'marne ka', 'marne ki', 'marne ke',
            'marne wala', 'marne wali', 'marne wale', 'marne ki iccha', 'marne ka man',
            'suicide', 'khudkhushi', 'aatmahatya', 'marne ki soch', 'marne ki feeling',
            'jaan leni', 'jaan dene', 'pran tyag', 'mar jana', 'mar jaana',
            # More common Hindi phrases
            'kaise', 'kyun', 'kyunki', 'kab', 'kahaan', 'kidhar', 'yahan', 'wahan', 'jahaan',
            'kahan', 'kabhi', 'har', 'bahut', 'thoda', 'jyada', 'kam', 'accha', 'bura',
            'sach', 'jhuth', 'pyaar', 'nafrat', 'dard', 'dukh', 'sukh', 'chain', 'tension',
            'problem', 'samadhan', 'madad', 'sahayta', 'doctor', 'dawai', 'bimar', 'sehat',
            'zindagi', 'jaan', 'mohabbat', 'dost', 'family', 'ghar', 'school', 'college', 'job',
            'paisa', 'dhana', 'garibi', 'amiri', 'khushi', 'gham', 'raaz', 'sachai'
        ]

    def detect(self, text: str) -> str:
        """Detect language of the input text."""
        text_lower = text.lower()
        words = text_lower.split()

        # Check for explicit hybrid/hinglish requests
        hybrid_indicators = ['hybrid', 'hinglish', 'mixed', 'code-switch', 'bilingual']
        for indicator in hybrid_indicators:
            if indicator in text_lower:
                return 'hybrid'

        # Check for explicit language requests
        hindi_indicators = ['hindi', 'hindhi', 'हिंदी', 'हिन्दी']
        sanskrit_indicators = ['sanskrit', 'sanskrit', 'संस्कृत', 'संस्कृतम्']
        english_indicators = ['english', 'angrezi']

        for indicator in hindi_indicators:
            if self._contains_indicator(text_lower, indicator):
                return 'hi'

        for indicator in sanskrit_indicators:
            if self._contains_indicator(text_lower, indicator):
                return 'sa'

        for indicator in english_indicators:
            if self._contains_indicator(text_lower, indicator):
                return 'en'

        # Check for Devanagari script
        devanagari_pattern = r'[\u0900-\u097F]'
        if re.search(devanagari_pattern, text):
            return self._detect_devanagari_language(text_lower)

        # Check for mixed language patterns (Hinglish)
        if self._is_mixed_language(text_lower, words):
            return 'hybrid'

        # Check for Hinglish/English with spiritual terms
        return self._detect_roman_script_language(words, text_lower)

    def _is_mixed_language(self, text_lower: str, words: List[str]) -> bool:
        """Check if text contains mixed language patterns (Hinglish)."""
        # Count English and Hindi/Hinglish words
        english_words = sum(1 for word in words if word.isalpha() and word not in self.hinglish_patterns and len(word) > 2)
        hindi_words = sum(1 for word in words if word in self.hinglish_patterns)

        # If we have both English and Hindi words, likely mixed
        if english_words >= 2 and hindi_words >= 2:
            return True

        # Check for common Hinglish patterns
        hinglish_patterns = [
            r'\b(kya|hai|kar|raha|hota)\b.*\b(the|and|or|but|so)\b',
            r'\b(the|and|or|but|so)\b.*\b(kya|hai|kar|raha|hota)\b'
        ]

        for pattern in hinglish_patterns:
            if re.search(pattern, text_lower, re.IGNORECASE):
                return True

        return False

    def _contains_indicator(self, text: str, indicator: str) -> bool:
        """Check if text contains language indicator."""
        return (f'in {indicator}' in text or
                f'{indicator} explain' in text or
                f'{indicator} mein' in text or
                indicator in text)

    def _detect_devanagari_language(self, text_lower: str) -> str:
        """Detect language for Devanagari script text."""
        sanskrit_word_count = sum(1 for word in self.sanskrit_patterns if word in text_lower)

        classical_sanskrit_indicators = [
            'आमुक्तये', 'परमेश्वराय', 'नारायणाय', 'हराय', 'विष्णवे', 'शिवाय',
            'ब्रह्मणे', 'ऋते', 'हि', 'च', 'यत्', 'तत्', 'यथा', 'तथा', 'इति',
            'भगवान्', 'परमात्मा', 'सर्वेश्वर', 'सर्वव्यापक', 'अनन्त', 'अपरिमित'
        ]

        classical_sanskrit_count = sum(1 for word in classical_sanskrit_indicators if word in text_lower)

        if sanskrit_word_count >= 3 or classical_sanskrit_count >= 2:
            return 'sa'
        else:
            return 'hi'

    def _detect_roman_script_language(self, words: List[str], text_lower: str) -> str:
        """Detect language for Roman script text."""
        hindi_word_count = sum(1 for word in words if word in self.hinglish_patterns)

        sanskrit_transliteration = [
            'krishna', 'arjuna', 'bhagavad', 'gita', 'dharma', 'karma', 'yoga',
            'brahma', 'shiva', 'vishnu', 'atman', 'paramatma', 'moksha',
            'samsara', 'satya', 'asura', 'kali', 'loka', 'shloka', 'mantra',
            'srushti', 'prakriti', 'sanskrit', 'hindu', 'vedic', 'upanishad'
        ]

        sanskrit_transliteration_count = sum(1 for word in words if word in sanskrit_transliteration)

        has_hindi_grammar = any(word in words for word in ['kya', 'hai', 'kar', 'raha', 'hota'])
        has_sanskrit_spiritual_terms = sanskrit_transliteration_count >= 2

        if has_hindi_grammar and has_sanskrit_spiritual_terms:
            return 'hi'
        elif hindi_word_count >= 2:
            return 'hi'
        elif sanskrit_transliteration_count >= 4 and not has_hindi_grammar:
            return 'sa'
        else:
            return 'en'
