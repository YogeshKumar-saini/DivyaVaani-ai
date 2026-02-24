/**
 * Conversation Service - Handles conversation history management
 */

import { apiClient } from './client';

export interface ConversationCreate {
  title?: string;
  language?: string;
}

export interface MessageCreate {
  role: 'user' | 'assistant';
  content: string;
  confidence_score?: number;
  model_used?: string;
  processing_time?: number;
  sources?: string[];
  quality_score?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  confidence_score?: number;
  model_used?: string;
  processing_time?: number;
  sources?: string[];
  quality_score?: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title?: string;
  language: string;
  created_at: string;
  updated_at: string;
  total_messages: number;
  avg_confidence: number;
  tags: string[];
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface ConversationStats {
  total_conversations: number;
  total_messages: number;
  avg_messages_per_conversation: number;
  avg_confidence_score: number;
  language_distribution: Record<string, number>;
}

export class ConversationService {
  /**
   * Create a new conversation
   */
  async createConversation(
    userId: string,
    data: ConversationCreate = {}
  ): Promise<Conversation> {
    const params = new URLSearchParams({
      user_id: userId,
    });

    return apiClient.request<Conversation>(`/conversations?${params.toString()}`, {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        language: data.language || 'en',
      }),
    });
  }

  /**
   * Get all conversations for a user
   */
  async getConversations(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Conversation[]> {
    const params = new URLSearchParams({
      user_id: userId,
      limit: limit.toString(),
      offset: offset.toString(),
    });

    return apiClient.request<Conversation[]>(`/conversations?${params.toString()}`);
  }

  /**
   * Get a specific conversation with messages
   */
  async getConversation(
    conversationId: string,
    includeMessages: boolean = true,
    messageLimit?: number
  ): Promise<ConversationWithMessages> {
    const params = new URLSearchParams({
      include_messages: includeMessages.toString(),
    });

    if (messageLimit) {
      params.append('message_limit', messageLimit.toString());
    }

    return apiClient.request<ConversationWithMessages>(
      `/conversations/${conversationId}?${params.toString()}`
    );
  }

  /**
   * Add a message to a conversation
   */
  async addMessage(
    conversationId: string,
    message: MessageCreate
  ): Promise<Message> {
    return apiClient.request<Message>(
      `/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(message),
      }
    );
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(
    conversationId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<Message[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    return apiClient.request<Message[]>(
      `/conversations/${conversationId}/messages?${params.toString()}`
    );
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await apiClient.request(`/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<ConversationStats> {
    return apiClient.request<ConversationStats>(
      `/conversations/users/${userId}/stats`
    );
  }

  /**
   * Search conversations
   */
  async searchConversations(
    userId: string,
    query: string,
    limit: number = 20
  ): Promise<Conversation[]> {
    const params = new URLSearchParams({
      user_id: userId,
      q: query,
      limit: limit.toString(),
    });

    return apiClient.request<Conversation[]>(
      `/conversations/search/?${params.toString()}`
    );
  }

  /**
   * Get personalized suggested questions based on user's chat behavior
   */
  async getSuggestedQuestions(
    userId: string
  ): Promise<{ questions: { text: string; tag: string }[]; personalized: boolean }> {
    return apiClient.request(
      `/conversations/users/${userId}/suggested-questions`
    );
  }

  /**
   * Get daily chat summaries within a date range
   */
  async getDailySummaries(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<DailySummary[]> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    return apiClient.request<DailySummary[]>(
      `/conversations/users/${userId}/daily-summaries?${params.toString()}`
    );
  }

  /**
   * Trigger daily summary generation for a specific date
   */
  async generateDailySummary(
    userId: string,
    date: string
  ): Promise<{ message: string; generated: boolean }> {
    const params = new URLSearchParams({ date });
    return apiClient.request(
      `/conversations/users/${userId}/generate-daily-summary?${params.toString()}`,
      { method: 'POST' }
    );
  }

  /**
   * Get conversation context (STM + LTM) for memory-enhanced responses
   */
  async getConversationContext(
    conversationId: string,
    messageCount: number = 5
  ): Promise<ConversationContext> {
    const params = new URLSearchParams({
      message_count: messageCount.toString(),
    });
    return apiClient.request<ConversationContext>(
      `/conversations/${conversationId}/context?${params.toString()}`
    );
  }

  /**
   * Trigger memory consolidation for a conversation
   */
  async triggerMemoryConsolidation(
    conversationId: string,
    userId: string
  ): Promise<{ status: string; facts_saved: number }> {
    const params = new URLSearchParams({ user_id: userId });
    return apiClient.request(
      `/api/v1/memory/consolidate/${conversationId}?${params.toString()}`,
      { method: 'POST' }
    );
  }
}

// Types for new features
export interface DailySummary {
  id: string;
  user_id: string;
  date: string;
  summary_text: string;
  topics: string[];
  conversation_count: number;
  message_count: number;
  mood: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationContext {
  conversation_id: string;
  title: string;
  stm: {
    messages: { role: string; content: string }[];
  };
  ltm: {
    summary: string | null;
    key_topics: string[];
  };
}

export const conversationService = new ConversationService();
