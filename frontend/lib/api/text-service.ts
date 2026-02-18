/**
 * Text Service - Handles text-based queries to the backend
 */

import { apiClient } from './client';

export interface TextQueryRequest {
  question: string;
  user_id?: string;
  preferred_language?: string;
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

export class TextService {
  /**
   * Ask a question and get an AI-powered response
   */
  async askQuestion(
    question: string,
    userId?: string,
    preferredLanguage?: string
  ): Promise<TextQueryResponse> {
    const requestBody: TextQueryRequest = {
      question,
      user_id: userId,
      preferred_language: preferredLanguage,
    };

    return apiClient.request<TextQueryResponse>('/text', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }
}

export const textService = new TextService();
