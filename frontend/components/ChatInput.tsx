import { useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";
import {
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Star
} from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
  onFeedback: (rating: string) => void;
  feedbackSubmitted?: boolean;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

export function ChatInput({
  input,
  setInput,
  isLoading,
  onSubmit,
  onFeedback,
  feedbackSubmitted = false,
  selectedLanguage,
  onLanguageChange
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="🕉️ Ask about dharma, karma, yoga, life, or any spiritual matter..."
          className="w-full resize-none rounded-2xl border border-orange-200/50 bg-white pl-24 pr-14 py-4 text-sm shadow-lg focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 disabled:bg-gray-50 disabled:text-gray-400 transition-all duration-300 placeholder:text-gray-500"
          rows={1}
          disabled={isLoading}
          style={{ minHeight: '52px', maxHeight: '200px' }}
        />
        <button
          onClick={onSubmit}
          disabled={isLoading || !input.trim()}
          className="absolute bottom-2.5 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white transition-all duration-300 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:hover:from-orange-500 disabled:hover:to-red-600 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
        <div className="absolute bottom-2.5 left-3">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={onLanguageChange}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Feedback Buttons */}
      {feedbackSubmitted ? (
        <div className="flex justify-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">Thank you for your feedback! 🙏</span>
          </div>
        </div>
      ) : (
        <div className="flex justify-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFeedback('excellent')}
            className="text-xs text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-200"
          >
            <Star className="mr-1 h-3 w-3" />
            Excellent
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFeedback('good')}
            className="text-xs text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-200"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Good
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFeedback('needs_improvement')}
            className="text-xs text-gray-600 hover:text-gray-600 hover:bg-gray-50 transition-colors duration-200"
          >
            <AlertCircle className="mr-1 h-3 w-3" />
            Needs Work
          </Button>
        </div>
      )}
    </div>
  );
}
