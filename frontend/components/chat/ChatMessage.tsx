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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sources?: any[];
  contexts?: Context[];
  language?: string;
  confidence_score?: number;
  processing_time?: number;
}

interface ChatMessageProps {
  message: Message;
  onFeedback?: (type: 'up' | 'down') => void;
  feedbackSubmitted?: boolean;
  isLastBot?: boolean;
  renderContent?: (message: Message) => React.ReactNode;
}

export function ChatMessage({ message, onFeedback, isLastBot = false, renderContent }: ChatMessageProps) {
  const isBot = message.type === 'bot';
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackClick = (type: 'up' | 'down') => {
    setFeedbackGiven(type);
    if (onFeedback) {
      onFeedback(type);
    }
  };

  if (isBot) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
        className="flex w-full mb-4 group"
      >
        <div className="max-w-[90%] md:max-w-[85%] space-y-1">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-violet-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-900/40 ring-1 ring-white/10 mt-1">
              <span className="text-white text-[12px] font-bold leading-none">ॐ</span>
            </div>

            <div className="flex-1 min-w-0">
              {/* Name tag */}
              <div className="flex items-center gap-2 mb-1 pl-1">
                <span className="text-[12px] font-medium text-violet-300 tracking-wide">DivyaVaani</span>
                {isLastBot && (
                  <span className="flex items-center gap-0.5 text-[9px] text-violet-400/60 bg-violet-500/10 px-1.5 py-0.5 rounded-full border border-violet-500/20">
                    <Sparkles size={8} />AI
                  </span>
                )}
              </div>

              {/* Bubble */}
              <div className={cn(
                "relative bg-white/5 backdrop-blur-2xl border rounded-2xl rounded-tl-sm px-6 py-4",
                "shadow-sm hover:shadow-md transition-all duration-300",
                isLastBot
                  ? "border-violet-500/30 shadow-[0_4px_24px_rgba(0,0,0,0.2),0_0_0_1px_rgba(139,92,246,0.1)] bg-violet-900/10"
                  : "border-white/10 hover:border-white/15 bg-white/5"
              )}>
                {isLastBot && (
                  <div className="absolute top-0 left-6 right-6 h-px bg-linear-to-r from-transparent via-violet-500/40 to-transparent" />
                )}

                {renderContent ? (
                  renderContent(message)
                ) : (
                  <>
                    <p className="text-white/90 font-normal text-[15px] leading-7 tracking-wide whitespace-pre-wrap m-0">
                      {message.content}
                    </p>

                    {/* Meta footer - Only show if NO renderContent (default behavior) */}
                    {(message.processing_time !== undefined || message.confidence_score !== undefined || (message.sources && message.sources.length > 0)) && (
                      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-4">
                        {message.processing_time !== undefined && (
                          <span className="flex items-center gap-1.5 text-[11px] text-white/40 font-medium">
                            <Clock size={10} />
                            {message.processing_time.toFixed(2)}s
                          </span>
                        )}
                        {message.confidence_score !== undefined && (
                          <span className={cn("flex items-center gap-1.5 text-[11px] font-medium",
                            message.confidence_score > 0.8 ? "text-emerald-400/80" : message.confidence_score > 0.5 ? "text-amber-400/80" : "text-red-400/80"
                          )}>
                            <Target size={10} />
                            {(message.confidence_score * 100).toFixed(0)}% confident
                          </span>
                        )}
                        {message.sources && message.sources.length > 0 && (
                          <button
                            onClick={() => setShowSources(!showSources)}
                            className="flex items-center gap-1.5 text-[11px] text-violet-300/80 hover:text-violet-200 font-medium transition-colors px-2 py-0.5 rounded-md hover:bg-violet-500/15"
                          >
                            <BookOpen size={10} />
                            {message.sources.length} {message.sources.length === 1 ? 'Source' : 'Sources'}
                            {showSources ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Sources - Only show if NO renderContent */}
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
                              <div key={i} className="flex items-start gap-2 text-[11px] text-white/60 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                                <BookOpen size={9} className="shrink-0 mt-0.5 text-violet-400/60" />
                                {src}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>

              {/* Action bar — hover reveal */}
              <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pl-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                >
                  {copied
                    ? <><Check size={10} className="text-emerald-400" /><span className="text-emerald-400">Copied</span></>
                    : <><Copy size={10} /><span>Copy</span></>}
                </button>
                <div className="h-3 w-px bg-white/10 mx-1" />
                <button
                  onClick={() => handleFeedbackClick('up')}
                  title="Good response"
                  className={cn(
                    "flex items-center gap-1 text-[10px] px-2 py-1 rounded-md transition-all",
                    feedbackGiven === 'up' ? "text-emerald-400 bg-emerald-400/10" : "text-white/40 hover:text-emerald-400 hover:bg-emerald-400/10"
                  )}
                >
                  <ThumbsUp size={10} />
                </button>
                <button
                  onClick={() => handleFeedbackClick('down')}
                  title="Poor response"
                  className={cn(
                    "flex items-center gap-1 text-[10px] px-2 py-1 rounded-md transition-all",
                    feedbackGiven === 'down' ? "text-red-400 bg-red-400/10" : "text-white/40 hover:text-red-400 hover:bg-red-400/10"
                  )}
                >
                  <ThumbsDown size={10} />
                </button>
                <div className="h-3 w-px bg-white/10 mx-1" />
                <span className="text-[10px] text-white/30 pl-1">
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
      className="flex w-full mb-4 justify-end group"
    >
      <div className="max-w-[85%] md:max-w-[70%] flex flex-col items-end">
        <div className="text-[11px] font-medium text-white/40 tracking-wide mb-1 pr-1">You</div>
        <div className="relative">
          <div className="bg-linear-to-br from-violet-600 to-indigo-700 rounded-2xl rounded-tr-sm px-6 py-3.5 shadow-lg shadow-violet-900/20 border border-white/10">
            <div className="absolute top-0 left-4 right-4 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
            <p className="text-white text-[15px] font-normal leading-7 tracking-wide">{message.content}</p>
          </div>
          <div className="flex items-center justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pr-1">
            <span className="text-[10px] text-white/30">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={handleCopy}
              className="text-[10px] text-white/40 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/5 flex items-center gap-1"
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
  renderContent?: (message: Message) => React.ReactNode;
}

export function ChatMessages({ messages, onFeedback, feedbackSubmitted = false, className = '', renderContent }: ChatMessagesProps) {
  const lastBotIndex = messages.map(m => m.type).lastIndexOf('bot');
  return (
    <div className={`py-2 ${className}`}>
      {messages.map((message, idx) => (
        <ChatMessage
          key={message.id}
          message={message}
          isLastBot={message.type === 'bot' && idx === lastBotIndex}
          onFeedback={onFeedback ? (type) => onFeedback(message.id, type === 'up' ? 'excellent' : 'needs_improvement') : undefined}
          feedbackSubmitted={feedbackSubmitted}
          renderContent={renderContent}
        />
      ))}
    </div>
  );
}

