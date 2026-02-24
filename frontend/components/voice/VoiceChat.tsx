'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { textService } from '@/lib/api/text-service';
import { voiceService } from '@/lib/api/voice-service';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';
import { cn } from '@/lib/utils';
import { conversationService } from '@/lib/api/conversation-service';
import { useAuth } from '@/lib/context/auth-provider';
import { useGuestChatLimit } from '@/lib/hooks/useGuestChatLimit';
import { GuestLimitModal } from '@/components/chat/GuestLimitModal';
import { GuestMessageBanner } from '@/components/chat/GuestMessageBanner';
import { VoiceVisualizer } from './VoiceVisualizer';
import { VoiceControls } from './VoiceControls';
import { LANGUAGES } from '@/components/chat/LanguageSelector';

/* ========================================================================
   Types
   ======================================================================== */

export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  transcription?: string;
  duration?: number;
}

interface VoiceChatProps {
  selectedLanguage: string;
  autoListen?: boolean;
  onAutoListenChange?: (val: boolean) => void;
}

/* ========================================================================
   Globals – persist across renders AND re-mounts so we never exhaust
   the browser's AudioContext limit (Chrome caps at ~6).
   ======================================================================== */

let _sharedAudioCtx: AudioContext | null = null;

function getSharedAudioCtx(): AudioContext {
  if (!_sharedAudioCtx || _sharedAudioCtx.state === 'closed') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    _sharedAudioCtx = new Ctor();
  }
  if (_sharedAudioCtx.state === 'suspended') {
    _sharedAudioCtx.resume();
  }
  return _sharedAudioCtx;
}

/* BCP-47 fallback map for browser speechSynthesis */
const LANG_TO_BCP47: Record<string, string> = {
  en: 'en-US', hi: 'hi-IN', sa: 'hi-IN', bn: 'bn-IN',
  te: 'te-IN', ta: 'ta-IN', mr: 'mr-IN', gu: 'gu-IN',
  kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN', or: 'or-IN',
};

function getPreferredVoice(language: string): string {
  const lang = normalizeLanguageCode(language) || 'en';
  if (lang === 'hi') return 'female_gentle';
  if (lang === 'sa') return 'female_sacred';
  return 'female_clear';
}

function normalizeLanguageCode(language?: string): string | null {
  if (!language) return null;
  const raw = language.toLowerCase().trim();
  const primary = raw.split('-')[0];
  const aliasMap: Record<string, string> = {
    auto: 'auto',
    en: 'en',
    hi: 'hi',
    sa: 'sa',
    bn: 'bn',
    te: 'te',
    ta: 'ta',
    mr: 'mr',
    gu: 'gu',
    kn: 'kn',
    ml: 'ml',
    pa: 'pa',
    or: 'or',
    od: 'or',
    ori: 'or',
    sanskrit: 'sa',
    hindi: 'hi',
    english: 'en',
  };
  return aliasMap[raw] || aliasMap[primary] || null;
}

function inferLanguageFromText(text?: string): string | null {
  if (!text) return null;
  const value = text.trim();
  if (!value) return null;

  if (/[\u0900-\u097F]/.test(value)) {
    // Devanagari can be Hindi or Sanskrit. Lightweight Sanskrit signal words:
    if (/\b(अहम्|त्वम्|भवति|नमः|किम्|एव|च)\b/.test(value)) return 'sa';
    return 'hi';
  }
  if (/[\u0980-\u09FF]/.test(value)) return 'bn';
  if (/[\u0C00-\u0C7F]/.test(value)) return 'te';
  if (/[\u0B80-\u0BFF]/.test(value)) return 'ta';
  if (/[\u0C80-\u0CFF]/.test(value)) return 'kn';
  if (/[\u0D00-\u0D7F]/.test(value)) return 'ml';
  if (/[\u0A00-\u0A7F]/.test(value)) return 'pa';
  if (/[\u0B00-\u0B7F]/.test(value)) return 'or';
  if (/[\u0A80-\u0AFF]/.test(value)) return 'gu';
  if (/[\u0900-\u097F]/.test(value)) return 'mr';
  if (/^[\x00-\x7F\s.,!?'"`~@#$%^&*()_+\-=[\]{};:/<>|\\]+$/.test(value)) return 'en';
  return null;
}

/* ========================================================================
   Component
   ======================================================================== */

export function VoiceChat({
  selectedLanguage,
  autoListen = false,
  onAutoListenChange,
}: VoiceChatProps) {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  /* ---- UI state ---- */
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStreamMsg, setCurrentStreamMsg] = useState<Message | null>(null);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [hasMicError, setHasMicError] = useState(false);
  const [micErrorMessage, setMicErrorMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<string[]>(['default']);
  const [selectedVoice, setSelectedVoice] = useState<string>('default');

  const {
    guestCount,
    remainingMessages,
    isLimitReached,
    isNearLimit,
    showLimitModal,
    isHydrated,
    checkLimit,
    incrementCount,
    dismissModal,
    openModal,
  } = useGuestChatLimit(isLoggedIn);

  /* ---- Mic stream for visualizer ---- */
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const audioLevel = useAudioAnalyzer(micStream, isRecording);

  /* ---- Refs ---- */
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const harkRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  /* We keep mutable "latest value" refs so callbacks created once
     can always read the freshest value without re-creating. */
  const autoListenRef = useRef(autoListen);
  useEffect(() => { autoListenRef.current = autoListen; }, [autoListen]);

  const isProcessingRef = useRef(false);
  useEffect(() => { isProcessingRef.current = isProcessing; }, [isProcessing]);

  const startRecordingFnRef = useRef<(() => Promise<void>) | null>(null);
  const stopRecordingFnRef = useRef<((streamOverride?: MediaStream) => void) | null>(null);

  const speakWithBrowserTTS = useCallback((text: string, lang: string) => {
    if (!text.trim() || typeof window === 'undefined' || !window.speechSynthesis || isMuted) return;
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = LANG_TO_BCP47[lang] || 'en-US';
    utt.volume = volume / 100;
    utt.onstart = () => setIsPlaying(true);
    utt.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utt);
  }, [isMuted, volume]);

  /* ---- auto-scroll ---- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamMsg]);

  /* ---- auto-dismiss mic error ---- */
  useEffect(() => {
    if (hasMicError) {
      const t = setTimeout(() => { setHasMicError(false); setMicErrorMessage(''); }, 8000);
      return () => clearTimeout(t);
    }
  }, [hasMicError]);

  /* ---- load all available TTS voices for manual selection ---- */
  useEffect(() => {
    let active = true;
    const loadVoices = async () => {
      try {
        const data = await voiceService.getAvailableTTSVoices();
        const voiceSet = new Set<string>();
        Object.values(data.voices || {}).forEach((voices) => {
          voices.forEach((voice) => voiceSet.add(voice));
        });
        const loaded = Array.from(voiceSet).sort((a, b) => a.localeCompare(b));
        if (!active || loaded.length === 0) return;
        setAvailableVoices(loaded);
        setSelectedVoice((prev) => (loaded.includes(prev) ? prev : loaded[0]));
      } catch (error) {
        console.warn('Could not load voice list, using defaults:', error);
      }
    };
    loadVoices();
    return () => { active = false; };
  }, []);

  /* ========================================================================
     cleanup helper – tears down mic + hark + recorder completely
     ======================================================================== */
  const teardownRecording = useCallback((stream?: MediaStream | null) => {
    // 1. Stop silence timer
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }

    // 2. Stop hark (VAD)
    if (harkRef.current) {
      try { harkRef.current.stop(); } catch { /* ignore */ }
      harkRef.current = null;
    }

    // 3. Stop MediaRecorder (synchronous state check, no callbacks needed)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch { /* ignore */ }
    }
    mediaRecorderRef.current = null;

    // 4. Release hardware mic
    const s = stream ?? null;
    if (s) { s.getTracks().forEach(t => t.stop()); }
    setMicStream(null);
    setIsRecording(false);
  }, []);

  /* ---- Cleanup on unmount ---- */
  useEffect(() => {
    return () => {
      teardownRecording(micStream);
      if (audioElRef.current) { audioElRef.current.pause(); audioElRef.current = null; }
      if (abortRef.current) abortRef.current.abort();
      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ========================================================================
     processVoiceQuery – STT → LLM streaming → sentence TTS → playback
     ======================================================================== */
  const processVoiceQuery = useCallback(async (audioBlob: Blob) => {
    setIsProcessing(true);
    setCurrentStreamMsg({ id: Date.now().toString(), type: 'user', content: 'Transcribing...', timestamp: new Date() });

    try {
      /* --- Step 1: Speech-to-Text --- */
      const sttResult = await voiceService.speechToText(audioBlob, selectedLanguage, user?.id);
      const text = sttResult.text || '';
      const normalizedDetectedLanguage = normalizeLanguageCode(sttResult.language);
      const inferredLanguageFromText = inferLanguageFromText(text);
      const resolvedDetectedLanguage = inferredLanguageFromText || normalizedDetectedLanguage;
      const effectiveLanguage = selectedLanguage === 'auto'
        ? (resolvedDetectedLanguage || detectedLanguage || 'en')
        : selectedLanguage;

      if (selectedLanguage === 'auto' && resolvedDetectedLanguage && resolvedDetectedLanguage !== detectedLanguage) {
        setDetectedLanguage(resolvedDetectedLanguage);
      }

      if (!text.trim()) {
        setCurrentStreamMsg({ id: Date.now().toString(), type: 'user', content: 'Could not understand audio. Please try again.', timestamp: new Date() });
        setIsProcessing(false);
        setTimeout(() => setCurrentStreamMsg(null), 3000);
        return;
      }

      /* Add user message */
      const userMsg: Message = { id: `user-${Date.now()}`, type: 'user', content: text, timestamp: new Date() };
      setMessages(prev => [...prev, userMsg]);

      /* "thinking" indicator */
      setCurrentStreamMsg({ id: Date.now().toString(), type: 'bot', content: '', timestamp: new Date(), transcription: text });

      /* --- Memory: create conversation if needed --- */
      let convId = conversationId;
      if (!convId && user?.id) {
        try {
          const newConv = await conversationService.createConversation(user.id, {
            title: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
            language: effectiveLanguage,
          });
          convId = newConv.id;
          setConversationId(convId);
        } catch (e) { console.error('Memory setup failed:', e); }
      }

      /* --- Step 2: Stream LLM --- */
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      let conversationHistory = '';
      if (convId && user?.id) {
        try {
          const ctx = await conversationService.getConversationContext(convId, 5);
          if (ctx.stm.messages.length > 0) {
            conversationHistory = ctx.stm.messages.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join('\n');
          }
        } catch { console.warn('Could not fetch context history'); }
      }

      const streamGen = textService.streamQuestion(text, user?.id, effectiveLanguage, conversationHistory, convId);
      let fullResponse = '';
      let sentenceBuf = '';
      const audioQueue: Blob[] = [];
      let queuePlaying = false;
      const ttsPromises: Promise<void>[] = [];
      let streamDone = false;

      /* --- Audio queue player --- */
      const playBlob = (blob: Blob): Promise<void> =>
        new Promise((resolve, reject) => {
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.volume = volume / 100;
          audioElRef.current = audio;
          audio.onplay = () => setIsPlaying(true);
          audio.onended = () => { setIsPlaying(false); URL.revokeObjectURL(url); audioElRef.current = null; resolve(); };
          audio.onerror = () => { setIsPlaying(false); URL.revokeObjectURL(url); audioElRef.current = null; reject(new Error('playback error')); };
          audio.play().catch(reject);
        });

      const drainQueue = async () => {
        if (queuePlaying) return;
        queuePlaying = true;
        while (audioQueue.length > 0) {
          if (abortRef.current?.signal.aborted) break;
          const blob = audioQueue.shift()!;
          try { await playBlob(blob); } catch (e) { console.warn('Queue playback err:', e); }
        }
        queuePlaying = false;

        /* Auto-listen after AI finishes speaking */
        if (streamDone && audioQueue.length === 0 && autoListenRef.current && !abortRef.current?.signal.aborted) {
          setTimeout(() => { startRecordingFnRef.current?.(); }, 600);
        }
      };

      const enqueueTTS = async (sentence: string) => {
        if (!sentence.trim() || isMuted) return;
        try {
          const voiceChoice = selectedVoice || getPreferredVoice(effectiveLanguage);
          const blob = await voiceService.textToSpeech(sentence, effectiveLanguage, voiceChoice, 1.0, user?.id);
          if (abortRef.current?.signal.aborted) return;
          audioQueue.push(blob);
          drainQueue();
        } catch (e) {
          console.warn('TTS failed, using browser speech fallback:', e);
          speakWithBrowserTTS(sentence, effectiveLanguage);
        }
      };

      /* --- Stream tokens --- */
      for await (const event of streamGen) {
        if (abortRef.current?.signal.aborted) break;
        if (event.type === 'token') {
          const token = event.data.token || '';
          fullResponse += token;
          sentenceBuf += token;

          setCurrentStreamMsg({ id: Date.now().toString(), type: 'bot', content: fullResponse, timestamp: new Date(), transcription: text });

          const match = sentenceBuf.match(/[.!?।॥]\s*/);
          if (match) {
            const idx = sentenceBuf.indexOf(match[0]) + match[0].length;
            const sentence = sentenceBuf.slice(0, idx);
            sentenceBuf = sentenceBuf.slice(idx);
            if (sentence.trim().length > 5) ttsPromises.push(enqueueTTS(sentence));
          }
        }
      }

      /* Flush remaining buffer */
      if (sentenceBuf.trim() && !isMuted) ttsPromises.push(enqueueTTS(sentenceBuf));

      /* Finalize bot message */
      if (fullResponse.trim()) {
        const botMsg: Message = { id: `bot-${Date.now()}`, type: 'bot', content: fullResponse, timestamp: new Date(), transcription: text };
        setMessages(prev => [...prev, botMsg]);
        setCurrentStreamMsg(null);
        streamDone = true;

        if (!isLoggedIn) {
          incrementCount();
        }

        if (!isMuted && !abortRef.current?.signal.aborted) {
          await Promise.allSettled(ttsPromises);
          drainQueue();
        } else if (autoListenRef.current) {
          setTimeout(() => startRecordingFnRef.current?.(), 600);
        }
      } else {
        streamDone = true;
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        setCurrentStreamMsg(prev => {
          if (prev && prev.content.trim()) {
            setMessages(m => [...m, { ...prev, id: `bot-${Date.now()}`, content: prev.content + ' – (Interrupted)' }]);
          }
          return null;
        });
      } else {
        console.error('Voice processing error:', error);
        setMessages(prev => [...prev, { id: `err-${Date.now()}`, type: 'bot', content: 'Sorry, I had trouble processing your request.', timestamp: new Date() }]);
        setCurrentStreamMsg(null);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [selectedLanguage, user?.id, conversationId, isMuted, volume, detectedLanguage, incrementCount, isLoggedIn, speakWithBrowserTTS, selectedVoice]);

  /* ========================================================================
     stopRecording – stop MediaRecorder; onstop callback handles the rest
     ======================================================================== */
  const stopRecordingFn = useCallback((streamOverride?: MediaStream) => {
    /* Clear silence timer */
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }

    /* Stop hark first so it doesn't fire again */
    if (harkRef.current) { try { harkRef.current.stop(); } catch { /* */ } harkRef.current = null; }

    /* Stop MediaRecorder – the onstop callback will handle blob + mic release */
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      /* No active recorder – manually clean up mic if stream provided */
      if (streamOverride && typeof streamOverride.getTracks === 'function') {
        streamOverride.getTracks().forEach(t => t.stop());
      }
      setMicStream(null);
      setIsRecording(false);
    }
    mediaRecorderRef.current = null;
  }, []);

  /* ========================================================================
     startRecording – acquire mic, set up hark VAD, start MediaRecorder
     ======================================================================== */
  const startRecordingFn = useCallback(async () => {
    /* Don't start if already recording or processing */
    if (isProcessingRef.current) return;

    if (!isLoggedIn) {
      const allowed = checkLimit();
      if (!allowed) return;
    }

    try {
      /* Stop any playing audio first */
      if (audioElRef.current) { audioElRef.current.pause(); audioElRef.current = null; }
      if (abortRef.current) abortRef.current.abort();
      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();

      if (!navigator?.mediaDevices?.getUserMedia) {
        setHasMicError(true);
        setMicErrorMessage('Your browser does not support audio recording or you are not on a secure context (HTTPS/localhost).');
        return;
      }

      /* Acquire mic with a 5-second timeout */
      const micPromise = navigator.mediaDevices.getUserMedia({ audio: true });
      const timeoutPromise = new Promise<never>((_, rej) => setTimeout(() => rej(new Error('Microphone request timed out after 5 seconds.')), 5000));
      const stream = await Promise.race([micPromise, timeoutPromise]) as MediaStream;

      setMicStream(stream);
      setHasMicError(false);
      setMicErrorMessage('');

      /* ---- hark VAD using the shared AudioContext ---- */
      const ctx = getSharedAudioCtx();
      const harkModule = (await import('hark')).default;
      const speechEvents = harkModule(stream, { threshold: -50, interval: 100, audioContext: ctx });
      harkRef.current = speechEvents;

      /* Silence timeout – if user never speaks for 5s, stop */
      silenceTimerRef.current = setTimeout(() => stopRecordingFn(stream), 5000);

      speechEvents.on('speaking', () => {
        if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
      });

      speechEvents.on('stopped_speaking', () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => stopRecordingFn(stream), 2500);
      });

      /* ---- Native MediaRecorder ---- */
      const mimeType = typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        /* Build the blob from collected chunks */
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];

        /* Release mic hardware */
        stream.getTracks().forEach(t => t.stop());
        setMicStream(null);
        setIsRecording(false);

        /* Clean up hark */
        if (harkRef.current) { try { harkRef.current.stop(); } catch { /* */ } harkRef.current = null; }
        if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }

        /* Process if valid */
        if (blob.size > 500) {
          processVoiceQuery(blob);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

    } catch (error: unknown) {
      console.error('Error starting recording:', error);
      setHasMicError(true);
      const err = error as Error;
      if (err.name === 'NotAllowedError') {
        setMicErrorMessage('Microphone access was denied. Please allow it in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setMicErrorMessage('No microphone detected on your system.');
      } else {
        setMicErrorMessage(err.message || 'Could not initialize microphone.');
      }
    }
  }, [isLoggedIn, checkLimit, stopRecordingFn, processVoiceQuery]);

  /* Populate refs for cross-callback access */
  startRecordingFnRef.current = startRecordingFn;
  stopRecordingFnRef.current = stopRecordingFn;

  /* ========================================================================
     Keyboard shortcut: Space to toggle recording
     ======================================================================== */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        if (isProcessing) return;
        if (isRecording) { stopRecordingFn(); } else { startRecordingFn(); }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isRecording, isProcessing, startRecordingFn, stopRecordingFn]);

  /* ========================================================================
     togglePlayback / replayMessage
     ======================================================================== */
  const togglePlayback = () => {
    if (!audioElRef.current) {
      const lastBot = [...messages].reverse().find(m => m.type === 'bot');
      if (lastBot && !isMuted) replayMessage(lastBot);
      return;
    }
    if (isPlaying) { audioElRef.current.pause(); setIsPlaying(false); }
    else { audioElRef.current.play(); setIsPlaying(true); }
  };

  const replayMessage = async (msg: Message) => {
    if (msg.type !== 'bot') return;
    const replayLanguage = selectedLanguage === 'auto' ? (detectedLanguage || 'en') : selectedLanguage;
    try {
      const voiceChoice = selectedVoice || getPreferredVoice(replayLanguage);
      const blob = await voiceService.textToSpeech(msg.content, replayLanguage, voiceChoice, 1.0, user?.id);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = volume / 100;
      audioElRef.current = audio;
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => { setIsPlaying(false); URL.revokeObjectURL(url); audioElRef.current = null; };
      audio.onerror = () => { setIsPlaying(false); URL.revokeObjectURL(url); audioElRef.current = null; };
      await audio.play();
    } catch (error) {
      console.error('Replay error, falling back to browser speech:', error);
      speakWithBrowserTTS(msg.content, replayLanguage);
    }
  };

  /* ========================================================================
     Derived state
     ======================================================================== */
  const effectiveSelectedLanguage = selectedLanguage === 'auto' ? (detectedLanguage || 'auto') : selectedLanguage;
  const currentLangObj = LANGUAGES.find(l => l.code === effectiveSelectedLanguage);
  const langLabel = selectedLanguage === 'auto' && detectedLanguage
    ? `Auto (${currentLangObj?.native || detectedLanguage})`
    : (currentLangObj?.native || 'English');

  let orbState: 'idle' | 'listening' | 'processing' | 'speaking' | 'error' = 'idle';
  if (hasMicError) orbState = 'error';
  else if (isProcessing && !isPlaying) orbState = 'processing';
  else if (isRecording) orbState = 'listening';
  else if (isPlaying) orbState = 'speaking';

  const allDisplayMessages = currentStreamMsg ? [...messages, currentStreamMsg] : messages;

  /* ========================================================================
     Render
     ======================================================================== */
  return (
    <div className="flex-1 grid grid-rows-[auto_minmax(0,1fr)_auto_auto] w-full max-w-5xl mx-auto px-3 sm:px-6 relative z-10 h-full min-h-0 overflow-hidden">
      <GuestLimitModal
        isOpen={showLimitModal}
        onClose={dismissModal}
        guestCount={guestCount}
      />

      {!isLoggedIn && isHydrated ? (
        <div className="w-full pb-2 sm:pb-3">
          <GuestMessageBanner
            remainingMessages={remainingMessages}
            isNearLimit={isNearLimit}
            isLimitReached={isLimitReached}
            onUpgradeClick={openModal}
          />
        </div>
      ) : (
        <div />
      )}

      {/* ---- Top: Conversation History ---- */}
      <div className="w-full min-h-0 border-b border-white/5 relative z-20 overflow-y-auto overscroll-contain touch-pan-y [scrollbar-gutter:stable]">
        <AnimatePresence mode="wait">
          {allDisplayMessages.length > 0 ? (
            <motion.div
              key="messages"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              className="max-w-3xl mx-auto px-2 sm:px-4 w-full scrollbar-voice flex flex-col gap-4 sm:gap-5 pt-3 sm:pt-4 pb-4 sm:pb-6"
            >
              {allDisplayMessages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx === allDisplayMessages.length - 1 ? 0 : 0.05 }}
                  className={cn("flex flex-col w-full", msg.type === 'user' ? 'items-end' : 'items-start')}
                >
                  {msg.type === 'user' ? (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/25">You</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-violet-400/60">DivyaVaani</span>
                    </div>
                  )}
                  <p className={cn(
                    "leading-relaxed",
                    msg.type === 'user'
                      ? "text-sm text-white/50 italic text-right"
                      : "text-base sm:text-lg md:text-xl text-white/90 font-light"
                  )}>
                    {msg.content || (isProcessing ? '...' : '')}
                  </p>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </motion.div>
          ) : (
            <motion.div
              key="welcome-prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full min-h-[180px] flex flex-col items-center justify-center space-y-3 text-center px-3 sm:px-4"
            >
              {!isRecording && !isProcessing && (
                <>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-white/80 tracking-tight">
                    Ask me anything...
                  </h2>
                  <p className="text-[11px] sm:text-xs text-white/30 mt-2">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/50 font-mono text-[10px]">Space</kbd> or tap the orb to speak
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---- Middle: The Orb ---- */}
      <div className="shrink-0 w-full flex items-center justify-center relative py-3 sm:py-6 md:py-8">
        <VoiceVisualizer
          state={orbState}
          volume={orbState === 'listening' ? audioLevel : isPlaying ? (audioLevel || 0.4) : 0}
          onClick={isRecording ? stopRecordingFn : startRecordingFn}
          errorMessage={micErrorMessage}
          languageLabel={langLabel}
        />
      </div>

      {/* ---- Bottom: Controls ---- */}
      <div className="w-full max-w-xl shrink-0 pb-3 sm:pb-6">
        <VoiceControls
          currentMessage={allDisplayMessages.length > 0 ? allDisplayMessages[allDisplayMessages.length - 1] : null}
          isPlaying={isPlaying}
          isMuted={isMuted}
          volume={volume}
          availableVoices={availableVoices}
          selectedVoice={selectedVoice}
          autoListen={autoListen}
          onTogglePlayback={togglePlayback}
          onReset={() => {
            if (audioElRef.current) { audioElRef.current.pause(); audioElRef.current = null; }
            if (abortRef.current) abortRef.current.abort();
            if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
            setMessages([]);
            setCurrentStreamMsg(null);
            setIsPlaying(false);
            setConversationId(undefined);
          }}
          onMuteToggle={() => setIsMuted(!isMuted)}
          onVolumeChange={(v) => {
            setVolume(v);
            if (audioElRef.current) audioElRef.current.volume = v / 100;
          }}
          onVoiceChange={(voice) => setSelectedVoice(voice)}
          onAutoListenToggle={() => onAutoListenChange?.(!autoListen)}
        />
      </div>
    </div>
  );
}
