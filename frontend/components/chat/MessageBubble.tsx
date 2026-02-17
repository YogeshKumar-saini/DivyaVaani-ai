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
    const textColor = 'text-gray-100'; // Always light text for dark mode theme

    // Bold/Italic colors
    const boldColor = 'text-white/90 font-bold';
    const italicColor = 'text-white/80 italic';

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
              return `<span class="text-orange-300 font-semibold drop-shadow-sm">${match}</span>`;
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
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ scale: 1.005 }}
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
            className={`relative rounded-3xl p-5 shadow-lg backdrop-blur-xl transition-all duration-300 border group-hover:shadow-2xl ${type === 'user'
              ? 'bg-gradient-to-br from-orange-500/20 to-amber-600/20 text-white border-orange-500/30 rounded-tr-none'
              : 'bg-white/5 text-gray-100 border-white/10 rounded-tl-none'
              }`}
          >
            {/* Subtle gradient overlay on hover */}
            <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${type === 'user' ? 'rounded-tr-none bg-gradient-to-br from-orange-300/10 to-transparent' : 'rounded-tl-none bg-gradient-to-br from-white/5 to-transparent'}`} />
            {/* Copy Button */}
            <button
              onClick={copyToClipboard}
              className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-200 text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 hover:scale-110 active:scale-95 z-10 ${copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              title="Copy message"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>

            <div className="leading-relaxed relative z-0">
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
