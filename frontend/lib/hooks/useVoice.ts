'use client';

import { useState, useRef } from 'react';
import { voiceService } from '@/lib/api/voice-service';
import { handleAPIError } from '@/lib/api/client';

export function useVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioResponse, setAudioResponse] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [responseText, setResponseText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
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


      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Create blob with the correct MIME type
        const audioBlob = new Blob(audioChunksRef.current, { type: selectedMimeType || 'audio/wav' });
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
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
    }
  };

  const processVoiceQuery = async (audioBlob: Blob, mimeType?: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await voiceService.processVoiceQuery(audioBlob, {
        inputLanguage: 'auto',
        outputLanguage: 'auto',
      }, mimeType);

      setAudioResponse(URL.createObjectURL(result.audio_data));
      setTranscription(result.transcription.text);
      setResponseText(result.response_text);
    } catch (err) {
      setError(handleAPIError(err));
      console.error('Voice processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearResponse = () => {
    setAudioResponse(null);
    setTranscription('');
    setResponseText('');
    setError(null);
  };

  return {
    isRecording,
    isProcessing,
    audioResponse,
    transcription,
    responseText,
    error,
    startRecording,
    stopRecording,
    clearResponse,
  };
}
