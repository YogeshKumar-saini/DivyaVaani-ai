/**
 * Conversation History Hook - Manages conversation persistence
 */

import { useState, useCallback } from 'react';
import { conversationService, Conversation, Message, MessageCreate } from '@/lib/api/conversation-service';

export { type Conversation, type Message };

export function useConversationHistory(userId: string = 'default') {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's conversations
  const fetchConversations = useCallback(async (limit: number = 50) => {
    setLoading(true);
    setError(null);
    try {
      const data = await conversationService.getConversations(userId, limit);
      setConversations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Create new conversation
  const createConversation = useCallback(async (title?: string, language: string = 'en') => {
    setLoading(true);
    setError(null);
    try {
      const conversation = await conversationService.createConversation(userId, { title, language });
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
  }, [userId]);

  // Load conversation with messages
  const loadConversation = useCallback(async (conversationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await conversationService.getConversation(conversationId, true);
      setCurrentConversation(data);
      setMessages(data.messages || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

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
      const messageData: MessageCreate = {
        role,
        content,
        confidence_score: metadata?.confidence_score,
        model_used: metadata?.model_used,
        sources: metadata?.sources,
        quality_score: metadata?.quality_score,
      };
      const message = await conversationService.addMessage(conversationId, messageData);
      setMessages(prev => [...prev, message]);
      return message;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, []);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      await conversationService.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [currentConversation]);

  // Search conversations
  const searchConversations = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await conversationService.searchConversations(userId, query);
      setConversations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

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
