'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Trash2, Volume2, Mic, User } from 'lucide-react';
import { VoiceMessage } from '@/lib/hooks/useConversationalVoice';

interface VoiceMessageBubbleProps {
  message: VoiceMessage;
  onTogglePlayback: (messageId: string) => void;
  onDelete: (messageId: string) => void;
}

export function VoiceMessageBubble({ message, onTogglePlayback, onDelete }: VoiceMessageBubbleProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !message.audioUrl) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onTogglePlayback(message.id);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [message.audioUrl, onTogglePlayback, message.id]);

  useEffect(() => {
    if (message.isPlaying !== isPlaying) {
      setIsPlaying(message.isPlaying || false);
      const audio = audioRef.current;
      if (audio) {
        if (message.isPlaying) {
          audio.play();
        } else {
          audio.pause();
        }
      }
    }
  }, [message.isPlaying, isPlaying]);

  const handlePlayPause = () => {
    onTogglePlayback(message.id);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isUser = message.type === 'user';

  return (
    <div className={`flex gap-3 group ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-purple-600' : 'bg-blue-600'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Mic className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className="max-w-md">
        {/* Message bubble */}
        <div className={`rounded-lg px-4 py-3 ${
          isUser ? 'bg-purple-600 text-white' : 'bg-gray-800 text-white'
        }`}>
          {/* Error State */}
          {message.error && (
            <div className="bg-red-900/50 border border-red-800 rounded p-2 mb-3">
              <p className="text-red-200 text-sm">{message.error}</p>
            </div>
          )}

          {/* Transcription */}
          {message.transcription && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-3 h-3 text-purple-300" />
                <span className="text-xs font-medium text-purple-300">You said:</span>
              </div>
              <p className="text-sm bg-black/20 rounded p-2">
                {message.transcription}
              </p>
            </div>
          )}

          {/* Response Text */}
          {message.responseText && !isUser && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Mic className="w-3 h-3 text-blue-300" />
                <span className="text-xs font-medium text-blue-300">Response:</span>
              </div>
              <p className="text-sm">
                {message.responseText}
              </p>
            </div>
          )}

          {/* Audio Player */}
          {message.audioUrl && (
            <div className="bg-black/30 rounded p-3">
              <div className="flex items-center gap-3">
                <audio ref={audioRef} src={message.audioUrl} />

                <button
                  onClick={handlePlayPause}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-3 h-3 text-white" />
                  ) : (
                    <Play className="w-3 h-3 text-white" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="w-full bg-gray-600 rounded-full h-1 overflow-hidden">
                    <div
                      className="h-full bg-purple-400 rounded-full transition-all"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <span className="text-xs text-gray-300 min-w-[3rem]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {!message.transcription && !message.error && isUser && (
            <div className="flex items-center gap-2 bg-purple-900/50 rounded p-2">
              <div className="w-3 h-3 border border-purple-300 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-purple-300">Processing...</span>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-600">
            <span className="text-xs text-gray-400">
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>

            {!isUser && (
              <span className="text-xs text-blue-300">AI</span>
            )}
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(message.id)}
          className="opacity-0 group-hover:opacity-100 mt-1 p-1 text-gray-400 hover:text-red-400 transition-all"
          title="Delete message"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
