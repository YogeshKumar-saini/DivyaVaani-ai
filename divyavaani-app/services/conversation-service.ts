/**
 * Conversation Service — manages conversation history and messages
 */

import { apiRequest } from './api-client';

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

export interface ConversationWithMessages extends Conversation {
    messages: Message[];
}

export interface ConversationContext {
    conversation_id: string;
    title?: string;
    stm: {
        messages: {
            role: 'user' | 'assistant';
            content: string;
        }[];
    };
    ltm: {
        summary?: string | null;
        key_topics: string[];
    };
}

export const conversationService = {
    async createConversation(
        userId: string,
        data: { title?: string; language?: string } = {},
    ): Promise<Conversation> {
        const params = new URLSearchParams({ user_id: userId });
        return apiRequest<Conversation>(`/conversations?${params.toString()}`, {
            method: 'POST',
            body: JSON.stringify({
                title: data.title,
                language: data.language || 'en',
            }),
        });
    },

    async getConversations(
        userId: string,
        limit = 50,
        offset = 0,
    ): Promise<Conversation[]> {
        const params = new URLSearchParams({
            user_id: userId,
            limit: limit.toString(),
            offset: offset.toString(),
        });
        return apiRequest<Conversation[]>(`/conversations?${params.toString()}`);
    },

    async getConversation(
        conversationId: string,
        includeMessages = true,
    ): Promise<ConversationWithMessages> {
        const params = new URLSearchParams({
            include_messages: includeMessages.toString(),
        });
        return apiRequest<ConversationWithMessages>(
            `/conversations/${conversationId}?${params.toString()}`,
        );
    },

    async addMessage(
        conversationId: string,
        message: { role: 'user' | 'assistant'; content: string; confidence_score?: number; processing_time?: number; sources?: string[] },
    ): Promise<Message> {
        return apiRequest<Message>(`/conversations/${conversationId}/messages`, {
            method: 'POST',
            body: JSON.stringify(message),
        });
    },

    async deleteConversation(conversationId: string): Promise<void> {
        await apiRequest(`/conversations/${conversationId}`, { method: 'DELETE' });
    },

    async searchConversations(
        userId: string,
        query: string,
        limit = 20,
    ): Promise<Conversation[]> {
        const params = new URLSearchParams({
            user_id: userId,
            q: query,
            limit: limit.toString(),
        });
        return apiRequest<Conversation[]>(
            `/conversations/search?${params.toString()}`,
        );
    },

    async getSuggestedQuestions(
        userId: string,
    ): Promise<{ questions: { text: string; tag: string }[]; personalized: boolean }> {
        return apiRequest(`/conversations/users/${userId}/suggested-questions`);
    },

    async getConversationContext(
        conversationId: string,
        messageCount = 5,
    ): Promise<ConversationContext> {
        const params = new URLSearchParams({
            message_count: messageCount.toString(),
        });
        return apiRequest<ConversationContext>(
            `/conversations/${conversationId}/context?${params.toString()}`,
        );
    },
};
