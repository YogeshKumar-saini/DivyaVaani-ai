import { Badge } from "@/components/ui/badge";
import { BookOpen, Globe } from "lucide-react";
import { useState, useEffect } from "react";

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
  isCached?: boolean;
  confidence_score?: number;
  processing_time?: number;
  model_used?: string;
  token_count?: number;
  quality_metrics?: any;
  cross_references?: string[];
  question_hash?: string;
}

interface ChatMessageProps {
  message: Message;
}

// Simple text processor with spiritual highlighting and markdown support
function processText(text: string): React.ReactElement {
  // Split by double newlines for paragraphs
  const paragraphs = text.split('\n\n');

  return (
    <>
      {paragraphs.map((paragraph, paraIdx) => {
        // Handle markdown formatting first
        let processedParagraph = paragraph
          // Bold text **text**
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
          // Italic text *text*
          .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
          // Replace chapter references with styled spans
          .replace(
            /\[Chapter (\d+), Verse (\d+)\]/g,
            '<span class="inline-block bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded text-xs mx-1 border border-blue-200">Chapter $1, Verse $2</span>'
          )
          .replace(
            /Chapter (\d+), Verse (\d+)/g,
            '<span class="inline-block bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded text-xs mx-1 border border-blue-200">Chapter $1, Verse $2</span>'
          );

        // Highlight spiritual terms (but not inside HTML tags)
        const spiritualTerms = ['Krishna', 'Arjuna', 'dharma', 'karma', 'yoga', 'bhakti', 'jnana', 'moksha', 'samsara', 'atman', 'Brahman'];
        spiritualTerms.forEach(term => {
          const regex = new RegExp(`\\b${term}\\b`, 'gi');
          processedParagraph = processedParagraph.replace(regex, (match) => {
            // Don't highlight if already inside a tag
            if (/<[^>]*>.*?<\/[^>]*>/.test(processedParagraph.slice(processedParagraph.indexOf(match) - 10, processedParagraph.indexOf(match) + match.length + 10))) {
              return match;
            }
            return `<span class="text-orange-700 font-semibold">${match}</span>`;
          });
        });

        return (
          <div
            key={`para-${paraIdx}`}
            className="mb-4 last:mb-0 text-sm leading-relaxed text-gray-800"
            dangerouslySetInnerHTML={{ __html: processedParagraph }}
          />
        );
      })}
    </>
  );
}

// Typing Text Component for progressive text reveal
function TypingText({ text, speed = 30 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;

    setDisplayedText('');
    setIsComplete(false);

    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(prev => prev + text[index]);
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <div className="leading-relaxed">
      {processText(displayedText)}
      {!isComplete && (
        <span className="inline-block w-2 h-4 bg-orange-500 ml-1 animate-pulse"></span>
      )}
    </div>
  );
}

// Verse Tooltip Component
function VerseTooltip({ verse, sanskrit, translation, isVisible }: {
  verse: string;
  sanskrit: string;
  translation: string;
  isVisible: boolean;
}) {
  if (!isVisible) return null;

  return (
    <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-96 bg-gradient-to-b from-white to-orange-50/50 border border-orange-200/60 rounded-xl shadow-2xl backdrop-blur-sm p-5 animate-in fade-in-0 zoom-in-95 duration-200">
      {/* Sacred Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-blue-800">{verse}</span>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
        <div className="text-xs text-orange-600 font-medium">🕉️</div>
      </div>

      {/* Sanskrit Text */}
      <div className="mb-4">
        <div className="text-xs font-medium text-orange-700 mb-1 uppercase tracking-wide">Sanskrit</div>
        <div className="text-base font-semibold text-orange-900 leading-relaxed bg-orange-50/50 p-3 rounded-lg border border-orange-100">
          {sanskrit || 'Sanskrit text not available'}
        </div>
      </div>

      {/* English Translation */}
      <div>
        <div className="text-xs font-medium text-blue-700 mb-1 uppercase tracking-wide">Translation</div>
        <div className="text-sm text-gray-700 leading-relaxed bg-blue-50/30 p-3 rounded-lg border border-blue-100">
          {translation || 'Translation not available'}
        </div>
      </div>

      {/* Decorative Arrow */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-white"></div>
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 translate-y-px w-0 h-0 border-l-5 border-r-5 border-t-5 border-transparent border-t-orange-200/60"></div>
    </div>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [hoveredVerse, setHoveredVerse] = useState<string | null>(null);

  // Create a map of verse to context data for quick lookup
  const verseMap = new Map<string, Context>();
  if (message.contexts) {
    message.contexts.forEach(context => {
      verseMap.set(context.verse, context);
    });
  }

  return (
    <div className="space-y-3 relative group">
      <div
        className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        {message.type === 'bot' && (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 shadow-lg ring-2 ring-white/30 relative">
            <BookOpen className="h-5 w-5 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-sm"></div>
          </div>
        )}
        <div className={`flex-1 space-y-3 ${message.type === 'user' ? 'max-w-[75%]' : 'max-w-[75%]'}`}>
          <div
            className={`rounded-2xl px-5 py-4 shadow-xl backdrop-blur-sm border transition-all duration-300 hover:shadow-2xl ${
              message.type === 'user'
                ? 'bg-gradient-to-r from-white/60  via-white/90 to-white/90 text-white border-white/20 hover:from-white/90 hover:via-white/70 hover:to-white/90'
                : 'bg-white/90 text-gray-900 border-white/40 hover:bg-white hover:border-orange-200/50'
            }`}
          >
            <div className="leading-relaxed">
              {processText(message.content)}
            </div>
          </div>

          {/* Enhanced Sources Display */}
          {message.sources && message.sources.length > 0 && (
            <div className="flex flex-wrap gap-2 px-1 relative">
              {message.sources.map((source, idx) => {
                const context = verseMap.get(source);
                return (
                  <div key={idx} className="relative group/verse">
                    <Badge
                      variant="outline"
                      className="text-xs bg-white/80 border-orange-200/50 text-gray-700 cursor-pointer hover:bg-orange-50 hover:border-orange-300 hover:text-orange-800 transition-all duration-300 shadow-sm hover:shadow-md backdrop-blur-sm font-medium"
                      onMouseEnter={() => setHoveredVerse(source)}
                      onMouseLeave={() => setHoveredVerse(null)}
                    >
                      📖 {source}
                    </Badge>
                    <VerseTooltip
                      verse={source}
                      sanskrit={context?.sanskrit || ''}
                      translation={context?.translation || ''}
                      isVisible={hoveredVerse === source}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {message.type === 'user' && (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 shadow-lg ring-2 ring-white/30 relative">
            <span className="text-sm font-semibold text-white">U</span>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
          </div>
        )}
      </div>

      {/* Enhanced Metadata Display */}
      {message.type === 'bot' && (message.confidence_score || message.processing_time || message.quality_metrics) && (
        <div className="flex justify-start pl-14 space-x-2">
          {message.confidence_score && (
            <Badge
              variant="outline"
              className={`text-xs border-green-200/40 flex items-center gap-1 px-2 py-1 shadow-sm backdrop-blur-sm ${
                message.confidence_score > 0.8 ? 'bg-green-50 text-green-700' :
                message.confidence_score > 0.6 ? 'bg-yellow-50 text-yellow-700' :
                'bg-red-50 text-red-700'
              }`}
            >
              <span className="font-medium">Confidence: {(message.confidence_score * 100).toFixed(0)}%</span>
            </Badge>
          )}
          {message.processing_time && (
            <Badge
              variant="outline"
              className="text-xs bg-blue-50 border-blue-200/40 text-blue-700 flex items-center gap-1 px-2 py-1 shadow-sm backdrop-blur-sm"
            >
              <span className="font-medium">{message.processing_time.toFixed(2)}s</span>
            </Badge>
          )}
          {message.quality_metrics && message.quality_metrics.overall_score && (
            <Badge
              variant="outline"
              className={`text-xs border-purple-200/40 flex items-center gap-1 px-2 py-1 shadow-sm backdrop-blur-sm ${
                message.quality_metrics.overall_score > 0.8 ? 'bg-purple-50 text-purple-700' :
                message.quality_metrics.overall_score > 0.6 ? 'bg-indigo-50 text-indigo-700' :
                'bg-gray-50 text-gray-700'
              }`}
            >
              <span className="font-medium">Quality: {(message.quality_metrics.overall_score * 100).toFixed(0)}%</span>
            </Badge>
          )}
        </div>
      )}

      {/* Enhanced Language indicator */}
      {message.type === 'bot' && message.language && message.language !== 'en' && (
        <div className="flex justify-start pl-14">
          <Badge
            variant="outline"
            className="text-xs bg-white/70 border-orange-200/40 text-gray-600 flex items-center gap-1.5 px-3 py-1 shadow-sm backdrop-blur-sm"
          >
            <Globe className="h-3 w-3 text-orange-500" />
            <span className="font-medium">
              {message.language === 'hi' ? 'हिंदी' : message.language === 'sa' ? 'संस्कृत' : message.language.toUpperCase()}
            </span>
          </Badge>
        </div>
      )}

      {/* Cross-references Display */}
      {message.type === 'bot' && message.cross_references && message.cross_references.length > 0 && (
        <div className="flex justify-start pl-14">
          <div className="flex flex-wrap gap-1">
            <span className="text-xs text-gray-500 mr-2">Related verses:</span>
            {message.cross_references.slice(0, 3).map((ref, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="text-xs bg-orange-50 border-orange-200/40 text-orange-700 px-2 py-0.5 shadow-sm backdrop-blur-sm"
              >
                {ref}
              </Badge>
            ))}
            {message.cross_references.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs bg-gray-50 border-gray-200/40 text-gray-600 px-2 py-0.5 shadow-sm backdrop-blur-sm"
              >
                +{message.cross_references.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
