"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { LanguageDetector } from "@/components/LanguageSelector";
import { AnalyticsCard, PopularQuestionsCard, SystemStatusCard, ActivityCard, SearchHistoryCard } from "@/components/sidebar";
import { SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import '../components/sidebar/animations.css';

interface Context {
  idx: number;
  score: number;
  verse: string;
  text: string;
  sanskrit: string;
  translation: string;
  hindi_translation?: string;
  relevance?: string;
  teaching_focus?: string;
  chapter?: string;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  sources?: string[];
  contexts?: Context[];
  language?: string;
  isCached?: boolean;
  confidence_score?: number;
  processing_time?: number;
  model_used?: string;
  token_count?: number;
  quality_metrics?: any;
  cross_references?: string[];
  question_hash?: string;
}

interface Analytics {
  total_queries: number;
  unique_users: number;
  cache_hits: number;
  avg_response_time: number;
  top_questions: [string, number][];
}

interface HistoryItem {
  id: string;
  question: string;
  timestamp: Date;
  language: string;
  isFavorite?: boolean;
  hasShared?: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function BhagavadGitaAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: '🕉️ ॐ नमस्ते!\n\nI am your divine spiritual companion, enlightened by the eternal wisdom of the Bhagavad Gita. As Krishna\'s messenger of divine knowledge, I offer profound guidance on the sacred paths of dharma, karma, yoga, and spiritual awakening.\n\nWhat sacred question dwells in your heart today? 🙏',
      timestamp: new Date(),
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('en');
  const [detectionConfidence, setDetectionConfidence] = useState(1.0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [searchHistory, setSearchHistory] = useState<HistoryItem[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userId = useRef(`user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
      try {
        setIsLoadingAnalytics(true);
        const response = await fetch(`${API_BASE}/analytics`);
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data.analytics);
          setIsOnline(true);
        } else {
          console.warn('Analytics endpoint returned error:', response.status);
          setIsOnline(false);
        }
      } catch (error) {
        console.error('Failed to load analytics:', error);
        setIsOnline(false);
      } finally {
        setIsLoadingAnalytics(false);
      }
    };
  
    const addToSearchHistory = (question: string, language: string = 'en') => {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        question,
        timestamp: new Date(),
        language,
        isFavorite: false,
        hasShared: false
      };
      setSearchHistory(prev => [newItem, ...prev.slice(0, 19)]); // Keep only last 20 items
    };
  
    const handleQuestionClick = (question: string) => {
      setInput(question);
      textareaRef.current?.focus();
    };
  
    const handleToggleFavorite = (id: string) => {
      setSearchHistory(prev =>
        prev.map(item =>
          item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        )
      );
    };

  const submitFeedback = async (rating: string) => {
    if (feedbackSubmitted) return; // Prevent multiple submissions

    try {
      setFeedbackSubmitted(true);
      await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId.current,
          rating,
          timestamp: new Date().toISOString(),
        }),
      });
      addMessage('bot', `🙏 **Thank you for your feedback!** Your input helps us improve our spiritual guidance system.`);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setFeedbackSubmitted(false); // Allow retry on error
    }
  };

  const addMessage = (
    type: 'user' | 'bot',
    content: string,
    sources?: string[],
    contexts?: Context[],
    language?: string,
    confidence_score?: number,
    processing_time?: number,
    model_used?: string,
    token_count?: number,
    quality_metrics?: any,
    cross_references?: string[],
    question_hash?: string
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      sources,
      contexts,
      language: language || 'en',
      confidence_score,
      processing_time,
      model_used,
      token_count,
      quality_metrics,
      cross_references,
      question_hash,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Auto-detect language from text
  const detectLanguageFromText = (text: string): { language: string; confidence: number } => {
    const devanagariRegex = /[\u0900-\u097F]/;
    const textLower = text.toLowerCase();
    let confidence = 0.8; // Default confidence

    // Check for explicit language requests first (more flexible matching)
    const hindiIndicators = ['hindi', 'hindhi', 'हिंदी', 'हिन्दी'];
    const sanskritIndicators = ['sanskrit', 'sanskrit', 'संस्कृत', 'संस्कृतम्'];
    const englishIndicators = ['english', 'angrezi'];

    // Check for language requests with flexible matching
    for (const indicator of hindiIndicators) {
      if (textLower.includes(`in ${indicator}`) || textLower.includes(`${indicator} explain`) || textLower.includes(`${indicator} mein`) || textLower.includes(indicator)) {
        return { language: 'hi', confidence: 1.0 };
      }
    }

    for (const indicator of sanskritIndicators) {
      if (textLower.includes(`in ${indicator}`) || textLower.includes(`${indicator} explain`) || textLower.includes(indicator)) {
        return { language: 'sa', confidence: 1.0 };
      }
    }

    for (const indicator of englishIndicators) {
      if (textLower.includes(`in ${indicator}`) || textLower.includes(`${indicator} explain`) || textLower.includes(indicator)) {
        return { language: 'en', confidence: 1.0 };
      }
    }

    // Check for Devanagari script
    if (devanagariRegex.test(text)) {
      // Check for Sanskrit-specific patterns
      const sanskritPatterns = ['आमुक्तये', 'परमेश्वराय', 'नारायणाय', 'हराय', 'विष्णवे', 'शिवाय'];
      const sanskritCount = sanskritPatterns.filter(word => text.includes(word)).length;
      
      if (sanskritCount >= 2) {
        return { language: 'sa', confidence: 0.9 };
      }
      return { language: 'hi', confidence: 0.8 };
    }

    // Enhanced Hindi detection in Roman script (expanded for Hinglish)
    const hindiWords = [
      'kya', 'hai', 'hain', 'ka', 'ki', 'ke', 'ko', 'se', 'mein', 'main', 'me', 'aur', 'ya', 'par', 'kar', 'raha',
      'hota', 'hoti', 'hote', 'hu', 'karta', 'karti', 'karte', 'ban', 'banaya', 'banaye', 'samajh', 'padh', 'likh', 'sun',
      'dharma', 'karma', 'yoga', 'bhagavan', 'shri', 'krishna', 'krishna', 'bhagavadgita', 'shloka',
      // Hinglish specific words
      'kahenge', 'kahunga', 'kahungi', 'kahoge', 'kahogi', 'kahega', 'kahegi',
      'karunga', 'karungi', 'karoge', 'karogi', 'karega', 'karegi'
    ];
    const sanskritTerms = [
      'krishna', 'arjuna', 'bhagavad', 'gita', 'dharma', 'karma', 'yoga', 'brahma', 'shiva', 'vishnu',
      'atman', 'paramatma', 'moksha', 'samsara', 'satya', 'asura', 'kali', 'loka', 'shloka', 'mantra'
    ];

    const hindiCount = hindiWords.filter(word => textLower.includes(word)).length;
    const sanskritCount = sanskritTerms.filter(word => textLower.includes(word)).length;

    // Context analysis - enhanced for Hinglish
    const hasHindiGrammar = hindiWords.some(word => textLower.includes(word) && ['kya', 'hai', 'kar', 'raha', 'hota', 'hu'].includes(word));

    if (hasHindiGrammar && sanskritCount >= 1) {
      return { language: 'hi', confidence: 0.8 };
    } else if (hindiCount >= 2) {
      return { language: 'hi', confidence: 0.7 };
    } else if (sanskritCount >= 3) {
      return { language: 'sa', confidence: 0.7 };
    }

    return { language: 'en', confidence: 0.6 };
  };

  const askQuestion = async () => {
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    
    // Auto-detect language
    setIsDetecting(true);
    const detection = detectLanguageFromText(question);
    setDetectedLanguage(detection.language);
    setDetectionConfidence(detection.confidence);
    setIsDetecting(false);

    setInput('');
    setIsLoading(true);

    // Add to search history
    addToSearchHistory(question, detection.language);
    addMessage('user', question);

    try {
      const response = await fetch(`${API_BASE}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId.current,
          question,
          preferred_language: null, // Auto-detect on backend
        }),
      });

      const data = await response.json();
      console.log('API response language:', data.language);

      if (response.ok) {
        const responseContent = data.answer;

        addMessage(
          'bot',
          responseContent,
          data.sources,
          data.contexts,
          data.language,
          data.confidence_score,
          data.processing_time,
          data.model_used,
          data.token_count,
          data.quality_metrics,
          data.cross_references,
          data.question_hash
        );
      } else {
        addMessage('bot', `❌ **Error:** ${data.detail || 'Unable to process your question at this time.'}`, undefined, undefined, data.language);
      }
    } catch (error) {
      console.error('Query error:', error);
      addMessage('bot', '❌ **Connection Error:** Unable to reach the spiritual guidance system. Please check your connection and try again.', undefined, undefined, 'en');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-orange-50/30 via-white to-blue-50/30">
      {/* Sacred Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,165,0,0.1),transparent_50%)]"></div>
        <div className="absolute top-20 left-20 text-9xl text-orange-200/20">ॐ</div>
        <div className="absolute bottom-20 right-20 text-7xl text-blue-200/20">🕉️</div>
      </div>

      <Header isOnline={isOnline} />

      {/* Main Layout */}
      <div className="flex pt-16 relative z-10">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 pr-80">
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-8 relative">
            {/* Language Detection Indicator */}
            <div className="mb-4 flex justify-center">
              <LanguageDetector
                currentDetectedLanguage={detectedLanguage}
                isDetecting={isDetecting}
                confidence={detectionConfidence}
                disabled={isLoading}
              />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto chat-messages pb-32">
              <div className="max-w-3xl mx-auto space-y-6 py-6">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`transform transition-all duration-500 ${
                      index === messages.length - 1 ? 'animate-fade-in' : ''
                    }`}
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <ChatMessage message={message} />
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area - Fixed at bottom with solid background */}
            <div className="fixed bottom-0 left-0 right-80 bg-white/95 border-t border-orange-200/30">
              <div className="max-w-3xl mx-auto px-6 py-4">
                <ChatInput
                  input={input}
                  setInput={setInput}
                  isLoading={isLoading}
                  onSubmit={askQuestion}
                  onFeedback={submitFeedback}
                  feedbackSubmitted={feedbackSubmitted}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="fixed top-16 right-0 w-80 h-[calc(100vh-4rem)] bg-sidebar flex flex-col shadow-2xl">
          <SidebarHeader className="p-6">
            <div className="text-center">
              <h3 className="text-sm font-semibold text-sidebar-foreground mb-1">Spiritual Insights</h3>
              <div className="w-12 h-px bg-gradient-to-r from-orange-400 to-blue-400 mx-auto"></div>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-6 space-y-6 flex-1 overflow-y-auto">
            <AnalyticsCard analytics={analytics} isLoading={isLoadingAnalytics} />
            <SearchHistoryCard
              history={searchHistory}
              onQuestionClick={handleQuestionClick}
              onToggleFavorite={handleToggleFavorite}
            />
            <PopularQuestionsCard
              analytics={analytics}
              onQuestionClick={handleQuestionClick}
            />
            <SystemStatusCard isOnline={isOnline} />
            <ActivityCard isLive={true} />
          </SidebarContent>
        </div>
      </div>
    </div>
  );
}
