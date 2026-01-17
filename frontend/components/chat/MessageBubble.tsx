import React, { useState } from 'react';
import { User, Sparkles, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  className?: string;
  messageId?: string;
  onRate?: (messageId: string, rating: number) => void;
}

const MessageBubbleComponent = ({ type, content, timestamp, className = '', messageId, onRate }: MessageBubbleProps) => {
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState<number | null>(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleRate = (value: number) => {
    if (messageId && onRate) {
      setRating(value);
      onRate(messageId, value);
    }
  };

  const processText = (text: string): React.ReactElement => {
    const paragraphs = text.split('\n\n');
    const isUser = type === 'user';
    const textColor = isUser
      ? 'text-indigo-900 dark:text-white'
      : 'text-gray-800 dark:text-gray-100';

    // Bold/Italic colors
    const boldColor = isUser ? 'text-indigo-950 dark:text-white/90' : 'text-gray-900 dark:text-white/90';
    const italicColor = isUser ? 'text-indigo-900/80 dark:text-white/80' : 'text-gray-800/80 dark:text-white/80';

    return (
      <>
        {paragraphs.map((paragraph, paraIdx) => {
          let processedParagraph = paragraph
            // Bold text **text**
            .replace(/\*\*(.*?)\*\*/g, `<strong class="font-semibold ${boldColor}">$1</strong>`)
            // Italic text *text*
            .replace(/\*(.*?)\*/g, `<em class="italic ${italicColor}">$1</em>`)
            // Line breaks
            .replace(/\n/g, '<br/>')
            // Chapter references
            .replace(
              /\[Chapter (\d+), Verse (\d+)\]/g,
              '<span class="inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-300 font-medium px-2 py-0.5 rounded text-xs border border-blue-500/20 mx-1">📚 Ch $1, V $2</span>'
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
              return `<span class="text-orange-600 dark:text-orange-300 font-medium">${match}</span>`;
            });
          });

          return (
            <div
              key={`para-${paraIdx}`}
              className={`mb-3 last:mb-0 text-[15px] leading-relaxed ${textColor}`}
              dangerouslySetInnerHTML={{ __html: processedParagraph }}
            />
          );
        })}
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`group relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
    >
      <div className={`flex py-2 ${type === 'user' ? 'justify-end' : 'justify-start'}`}>

        {/* Bot Avatar */}
        {type === 'bot' && (
          <div className="flex-shrink-0 mr-3 mt-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-lg ring-2 ring-white/10">
              <Sparkles className="h-5 w-5 text-white" strokeWidth={1.5} />
            </div>
          </div>
        )}

        {/* Message Content */}
        <div className={`transition-all duration-300 ease-out ${type === 'user' ? 'max-w-[85%] flex-1 ml-12' : 'max-w-[85%] flex-1 mr-12'}`}>

          {/* Message Bubble */}
          <div
            className={`relative rounded-3xl p-5 shadow-lg backdrop-blur-xl transition-all duration-200 border ${type === 'user'
              ? 'bg-orange-100 dark:bg-orange-600/20 border-orange-200 dark:border-orange-500/20 rounded-tr-none'
              : 'bg-white dark:bg-white/10 border-gray-100 dark:border-white/10 rounded-tl-none'
              }`}
          >
            {/* Copy Button */}
            <button
              onClick={copyToClipboard}
              className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-200 text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 ${copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              title="Copy message"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>

            <div className="leading-relaxed">
              {processText(content)}
            </div>
          </div>

          {/* Timestamp and Rating */}
          <div className={`mt-2 flex items-center gap-3 px-1 ${type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[11px] text-white/40 font-medium">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>

            {/* Rating buttons for bot messages */}
            {type === 'bot' && messageId && onRate && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => handleRate(1)}
                  className={`p-1 rounded-md transition-all duration-200 ${rating === 1
                    ? 'text-green-400 bg-green-500/10'
                    : 'text-white/30 hover:text-green-400 hover:bg-green-500/10'
                    }`}
                  title="Helpful"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleRate(-1)}
                  className={`p-1 rounded-md transition-all duration-200 ${rating === -1
                    ? 'text-red-400 bg-red-500/10'
                    : 'text-white/30 hover:text-red-400 hover:bg-red-500/10'
                    }`}
                  title="Not helpful"
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User Avatar */}
        {type === 'user' && (
          <div className="flex-shrink-0 ml-3 mt-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 shadow-lg ring-1 ring-white/20 backdrop-blur-md">
              <User className="h-5 w-5 text-white/90" strokeWidth={1.5} />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const MessageBubble = React.memo(MessageBubbleComponent, (prevProps, nextProps) => {
  return (
    prevProps.type === nextProps.type &&
    prevProps.content === nextProps.content &&
    prevProps.timestamp.getTime() === nextProps.timestamp.getTime() &&
    prevProps.messageId === nextProps.messageId
  );
});
