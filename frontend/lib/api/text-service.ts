/**
 * Text Service - Handles text-based queries to the backend
 */

import { apiClient } from './client';

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
  confidence_score?: number;
  model_used?: string;
  token_count?: number;
  quality_metrics?: Record<string, unknown>;
  cross_references?: string[];
  question_hash?: string;
}

export type StreamEvent =
  | { type: 'start'; data: { status: string; question: string } }
  | { type: 'thinking'; data: { status: string } }
  | { type: 'token'; data: { token: string } }
  | { type: 'source'; data: { verse: string; score: number; text: string; sanskrit?: string; translation?: string; chapter?: string } }
  | { type: 'follow_up'; data: { questions: string[] } }
  | { type: 'metadata'; data: { confidence: number; processing_time: number; model_used: string; quality_score: number; sources_count?: number; language?: string } }
  | { type: 'done'; data: { status: string } }
  | { type: 'error'; data: { error: string; status_code: number } };

export class TextService {
  /**
   * Ask a question and get an AI-powered response
   */
  async askQuestion(
    question: string,
    userId?: string,
    preferredLanguage?: string,
    conversationHistory?: string
  ): Promise<TextQueryResponse> {
    const requestBody: TextQueryRequest = {
      question,
      user_id: userId,
      preferred_language: preferredLanguage,
      conversation_history: conversationHistory,
      conversation_id: undefined // Add if needed later for askQuestion
    };

    return apiClient.request<TextQueryResponse>('/text', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * Stream a question and get real-time response events
   */
  async *streamQuestion(
    question: string,
    userId?: string,
    preferredLanguage?: string,
    conversationHistory?: string,
    conversationId?: string
  ): AsyncGenerator<StreamEvent, void, unknown> {
    const requestBody: TextQueryRequest = {
      question,
      user_id: userId,
      preferred_language: preferredLanguage,
      conversation_history: conversationHistory,
      conversation_id: conversationId,
    };

    const response = await fetch(`${apiClient['baseURL']}/text/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Streaming failed: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentEvent: string | null = null;
    let currentData: string | null = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            currentData = line.slice(6).trim();

            if (currentEvent && currentData) {
              try {
                const parsedData = JSON.parse(currentData);
                yield { type: currentEvent, data: parsedData } as StreamEvent;
              } catch {
                console.warn('Failed to parse SSE data:', currentData);
              }
              currentEvent = null;
              currentData = null;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export const textService = new TextService();
