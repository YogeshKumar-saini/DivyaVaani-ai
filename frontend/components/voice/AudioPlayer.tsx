'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  audioUrl: string;
  transcription: string;
  onPlaybackEnd?: () => void;
}

export function AudioPlayer({ audioUrl, transcription, onPlaybackEnd }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onPlaybackEnd) onPlaybackEnd();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onPlaybackEnd]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const handleSpeedChange = (speed: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'divyavaani-response.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-xl border border-orange-200/50">
      <audio ref={audioRef} src={audioUrl} />

      {/* Transcription */}
      {transcription && (
        <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-sm font-semibold text-orange-800 mb-2">Transcription:</p>
          <p className="text-gray-700">{transcription}</p>
        </div>
      )}

      {/* Player Controls */}
      <div className="space-y-4">
        {/* Play/Pause Button and Progress */}
        <div className="flex items-center space-x-4">
          <button
            onClick={togglePlayPause}
            className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center hover:from-orange-500 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 text-white" />
            ) : (
              <Play className="h-6 w-6 text-white ml-0.5" />
            )}
          </button>

          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Volume and Speed Controls */}
        <div className="flex items-center justify-between">
          {/* Volume */}
          <div className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4 text-gray-600" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          {/* Playback Speed */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Speed:</span>
            {[0.5, 1, 1.5, 2].map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={cn(
                  "px-2 py-1 text-xs rounded transition-colors",
                  playbackSpeed === speed
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                )}
              >
                {speed}×
              </button>
            ))}
          </div>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Download audio"
          >
            <Download className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
