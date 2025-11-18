import React, { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { Send, Loader2, Mic, Paperclip, Smile } from 'lucide-react';
import { useTheme, useMediaQuery } from '@mui/material';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export function ChatInput({
  input,
  setInput,
  isLoading,
  onSubmit,
  placeholder = "Ask about dharma, karma, yoga...",
  maxLength = 2000,
  className = ''
}: ChatInputProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // reliable auto-resize (useLayoutEffect to avoid flicker)
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto'; // reset to measure
    const scrollH = textarea.scrollHeight;
    const minH = 36;
    const maxH = 140;
    const newH = Math.min(Math.max(scrollH, minH), maxH);
    textarea.style.height = `${newH}px`;
  }, [input]);

  // autofocus on mount when empty
  useEffect(() => {
    if (!input && textareaRef.current) {
      textareaRef.current.focus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only run on mount

  const handleSubmit = useCallback(() => {
    if (input.trim() && !isLoading && input.length <= maxLength) {
      onSubmit();
    }
  }, [input, isLoading, maxLength, onSubmit]);

  // Enter to send, Shift+Enter newline; respect composition (IME)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  }, [isComposing, handleSubmit]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    if (v.length <= maxLength) setInput(v);
    else setInput(v.slice(0, maxLength));
  }, [setInput, maxLength]);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log('Files selected:', files);
    // TODO: emit files or upload
  }, []);

  const remaining = maxLength - input.length;
  const isNearLimit = remaining <= 200 && remaining > 0;
  const isAtLimit = remaining <= 0;

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
      className={`w-full max-w-4xl mx-auto ${className}`}
      role="search"
      aria-label="Chat input form"
    >
      {/* header row: helper + charcount */}
      {input.length > 0 && (
        <div className="flex justify-between items-center mb-2 px-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 select-none hidden sm:block">
            Spiritual guidance powered by wisdom
          </div>
          {!isMobile && (
            <div
              id="input-help"
              aria-live="polite"
              className={`text-xs font-medium ${isAtLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-500' : 'text-gray-400'}`}
            >
              {remaining} characters remaining
            </div>
          )}
        </div>
      )}

      {/* main container */}
      <div
        className={`relative flex items-end gap-3 p-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-2 rounded-2xl shadow-lg transition-all duration-300
          ${isFocused ? 'border-amber-400 shadow-amber-200/30' : 'border-amber-200 dark:border-amber-600 hover:border-amber-300'}`}
      >
        {/* left tools (kept vertically centered) */}
        <div className="flex items-center gap-1 mb-1">
          <button
            type="button"
            onClick={openFilePicker}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Attach file"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Voice input"
            aria-label="Voice input"
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>

        {/* textarea area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={placeholder}
            disabled={isLoading}
            maxLength={maxLength}
            rows={1}
            aria-label="Message input"
            aria-describedby="input-help"
            className={`w-full resize-none border-none outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm leading-tight min-h-[36px] max-h-[140px] overflow-y-auto px-1 py-1 transition-all duration-200
              ${isAtLimit ? 'text-red-600 dark:text-red-400' : ''}`}
            style={{
              caretColor: isFocused ? '#8b5cf6' : '#9ca3af',
              scrollbarWidth: 'thin'
            }}
          />
        </div>

        {/* right tools */}
        <div className="flex items-center gap-1 mb-1">
          <button
            type="button"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Add emoji"
            aria-label="Add emoji"
            onClick={() => { /* TODO: open emoji picker */ }}
          >
            <Smile className="h-4 w-4" />
          </button>

          <button
            type="submit"
            disabled={isLoading || !input.trim() || isAtLimit}
            aria-label="Send message"
            className={`group relative flex items-center justify-center h-9 w-9 rounded-full transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400
              ${isLoading || !input.trim() || isAtLimit ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 hover:scale-105 active:scale-95'}`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 text-white animate-spin" />
            ) : (
              <Send className={`h-4 w-4 text-white transition-transform duration-200 ${!isLoading && input.trim() && !isAtLimit ? 'group-hover:translate-x-0.5' : ''}`} />
            )}

            {/* subtle pulse */}
            {!isLoading && input.trim() && !isAtLimit && (
              <span className="absolute inset-0 rounded-full animate-pulse opacity-20 pointer-events-none" />
            )}
          </button>
        </div>
      </div>

      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,audio/*,video/*,.pdf,.txt,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
    </form>
  );
}
