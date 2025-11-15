import React, { useState } from 'react';
import { User, Sparkles, Copy, Check } from 'lucide-react';

interface MessageBubbleProps {
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  className?: string;
}

export function MessageBubble({ type, content, timestamp, className = '' }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const processText = (text: string): React.ReactElement => {
    const paragraphs = text.split('\n\n');
    
    return (
      <>
        {paragraphs.map((paragraph, paraIdx) => {
          let processedParagraph = paragraph
            // Bold text **text**
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800 dark:text-gray-200">$1</strong>')
            // Italic text *text*
            .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>')
            // Line breaks
            .replace(/\n/g, '<br/>')
            // Chapter references
            .replace(
              /\[Chapter (\d+), Verse (\d+)\]/g,
              '<span class="inline-flex items-center gap-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 text-blue-700 dark:text-blue-300 font-medium px-3 py-1 rounded-full text-xs border border-blue-200 dark:border-blue-800 mx-1">📚 Chapter $1, Verse $2</span>'
            )
            .replace(
              /Chapter (\d+), Verse (\d+)/g,
              '<span class="inline-flex items-center gap-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 text-blue-700 dark:text-blue-300 font-medium px-3 py-1 rounded-full text-xs border border-blue-200 dark:border-blue-800 mx-1">📚 Chapter $1, Verse $2</span>'
            );

          // Highlight spiritual terms
          const spiritualTerms = [
            'Krishna', 'Arjuna', 'dharma', 'karma', 'yoga', 'bhakti',
            'jnana', 'moksha', 'samsara', 'atman', 'Brahman', 'Vedanta',
            'Gita', 'Bhagavad', 'sadhana', 'spirituality', 'consciousness'
          ];

          spiritualTerms.forEach(term => {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            processedParagraph = processedParagraph.replace(regex, (match) => {
              return `<span class="text-amber-600 dark:text-amber-400 font-medium bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 px-2 py-0.5 rounded-md">${match}</span>`;
            });
          });

          return (
            <div
              key={`para-${paraIdx}`}
              className="mb-3 last:mb-0 text-sm leading-relaxed text-amber-900 dark:text-gray-200"
              dangerouslySetInnerHTML={{ __html: processedParagraph }}
            />
          );
        })}
      </>
    );
  };

  return (
    <div className={`group relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className={`flex py-2 sm:py-4 ${type === 'user' ? 'justify-end' : 'justify-start'}`}>

        {/* Bot Avatar */}
        {type === 'bot' && (
          <div className="flex-shrink-0 mr-2 sm:mr-4 mt-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg ring-2 ring-white dark:ring-gray-800">
              <Sparkles className="h-4 w-4 text-white" strokeWidth={1.5} />
            </div>
          </div>
        )}

        {/* Message Content */}
        <div className={`transition-all duration-300 ease-out ${type === 'user' ? 'max-w-full flex-1 ml-4 sm:ml-12' : 'max-w-4xl flex-1 mr-4 sm:mr-12'}`}>
          
          {/* Message Bubble */}
          <div
            className={`relative rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md group ${
              type === 'user'
                ? 'bg-gradient-saffron text-white border border-amber-400/30 shadow-amber-100/50 dark:shadow-amber-900/30'
                : 'bg-lotus-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 text-amber-900 dark:text-gray-100'
            }`}
          >
            {/* Copy Button */}
            <button
              onClick={copyToClipboard}
              className={`absolute top-2 right-2 p-1 rounded-md transition-all duration-200 ${
                type === 'user'
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              } ${copied ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'}`}
              title="Copy message"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>

            <div className={`leading-relaxed pr-6 ${type === 'user' ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
              {processText(content)}
            </div>
          </div>

          {/* Timestamp */}
          <div className={`mt-2 ${type === 'user' ? 'text-right' : 'text-left'}`}>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* User Avatar */}
        {type === 'user' && (
          <div className="flex-shrink-0 ml-2 sm:ml-4 mt-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-800 shadow-lg ring-2 ring-white dark:ring-gray-800">
              <User className="h-4 w-4 text-white" strokeWidth={1.5} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
