/**
 * Voice Service — handles speech-to-text interactions.
 */

import { apiUpload, APIError } from './api-client';

export interface STTResponse {
    text: string;
    confidence: number;
    language: string;
    duration?: number;
    processing_time?: number;
}

function getAudioMetaFromUri(uri: string): { filename: string; mimeType: string } {
    const cleanedUri = uri.split('?')[0];
    const lastSegment = cleanedUri.split('/').pop() || 'recording.m4a';
    const hasExtension = /\.[a-zA-Z0-9]+$/.test(lastSegment);
    const filename = hasExtension ? lastSegment : `${lastSegment}.m4a`;
    const extension = filename.split('.').pop()?.toLowerCase();

    const mimeTypeMap: Record<string, string> = {
        wav: 'audio/wav',
        mp3: 'audio/mpeg',
        m4a: 'audio/mp4',
        mp4: 'audio/mp4',
        flac: 'audio/flac',
        ogg: 'audio/ogg',
        webm: 'audio/webm',
    };

    return {
        filename,
        mimeType: mimeTypeMap[extension || ''] || 'audio/mp4',
    };
}

export const voiceService = {
    async speechToText(
        audioUri: string,
        language: string = 'auto',
        userId?: string,
    ): Promise<STTResponse> {
        if (!audioUri) {
            throw new APIError('Invalid audio recording URI', 400);
        }

        const { filename, mimeType } = getAudioMetaFromUri(audioUri);
        const formData = new FormData();

        // React Native file upload payload for multipart/form-data.
        formData.append('audio_file', {
            uri: audioUri,
            name: filename,
            type: mimeType,
        } as unknown as Blob);
        formData.append('language', language);
        if (userId) {
            formData.append('user_id', userId);
        }

        const response = await apiUpload('/voice/stt', formData);
        return response.json();
    },
};
