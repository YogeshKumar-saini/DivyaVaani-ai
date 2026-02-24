import { apiClient } from './client';

export interface MemoryFact {
    id: string;
    fact_type: 'preference' | 'interest' | 'spiritual_insight' | 'personal';
    content: string;
    importance: number;
    source_conversation_id: string;
    created_at: string;
}

export interface EpisodicMemory {
    id: string;
    conversation_id: string;
    summary: string;
    themes: string[];
    mood: string | null;
    key_insights: string[];
    message_count: number;
    created_at: string;
}

export interface UserMemoryProfile {
    top_topics: string[];
    preferred_language: string;
    spiritual_stage: string;
    total_conversations: number;
    total_facts: number;
    total_episodes: number;
    last_updated_at: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    limit: number;
    offset: number;
}

export class MemoryService {
    /**
     * Get overall memory profile for the user
     */
    async getProfile(userId: string): Promise<UserMemoryProfile> {
        return apiClient.request<UserMemoryProfile>(`/api/v1/memory/user/${userId}`);
    }

    /**
     * Get specific facts stored in long-term memory
     */
    async getFacts(userId: string, limit: number = 20, offset: number = 0): Promise<PaginatedResponse<MemoryFact>> {
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString()
        });
        return apiClient.request<PaginatedResponse<MemoryFact>>(`/api/v1/memory/user/${userId}/facts?${params.toString()}`);
    }

    /**
     * Delete a specific memory fact
     */
    async deleteFact(userId: string, factId: string): Promise<void> {
        return apiClient.request(`/api/v1/memory/user/${userId}/facts/${factId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Get recent episodic memories (past conversations)
     */
    async getEpisodes(userId: string, limit: number = 10): Promise<PaginatedResponse<EpisodicMemory>> {
        const params = new URLSearchParams({
            limit: limit.toString()
        });
        return apiClient.request<PaginatedResponse<EpisodicMemory>>(`/api/v1/memory/user/${userId}/episodes?${params.toString()}`);
    }

    /**
     * Completely erase all memory profile and history for the user
     */
    async eraseAllMemory(userId: string): Promise<void> {
        return apiClient.request(`/api/v1/memory/user/${userId}`, {
            method: 'DELETE'
        });
    }
}

export const memoryService = new MemoryService();
