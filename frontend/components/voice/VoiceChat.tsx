'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Waves,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { voiceService } from '@/lib/api/voice-service';
import { handleAPIError } from '@/lib/api/client';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  transcription?: string;
  duration?: number;
}

const AudioVisualizer = ({ isRecording, isProcessing }: { isRecording: boolean; isProcessing: boolean }) => {
  // Create 20 bars for the visualizer
  const bars = Array.from({ length: 20 });

  return (
    <div className="flex items-center justify-center gap-1 h-16 sm:h-24">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            "w-1.5 sm:w-2 rounded-full",
            isRecording ? "bg-gradient-to-t from-orange-500 to-red-500" :
              isProcessing ? "bg-gradient-to-t from-blue-500 to-purple-500" :
                "bg-white/20"
          )}
          animate={{
            height: isRecording
              ? [10, Math.random() * 60 + 20, 10]
              : isProcessing
                ? [10, 30, 10]
                : 8,
            opacity: isRecording || isProcessing ? 1 : 0.3
          }}
          transition={{
            duration: isRecording ? 0.2 : 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.05,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export function VoiceChat() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Real voice recording implementation
  const startRecording = async () => {
    try {
      setIsRecording(true);
      setRecordingTime(0);
      setCurrentMessage(null); // Clear previous message on new record

      // Clear previous audio chunks
      audioChunksRef.current = [];

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create media recorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
        audioBitsPerSecond: 128000
      });

      // Set up event handlers
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      mediaRecorderRef.current.start(100); // Collect data every 100ms

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 300) { // 5 minute max
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    setIsRecording(false);

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setIsProcessing(true);

    try {
      // Stop recording
      mediaRecorderRef.current.stop();

      // Wait for the stop event to complete
      await new Promise(resolve => {
        mediaRecorderRef.current!.onstop = () => {
          mediaRecorderRef.current!.onstop = null;
          resolve(null);
        };
      });

      // Create audio blob from chunks
      const audioBlob = new Blob(audioChunksRef.current, {
        type: 'audio/webm'
      });

      // Process the voice query
      await processVoiceQuery(audioBlob);

    } catch (error) {
      console.error('Error processing voice query:', error);
      setIsProcessing(false);
      alert('Error processing your voice query. Please try again.');
    }
  };

  const processVoiceQuery = async (audioBlob: Blob) => {
    try {
      // Call the backend voice service
      const response = await voiceService.processVoiceQuery(audioBlob, {
        inputLanguage: 'auto',
        outputLanguage: 'auto',
        voice: 'default'
      });

      // Create audio URL for playback
      const audioUrl = URL.createObjectURL(response.audio_data);

      // Create message with response
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: response.response_text,
        timestamp: new Date(),
        audioUrl: audioUrl,
        transcription: response.transcription.text,
        duration: Math.ceil(response.audio_data.size / (128000 / 8)) // Estimate duration
      };

      setCurrentMessage(newMessage);
      setIsProcessing(false);

    } catch (error) {
      console.error('Voice query failed:', error);
      setIsProcessing(false);
      const errorMessage = handleAPIError(error);
      alert(`Voice query failed: ${errorMessage}`);
    }
  };

  const togglePlayback = () => {
    if (!currentMessage?.audioUrl) return;

    if (isPlaying) {
      // Stop playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // Start playback
      const audioElement = new Audio(currentMessage.audioUrl);
      audioElement.volume = isMuted ? 0 : volume / 100;
      audioElement.play();

      audioElement.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };

      audioElement.onerror = () => {
        console.error('Audio playback error');
        setIsPlaying(false);
        audioRef.current = null;
      };

      audioRef.current = audioElement;
      setIsPlaying(true);
    }
  };

  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden">

      {/* Central Visualizer & Interaction Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-8">

        {/* Holographic Circle Background Effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px] animate-pulse-slow" />
          <div className="w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px] animate-pulse-slow delay-1000" />
        </div>

        {/* Dynamic Status Text */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={isRecording ? 'rec' : isProcessing ? 'proc' : currentMessage ? 'res' : 'idle'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center mb-12 z-10"
          >
            {isRecording ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-red-400 font-medium tracking-widest text-sm uppercase">Listening</span>
                <span className="text-4xl md:text-5xl font-light text-white font-mono">{formatTime(recordingTime)}</span>
                <span className="text-white/40 text-sm">Tap stop when finished</span>
              </div>
            ) : isProcessing ? (
              <div className="flex flex-col items-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-400 animate-spin" />
                <span className="text-2xl font-light text-blue-200">Consulting the ancient wisdom...</span>
              </div>
            ) : currentMessage ? (
              <div className="flex flex-col items-center gap-4 max-w-2xl px-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl"
                >
                  <p className="text-lg md:text-xl text-white/90 leading-relaxed font-light">
                    &ldquo;{currentMessage.content}&rdquo;
                  </p>
                </motion.div>
                <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wider">
                  <Waves className="h-3 w-3" /> AI Response Generated
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                  DivyaVaani Voice
                </h2>
                <p className="text-lg text-white/60">Tap the mic to begin your spiritual query</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Audio Visualizer */}
        <div className="mb-12 h-24 relative z-10 w-full max-w-lg mx-auto">
          <AudioVisualizer isRecording={isRecording} isProcessing={isProcessing} />
        </div>

        {/* Main Mic Button */}
        <div className="relative z-20">
          {/* Pulsing rings */}
          {(isRecording || isProcessing) && (
            <>
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={cn(
                  "absolute inset-0 rounded-full blur-xl",
                  isRecording ? "bg-red-500/40" : "bg-blue-500/40"
                )}
              />
              <motion.div
                animate={{ scale: [1, 2, 1], opacity: [0.1, 0, 0.1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className={cn(
                  "absolute inset-0 rounded-full blur-2xl",
                  isRecording ? "bg-orange-500/30" : "bg-purple-500/30"
                )}
              />
            </>
          )}

          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={cn(
              "relative flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full transition-all duration-300 shadow-2xl group",
              isRecording
                ? "bg-gradient-to-br from-red-500 to-orange-600 shadow-red-500/40 scale-110"
                : isProcessing
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-500/40 cursor-wait"
                  : "bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/20 hover:scale-105"
            )}
          >
            {isRecording ? (
              <Square className="w-10 h-10 text-white fill-white animate-pulse" />
            ) : isProcessing ? (
              <Cpu className="w-12 h-12 text-white animate-pulse" />
            ) : (
              <Mic className="w-12 h-12 text-white/80 group-hover:text-white transition-colors" />
            )}
          </button>
        </div>

      </div>

      {/* Bottom Controls Bar (Glassmorphic) */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="w-full bg-black/40 backdrop-blur-xl border-t border-white/10 p-4 sm:p-6 z-30"
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8">

          {/* Playback Controls */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-white hover:bg-white/10 rounded-full"
              disabled={!currentMessage}
              onClick={() => {
                setCurrentMessage(null);
                setIsPlaying(false);
              }}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full border border-white/20 text-white hover:bg-white/10 hover:scale-105 transition-all",
                isPlaying && "bg-white/20 text-white border-white/40"
              )}
              disabled={!currentMessage}
              onClick={togglePlayback}
            >
              {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
            </Button>

            <div className="flex flex-col items-start min-w-[100px]">
              <span className="text-xs text-white/40 font-mono">
                {currentMessage?.duration && isPlaying ? formatTime(currentMessage.duration) : "--:--"}
              </span>
              <span className="text-xs font-medium text-white/80">
                {isPlaying ? "Playing Answer" : "Playback Ready"}
              </span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 w-full sm:w-64">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-white hover:bg-white/10 rounded-full shrink-0"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <div className="flex-1">
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={(val) => {
                  setVolume(val[0]);
                  if (val[0] > 0) setIsMuted(false);
                }}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
