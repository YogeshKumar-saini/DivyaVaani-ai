'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { voiceService } from '@/lib/api/voice-service';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';
import { VoiceVisualizer } from './VoiceVisualizer';
import { VoiceControls } from './VoiceControls';

export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  transcription?: string;
  duration?: number;
}

export function VoiceChat() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Audio state
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Use our new hook for visualization
  const audioLevel = useAudioAnalyzer(stream, isRecording);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(mediaStream);

      mediaRecorderRef.current = new MediaRecorder(mediaStream, {
        mimeType: 'audio/webm', // Or standard mimeType check
      });

      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        // Don't stop tracks immediately if we want visualizer to fade out nicely, but usually good practice.
        // We will stop stream in stopRecording.
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setCurrentMessage(null); // Clear previous

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone.');
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !stream) return;

    setIsRecording(false);
    setIsProcessing(true);

    mediaRecorderRef.current.stop();

    // Give a moment for last data
    await new Promise(resolve => setTimeout(resolve, 200));

    // Stop stream tracks
    stream.getTracks().forEach(track => track.stop());
    setStream(null);

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

    // Process
    try {
      const response = await voiceService.processVoiceQuery(audioBlob, {
        inputLanguage: 'auto',
        outputLanguage: 'auto',
        voice: 'default'
      });

      const audioUrl = URL.createObjectURL(response.audio_data);

      // Estimate duration crudely if backend doesn't send it, or assume 0 for now until loaded
      // Ideally backend sends duration.
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: response.response_text,
        timestamp: new Date(),
        audioUrl: audioUrl,
        transcription: response.transcription.text,
        duration: 0 // Will update on metadata load
      };

      setCurrentMessage(newMessage);
      setIsProcessing(false);

      // Auto-play
      setTimeout(() => playAudio(audioUrl), 500);

    } catch (error) {
      console.error("Processing error", error);
      setIsProcessing(false);
      // Error handling visual feedback?
    }
  };

  const playAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    const audio = new Audio(url);
    audio.volume = isMuted ? 0 : volume / 100;

    audio.onloadedmetadata = () => {
      // Update message duration if needed, state is local though
      // For now just play
    };

    audio.onended = () => {
      setIsPlaying(false);
    };

    audioRef.current = audio;
    audio.play();
    setIsPlaying(true);
  };

  const togglePlayback = () => {
    if (!audioRef.current || !currentMessage) {
      if (currentMessage?.audioUrl) playAudio(currentMessage.audioUrl);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // derived state for Visualizer
  let orbState: 'idle' | 'listening' | 'processing' | 'speaking' = 'idle';
  if (isProcessing) orbState = 'processing';
  else if (isRecording) orbState = 'listening';
  else if (isPlaying) orbState = 'speaking';
  else orbState = 'idle';

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-8">

        {/* Text Output / Status */}
        <div className="mb-12 text-center h-24 flex flex-col justify-end">
          <AnimatePresence mode="wait">
            {currentMessage ? (
              <motion.div
                key="text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl"
              >
                <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed">
                  &ldquo;{currentMessage.content}&rdquo;
                </p>
                {currentMessage.transcription && (
                  <p className="text-sm text-white/40 mt-2 italic">You said: {currentMessage.transcription}</p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/50"
              >
                {!isRecording && !isProcessing && (
                  <p>Tap the orb to begin your spiritual journey</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* The Orb */}
        <div className="relative z-20">
          <VoiceVisualizer
            state={orbState}
            volume={orbState === 'listening' ? audioLevel : isPlaying ? (audioLevel || 0.5) : 0} // Mock volume for playback if no analyzer on output
            onClick={isRecording ? stopRecording : startRecording}
          />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-10 left-0 right-0 px-4 z-30">
        <VoiceControls
          currentMessage={currentMessage}
          isPlaying={isPlaying}
          isMuted={isMuted}
          volume={volume}
          onTogglePlayback={togglePlayback}
          onReset={() => setCurrentMessage(null)}
          onMuteToggle={() => setIsMuted(!isMuted)}
          onVolumeChange={(v) => setVolume(v)}
        />
      </div>

    </div>
  );
}
