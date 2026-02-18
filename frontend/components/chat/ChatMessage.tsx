'use client';

import React, { useState } from 'react';
import { Clock, Target, BookOpen, ThumbsUp, ThumbsDown, Copy, Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

interface ChatMessageProps {
  message: Message;
  onFeedback?: (rating: 'excellent' | 'good' | 'needs_improvement') => Promise<void> | void;
  feedbackSubmitted?: boolean;
  isLastBot?: boolean;
}

export function ChatMessage({ message, onFeedback, isLastBot = false }: ChatMessageProps) {
  const isBot = message.type === 'bot';
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedbackGiven(type);
    if (onFeedback) {
      onFeedback(type === 'up' ? 'excellent' : 'needs_improvement');
    }
  };

  if (isBot) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
        className="flex w-full mb-6 group"
      >
        <div className="max-w-[90%] md:max-w-[78%] space-y-2">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="shrink-0 w-9 h-9 rounded-2xl bg-linear-to-br from-violet-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-900/40 ring-1 ring-white/15 mt-0.5">
              <span className="text-white text-[13px] font-bold leading-none">ॐ</span>
            </div>

            <div className="flex-1 min-w-0">
              {/* Name tag */}
              <div className="flex items-center gap-2 mb-1.5 pl-0.5">
                <span className="text-[11px] font-semibold text-violet-400/80 tracking-wide">DivyaVaani</span>
                {isLastBot && (
                  <span className="flex items-center gap-0.5 text-[9px] text-violet-400/40">
                    <Sparkles size={8} />AI
                  </span>
                )}
              </div>

              {/* Bubble */}
              <div className={cn(
                "relative bg-white/5 backdrop-blur-2xl border rounded-2xl rounded-tl-sm px-5 py-4",
                "shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-colors duration-300",
                isLastBot
                  ? "border-violet-500/20 shadow-[0_4px_24px_rgba(0,0,0,0.3),0_0_0_1px_rgba(139,92,246,0.08)]"
                  : "border-white/8 hover:border-white/12"
              )}>
                {isLastBot && (
                  <div className="absolute top-0 left-4 right-4 h-px bg-linear-to-r from-transparent via-violet-500/30 to-transparent rounded-full" />
                )}
                <p className="text-white/88 font-light text-[15px] leading-[1.85] tracking-wide whitespace-pre-wrap m-0">
                  {message.content}
                </p>

                {/* Meta footer */}
                {(message.processing_time !== undefined || message.confidence_score !== undefined || (message.sources && message.sources.length > 0)) && (
                  <div className="mt-3.5 pt-3 border-t border-white/6 flex flex-wrap items-center gap-3">
                    {message.processing_time !== undefined && (
                      <span className="flex items-center gap-1.5 text-[11px] text-white/25 font-medium">
                        <Clock size={10} />
                        {message.processing_time.toFixed(2)}s
                      </span>
                    )}
                    {message.confidence_score !== undefined && (
                      <span className={cn("flex items-center gap-1.5 text-[11px] font-medium",
                        message.confidence_score > 0.8 ? "text-emerald-400/60" : message.confidence_score > 0.5 ? "text-amber-400/60" : "text-red-400/60"
                      )}>
                        <Target size={10} />
                        {(message.confidence_score * 100).toFixed(0)}% confident
                      </span>
                    )}
                    {message.sources && message.sources.length > 0 && (
                      <button
                        onClick={() => setShowSources(!showSources)}
                        className="flex items-center gap-1.5 text-[11px] text-violet-400/60 hover:text-violet-300 font-medium transition-colors px-2 py-0.5 rounded-md hover:bg-violet-500/10"
                      >
                        <BookOpen size={10} />
                        {message.sources.length} {message.sources.length === 1 ? 'Source' : 'Sources'}
                        {showSources ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                      </button>
                    )}
                  </div>
                )}

                {/* Sources */}
                <AnimatePresence>
                  {showSources && message.sources && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-1.5">
                        {message.sources.map((src, i) => (
                          <div key={i} className="flex items-start gap-2 text-[11px] text-white/40 bg-white/3 rounded-xl px-3 py-2 border border-white/6">
                            <BookOpen size={9} className="shrink-0 mt-0.5 text-violet-400/40" />
                            {src}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action bar — hover reveal */}
              <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pl-1">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/70 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/6"
                >
                  {copied
                    ? <><Check size={11} className="text-emerald-400" /><span className="text-emerald-400">Copied</span></>
                    : <><Copy size={11} /><span>Copy</span></>}
                </button>
                <div className="h-3 w-px bg-white/10 mx-0.5" />
                <button
                  onClick={() => handleFeedback('up')}
                  title="Good response"
                  className={cn(
                    "flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg transition-all",
                    feedbackGiven === 'up' ? "text-emerald-400 bg-emerald-400/10" : "text-white/20 hover:text-emerald-400 hover:bg-emerald-400/8"
                  )}
                >
                  <ThumbsUp size={11} />
                </button>
                <button
                  onClick={() => handleFeedback('down')}
                  title="Poor response"
                  className={cn(
                    "flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg transition-all",
                    feedbackGiven === 'down' ? "text-red-400 bg-red-400/10" : "text-white/20 hover:text-red-400 hover:bg-red-400/8"
                  )}
                >
                  <ThumbsDown size={11} />
                </button>
                <div className="h-3 w-px bg-white/10 mx-0.5" />
                <span className="text-[10px] text-white/15 pl-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // User bubble
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, x: 8 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
      className="flex w-full mb-6 justify-end group"
    >
      <div className="max-w-[78%] md:max-w-[62%] flex flex-col items-end">
        <div className="text-[11px] font-semibold text-white/30 tracking-wide mb-1.5 pr-0.5">You</div>
        <div className="relative">
          <div className="bg-linear-to-br from-violet-600/85 to-indigo-700/85 backdrop-blur-md rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-xl shadow-violet-900/30 border border-white/10">
            <div className="absolute top-0 left-3 right-3 h-px bg-linear-to-r from-transparent via-white/20 to-transparent rounded-full" />
            <p className="text-white text-[15px] font-medium leading-relaxed tracking-wide">{message.content}</p>
          </div>
          <div className="flex items-center justify-end gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity pr-0.5">
            <span className="text-[10px] text-white/20">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={handleCopy}
              className="text-[11px] text-white/25 hover:text-white/60 transition-colors px-2 py-1 rounded-lg hover:bg-white/8 flex items-center gap-1"
            >
              {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface ChatMessagesProps {
  messages: Message[];
  onFeedback?: (messageId: string, rating: 'excellent' | 'good' | 'needs_improvement') => Promise<void> | void;
  feedbackSubmitted?: boolean;
  className?: string;
}

export function ChatMessages({ messages, onFeedback, feedbackSubmitted = false, className = '' }: ChatMessagesProps) {
  const lastBotIndex = messages.map(m => m.type).lastIndexOf('bot');
  return (
    <div className={`py-2 ${className}`}>
      {messages.map((message, idx) => (
        <ChatMessage
          key={message.id}
          message={message}
          isLastBot={message.type === 'bot' && idx === lastBotIndex}
          onFeedback={onFeedback ? (rating) => onFeedback(message.id, rating) : undefined}
          feedbackSubmitted={feedbackSubmitted}
        />
      ))}
    </div>
  );
}

