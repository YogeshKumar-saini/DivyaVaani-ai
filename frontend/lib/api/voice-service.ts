/**
 * Voice Service - Handles voice-based interactions with the backend
 */

import { apiClient } from './client';

export interface VoiceQueryOptions {
  userId?: string;
  inputLanguage?: string;
  outputLanguage?: string;
  voice?: string;
}

export interface STTResponse {
  text: string;
  confidence: number;
  language: string;
  duration: number;
  processing_time: number;
}

export interface VoiceQueryResponse {
  audio_data: Blob;
  transcription: {
    text: string;
    confidence: number;
    language: string;
  };
  response_text: string;
  processing_time: number;
}

export class VoiceService {
  /**
   * Process a complete voice query (speech-to-text, QA, text-to-speech)
   */
  async processVoiceQuery(
    audioBlob: Blob,
    options: VoiceQueryOptions = {},
    mimeType?: string
  ): Promise<VoiceQueryResponse> {
    // Determine filename based on mimeType for backend validation
    let filename = 'recording.wav';
    if (mimeType) {
      if (mimeType.includes('webm')) {
        filename = 'recording.webm';
      } else if (mimeType.includes('mp4')) {
        filename = 'recording.m4a';
      } else if (mimeType.includes('wav')) {
        filename = 'recording.wav';
      }
    }

    // Create a File object with proper filename for backend validation
    const audioFile = new File([audioBlob], filename, { type: audioBlob.type });

    const response = await apiClient.uploadFile('/voice', audioFile, {
      user_id: options.userId || '',
      input_language: options.inputLanguage || 'auto',
      output_language: options.outputLanguage || 'auto',
      voice: options.voice || 'default',
    });

    const audioData = await response.blob();
    const encodedTranscription = response.headers.get('X-Transcription') || '';
    const encodedResponseText = response.headers.get('X-Response-Text') || '';

    // URL decode the headers
    const transcription = decodeURIComponent(encodedTranscription);
    const responseText = decodeURIComponent(encodedResponseText);
    const processingTime = parseFloat(
      response.headers.get('X-Processing-Time') || '0'
    );

    return {
      audio_data: audioData,
      transcription: {
        text: transcription,
        confidence: 1.0,
        language: options.inputLanguage || 'auto',
      },
      response_text: responseText,
      processing_time: processingTime,
    };
  }

  /**
   * Convert speech to text only
   */
  async speechToText(
    audioBlob: Blob,
    language: string = 'auto',
    userId?: string
  ): Promise<STTResponse> {
    const response = await apiClient.uploadFile('/voice/stt', audioBlob, {
      language,
      user_id: userId || '',
    });

    return response.json();
  }

  /**
   * Convert text to speech only
   */
  async textToSpeech(
    text: string,
    language: string = 'en',
    voice: string = 'default',
    speed: number = 1.0,
    userId?: string
  ): Promise<Blob> {
    const additionalData: Record<string, string> = {
      text,
      language,
      voice,
      speed: speed.toString(),
    };

    if (userId) {
      additionalData.user_id = userId;
    }

    const response = await apiClient.uploadFile('/voice/tts', new Blob([]), additionalData);
    return response.blob();
  }

  /**
   * Get supported STT languages
   */
  async getSupportedSTTLanguages(): Promise<{
    supported_languages: string[];
    supported_formats: string[];
  }> {
    return apiClient.request('/voice/stt/languages');
  }

  /**
   * Get available TTS voices
   */
  async getAvailableTTSVoices(language?: string): Promise<{
    voices: Record<string, string[]>;
    supported_languages: string[];
    supported_formats: string[];
  }> {
    const endpoint = language
      ? `/voice/tts/voices?language=${language}`
      : '/voice/tts/voices';
    return apiClient.request(endpoint);
  }
}

export const voiceService = new VoiceService();
