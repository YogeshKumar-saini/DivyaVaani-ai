/**
 * App configuration
 */

// Backend API base URL.
// Set EXPO_PUBLIC_API_BASE_URL in .env/.env.local so mobile builds can reach
// the backend without editing source code.
const envApiBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL || '').trim();
export const API_BASE_URL = envApiBaseUrl || 'http://127.0.0.1:8001';

// Supported languages
export const LANGUAGES = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
] as const;

export const DEFAULT_LANGUAGE = 'en';

// Suggested questions for new conversations
export const SUGGESTED_QUESTIONS = [
    { text: 'What is the meaning of dharma?', tag: 'philosophy' },
    { text: 'How to find inner peace through meditation?', tag: 'meditation' },
    { text: 'What does the Bhagavad Gita say about karma?', tag: 'gita' },
    { text: 'How to deal with anxiety and stress?', tag: 'wellbeing' },
    { text: 'What is the purpose of life according to Vedas?', tag: 'vedas' },
    { text: 'Explain the concept of Atman and Brahman', tag: 'philosophy' },
];
