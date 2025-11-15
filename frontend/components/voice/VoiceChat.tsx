'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Delete } from '@mui/icons-material';
import { useConversationalVoice } from '@/lib/hooks/useConversationalVoice';
import { VoiceMessageBubble } from './VoiceMessageBubble';
import { Box, Typography, IconButton, CircularProgress, Button, Chip, Alert, Divider } from '@mui/material';

interface VoiceChatProps {
  userId?: string;
}

export function VoiceChat({ userId = 'default' }: VoiceChatProps) {
  const {
    messages,
    isRecording,
    isProcessing,
    error,
    startRecording,
    stopRecording,
    clearConversation,
    togglePlayback,
    deleteMessage,
  } = useConversationalVoice(userId);

  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Auto-stop recording after 30 seconds
  useEffect(() => {
    if (isRecording && recordingTime >= 30) {
      handleStopRecording();
    }
  }, [recordingTime, isRecording]);

  const handleStartRecording = async () => {
    try {
      setPermissionDenied(false);
      await startRecording();
    } catch (error) {
      console.error('Microphone access denied:', error);
      setPermissionDenied(true);
    }
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasMessages = messages.length > 0;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">Voice Chat</Typography>
          <Typography variant="body2" color="text.secondary">
            {hasMessages ? `${messages.length} messages` : 'Start a conversation'}
          </Typography>
        </Box>

        {hasMessages && (
          <IconButton onClick={clearConversation} size="small" title="Clear conversation">
            <Delete />
          </IconButton>
        )}
      </Box>

      {/* Messages Area */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <Box sx={{
          height: '100%',
          overflowY: 'auto',
          p: 2,
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'grey.400',
            borderRadius: '2px',
          },
        }}>
          {hasMessages ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {messages.map((message) => (
                <VoiceMessageBubble
                  key={message.id}
                  message={message}
                  onTogglePlayback={togglePlayback}
                  onDelete={deleteMessage}
                />
              ))}
              <div ref={messagesEndRef} />
            </Box>
          ) : (
            <Box sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              py: 6,
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                opacity: 0.6,
              }}>
                <Mic sx={{ fontSize: 32, color: 'white' }} />
              </Box>

              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Ready to Start
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                Tap the microphone to begin your voice conversation with AI
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Recording Controls */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        {/* Error Display */}
        {(error || permissionDenied) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {permissionDenied ? "Microphone permission required" : error}
          </Alert>
        )}

        {/* Recording Interface */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleToggleRecording}
            disabled={isProcessing}
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: isRecording ? 'error.main' : 'primary.main',
              '&:hover': {
                bgcolor: isRecording ? 'error.dark' : 'primary.dark',
              },
              '&.Mui-disabled': {
                opacity: 0.6,
              },
            }}
          >
            {isProcessing ? (
              <CircularProgress size={32} sx={{ color: 'white' }} />
            ) : isRecording ? (
              <Square sx={{ fontSize: 32, color: 'white' }} />
            ) : (
              <Mic sx={{ fontSize: 32, color: 'white' }} />
            )}
          </Button>

          {/* Status Display */}
          <Box sx={{ textAlign: 'center', minHeight: 40 }}>
            {isProcessing ? (
              <Typography variant="body2" color="primary" fontWeight="bold">
                Processing...
              </Typography>
            ) : isRecording ? (
              <Box>
                <Typography variant="body1" color="error.main" fontWeight="bold">
                  Recording
                </Typography>
                <Chip label={formatTime(recordingTime)} size="small" color="error" />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {hasMessages ? 'Continue recording' : 'Start recording'}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
