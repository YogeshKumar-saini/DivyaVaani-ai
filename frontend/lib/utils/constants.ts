/**
 * Application constants
 */

export const APP_NAME = 'DivyaVaani AI';
export const APP_TITLE = 'DivyaVaani AI';
export const APP_TAGLINE = 'Universal Spiritual Wisdom Meets Modern AI';
export const APP_DESCRIPTION = 'Your divine spiritual companion powered by wisdom from all spiritual traditions';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const ROUTES = {
  HOME: '/',
  CHAT: '/chat',
  VOICE: '/voice',
  ANALYTICS: '/analytics',
  ABOUT: '/about',
} as const;

export const LANGUAGES = {
  ENGLISH: { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  HINDI: { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  SANSKRIT: { code: 'sa', name: 'Sanskrit', native: 'संस्कृत', flag: '🕉️' },
} as const;

export const SUPPORTED_LANGUAGES = ['en', 'hi', 'sa', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml', 'pa', 'or'] as const;

export const FEATURES = [
  {
    id: 'multilingual',
    title: 'Multilingual Support',
    description: 'Ask questions in English, Hindi, Sanskrit, and more',
    icon: 'Globe',
  },
  {
    id: 'voice',
    title: 'Voice Interaction',
    description: 'Speak your questions and hear divine responses',
    icon: 'Mic',
  },
  {
    id: 'wisdom',
    title: 'Spiritual Wisdom',
    description: 'Access profound teachings from all spiritual traditions',
    icon: 'BookOpen',
  },
  {
    id: 'realtime',
    title: 'Real-time Responses',
    description: 'Get instant AI-powered spiritual guidance',
    icon: 'Zap',
  },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    number: 1,
    title: 'Ask Your Question',
    description: 'Type or speak your spiritual question in any supported language',
    icon: 'MessageCircle',
  },
  {
    number: 2,
    title: 'AI Processes',
    description: 'Our AI analyzes your question using universal spiritual knowledge',
    icon: 'Brain',
  },
  {
    number: 3,
    title: 'Receive Guidance',
    description: 'Get personalized spiritual wisdom with verse references',
    icon: 'Sparkles',
  },
] as const;

export const SAMPLE_QUESTIONS = [
  {
    category: 'Dharma',
    question: 'What is dharma and how do I follow it?',
  },
  {
    category: 'Karma',
    question: 'How does karma work in daily life?',
  },
  {
    category: 'Yoga',
    question: 'What are the different paths of yoga?',
  },
  {
    category: 'Life Guidance',
    question: 'How can I find inner peace?',
  },
  {
    category: 'Dharma',
    question: 'What is my purpose in life?',
  },
  {
    category: 'Karma',
    question: 'How do I overcome fear and anxiety?',
  },
  {
    category: 'Yoga',
    question: 'What is the meaning of detachment?',
  },
  {
    category: 'Life Guidance',
    question: 'How should I handle difficult situations?',
  },
] as const;

export const MAX_QUESTION_LENGTH = 1000;
export const MAX_MESSAGE_HISTORY = 50;
export const ANALYTICS_REFRESH_INTERVAL = 30000; // 30 seconds
export const TOAST_DURATION = 5000; // 5 seconds

export const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: 200, // ms
  GOOD: 500, // ms
  NEEDS_IMPROVEMENT: 1000, // ms
} as const;

export const CACHE_RATE_THRESHOLDS = {
  EXCELLENT: 80, // %
  GOOD: 50, // %
  NEEDS_IMPROVEMENT: 30, // %
} as const;

export const COLORS = {
  PRIMARY: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  SECONDARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  ACCENT: {
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
  },
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;
