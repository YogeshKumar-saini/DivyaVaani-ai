'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Settings,
  Volume2,
  VolumeX,
  RotateCcw,
  Send,
  Loader2,
} from 'lucide-react';
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  Slider,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  Divider,
} from '@mui/material';

interface Message {
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
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Simulated voice recording for demo
  const startRecording = () => {
    setIsRecording(true);
    setError(null);
    setRecordingTime(0);

    // Start countdown timer
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 300) { // Max 5 minutes
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    // Simulate recording started
    setTimeout(() => {
      if (isRecording) {
        setIsProcessing(true);
      }
    }, 2000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      // Mock processed message
      const mockMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: 'दिव्य मार्ग指引',
        timestamp: new Date(),
        audioUrl: 'mock-audio.mp3',
        transcription: 'Show me the path to enlightenment',
        duration: 3.2,
      };
      setCurrentMessage(mockMessage);
    }, 2000);
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume / 100 : 0;
    }
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const volumeValue = newValue as number;
    setVolume(volumeValue);
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = volumeValue / 100;
    }
  };

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
    <Box sx={{ maxWidth: '100%', height: '100%' }}>
      {/* Status Indicator */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Chip
          icon={
            isRecording ? <Mic color="white" /> :
            isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> :
            <MicOff />
          }
          label={
            isRecording ? `Recording... ${formatTime(recordingTime)}` :
            isProcessing ? 'Processing...' :
            currentMessage ? 'Ready to respond' : 'Tap to start voice query'
          }
          sx={{
            bgcolor: isRecording ? 'error.main' :
                   isProcessing ? 'warning.main' : 'primary.main',
            color: 'white',
            '& .MuiChip-icon': {
              animate: isProcessing ? 'spin' : 'none',
            },
            animation: isProcessing ? 'pulse 2s infinite' : 'none',
          }}
        />
      </Box>

      {/* Main Recording Interface */}
      <Card sx={{
        p: 4,
        textAlign: 'center',
        borderRadius: 3,
        mb: 3,
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(254, 211, 170, 0.8) 100%)`,
      }}>
        {/* Large Avatar/Icon */}
        <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              bgcolor: isRecording ? 'error.main' : 'primary.main',
              border: 4,
              borderColor: 'white',
              boxShadow: 3,
              animation: isRecording
                ? 'pulse-red 1.5s infinite'
                : isProcessing
                ? 'spin 2s linear infinite'
                : 'none',
            }}
          >
            {isRecording ? (
              <Mic className="text-white" style={{ fontSize: 48 }} />
            ) : isProcessing ? (
              <Loader2 className="text-white animate-spin" style={{ fontSize: 48 }} />
            ) : (
              <Mic className="text-white" style={{ fontSize: 48 }} />
            )}
          </Avatar>

          {isRecording && (
            <Box
              sx={{
                position: 'absolute',
                inset: -4,
                borderRadius: '50%',
                border: '2px solid',
                borderColor: 'error.main',
                animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
                opacity: 0.3,
              }}
            />
          )}
        </Box>

        {/* Recording Status */}
        {isRecording && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress
              variant="determinate"
              value={(recordingTime / 300) * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'grey.300',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'error.main',
                  borderRadius: 3,
                }
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Keep speaking... maximum 5 minutes
            </Typography>
          </Box>
        )}

        {/* Main Action Button */}
        <Button
          variant="contained"
          color={isRecording ? 'error' : 'primary'}
          size="large"
          startIcon={isRecording ? <Square /> : <Mic />}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          sx={{
            minWidth: 200,
            py: 2,
            fontSize: '1.1rem',
            borderRadius: 3,
            boxShadow: isRecording ? '0 0 20px rgba(244, 67, 54, 0.3)' : '0 4px 14px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              boxShadow: isRecording
                ? '0 0 30px rgba(244, 67, 54, 0.5)'
                : '0 6px 20px rgba(0, 0, 0, 0.15)',
            }
          }}
        >
          {isRecording ? 'Stop Recording' : isProcessing ? 'Processing...' : 'Start Voice Query'}
        </Button>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mt: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </Card>

      {/* Current Message Display */}
      {currentMessage && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
              }}
            >
              ॐ
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {currentMessage.content}
              </Typography>

              {currentMessage.transcription && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    borderLeft: 3,
                    borderColor: 'primary.light',
                    pl: 2,
                    mb: 2,
                    fontStyle: 'italic'
                  }}
                >
                  &ldquo;{currentMessage.transcription}&rdquo;
                </Typography>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <IconButton
                  size="small"
                  onClick={togglePlayback}
                  sx={{ color: 'primary.main' }}
                >
                  {isPlaying ? <Pause /> : <Play />}
                </IconButton>

                <Typography variant="caption" color="text.secondary">
                  {currentMessage.duration ? `${formatTime(Math.floor(currentMessage.duration))}` : 'Audio ready'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Card>
      )}

      {/* Audio Controls */}
      {(isPlaying || currentMessage) && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Audio Controls
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconButton onClick={toggleMute}>
              {isMuted ? <VolumeX /> : <Volume2 />}
            </IconButton>

            <Slider
              value={volume}
              onChange={handleVolumeChange}
              sx={{ flexGrow: 1 }}
              disabled={isMuted}
            />

            <Typography variant="body2" color="text.secondary">
              {volume}%
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RotateCcw />}
            onClick={() => {
              setCurrentMessage(null);
              setIsPlaying(false);
            }}
            size="small"
          >
            Clear Response
          </Button>
        </Card>
      )}

      {/* Features Info */}
      <Card sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Voice Features
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Mic className="text-blue-600" style={{ fontSize: 16 }} />
            <Typography variant="body2">Natural voice recognition</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Play className="text-green-600" style={{ fontSize: 16 }} />
            <Typography variant="body2">AI-generated responses</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Volume2 className="text-indigo-600" style={{ fontSize: 16 }} />
            <Typography variant="body2">High-quality audio</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Send className="text-amber-600" style={{ fontSize: 16 }} />
            <Typography variant="body2">Instant voice responses</Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
