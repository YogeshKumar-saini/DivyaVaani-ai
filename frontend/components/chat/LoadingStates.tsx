'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Flame, Wind, Star, BookOpen } from 'lucide-react';

interface LoadingStateProps {
  isTyping?: boolean;
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Contemplating your question...",
  className = ''
}: LoadingStateProps) {
  return (
    <div className={`flex items-start gap-3 mb-6 ${className}`}>
      {/* Avatar with pulse ring */}
      <div className="relative shrink-0">
        <div className="absolute inset-0 rounded-2xl bg-violet-500/30 animate-ping opacity-50 scale-110" />
        <div className="relative w-9 h-9 rounded-2xl bg-linear-to-br from-violet-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-900/40 ring-1 ring-white/15">
          <span className="text-white text-[13px] font-bold leading-none">ॐ</span>
        </div>
      </div>

      {/* Bubble */}
      <div className="bg-white/5 backdrop-blur-2xl border border-violet-500/20 rounded-2xl rounded-tl-sm px-5 py-4 shadow-xl">
        <div className="flex items-center gap-3">
          {/* Animated dots */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-violet-400"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <span className="text-[13px] text-white/45 font-light italic">
            {message}
          </span>
        </div>
        {/* Shimmer bar */}
        <div className="mt-3 h-0.5 w-full rounded-full overflow-hidden bg-white/5">
          <motion.div
            className="h-full rounded-full bg-linear-to-r from-transparent via-violet-500/60 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            style={{ width: "50%" }}
          />
        </div>
      </div>
    </div>
  );
}

interface TypingIndicatorProps {
  users?: string[];
  className?: string;
}

export function TypingIndicator({ users = ['DivyaVaani'], className = '' }: TypingIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 text-xs text-white/30 ${className}`}>
      <span className="animate-pulse">●</span>
      <span>{users.join(', ')} {users.length === 1 ? 'is' : 'are'} typing...</span>
    </div>
  );
}

interface SuggestedQuestion {
  text: string;
  tag: string;
}

interface WelcomeScreenProps {
  onExampleClick?: (question: string) => void;
  className?: string;
  userName?: string;
  avatarUrl?: string;
  suggestedQuestions?: SuggestedQuestion[];
}

export function WelcomeScreen({ onExampleClick, className = '', userName, avatarUrl, suggestedQuestions }: WelcomeScreenProps) {
  const defaultQuestions: SuggestedQuestion[] = [
    { text: "What is the nature of dharma and how do I follow it?", tag: "Dharma" },
    { text: "How should one handle difficult decisions with equanimity?", tag: "Equanimity" },
    { text: "What does the Gita teach about selfless action (Karma Yoga)?", tag: "Karma Yoga" },
    { text: "How can I find inner peace amid chaos?", tag: "Inner Peace" },
    { text: "What is the path to self-realization according to Vedanta?", tag: "Vedanta" },
    { text: "How do I overcome fear and attachment?", tag: "Liberation" },
  ];

  const questionIcons = [Flame, Wind, Sparkles, Star, BookOpen, Flame];
  const questions = suggestedQuestions && suggestedQuestions.length > 0 ? suggestedQuestions : defaultQuestions;
  const isPersonalized = !!(suggestedQuestions && suggestedQuestions.length > 0);

  const greetingName = userName ? userName.split(' ')[0] : 'Seeker';
  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'ॐ';

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`flex-1 flex items-center justify-center px-4 py-8 ${className}`}
    >
      <div className="w-full max-w-2xl space-y-8">
        {/* Hero */}
        <motion.div variants={itemVariants} className="text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 rounded-full bg-violet-600/20 blur-3xl scale-150" />
            <div className="absolute inset-0 rounded-full bg-indigo-600/15 blur-2xl scale-125 animate-pulse" />
            {userName && avatarUrl ? (
              <div className="relative w-20 h-20 mx-auto rounded-2xl shadow-2xl shadow-violet-900/40 ring-1 ring-white/10 overflow-hidden">
                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
              </div>
            ) : userName ? (
              <div className="relative w-20 h-20 mx-auto rounded-2xl bg-linear-to-br from-violet-600 via-purple-600 to-indigo-700 shadow-2xl shadow-violet-900/40 flex items-center justify-center ring-1 ring-white/10">
                <span className="text-white text-2xl font-bold leading-none">{initials}</span>
              </div>
            ) : (
              <div className="relative w-20 h-20 mx-auto rounded-2xl bg-linear-to-br from-violet-600 via-purple-600 to-indigo-700 shadow-2xl shadow-violet-900/40 flex items-center justify-center ring-1 ring-white/10">
                <span className="text-white text-3xl font-serif leading-none">ॐ</span>
              </div>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold bg-clip-text text-transparent bg-linear-to-r from-white via-white/90 to-white/60 mb-3">
            Namaste, {greetingName}
          </h1>
          <p className="text-white/40 text-[15px] font-light leading-relaxed max-w-md mx-auto">
            {userName
              ? 'Continue your spiritual journey with personalized wisdom and guidance.'
              : 'Receive guidance from the eternal wisdom of the Bhagavad Gita and universal spiritual traditions.'}
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="h-px flex-1 bg-linear-to-r from-transparent to-white/10" />
          <span className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-medium">
            {isPersonalized ? 'Daily Picks for You ✨' : 'Explore Questions'}
          </span>
          <div className="h-px flex-1 bg-linear-to-l from-transparent to-white/10" />
        </motion.div>

        {/* Question grid */}
        {onExampleClick && (
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {questions.map(({ text, tag }, idx) => {
              const Icon = questionIcons[idx % questionIcons.length];
              return (
                <motion.button
                  key={idx}
                  onClick={() => onExampleClick(text)}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex items-start gap-3.5 w-full text-left px-4 py-3.5 rounded-2xl bg-white/3 hover:bg-white/7 border border-white/6 hover:border-violet-500/30 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-violet-600/0 to-indigo-600/0 group-hover:from-violet-600/5 group-hover:to-indigo-600/4 transition-all duration-300" />
                  <div className="relative shrink-0 w-8 h-8 rounded-xl bg-white/4 border border-white/6 flex items-center justify-center group-hover:bg-violet-500/12 group-hover:border-violet-500/25 transition-all duration-300 mt-0.5">
                    <Icon size={14} className="text-white/25 group-hover:text-violet-300 transition-colors" />
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-violet-400/50 uppercase tracking-wider mb-1 group-hover:text-violet-400/80 transition-colors">{tag}</div>
                    <span className="text-[13px] text-white/50 group-hover:text-white/80 font-light leading-snug transition-colors line-clamp-2">
                      {text}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Hint */}
        <motion.div variants={itemVariants} className="text-center">
          <p className="text-[11px] text-white/15 tracking-widest uppercase">
            ↑ Choose a question or type below
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
