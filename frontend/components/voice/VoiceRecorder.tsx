'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Waves, Zap, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export function VoiceRecorder({
  isRecording,
  isProcessing,
  onStartRecording,
  onStopRecording
}: VoiceRecorderProps) {
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Animate audio level visualization
      const animateAudio = () => {
        setAudioLevel(Math.random() * 100);
        animationRef.current = requestAnimationFrame(animateAudio);
      };
      animateAudio();
    } else {
      // Reset timer
      setRecordingTime(0);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setAudioLevel(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording]);

  const handleToggleRecording = async () => {
    console.log('VoiceRecorder: handleToggleRecording called, isRecording:', isRecording);
    if (isRecording) {
      console.log('VoiceRecorder: Stopping recording...');
      onStopRecording();
    } else {
      try {
        setPermissionDenied(false);
        console.log('VoiceRecorder: Starting recording...');
        await onStartRecording();
      } catch (error) {
        console.error('Microphone access denied:', error);
        setPermissionDenied(true);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-8 p-8">
      {/* Main Microphone Interface */}
      <div className="relative">
        {/* Outer glow rings for recording state */}
        {isRecording && (
          <>
            <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping"></div>
            <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute inset-0 rounded-full bg-red-300/10 animate-ping" style={{ animationDelay: '1s' }}></div>
          </>
        )}

        {/* Audio visualization rings */}
        {isRecording && (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border-2 border-red-400/50 animate-pulse"
                style={{
                  animationDelay: `${i * 0.3}s`,
                  transform: `scale(${1.1 + i * 0.2})`
                }}
              />
            ))}
          </>
        )}

        {/* Main Microphone Button */}
        <button
          onClick={handleToggleRecording}
          disabled={isProcessing}
          className={cn(
            "relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/50",
            isRecording
              ? "bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 shadow-red-500/50 scale-110 animate-pulse"
              : "bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-700 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-800 hover:scale-105 shadow-purple-500/50",
            isProcessing && "opacity-50 cursor-not-allowed scale-100 animate-none"
          )}
        >
          {isProcessing ? (
            <Loader2 className="h-16 w-16 text-white animate-spin" />
          ) : isRecording ? (
            <Square className="h-16 w-16 text-white" />
          ) : (
            <Mic className="h-16 w-16 text-white" />
          )}

          {/* Inner glow effect */}
          <div className={cn(
            "absolute inset-2 rounded-full",
            isRecording
              ? "bg-gradient-to-br from-red-400/30 to-transparent"
              : "bg-gradient-to-br from-white/20 to-transparent"
          )} />
        </button>
      </div>

      {/* Audio Level Visualization */}
      {isRecording && (
        <div className="relative">
          {/* Central audio visualization */}
          <div className="flex items-end gap-1 h-16 px-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-2 bg-gradient-to-t from-red-400 via-red-500 to-red-300 rounded-full transition-all duration-100"
                style={{
                  height: `${Math.max(8, Math.random() * audioLevel * 0.8 + 20)}px`,
                  animationDelay: `${i * 50}ms`
                }}
              />
            ))}
          </div>
          
          {/* Surrounding wave visualization */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border border-red-400/30 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Status Display */}
      <div className="text-center min-h-[6rem] flex flex-col items-center justify-center">
        {isProcessing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              <div className="flex flex-col items-start">
                <p className="text-lg font-semibold text-white">Processing your sacred words</p>
                <p className="text-sm text-slate-300">AI is understanding your voice...</p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        ) : isRecording ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-4 h-4 bg-red-400 rounded-full animate-pulse"></div>
              <div className="flex flex-col items-start">
                <p className="text-xl font-semibold text-red-300">Recording in progress</p>
                <p className="text-sm text-slate-300">Your voice is being captured</p>
              </div>
            </div>

            {/* Large timer display */}
            <div className="bg-black/30 backdrop-blur-xl rounded-2xl px-8 py-4 border border-white/20">
              <div className="text-4xl font-mono text-white mb-2">{formatTime(recordingTime)}</div>
              <div className="w-32 h-2 bg-red-500/30 rounded-full mx-auto overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-red-300 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((recordingTime / 30) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Stop button */}
            <button
              onClick={() => {
                console.log('Stop button clicked');
                onStopRecording();
              }}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/50"
            >
              Stop Recording
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Volume2 className="w-6 h-6 text-purple-400" />
              <div className="flex flex-col items-start">
                <p className="text-lg font-semibold text-white">Ready for divine conversation</p>
                <p className="text-sm text-slate-300">Tap the microphone to begin</p>
              </div>
            </div>

            {/* Feature indicators */}
            <div className="grid grid-cols-3 gap-4 max-w-sm">
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <Waves className="w-5 h-5 text-purple-300 mx-auto mb-1" />
                <p className="text-xs text-slate-300">Crystal Clear</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <Zap className="w-5 h-5 text-purple-300 mx-auto mb-1" />
                <p className="text-xs text-slate-300">Real-time</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <Volume2 className="w-5 h-5 text-purple-300 mx-auto mb-1" />
                <p className="text-xs text-slate-300">AI Powered</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Permission Denied Message */}
      {permissionDenied && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 max-w-md backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Mic className="w-6 h-6 text-red-400" />
            <div>
              <p className="text-red-200 font-semibold mb-1">Microphone Access Required</p>
              <p className="text-red-300 text-sm">
                Please enable microphone permissions in your browser settings to use voice features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isRecording && !isProcessing && (
        <div className="text-center">
          <p className="text-slate-300 text-sm max-w-md">
            Experience premium voice recognition with advanced noise cancellation and AI-powered responses
          </p>
        </div>
      )}
    </div>
  );
}
