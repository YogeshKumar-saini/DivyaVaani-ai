import React from 'react';
import { Clock, Target, Globe } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ContextGrid } from './ContextCard';
import { FeedbackSystem } from './FeedbackSystem';

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
}

/**
 * Improved ChatMessage / ChatMessages component
 * - fixes alignment, spacing, and consistent color handling (light/dark)
 * - makes metadata badges visually consistent and accessible
 * - ensures outer margins/padding are consistent with MessageBubble
 */
export function ChatMessage({ message, onFeedback, feedbackSubmitted = false }: ChatMessageProps) {
  const isBot = message.type === 'bot';

  const renderMetadata = () => {
    if (!isBot) return null;

    return (
      <div className="flex flex-wrap items-center gap-2 text-xs mt-3 px-2">
        {message.processing_time != null && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
            <Clock className="h-3 w-3 text-gray-600 dark:text-gray-300" />
            <span className="font-medium text-gray-700 dark:text-gray-200">{message.processing_time.toFixed(2)}s</span>
          </div>
        )}

        {message.confidence_score != null && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30">
            <Target className="h-3 w-3 text-emerald-600 dark:text-emerald-300" />
            <span className="font-medium text-emerald-700 dark:text-emerald-200">{(message.confidence_score * 100).toFixed(0)}% confident</span>
          </div>
        )}

        {message.language && message.language !== 'en' && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-sky-50 dark:bg-sky-900/20">
            <Globe className="h-3 w-3 text-sky-600 dark:text-sky-300" />
            <span className="font-medium text-sky-700 dark:text-sky-200">{message.language.toUpperCase()}</span>
          </div>
        )}
      </div>
    );
  };

  const renderFeedback = () => {
    if (!isBot || !onFeedback) return null;

    return (
      <div className="mt-3 px-2">
        <FeedbackSystem onFeedback={onFeedback} feedbackSubmitted={feedbackSubmitted} />
      </div>
    );
  };

  const renderContexts = () => {
    if (!isBot || !message.contexts || message.contexts.length === 0) return null;
    return (
      <div className="mt-3 px-2">
        <ContextGrid contexts={message.contexts} />
      </div>
    );
  };

  return (
    <div className="group relative max-w-4xl mx-auto">
      {/* Message bubble */}
      <div className="px-4 lg:px-8">
        <MessageBubble type={message.type} content={message.content} timestamp={message.timestamp} />

        {/* Bot-only extras with consistent container spacing */}
        {isBot && (
          <div className="mt-2">
            {renderMetadata()}
            {renderFeedback()}
            {renderContexts()}
          </div>
        )}
      </div>

      {/* Optional sources block (kept commented - but aligned and styled) */}
      {/*
      {isBot && message.sources && message.sources.length > 0 && (
        <div className="mt-2 px-4 lg:px-8">
          <details className="group/details">
            <summary className="cursor-pointer text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium py-1 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                View sources ({message.sources.length})
              </span>
            </summary>

            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {message.sources.map((source, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-amber-400" />
                    <span className="font-mono break-all">{source}</span>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      )}
      */}
    </div>
  );
}

interface ChatMessagesProps {
  messages: Message[];
  onFeedback?: (messageId: string, rating: 'excellent' | 'good' | 'needs_improvement') => Promise<void> | void;
  feedbackSubmitted?: boolean;
  className?: string;
}

export function ChatMessages({ messages, onFeedback, feedbackSubmitted = false, className = '' }: ChatMessagesProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {messages.map((message, index) => (
        <div
          key={message.id}
          className="animate-in slide-in-from-bottom-2"
          style={{
            animationDelay: `${index * 60}ms`,
            animationFillMode: 'both'
          }}
        >
          <ChatMessage
            message={message}
            onFeedback={onFeedback ? (rating) => onFeedback(message.id, rating) : undefined}
            feedbackSubmitted={feedbackSubmitted}
          />
        </div>
      ))}
    </div>
  );
}
