/**
 * Analytics Service - Handles analytics and system health data
 */

import { apiClient } from './client';

export interface AnalyticsData {
  total_queries: number;
  unique_users: number;
  popular_questions: Record<string, number>;
  response_times: number[];
  avg_response_time: number;
  cache_hits: number;
  cache_misses: number;
  error_count: number;
  top_questions?: [string, number][];
}

export interface CacheStats {
  total_entries: number;
  hit_rate: number;
}

export interface AnalyticsResponse {
  analytics: AnalyticsData;
  cache: CacheStats;
  system_info?: {
    version: string;
    model: string;
    environment: string;
    features: string[];
  };
}

export interface HealthResponse {
  status: string;
  timestamp: number;
  system_ready: boolean;
  is_loading: boolean;
  components?: {
    qa_system: string;
    retriever: string;
    embeddings: string;
  };
  components_health?: Record<string, {
    status: string;
    message: string;
    details: Record<string, unknown>;
  }>;
}

export interface FeedbackRequest {
  type: string;
  content: string;
  user_id?: string;
}

export class AnalyticsService {
  /**
   * Get system analytics and usage statistics
   */
  async getAnalytics(): Promise<AnalyticsResponse> {
    return apiClient.request<AnalyticsResponse>('/analytics');
  }

  /**
   * Get system health status
   */
  async getHealth(): Promise<HealthResponse> {
    return apiClient.request<HealthResponse>('/health');
  }

  /**
   * Submit user feedback
   */
  async submitFeedback(feedback: FeedbackRequest): Promise<{
    message: string;
    status: string;
    timestamp: number;
  }> {
    return apiClient.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  /**
   * Get system metrics (if enabled)
   */
  async getMetrics(): Promise<{
    metrics: Record<string, unknown>;
    timestamp: number;
  }> {
    return apiClient.request('/metrics');
  }
}

export const analyticsService = new AnalyticsService();
