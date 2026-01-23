import React from 'react';
import { Loader2, Brain, Heart } from 'lucide-react';
import Image from 'next/image';

interface LoadingStateProps {
  isTyping?: boolean;
  message?: string;
  className?: string;
}

export function LoadingState({
  isTyping = false,
  message = "Contemplating your question...",
  className = ''
}: LoadingStateProps) {
  const messages = [
    "Contemplating your question...",
    "Consulting the ancient wisdom...",
    "Seeking guidance from the Gita...",
    "Channeling spiritual insights...",
    "Finding the right verse...",
    "Harmonizing with cosmic truth..."
  ];

  const animatedMessage = isTyping ? messages[Math.floor(Date.now() / 2000) % messages.length] : message;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Animated Avatar */}
      <div className="flex-shrink-0 relative">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-lg ring-2 ring-white/10 animate-pulse">
          <Brain className="h-5 w-5 text-white" />
        </div>

        {/* Pulsing background effect with gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 to-red-600 animate-ping opacity-20"></div>
        <div className="absolute inset-0 rounded-full bg-orange-500/30 animate-pulse blur-md"></div>
      </div>

      {/* Loading Content */}
      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl rounded-tl-none px-5 py-4 shadow-xl">
        <div className="flex items-center gap-3">
          {/* Typing Animation with gradient */}
          <div className="flex items-center gap-1">
            <div className="flex space-x-1.5">
              <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>

          {/* Loading Text */}
          <span className="text-sm text-white/80 font-medium">
            {animatedMessage}
          </span>

          {/* Subtle loader */}
          <Loader2 className="h-4 w-4 text-orange-400 animate-spin" />
        </div>

        {/* Progress indicator with gradient */}
        <div className="mt-3 w-full bg-white/5 rounded-full h-1 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 h-1 rounded-full animate-shimmer" style={{ width: '100%', backgroundSize: '200% 100%' }}></div>
        </div>
      </div>
    </div>
  );
}

interface TypingIndicatorProps {
  users?: string[];
  className?: string;
}

export function TypingIndicator({ users = ['AI'], className = '' }: TypingIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      <div className="flex items-center gap-1">
        <Heart className="h-3 w-3 text-red-400 animate-pulse" />
        <span>{users.join(', ')} {users.length === 1 ? 'is' : 'are'} typing</span>
      </div>
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
      </div>
    </div>
  );
}

interface WelcomeScreenProps {
  onExampleClick?: (question: string) => void;
  className?: string;
}

export function WelcomeScreen({ onExampleClick, className = '' }: WelcomeScreenProps) {
  const exampleQuestions = [
    "What is the nature of dharma?",
    "How should one handle difficult decisions?",
    "What does the Gita teach about selfless action?",
    "How can I find inner peace?",
    "What is the path to self-realization?"
  ];

  return (
    <div className={`flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="text-center max-w-2xl space-y-8">
        {/* Main Logo/Avatar */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl rounded-full"></div>
          <div className="relative flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 shadow-2xl animate-pulse">
              {/* <Sparkles className="h-10 w-10 text-white" /> */}
              <Image
                src="/images/logo.png"
                alt="DivyaVaani Logo"
                width={80}
                height={80}
                className="h-full w-full object-cover rounded-full p-1"
              />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome to DivyaVaani AI
          </h1>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg mx-auto">
            Your spiritual companion enlightened by the eternal wisdom of the Bhagavad Gita.
            Ask deep questions about dharma, karma, moksha, and the path to self-realization.
          </p>
        </div>

        {/* Example Questions */}
        {onExampleClick && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Try asking about
            </h3>
            <div className="grid gap-3 max-w-xl mx-auto">
              {exampleQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => onExampleClick(question)}
                  className="group relative p-4 text-left text-sm text-gray-700 dark:text-gray-300 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/15 dark:hover:bg-white/10 hover:border-orange-500/40 dark:hover:border-orange-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">&ldquo;{question}&rdquo;</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Ancient Wisdom</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Spiritual Guidance</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
            <span>Modern Interface</span>
          </div>
        </div>
      </div>
    </div>
  );
}
