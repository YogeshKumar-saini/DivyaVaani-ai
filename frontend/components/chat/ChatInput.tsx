import { fileService } from '@/lib/api/file-service';
import { useToast } from '@/lib/context/ToastContext';
import { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { Paperclip, Send, Loader2, Mic } from 'lucide-react';

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
  const { success, error, info } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto'; // reset to measure
    const scrollH = textarea.scrollHeight;
    const minH = 44;
    const maxH = 160;
    const newH = Math.min(Math.max(scrollH, minH), maxH);
    textarea.style.height = `${newH}px`;
  }, [input]);

  useEffect(() => {
    if (!input && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [input]);

  const handleSubmit = useCallback(() => {
    if (input.trim() && !isLoading && input.length <= maxLength) {
      onSubmit();
    }
  }, [input, isLoading, maxLength, onSubmit]);

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

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    info(`Uploading ${file.name}...`, 2000);

    try {
      const response = await fileService.uploadFile({ file });
      if (response.success) {
        success(`Successfully uploaded ${file.name}`);
        // Optional: you could append a message to the input or just notify
        console.log('Upload response:', response);
      }
    } catch (err: unknown) {
      console.error('Upload failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      error(errorMessage);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [success, error, info]);

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
      {input.length > 0 && (
        <div className="flex justify-between items-center mb-2 px-4">
          <div />
          <div
            id="input-help"
            className={`text-xs font-medium backdrop-blur-md px-2 py-1 rounded-full ${isAtLimit ? 'bg-red-500/10 text-red-400' : isNearLimit ? 'bg-amber-500/10 text-amber-400' : 'text-gray-400'}`}
          >
            {remaining} characters
          </div>
        </div>
      )}

      {/* Main Container */}
      <div
        className={`relative flex items-end gap-2 p-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl transition-all duration-300
          ${isFocused ? 'bg-white/15 border-orange-500/40 shadow-[0_0_30px_rgba(249,115,22,0.15)] ring-2 ring-orange-500/20' : 'hover:bg-white/12 hover:border-white/20'}`}
      >
        {/* Animated Glow Effect */}
        {isFocused && (
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-orange-500/10 animate-gradient-x opacity-50 pointer-events-none" />
        )}
        {/* Left Tools */}
        <div className="flex items-center gap-1 mb-1 ml-1">
          <button
            type="button"
            onClick={openFilePicker}
            disabled={isUploading}
            className="p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 disabled:opacity-50 hover:scale-110 active:scale-95"
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>
        </div>

        {/* Textarea */}
        <div className="flex-1 relative py-2">
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
            className="w-full resize-none border-none outline-none bg-transparent text-white placeholder-white/40 text-base leading-relaxed min-h-[24px] max-h-[160px] overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-white/10"
            style={{
              caretColor: '#f97316', // Orange caret
            }}
          />
        </div>

        {/* Right Tools & Send */}
        <div className="flex items-center gap-2 mb-1 mr-1">
          <button
            type="button"
            className="p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 hidden sm:block hover:scale-110 active:scale-95"
            title="Voice input"
          >
            <Mic className="h-5 w-5" />
          </button>

          <button
            type="submit"
            disabled={isLoading || !input.trim() || isAtLimit}
            className={`group relative flex items-center justify-center h-11 w-11 rounded-full transition-all duration-300 shadow-lg overflow-hidden
              ${isLoading || !input.trim() || isAtLimit ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-gradient-to-br from-orange-500 to-red-600 text-white hover:scale-110 active:scale-95 hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]'}`}
          >
            {/* Animated shine on hover */}
            {input.trim() && !isLoading && !isAtLimit && (
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-500" />
            )}
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin relative z-10" />
            ) : (
              <Send className={`h-5 w-5 ml-0.5 transition-transform duration-200 relative z-10 ${input.trim() ? 'group-hover:rotate-12' : ''}`} />
            )}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </form>
  );
}
