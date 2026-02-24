/**
 * Chat Screen — full mobile chat experience aligned with frontend features.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { textService } from '@/services/text-service';
import {
  conversationService,
  Conversation,
  ConversationWithMessages,
} from '@/services/conversation-service';
import { ChatBubble } from '@/components/ChatBubble';
import { SourceCard } from '@/components/SourceCard';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { DEFAULT_LANGUAGE, LANGUAGES, SUGGESTED_QUESTIONS } from '@/constants/config';

interface ChatSource {
  verse: string;
  score: number;
  text: string;
  sanskrit?: string;
  translation?: string;
  chapter?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  sources?: ChatSource[];
  followUpQuestions?: string[];
  isStreaming?: boolean;
}

interface PersistedChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
}

const GUEST_MESSAGES_KEY = 'divyavaani_guest_messages_v1';

function buildLocalHistory(messages: ChatMessage[]): string {
  return messages
    .slice(-8)
    .map((m) => `${m.type === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');
}

function mapConversationToMessages(conversation: ConversationWithMessages): ChatMessage[] {
  return conversation.messages.map((message) => ({
    id: message.id,
    type: message.role === 'assistant' ? 'bot' : 'user',
    content: message.content,
    timestamp: new Date(message.created_at),
    sources:
      message.sources && message.sources.length > 0
        ? message.sources.map((source) => ({
          verse: source,
          score: 1,
          text: source,
        }))
        : undefined,
  }));
}

function ChatScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const routeParams = useLocalSearchParams<{ conversationId?: string | string[] }>();
  const routeConversationId = useMemo(() => {
    const raw = routeParams.conversationId;
    if (Array.isArray(raw)) return raw[0];
    return raw;
  }, [routeParams.conversationId]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isResumingConversation, setIsResumingConversation] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState(DEFAULT_LANGUAGE);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [isSyncingGuest, setIsSyncingGuest] = useState(false);

  const [suggestedQuestions, setSuggestedQuestions] = useState<
    { text: string; tag: string }[]
  >([]);

  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const streamAbortRef = useRef<AbortController | null>(null);
  const activeRecordingRef = useRef<Audio.Recording | null>(null);
  const activeVoiceTaskIdRef = useRef<string | null>(null);
  const activeStreamIdRef = useRef<string | null>(null);
  const prevUserIdRef = useRef<string | null>(null);
  const isLoggedIn = !!user;

  const currentLangLabel =
    LANGUAGES.find((language) => language.code === selectedLanguage)?.name || 'English';

  const visibleSuggestions =
    suggestedQuestions.length > 0 ? suggestedQuestions.slice(0, 6) : SUGGESTED_QUESTIONS.slice(0, 6);

  const resetAudioMode = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch {
      // ignore audio mode reset failures
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (!flatListRef.current || messages.length === 0) return;
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
  }, [messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const loadConversations = useCallback(async () => {
    if (!user?.id) {
      setConversations([]);
      return;
    }

    setSidebarLoading(true);
    try {
      const data = await conversationService.getConversations(user.id);
      const sorted = [...data].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
      setConversations(sorted);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setSidebarLoading(false);
    }
  }, [user?.id]);

  const loadGuestMessages = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(GUEST_MESSAGES_KEY);
      if (!raw) {
        setCurrentConversationId(undefined);
        setMessages([]);
        return;
      }

      const parsed = JSON.parse(raw) as PersistedChatMessage[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setCurrentConversationId(undefined);
        setMessages([]);
        return;
      }

      const hydrated: ChatMessage[] = parsed.map((message) => ({
        id: message.id,
        type: message.type,
        content: message.content,
        timestamp: new Date(message.timestamp),
      }));
      setMessages(hydrated);
    } catch (error) {
      console.error('Failed to load guest messages:', error);
    }
  }, []);

  const saveGuestMessages = useCallback(async (nextMessages: ChatMessage[]) => {
    try {
      const payload: PersistedChatMessage[] = nextMessages.slice(-120).map((message) => ({
        id: message.id,
        type: message.type,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
      }));
      await AsyncStorage.setItem(GUEST_MESSAGES_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error('Failed to save guest messages:', error);
    }
  }, []);

  const clearGuestMessages = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(GUEST_MESSAGES_KEY);
    } catch {
      // ignore storage cleanup errors
    }
  }, []);

  const syncGuestMessagesAfterLogin = useCallback(
    async (userId: string) => {
      try {
        const raw = await AsyncStorage.getItem(GUEST_MESSAGES_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as PersistedChatMessage[];
        if (!Array.isArray(parsed) || parsed.length === 0) return;

        const firstUserMessage = parsed.find((message) => message.type === 'user');
        const titleSource = firstUserMessage?.content || 'Imported Guest Conversation';
        const title = titleSource.slice(0, 64) + (titleSource.length > 64 ? '...' : '');

        setIsSyncingGuest(true);

        const conversation = await conversationService.createConversation(userId, {
          title,
          language: selectedLanguage,
        });

        for (const message of parsed) {
          await conversationService.addMessage(conversation.id, {
            role: message.type === 'user' ? 'user' : 'assistant',
            content: message.content,
          });
        }

        setCurrentConversationId(conversation.id);
        setMessages(
          parsed.map((message) => ({
            id: message.id,
            type: message.type,
            content: message.content,
            timestamp: new Date(message.timestamp),
          })),
        );

        await clearGuestMessages();
        await loadConversations();
      } catch (error) {
        console.error('Failed to sync guest messages:', error);
      } finally {
        setIsSyncingGuest(false);
      }
    },
    [clearGuestMessages, loadConversations, selectedLanguage],
  );

  const loadConversationById = useCallback(
    async (conversationId: string) => {
      if (!user?.id) return;

      activeStreamIdRef.current = null;
      streamAbortRef.current?.abort();
      streamAbortRef.current = null;
      setIsLoading(true);
      setIsResumingConversation(true);
      try {
        const conversation = await conversationService.getConversation(conversationId, true);
        setCurrentConversationId(conversationId);
        setSelectedLanguage(conversation.language || DEFAULT_LANGUAGE);
        setMessages(mapConversationToMessages(conversation));
      } catch (error) {
        console.error('Failed to load conversation:', error);
      } finally {
        setIsLoading(false);
        setIsResumingConversation(false);
      }
    },
    [user?.id],
  );

  const deleteConversationById = useCallback(
    async (conversationId: string) => {
      try {
        await conversationService.deleteConversation(conversationId);
        setConversations((prev) => prev.filter((conversation) => conversation.id !== conversationId));

        if (currentConversationId === conversationId) {
          setCurrentConversationId(undefined);
          setMessages([]);
          setInput('');
        }
      } catch (error) {
        console.error('Failed to delete conversation:', error);
      }
    },
    [currentConversationId],
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!isLoggedIn) {
      loadGuestMessages();
    }
  }, [isLoggedIn, loadGuestMessages]);

  useEffect(() => {
    return () => {
      activeStreamIdRef.current = null;
      streamAbortRef.current?.abort();
      streamAbortRef.current = null;

      const recording = activeRecordingRef.current;
      activeRecordingRef.current = null;
      activeVoiceTaskIdRef.current = null;
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {
          // ignore cleanup errors
        });
      }
      void resetAudioMode();
    };
  }, [resetAudioMode]);

  useEffect(() => {
    if (!isLoggedIn) {
      saveGuestMessages(messages);
    }
  }, [messages, isLoggedIn, saveGuestMessages]);

  useEffect(() => {
    if (!user?.id) {
      setSuggestedQuestions([]);
      return;
    }

    conversationService
      .getSuggestedQuestions(user.id)
      .then((result) => {
        if (result.questions && result.questions.length > 0) {
          setSuggestedQuestions(result.questions);
        }
      })
      .catch(() => {
        setSuggestedQuestions([]);
      });
  }, [user?.id]);

  useEffect(() => {
    if (!routeConversationId || !user?.id) return;
    if (currentConversationId === routeConversationId) return;

    loadConversationById(routeConversationId);
  }, [routeConversationId, user?.id, currentConversationId, loadConversationById]);

  useEffect(() => {
    const currentUserId = user?.id ?? null;
    const justLoggedIn = prevUserIdRef.current === null && currentUserId !== null;

    if (justLoggedIn && currentUserId) {
      syncGuestMessagesAfterLogin(currentUserId);
    }
    prevUserIdRef.current = currentUserId;
  }, [user?.id, syncGuestMessagesAfterLogin]);

  const ensureConversation = useCallback(
    async (question: string): Promise<string | undefined> => {
      if (!user?.id) return undefined;
      if (currentConversationId) return currentConversationId;

      try {
        const title = question.slice(0, 64) + (question.length > 64 ? '...' : '');
        const conversation = await conversationService.createConversation(user.id, {
          title,
          language: selectedLanguage,
        });

        setCurrentConversationId(conversation.id);
        setConversations((prev) => [conversation, ...prev.filter((c) => c.id !== conversation.id)]);
        return conversation.id;
      } catch (error) {
        console.error('Failed to create conversation:', error);
        return undefined;
      }
    },
    [user?.id, currentConversationId, selectedLanguage],
  );

  const getConversationHistory = useCallback(
    async (conversationId: string | undefined, messageSnapshot: ChatMessage[]): Promise<string> => {
      if (!conversationId || !user?.id) {
        return buildLocalHistory(messageSnapshot);
      }

      try {
        const context = await conversationService.getConversationContext(conversationId, 6);
        const ltmSummary = context.ltm.summary ? `[Conversation Summary: ${context.ltm.summary}]` : '';
        const stmHistory = context.stm.messages
          .map((message) => `${message.role === 'assistant' ? 'Assistant' : 'User'}: ${message.content}`)
          .join('\n');

        const combined = [ltmSummary, stmHistory].filter(Boolean).join('\n');
        return combined || buildLocalHistory(messageSnapshot);
      } catch {
        return buildLocalHistory(messageSnapshot);
      }
    },
    [user?.id],
  );

  const startVoiceInput = useCallback(async () => {
    if (isLoading || isTranscribing || isRecording) return;

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Microphone permission required',
          'Please allow microphone access to use voice input.',
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      activeRecordingRef.current = recording;
      setShowLanguagePicker(false);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start voice recording:', error);
      await resetAudioMode();
      Alert.alert('Voice input failed', 'Could not start recording. Please try again.');
    }
  }, [isLoading, isRecording, isTranscribing, resetAudioMode]);

  const stopVoiceInput = useCallback(async () => {
    const recording = activeRecordingRef.current;
    if (!recording || !isRecording) return;

    const voiceTaskId = `voice-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    activeVoiceTaskIdRef.current = voiceTaskId;
    activeRecordingRef.current = null;
    setIsRecording(false);
    setIsTranscribing(true);

    try {
      await recording.stopAndUnloadAsync();
      const audioUri = recording.getURI();

      await resetAudioMode();

      if (!audioUri) {
        throw new Error('Recorded file is unavailable.');
      }

      const transcriptResult = await voiceService.speechToText(
        audioUri,
        selectedLanguage || 'auto',
        user?.id,
      );
      if (activeVoiceTaskIdRef.current !== voiceTaskId) {
        return;
      }
      const transcribedText = transcriptResult.text?.trim();

      if (!transcribedText) {
        Alert.alert('No speech detected', 'Please speak a bit louder and try again.');
        return;
      }

      setInput((prev) => {
        const nextValue = prev ? `${prev} ${transcribedText}` : transcribedText;
        if (nextValue.length > 2000) {
          return nextValue.slice(0, 2000);
        }
        return nextValue;
      });
    } catch (error) {
      if (activeVoiceTaskIdRef.current !== voiceTaskId) {
        return;
      }
      console.error('Failed to transcribe voice input:', error);
      Alert.alert('Voice input failed', handleAPIError(error));
    } finally {
      if (activeVoiceTaskIdRef.current === voiceTaskId) {
        activeVoiceTaskIdRef.current = null;
      }
      setIsTranscribing(false);
      await resetAudioMode();
    }
  }, [isRecording, resetAudioMode, selectedLanguage, user?.id]);

  const toggleVoiceInput = useCallback(() => {
    if (isRecording) {
      void stopVoiceInput();
      return;
    }
    void startVoiceInput();
  }, [isRecording, startVoiceInput, stopVoiceInput]);

  const askQuestion = async (questionText?: string) => {
    const question = (questionText ?? input).trim();
    if (!question || isLoading || isRecording || isTranscribing) return;

    setShowLanguagePicker(false);
    setInput('');
    Keyboard.dismiss();

    const timestamp = Date.now();
    const userMessage: ChatMessage = {
      id: `user-${timestamp}`,
      type: 'user',
      content: question,
      timestamp: new Date(),
    };

    const botMessageId = `bot-${timestamp + 1}`;
    const botMessage: ChatMessage = {
      id: botMessageId,
      type: 'bot',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    const nextSnapshot = [...messages, userMessage];
    const streamId = `stream-${timestamp}-${Math.random().toString(36).slice(2, 8)}`;
    activeStreamIdRef.current = streamId;

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setIsLoading(true);

    const abortController = new AbortController();
    streamAbortRef.current = abortController;
    const isActiveStream = () => activeStreamIdRef.current === streamId;
    const updateBotMessage = (updater: (message: ChatMessage) => ChatMessage) => {
      setMessages((prev) => {
        if (!isActiveStream()) return prev;
        return prev.map((message) =>
          message.id === botMessageId ? updater(message) : message,
        );
      });
    };

    let activeConversationId = currentConversationId;
    let fullAnswer = '';
    const sources: ChatSource[] = [];
    let followUpQuestions: string[] = [];
    let confidenceScore: number | undefined;
    let processingTime: number | undefined;
    let streamCompleted = false;

    try {
      if (user?.id) {
        activeConversationId = (await ensureConversation(question)) ?? activeConversationId;
        if (!isActiveStream()) return;

        if (activeConversationId) {
          conversationService
            .addMessage(activeConversationId, {
              role: 'user',
              content: question,
            })
            .catch((error) => {
              console.error('Failed to persist user message:', error);
            });
        }
      }

      const history = await getConversationHistory(activeConversationId, nextSnapshot);
      if (!isActiveStream()) return;

      for await (const event of textService.streamQuestion(
        question,
        user?.id,
        selectedLanguage,
        history,
        activeConversationId,
        abortController.signal,
      )) {
        if (!isActiveStream()) break;

        switch (event.type) {
          case 'token': {
            fullAnswer += event.data.token;
            updateBotMessage((message) => ({ ...message, content: fullAnswer }));
            break;
          }

          case 'source': {
            sources.push({
              verse: event.data.verse,
              score: event.data.score,
              text: event.data.text,
              sanskrit: event.data.sanskrit,
              translation: event.data.translation,
              chapter: event.data.chapter,
            });
            break;
          }

          case 'follow_up': {
            followUpQuestions = event.data.questions;
            break;
          }

          case 'metadata': {
            confidenceScore = event.data.confidence;
            processingTime = event.data.processing_time;
            break;
          }

          case 'done': {
            streamCompleted = true;
            updateBotMessage((message) => ({
              ...message,
              content: fullAnswer,
              isStreaming: false,
              sources: sources.length > 0 ? sources : undefined,
              followUpQuestions:
                followUpQuestions.length > 0 ? followUpQuestions : undefined,
            }));

            if (user?.id && activeConversationId && fullAnswer.trim()) {
              try {
                await conversationService.addMessage(activeConversationId, {
                  role: 'assistant',
                  content: fullAnswer,
                  confidence_score: confidenceScore,
                  processing_time: processingTime,
                  sources: sources.map((source) => source.verse),
                });
              } catch (error) {
                console.error('Failed to persist assistant message:', error);
              }
            }
            break;
          }

          case 'error': {
            updateBotMessage((message) => ({
              ...message,
              content: `⚠️ ${event.data.error}`,
              isStreaming: false,
            }));
            break;
          }
        }
      }

      if (!isActiveStream()) return;

      // Defensive finalize: if stream ended without explicit "done", close placeholder.
      if (!streamCompleted) {
        updateBotMessage((message) => ({
          ...message,
          content: fullAnswer || message.content,
          isStreaming: false,
          sources: sources.length > 0 ? sources : message.sources,
          followUpQuestions:
            followUpQuestions.length > 0 ? followUpQuestions : message.followUpQuestions,
        }));

        if (user?.id && activeConversationId && fullAnswer.trim()) {
          try {
            await conversationService.addMessage(activeConversationId, {
              role: 'assistant',
              content: fullAnswer,
              confidence_score: confidenceScore,
              processing_time: processingTime,
              sources: sources.map((source) => source.verse),
            });
          } catch (error) {
            console.error('Failed to persist assistant message:', error);
          }
        }
      }
    } catch (error) {
      const aborted =
        error instanceof Error &&
        (error.name === 'AbortError' || error.message.toLowerCase().includes('aborted'));

      if (!aborted) {
        console.error('Failed to stream question:', error);
      }

      updateBotMessage((message) => {
        if (aborted) {
          return {
            ...message,
            content: fullAnswer || '⏹️ Response stopped.',
            isStreaming: false,
            sources: sources.length > 0 ? sources : message.sources,
            followUpQuestions:
              followUpQuestions.length > 0 ? followUpQuestions : message.followUpQuestions,
          };
        }
        return {
          ...message,
          content: '⚠️ Something went wrong. Please try again.',
          isStreaming: false,
        };
      });
    } finally {
      if (streamAbortRef.current === abortController) {
        streamAbortRef.current = null;
      }
      if (activeStreamIdRef.current === streamId) {
        activeStreamIdRef.current = null;
      }
      setIsLoading(false);
      if (user?.id) {
        loadConversations();
      }
    }
  };

  const stopStreaming = () => {
    if (!isLoading) return;
    streamAbortRef.current?.abort();
  };

  const startNewChat = () => {
    activeStreamIdRef.current = null;
    streamAbortRef.current?.abort();
    streamAbortRef.current = null;

    const recording = activeRecordingRef.current;
    activeRecordingRef.current = null;
    activeVoiceTaskIdRef.current = null;
    if (recording) {
      recording.stopAndUnloadAsync().catch(() => {
        // ignore cleanup errors
      });
      setIsRecording(false);
      void resetAudioMode();
    }

    setCurrentConversationId(undefined);
    setMessages([]);
    setInput('');
    setShowLanguagePicker(false);
    setIsTranscribing(false);
    setIsResumingConversation(false);
    if (!isLoggedIn) {
      clearGuestMessages();
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View>
      <ChatBubble
        role={item.type}
        content={item.content}
        timestamp={item.timestamp}
        isStreaming={item.isStreaming}
      />

      {item.sources && item.sources.length > 0 && (
        <View style={styles.sourcesContainer}>
          <Text style={styles.sourcesLabel}>Sources</Text>
          {item.sources.map((source, index) => (
            <SourceCard
              key={`${item.id}-src-${index}`}
              verse={source.verse}
              score={source.score}
              text={source.text}
              sanskrit={source.sanskrit}
              translation={source.translation}
              chapter={source.chapter}
            />
          ))}
        </View>
      )}

      {item.followUpQuestions && item.followUpQuestions.length > 0 && (
        <View style={styles.followUpContainer}>
          {item.followUpQuestions.map((question, index) => (
            <TouchableOpacity
              key={`${item.id}-follow-up-${index}`}
              style={styles.followUpChip}
              onPress={() => askQuestion(question)}
              activeOpacity={0.85}
            >
              <Text style={styles.followUpText} numberOfLines={1}>
                {question}
              </Text>
              <Ionicons name="arrow-forward" size={12} color="#C4B5FD" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.heroIconWrap}>
        <LinearGradient
          colors={['#8B5CF6', '#4F46E5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroIcon}
        >
          <Text style={styles.omText}>ॐ</Text>
        </LinearGradient>
      </View>

      <Text style={styles.emptyTitle}>Namaste, Seeker</Text>
      <Text style={styles.emptySubtitle}>
        Ask spiritual questions and receive guidance grounded in sacred wisdom.
      </Text>

      <View style={styles.suggestionsGrid}>
        {visibleSuggestions.map((question, index) => (
          <TouchableOpacity
            key={`${question.text}-${index}`}
            style={styles.suggestionCard}
            onPress={() => askQuestion(question.text)}
            activeOpacity={0.85}
          >
            <View style={styles.suggestionTag}>
              <Text style={styles.suggestionTagText}>{question.tag}</Text>
            </View>
            <Text style={styles.suggestionText} numberOfLines={2}>
              {question.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ChatSidebar
        visible={sidebarOpen}
        isLoggedIn={isLoggedIn}
        loading={sidebarLoading}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onClose={() => setSidebarOpen(false)}
        onNewChat={startNewChat}
        onSelectConversation={loadConversationById}
        onDeleteConversation={deleteConversationById}
        onRefresh={loadConversations}
      />

      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(139,92,246,0.16)', 'rgba(15,23,42,0)']}
          style={styles.topGlow}
          pointerEvents="none"
        />

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => setSidebarOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="menu-outline" size={18} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>DivyaVaani</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {isSyncingGuest
                ? 'Syncing guest conversation...'
                : isResumingConversation
                ? 'Loading conversation...'
                : currentConversationId
                  ? 'Conversation mode'
                  : 'Universal Spiritual Guidance'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.newChatButton}
            onPress={startNewChat}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom + 8 : 0}
        >
          {messages.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToBottom}
            />
          )}

          {showLanguagePicker && (
            <View style={styles.langPicker}>
              {LANGUAGES.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.langOption,
                    selectedLanguage === language.code && styles.langOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedLanguage(language.code);
                    setShowLanguagePicker(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.langOptionText,
                      selectedLanguage === language.code && styles.langOptionTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {language.native} ({language.name})
                  </Text>
                  {selectedLanguage === language.code && (
                    <Ionicons name="checkmark" size={15} color="#DDD6FE" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View
            style={[
              styles.inputDock,
              {
                paddingBottom:
                  Platform.OS === 'ios'
                    ? Math.max(insets.bottom, Spacing.md)
                    : Spacing.md,
              },
            ]}
          >
            <View style={styles.inputCard}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder={isRecording ? 'Listening...' : 'Ask the universe anything...'}
                  placeholderTextColor="rgba(241,245,249,0.35)"
                  value={input}
                  onChangeText={setInput}
                  multiline
                  maxLength={2000}
                  editable={!isLoading && !isTranscribing && !isRecording}
                  onSubmitEditing={() => askQuestion()}
                  blurOnSubmit={false}
                />

                <TouchableOpacity
                  onPress={isLoading ? stopStreaming : () => askQuestion()}
                  disabled={isRecording || isTranscribing || (!isLoading && !input.trim())}
                  style={styles.sendButton}
                  activeOpacity={0.9}
                >
                  {isLoading ? (
                    <LinearGradient
                      colors={['rgba(239,68,68,0.9)', 'rgba(185,28,28,0.9)']}
                      style={styles.sendGradient}
                    >
                      <Ionicons name="stop" size={14} color="#fff" />
                    </LinearGradient>
                  ) : (
                    <LinearGradient
                      colors={
                        input.trim()
                          ? ['#8B5CF6', '#4F46E5']
                          : ['rgba(148,163,184,0.2)', 'rgba(148,163,184,0.2)']
                      }
                      style={styles.sendGradient}
                    >
                      <Ionicons
                        name="send"
                        size={15}
                        color={input.trim() ? '#fff' : 'rgba(241,245,249,0.45)'}
                      />
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.bottomRow}>
                <View style={styles.bottomActions}>
                  <TouchableOpacity
                    style={styles.languageButton}
                    onPress={() => setShowLanguagePicker((value) => !value)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="globe-outline" size={13} color="#C4B5FD" />
                    <Text style={styles.languageButtonText}>{currentLangLabel}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.voiceButton,
                      isRecording && styles.voiceButtonActive,
                      (isLoading || isTranscribing) && styles.voiceButtonDisabled,
                    ]}
                    onPress={toggleVoiceInput}
                    activeOpacity={0.8}
                    disabled={isLoading || isTranscribing}
                  >
                    <Ionicons
                      name={isRecording ? 'radio-button-on' : 'mic-outline'}
                      size={13}
                      color={isRecording ? '#FCA5A5' : '#C4B5FD'}
                    />
                    <Text
                      style={[
                        styles.voiceButtonText,
                        isRecording && styles.voiceButtonTextActive,
                      ]}
                    >
                      {isRecording ? 'Listening...' : isTranscribing ? 'Transcribing...' : 'Voice'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.counterText}>
                  {isTranscribing ? 'Converting...' : 2000 - input.length}
                </Text>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

export default ChatScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#030014', // Deep premium dark
  },
  container: {
    flex: 1,
    backgroundColor: '#030014',
  },
  topGlow: {
    position: 'absolute',
    top: -60,
    left: -80,
    right: -80,
    height: 250,
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
  },
  flex: { flex: 1 },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
    backgroundColor: 'rgba(3,0,20,0.65)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  headerTitle: {
    ...Typography.h3,
    color: '#F8FAFC',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: 'rgba(148,163,184,0.7)',
    marginTop: 2,
    maxWidth: '95%',
  },
  newChatButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    ...Shadows.glow,
  },

  guestBanner: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  guestBannerText: {
    ...Typography.caption,
    color: '#E2E8F0',
    flex: 1,
  },

  messagesList: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  sourcesContainer: {
    paddingLeft: 52,
    paddingRight: Spacing.md,
    marginBottom: Spacing.md,
  },
  sourcesLabel: {
    ...Typography.caption,
    color: '#C4B5FD',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  followUpContainer: {
    paddingLeft: 52,
    paddingRight: Spacing.md,
    flexDirection: 'column',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  followUpChip: {
    alignSelf: 'stretch',
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
    backgroundColor: 'rgba(139,92,246,0.1)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  followUpText: {
    ...Typography.caption,
    color: '#E2E8F0',
    fontWeight: '500',
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    marginRight: 6,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  heroIconWrap: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  heroIcon: {
    width: 88,
    height: 88,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  omText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 42,
    lineHeight: 48,
  },
  emptyTitle: {
    ...Typography.h1,
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    ...Typography.body,
    color: 'rgba(241,245,249,0.7)',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
    lineHeight: 24,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  suggestionCard: {
    width: '47.5%',
    minHeight: 110,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: Spacing.md,
  },
  suggestionTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    backgroundColor: 'rgba(139,92,246,0.15)',
    marginBottom: 8,
  },
  suggestionTagText: {
    ...Typography.caption,
    color: '#C4B5FD',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 10,
  },
  suggestionText: {
    ...Typography.bodySmall,
    color: '#E2E8F0',
    lineHeight: 20,
    fontWeight: '500',
  },

  langPicker: {
    position: 'absolute',
    right: Spacing.md,
    bottom: 90,
    width: 240,
    maxHeight: 280,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(9,9,11,0.95)',
    ...Shadows.glow,
  },
  langOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  langOptionSelected: {
    backgroundColor: 'rgba(139,92,246,0.15)',
  },
  langOptionText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  langOptionTextSelected: {
    color: '#E2E8F0',
    fontWeight: '700',
  },

  inputDock: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    backgroundColor: 'transparent',
  },
  inputCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(9, 9, 11, 0.96)',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    color: '#F8FAFC',
    ...Typography.body,
    maxHeight: 140,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    paddingRight: Spacing.md,
  },
  sendButton: {
    marginBottom: 4,
  },
  sendGradient: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageButton: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voiceButton: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voiceButtonActive: {
    borderColor: 'rgba(248,113,113,0.55)',
    backgroundColor: 'rgba(248,113,113,0.14)',
  },
  voiceButtonDisabled: {
    opacity: 0.6,
  },
  languageButtonText: {
    ...Typography.caption,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  voiceButtonText: {
    ...Typography.caption,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  voiceButtonTextActive: {
    color: '#FECACA',
  },
  counterText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
});
