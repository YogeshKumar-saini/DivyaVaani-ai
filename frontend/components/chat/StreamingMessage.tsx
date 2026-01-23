/**
 * Streaming Chat Message Component - Shows real-time streaming
 */

'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface StreamingMessageProps {
  content: string;
  isStreaming: boolean;
  sources?: any[];
  className?: string;
}

export function StreamingMessage({
  content,
  isStreaming,
  sources = [],
  className = ''
}: StreamingMessageProps) {
  return (
    <div className={`group relative max-w-4xl mx-auto ${className}`}>
      <div className="px-4 lg:px-8">
        {/* Bot message bubble with streaming content */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">🕉️</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                  {content}
                  {isStreaming && (
                    <span className="inline-block ml-1 w-2 h-4 bg-blue-500 animate-pulse" />
                  )}
                </p>
              </div>
            </div>

            {/* Streaming indicator */}
            {isStreaming && (
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Krishna is responding...</span>
              </div>
            )}

            {/* Sources preview (shown during streaming) */}
            {sources.length > 0 && (
              <div className="mt-3 space-y-1">
                {sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-gray-600 dark:text-gray-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded inline-block mr-2"
                  >
                    📖 {source.verse}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
