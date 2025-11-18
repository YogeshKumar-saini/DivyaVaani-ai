'use client';

import { useState, useRef, useCallback } from 'react';
import { voiceService } from '@/lib/api/voice-service';
import { handleAPIError } from '@/lib/api/client';

export interface VoiceMessage {
  id: string;
  type: 'user' | 'assistant';
  transcription?: string;
  responseText?: string;
  audioUrl?: string;
  timestamp: Date;
  isPlaying?: boolean;
  error?: string;
}

export function useConversationalVoice(userId: string = 'default') {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentMessageIdRef = useRef<string>('');

  const processVoiceQuery = useCallback(async (audioBlob: Blob, mimeType?: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await voiceService.processVoiceQuery(audioBlob, {
        userId,
        inputLanguage: 'auto',
        outputLanguage: 'auto',
      }, mimeType);

      // Update user message with transcription
      setMessages(prev => prev.map(msg =>
        msg.id === currentMessageIdRef.current
          ? { ...msg, transcription: result.transcription.text }
          : msg
      ));

      // Add assistant response
      const assistantMessage: VoiceMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'assistant',
        transcription: result.transcription.text,
        responseText: result.response_text,
        audioUrl: URL.createObjectURL(result.audio_data),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);

      // Update user message with error
      setMessages(prev => prev.map(msg =>
        msg.id === currentMessageIdRef.current
          ? { ...msg, error: errorMessage }
          : msg
      ));

      console.error('Voice processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [userId]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      // Try different mimeTypes in order of preference for backend compatibility
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/wav'];
      let selectedMimeType = undefined;

      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      console.log('useConversationalVoice: Selected mimeType for recording:', selectedMimeType);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Generate unique message ID
      currentMessageIdRef.current = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Add user message placeholder
      const userMessage: VoiceMessage = {
        id: currentMessageIdRef.current,
        type: 'user',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Create blob with the correct MIME type
        const audioBlob = new Blob(audioChunksRef.current, { type: selectedMimeType || 'audio/wav' });
        console.log('useConversationalVoice: Created audio blob, size:', audioBlob.size, 'type:', audioBlob.type);
        await processVoiceQuery(audioBlob, selectedMimeType);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('Microphone access denied. Please enable microphone permissions.');
      console.error('Microphone error:', err);
    }
  }, [processVoiceQuery]);

  const stopRecording = useCallback(() => {
    console.log('useConversationalVoice: stopRecording called, mediaRecorder exists:', !!mediaRecorderRef.current, 'isRecording:', isRecording);
    if (mediaRecorderRef.current && isRecording) {
      console.log('useConversationalVoice: Stopping MediaRecorder...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      console.log('useConversationalVoice: Cannot stop - MediaRecorder not available or not recording');
    }
  }, [isRecording]);



  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const togglePlayback = useCallback((messageId: string) => {
    setMessages(prev => prev.map(msg => ({
      ...msg,
      isPlaying: msg.id === messageId ? !msg.isPlaying : false
    })));
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  return {
    messages,
    isRecording,
    isProcessing,
    error,
    startRecording,
    stopRecording,
    clearConversation,
    togglePlayback,
    deleteMessage,
  };
}
