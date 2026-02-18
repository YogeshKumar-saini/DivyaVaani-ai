/**
 * Application constants
 */

export const APP_NAME = "DivyaVaani AI";
export const APP_TITLE = "DivyaVaani AI";
export const APP_TAGLINE = "Universal Spiritual Wisdom Meets Modern AI";
export const APP_DESCRIPTION =
  "Your divine spiritual companion powered by wisdom from all spiritual traditions";

// ⚠️  Do NOT add API_BASE_URL here.
// Use `import { apiClient } from '@/lib/api/client'` for all HTTP calls.
// The API base URL is managed centrally in frontend/lib/api/client.ts so that
// the browser always uses the /api rewrite proxy (avoiding mixed-content errors
// on the HTTPS Vercel domain) while SSR uses the direct backend origin.

export const ROUTES = {
  HOME: "/",
  CHAT: "/chat",
  VOICE: "/voice",
  ANALYTICS: "/analytics",
  ABOUT: "/about",
} as const;

export const LANGUAGES = {
  ENGLISH: { code: "en", name: "English", native: "English", flag: "🇺🇸" },
  HINDI: { code: "hi", name: "Hindi", native: "हिंदी", flag: "🇮🇳" },
  SANSKRIT: { code: "sa", name: "Sanskrit", native: "संस्कृत", flag: "🕉️" },
} as const;

export const SUPPORTED_LANGUAGES = [
  "en",
  "hi",
  "sa",
  "bn",
  "te",
  "ta",
  "mr",
  "gu",
  "kn",
  "ml",
  "pa",
  "or",
] as const;

export const FEATURES = [
  {
    id: "multilingual",
    title: "Multilingual Support",
    description: "Ask questions in English, Hindi, Sanskrit, and more",
    icon: "Globe",
  },
  {
    id: "voice",
    title: "Voice Interaction",
    description: "Speak your questions and hear divine responses",
    icon: "Mic",
  },
  {
    id: "wisdom",
    title: "Spiritual Wisdom",
    description: "Access profound teachings from all spiritual traditions",
    icon: "BookOpen",
  },
  {
    id: "realtime",
    title: "Real-time Responses",
    description: "Get instant AI-powered spiritual guidance",
    icon: "Zap",
  },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    number: 1,
    title: "Ask Your Question",
    description:
      "Type or speak your spiritual question in any supported language",
    icon: "MessageCircle",
  },
  {
    number: 2,
    title: "AI Processes",
    description:
      "Our AI analyzes your question using universal spiritual knowledge",
    icon: "Brain",
  },
  {
    number: 3,
    title: "Receive Guidance",
    description: "Get personalized spiritual wisdom with verse references",
    icon: "Sparkles",
  },
] as const;

export const SAMPLE_QUESTIONS = [
  {
    category: "Dharma",
    question: "What is dharma and how do I follow it?",
  },
  {
    category: "Karma",
    question: "How does karma work in daily life?",
  },
  {
    category: "Yoga",
    question: "What are the different paths of yoga?",
  },
  {
    category: "Life Guidance",
    question: "How can I find inner peace?",
  },
  {
    category: "Dharma",
    question: "What is my purpose in life?",
  },
  {
    category: "Karma",
    question: "How do I overcome fear and anxiety?",
  },
  {
    category: "Yoga",
    question: "What is the meaning of detachment?",
  },
  {
    category: "Life Guidance",
    question: "How should I handle difficult situations?",
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
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
  },
  SECONDARY: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  ACCENT: {
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
  },
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
} as const;

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Aarav Sharma",
    role: "Yoga Instructor",
    content:
      "DivyaVaani has transformed how I prepare for my classes. The depth of spiritual insight it provides is truly remarkable and feels incredibly authentic.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
  },
  {
    id: 2,
    name: "Sarah Jenkins",
    role: "Mindfulness Coach",
    content:
      "I was skeptical about AI for spirituality, but this app captures the essence of the Gita beautifully. It's like having a wise mentor in my pocket.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
  },
  {
    id: 3,
    name: "Priya Patel",
    role: "Software Engineer",
    content:
      "In the middle of a stressful workday, DivyaVaani helps me find center. The guidance is practical yet deeply rooted in ancient wisdom.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
  },
  {
    id: 4,
    name: "Raj Malhotra",
    role: "Entrepreneur",
    content:
      "The multilingual support is incredible! I can ask questions in Hindi and get answers that resonate with my cultural background. Truly revolutionary.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
  },
  {
    id: 5,
    name: "Emily Chen",
    role: "Student",
    content:
      "As someone new to Eastern philosophy, DivyaVaani has been an invaluable guide. Complex concepts are explained with clarity and compassion.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
  },
  {
    id: 6,
    name: "Dr. Vikram Singh",
    role: "Psychologist",
    content:
      "I recommend DivyaVaani to my clients seeking deeper meaning. The AI's ability to provide contextual spiritual wisdom is truly impressive.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=6",
  },
] as const;

export const STATS = [
  {
    id: 1,
    value: "1M+",
    label: "Spiritual Answers",
    description: "Questions answered with wisdom",
  },
  {
    id: 2,
    value: "12+",
    label: "Languages",
    description: "Multilingual spiritual guidance",
  },
  {
    id: 3,
    value: "50K+",
    label: "Active Users",
    description: "Seekers worldwide",
  },
  {
    id: 4,
    value: "4.9",
    label: "User Rating",
    description: "Trusted by our community",
  },
] as const;
