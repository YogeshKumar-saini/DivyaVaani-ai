/**
 * Conversation History Hook - Manages conversation persistence
 */

import { useState, useCallback } from 'react';

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
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
  created_at: string;
  confidence_score?: number;
  model_used?: string;
  sources?: string[];
}

export function useConversationHistory(userId: string = 'default') {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch user's conversations
  const fetchConversations = useCallback(async (limit: number = 50) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${apiBase}/conversations/?user_id=${userId}&limit=${limit}`
      );
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setConversations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, apiBase]);

  // Create new conversation
  const createConversation = useCallback(async (title?: string, language: string = 'en') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${apiBase}/conversations/?user_id=${userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, language })
        }
      );
      if (!response.ok) throw new Error('Failed to create conversation');
      const conversation = await response.json();
      setCurrentConversation(conversation);
      setConversations(prev => [conversation, ...prev]);
      setMessages([]);
      return conversation;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, apiBase]);

  // Load conversation with messages
  const loadConversation = useCallback(async (conversationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${apiBase}/conversations/${conversationId}?include_messages=true`
      );
      if (!response.ok) throw new Error('Failed to load conversation');
      const data = await response.json();
      setCurrentConversation(data);
      setMessages(data.messages || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  // Add message to conversation
  const addMessage = useCallback(async (
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    metadata?: {
      confidence_score?: number;
      model_used?: string;
      sources?: string[];
      quality_score?: number;
    }
  ) => {
    try {
      const response = await fetch(
        `${apiBase}/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, content, ...metadata })
        }
      );
      if (!response.ok) throw new Error('Failed to add message');
      const message = await response.json();
      setMessages(prev => [...prev, message]);
      return message;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [apiBase]);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(
        `${apiBase}/conversations/${conversationId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to delete conversation');
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [apiBase, currentConversation]);

  // Search conversations
  const searchConversations = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${apiBase}/conversations/search/?user_id=${userId}&query=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error('Failed to search conversations');
      const data = await response.json();
      setConversations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, apiBase]);

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    fetchConversations,
    createConversation,
    loadConversation,
    addMessage,
    deleteConversation,
    searchConversations
  };
}
