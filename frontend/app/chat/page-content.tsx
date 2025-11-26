"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { textService } from "@/lib/api/text-service";
import { handleAPIError } from "@/lib/api/client";
import { ChatMessages } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { LoadingState, WelcomeScreen } from "@/components/chat/LoadingStates";
import { LanguageDetector } from "@/components/LanguageSelector";

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
  confidence_score?: number;
  processing_time?: number;
}

interface FeedbackState {
  [messageId: string]: 'excellent' | 'good' | 'needs_improvement' | undefined;
}

export default function ChatPageContent() {
  const searchParams = useSearchParams();
  const initialQuestion = searchParams?.get('q');

  const detectedLanguage = 'en';

  // State management
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'bot',
      content: 'ॐ नमस्ते!\n\nI am DivyaVaani, your enlightened spiritual guide drawing from the collective wisdom of all spiritual traditions. I offer profound guidance on the sacred paths of dharma, karma, yoga, and spiritual awakening from universal teachings.\n\nWhat sacred wisdom dwells in your heart today?',
      timestamp: new Date(),
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({});
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = useRef(`user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const initialQuestionProcessed = useRef(false);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle initial question from URL
  useEffect(() => {
    if (initialQuestion && !isLoading && messages.length === 1 && !initialQuestionProcessed.current) {
      const question = initialQuestion.trim();
      if (question) {
        initialQuestionProcessed.current = true;
        setInput('');
        void handleInitialQuestion(question);
      }
    }
  }, [initialQuestion, isLoading, messages.length]);

  const handleInitialQuestion = async (question: string) => {
    setIsLoading(true);

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: question,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await textService.askQuestion(question, userId.current);

      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        type: 'bot',
        content: response.answer,
        timestamp: new Date(),
        sources: response.sources,
        contexts: response.contexts,
        language: response.language,
        confidence_score: response.confidence_score,
        processing_time: response.processing_time,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error: unknown) {
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: 'bot',
        content: `❌ **Error:** ${handleAPIError(error)}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit feedback for a message
  const handleFeedback = useCallback(async (messageId: string, rating: 'excellent' | 'good' | 'needs_improvement') => {
    // Store feedback state (can be used for UI feedback)
    const currentFeedbackState = feedbackState;
    setFeedbackState(prev => ({ ...prev, [messageId]: rating }));

    // TODO: Implement actual feedback submission to backend
    console.log('Feedback submitted:', { messageId, rating, currentState: currentFeedbackState });

    // Auto-reset feedback state after delay
    setTimeout(() => {
      setFeedbackState(prev => ({ ...prev, [messageId]: undefined }));
    }, 3000);
  }, [feedbackState]);

  // Handle example question clicks
  const handleExampleQuestion = useCallback((question: string) => {
    setInput(question);
    // Optional: auto-submit or wait for user to press send
  }, []);

  // Main question submission
  const askQuestion = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    setInput('');
    setIsLoading(true);

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: question,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await textService.askQuestion(question, userId.current);

      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        type: 'bot',
        content: response.answer,
        timestamp: new Date(),
        sources: response.sources,
        contexts: response.contexts,
        language: response.language,
        confidence_score: response.confidence_score,
        processing_time: response.processing_time,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error: unknown) {
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: 'bot',
        content: `❌ **Error:** ${handleAPIError(error)}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const showWelcome = messages.length === 1 && !initialQuestionProcessed.current;

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-br from-orange-50 via-yellow-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
      {/* Header with enhanced spiritual design */}
      <header className="shrink-0 border-b border-orange-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-saffron animate-pulse ring-2 ring-amber-300/50">
                  <div className="text-white text-lg">ॐ</div>
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-saffron animate-ping opacity-20"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-amber-900 dark:text-amber-100 text-gradient-spiritual">
                  DivyaVaani AI
                </h1>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Universal Spiritual Wisdom Assistant 🪷
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Language Detector */}
              <LanguageDetector
                currentDetectedLanguage={detectedLanguage}
                isDetecting={false}
                confidence={1.0}
                disabled={true}
              />

              {/* Online Status */}
              <div className="flex items-center gap-2 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {/* Messages Container */}
        <div className="absolute inset-0 pt-0 pb-28 sm:pb-32 overflow-y-auto overflow-x-hidden bg-transparent">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col min-h-screen">
              {/* Welcome Screen */}
              {showWelcome && (
                <WelcomeScreen onExampleClick={handleExampleQuestion} />
              )}

              {/* Chat Messages */}
              <div className="pb-8">
                {messages.length > 1 && (
                  <ChatMessages
                    messages={messages.slice(1)} // Skip welcome message
                    onFeedback={handleFeedback}
                    feedbackSubmitted={false}
                  />
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="py-4">
                    <LoadingState isTyping={true} />
                  </div>
                )}

                <div ref={messagesEndRef} />
                {/* Extra padding for scrolling */}
                <div className="h-8" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Input Section at bottom */}
      <div className="fixed bottom-0 left-0 right-0 ">
        <div className="max-w-4xl mx-auto p-2 sm:p-4">
          <ChatInput
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            onSubmit={askQuestion}
            placeholder="Ask about dharma, karma, yoga..."
            maxLength={2000}
            className="shadow-lg border-amber-200 focus-within:border-saffron"
          />
        </div>
      </div>
    </div>
  );
}
