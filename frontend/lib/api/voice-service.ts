/**
 * Voice Service - Handles voice-based interactions with the backend
 */

import { APIError, apiClient } from './client';

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

function asciiPrefix(bytes: Uint8Array, length: number): string {
  return String.fromCharCode(...bytes.slice(0, length));
}

function hasKnownAudioSignature(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;

  const head3 = asciiPrefix(bytes, 3);
  const head4 = asciiPrefix(bytes, 4);
  const head8 = asciiPrefix(bytes, 8);

  // MP3: ID3 tag or MPEG frame sync
  const isMp3 =
    head3 === 'ID3' ||
    (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);

  // WAV/AIFF/OGG/FLAC/WEBM containers
  const isWav = head4 === 'RIFF' && asciiPrefix(bytes.slice(8), 4) === 'WAVE';
  const isAiff = head4 === 'FORM' && asciiPrefix(bytes.slice(8), 4) === 'AIFF';
  const isOgg = head4 === 'OggS';
  const isFlac = head4 === 'fLaC';
  const isWebm = head4 === '\x1aE\xdf\xa3' || head8 === '\x1aE\xdf\xa3\x9fB\x86\x81';

  return isMp3 || isWav || isAiff || isOgg || isFlac || isWebm;
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
    const audioFile = new File([audioBlob], 'recording.webm', { type: audioBlob.type || 'audio/webm' });
    const response = await apiClient.uploadFile('/voice/stt', audioFile, {
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
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    const audioBlob = await response.blob();

    // Some backends return JSON/text errors with HTTP 200. Guard playback against non-audio payloads.
    if ((contentType && !contentType.startsWith('audio/')) || audioBlob.size === 0) {
      let details: unknown = `content-type=${contentType || 'unknown'} size=${audioBlob.size}`;
      try {
        details = await audioBlob.text();
      } catch {
        // no-op, keep fallback details
      }
      throw new APIError('TTS service returned an invalid audio payload', response.status, undefined, details);
    }

    const probe = new Uint8Array(await audioBlob.slice(0, 64).arrayBuffer());
    if (!hasKnownAudioSignature(probe)) {
      let details: unknown = `Unrecognized audio signature, content-type=${contentType || 'unknown'}, size=${audioBlob.size}`;
      try {
        details = await audioBlob.slice(0, 256).text();
      } catch {
        // no-op, keep fallback details
      }
      throw new APIError('TTS service returned undecodable audio data', response.status, undefined, details);
    }

    return audioBlob;
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
