/**
 * Text Service — handles chat queries and SSE streaming
 */

import { apiRequest, getToken } from './api-client';
import { API_BASE_URL } from '../constants/config';

export interface TextQueryRequest {
    question: string;
    user_id?: string;
    preferred_language?: string;
    conversation_history?: string;
    conversation_id?: string;
}

export interface Context {
    idx: number;
    score: number;
    verse: string;
    text: string;
    sanskrit: string;
    translation: string;
    hindi_translation?: string;
    relevance?: string;
    teaching_focus?: string;
    chapter?: string;
}

export interface TextQueryResponse {
    answer: string;
    confidence: number;
    sources: string[];
    contexts?: Context[];
    language: string;
    processing_time: number;
    cached: boolean;
}

export type StreamEvent =
    | { type: 'start'; data: { status: string; question: string } }
    | { type: 'thinking'; data: { status: string } }
    | { type: 'token'; data: { token: string } }
    | { type: 'source'; data: { verse: string; score: number; text: string; sanskrit?: string; translation?: string; chapter?: string } }
    | { type: 'follow_up'; data: { questions: string[] } }
    | { type: 'metadata'; data: { confidence: number; processing_time: number; model_used: string; quality_score: number; language?: string } }
    | { type: 'done'; data: { status: string } }
    | { type: 'error'; data: { error: string; status_code: number } };

export const textService = {
    /**
     * Ask a question and get an AI-powered response (non-streaming)
     */
    async askQuestion(
        question: string,
        userId?: string,
        preferredLanguage?: string,
        conversationHistory?: string,
    ): Promise<TextQueryResponse> {
        return apiRequest<TextQueryResponse>('/text', {
            method: 'POST',
            body: JSON.stringify({
                question,
                user_id: userId,
                preferred_language: preferredLanguage,
                conversation_history: conversationHistory,
            }),
        });
    },

    /**
     * Stream a question — yields SSE events as they arrive.
     * Works on React Native via fetch ReadableStream polyfill.
     */
    async *streamQuestion(
        question: string,
        userId?: string,
        preferredLanguage?: string,
        conversationHistory?: string,
        conversationId?: string,
        signal?: AbortSignal,
    ): AsyncGenerator<StreamEvent, void, unknown> {
        const token = await getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/text/stream`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                question,
                user_id: userId,
                preferred_language: preferredLanguage,
                conversation_history: conversationHistory,
                conversation_id: conversationId,
            }),
            signal,
        });

        if (!response.ok) {
            throw new Error(`Streaming failed: ${response.status}`);
        }

        if (!response.body) {
            throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let currentEvent: string | null = null;

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('event: ')) {
                        currentEvent = line.slice(7).trim();
                    } else if (line.startsWith('data: ')) {
                        const currentData = line.slice(6).trim();
                        if (currentEvent && currentData) {
                            try {
                                const parsedData = JSON.parse(currentData);
                                yield { type: currentEvent, data: parsedData } as StreamEvent;
                            } catch {
                                // skip malformed data
                            }
                            currentEvent = null;
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    },
};
