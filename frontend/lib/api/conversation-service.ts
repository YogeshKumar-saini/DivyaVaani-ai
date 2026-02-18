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
}

export const conversationService = new ConversationService();
