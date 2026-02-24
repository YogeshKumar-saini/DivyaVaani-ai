'use client';

import { useToast } from '@/lib/context/ToastContext';
import { useState, useRef, useLayoutEffect, useCallback, memo } from 'react';
import { Paperclip, Send, Loader2, Mic } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { voiceService } from '@/lib/api/voice-service';
import { LanguageSelector } from './LanguageSelector';

interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  onSubmit: () => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  selectedLanguage?: string;
  onLanguageChange?: (code: string) => void;
}

const ChatInputInner = memo<ChatInputProps>(({
  input,
  setInput,
  isLoading,
  onSubmit,
  placeholder = "Ask the universe anything...",
  maxLength = 2000,
  className = '',
  selectedLanguage,
  onLanguageChange
}) => {
  const { success, error: toastError } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
  }, [input]);

  const handleSubmit = useCallback(() => {
    if (input.trim() && !isLoading && input.length <= maxLength) {
      onSubmit();
    }
  }, [input, isLoading, maxLength, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    if (v.length <= maxLength) setInput(v);
  }, [setInput, maxLength]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const file = files[0];
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      success(`Uploaded ${file.name}`);
    }, 1000);
  }, [success]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setIsUploading(true);
        try {
          // Determine language based on selectedLanguage or default to auto
          const lang = selectedLanguage || 'auto';
          const result = await voiceService.speechToText(audioBlob, lang);

          if (result.text) {
            setInput((prev) => {
              const newText = prev ? `${prev} ${result.text}` : result.text;
              return newText.length <= maxLength ? newText : prev;
            });
            success("Transcription complete");
          } else {
            toastError("Could not understand audio");
          }
        } catch (err) {
          console.error("STT Error:", err);
          toastError("Failed to process voice");
        } finally {
          setIsUploading(false);
          // Stop all tracks to release microphone
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      toastError("Microphone access denied. Please check permissions.");
    }
  }, [selectedLanguage, setInput, maxLength, success, toastError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const charPercent = (input.length / maxLength) * 100;
  const isNearLimit = charPercent > 80;

  return (
    <div className={cn("w-full max-w-4xl mx-auto relative px-3 md:px-4 pb-3 md:pb-5", className)}>
      {/* Main input container */}
      <div
        className={cn(
          "relative rounded-[24px] md:rounded-3xl transition-all duration-300 flex flex-col",
          "bg-slate-900/70 backdrop-blur-3xl border shadow-2xl",
          isFocused
            ? "border-violet-500/40 shadow-[0_0_40px_rgba(139,92,246,0.15),0_8px_32px_rgba(0,0,0,0.5)]"
            : "border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-white/15"
        )}
      >
        {/* Top glow line when focused */}
        <div className={cn(
          "absolute top-0 left-10 right-10 h-px rounded-full transition-opacity duration-300",
          "bg-linear-to-r from-transparent via-violet-500/50 to-transparent",
          isFocused ? "opacity-100" : "opacity-0"
        )} />

        <div className="flex items-end gap-2 md:gap-3 p-3 md:p-4 pb-2">
          {/* Attach button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white/40 hover:text-white hover:bg-white/10 rounded-xl shrink-0 h-9 w-9 md:h-10 md:w-10 mb-0.5 transition-all duration-200"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="Attach file"
          >
            {isUploading ? <Loader2 className="animate-spin h-4 w-4 md:h-5 md:w-5" /> : <Paperclip className="h-4 w-4 md:h-5 md:w-5" />}
          </Button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none resize-none py-2 text-white/90 placeholder-white/30 text-[15px] md:text-[16px] leading-relaxed scrollbar-hide min-h-[40px] md:min-h-[44px] font-normal tracking-wide shadow-none"
          />

          {/* Send button */}
          <div className="shrink-0 mb-0.5">
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className={cn(
                "rounded-xl h-9 w-9 md:h-10 md:w-10 transition-all duration-300 relative overflow-hidden",
                input.trim() && !isLoading
                  ? "bg-linear-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-900/40 text-white hover:scale-105"
                  : "bg-white/5 text-white/20 cursor-not-allowed"
              )}
            >
              {isLoading
                ? <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                : <Send className="h-4 w-4 md:h-5 md:w-5 ml-0.5" />
              }
            </Button>
          </div>
        </div>

        {/* Bottom Bar: Language & Voice on left, Char Count on right */}
        <div className="flex items-center justify-between px-4 pb-3 pt-1">
          <div className="flex items-center gap-3">
            {selectedLanguage && onLanguageChange && (
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onLanguageChange={onLanguageChange}
                className="bg-transparent border-none hover:bg-white/5 px-2 py-1 h-auto text-[11px] md:text-xs font-medium text-white/50 rounded-lg transition-colors"
              />
            )}
            <div className="h-3 w-px bg-white/10 hidden md:block" />
            <button
              onClick={toggleRecording}
              className={cn(
                "text-[11px] flex items-center gap-1.5 transition-all duration-300 px-2 py-1 rounded-lg hover:bg-white/5",
                isRecording
                  ? "text-red-400 hover:text-red-300 animate-pulse font-medium bg-red-400/10"
                  : "text-white/40 hover:text-white"
              )}
              title={isRecording ? "Stop recording" : "Voice input"}
            >
              <Mic size={12} className={cn("transition-colors", isRecording ? "text-red-400" : "text-white/40")} />
              <span className="hidden md:inline">{isRecording ? "Listening..." : "Voice"}</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn(
              "text-[10px] font-medium tabular-nums transition-opacity duration-300",
              isNearLimit ? "opacity-100" : "opacity-0",
              charPercent > 95 ? "text-red-400" : "text-amber-400/80"
            )}>
              {maxLength - input.length}
            </span>
          </div>
        </div>

      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept="image/*, .pdf, .txt, .doc, .docx"
      />
    </div>
  );
});

ChatInputInner.displayName = 'ChatInputInner';
export const ChatInput = ChatInputInner;
