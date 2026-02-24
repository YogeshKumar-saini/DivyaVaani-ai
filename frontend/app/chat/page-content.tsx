'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { textService } from '@/lib/api/text-service';
import { conversationService } from '@/lib/api/conversation-service';
import { useAuth } from '@/lib/context/auth-provider';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessages } from '@/components/chat/ChatMessage';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { LoadingState, WelcomeScreen } from '@/components/chat/LoadingStates';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { GrainOverlay } from '@/components/ui/GrainOverlay';
import { GuestLimitModal } from '@/components/chat/GuestLimitModal';
import { GuestMessageBanner } from '@/components/chat/GuestMessageBanner';
import { useGuestChatLimit } from '@/lib/hooks/useGuestChatLimit';
import { AnimatePresence, motion } from 'framer-motion';
import { SourceCard, Source } from '@/components/chat/SourceCard';
import { FollowUpQuestions } from '@/components/chat/FollowUpQuestions';
import { StreamingText } from '@/components/chat/StreamingText';
import { Volume2, Loader2, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Context {
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

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  sources?: Source[];
  contexts?: Context[];
  language?: string;
  confidence_score?: number;
  processing_time?: number;
  follow_up_questions?: string[];
  isPlayingAudio?: boolean;
  isLoadingAudio?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatPageContent() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState('en');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);
  // Guard: prevent double-sync if both onAuthSuccess + user?.id effect fire simultaneously
  const isSyncingRef = useRef(false);
  // Conversation continuation indicator
  const [isResumingConversation, setIsResumingConversation] = useState(false);
  // Suggested questions for personalized welcome
  const [suggestedQuestions, setSuggestedQuestions] = useState<{ text: string; tag: string }[]>([]);
  // Conversation title for active chat
  const [conversationTitle, setConversationTitle] = useState<string | undefined>(undefined);

  // Guest limit system
  const {
    guestCount,
    remainingMessages,
    isLimitReached,
    isNearLimit,
    showLimitModal,
    isHydrated,
    checkLimit,
    incrementCount,
    saveGuestMessages,
    loadGuestMessages,
    clearGuestData,
    dismissModal,
    openModal,
  } = useGuestChatLimit(isLoggedIn);

  // ── Scroll to bottom on new messages ───────────────────────────────────────
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  // ── Save guest messages to localStorage whenever they change ───────────────
  useEffect(() => {
    if (!isLoggedIn && messages.length > 0) {
      saveGuestMessages(
        messages.map((m) => ({
          id: m.id,
          type: m.type,
          content: m.content,
          timestamp: m.timestamp.toISOString(),
        }))
      );
    }
  }, [messages, isLoggedIn, saveGuestMessages]);

  // ── Fetch personalized suggested questions on mount ──────────────────────────
  useEffect(() => {
    if (user?.id) {
      conversationService.getSuggestedQuestions(user.id)
        .then((data) => {
          if (data.questions && data.questions.length > 0) {
            setSuggestedQuestions(data.questions);
          }
        })
        .catch(() => { /* Silently fall back to defaults */ });
    }
  }, [user?.id]);

  // ── TTS Handler ───────────────────────────────────────────────────────────
  // ── TTS Handler ───────────────────────────────────────────────────────────

  const handlePlayAudio = async () => {
    toast("Coming Soon", {
      description: "Voice features are currently being upgraded for a better experience.",
      duration: 3000,
    });
  };


  // ── Sync guest messages after login ───────────────────────────────────────
  const syncGuestMessagesAfterLogin = useCallback(async (targetUserId?: string) => {
    // Prevent concurrent double-sync (onAuthSuccess + user?.id effect both fire)
    if (isSyncingRef.current) return;

    const guestMsgs = loadGuestMessages();
    if (!guestMsgs || guestMsgs.length === 0) {
      clearGuestData();
      return;
    }

    // Use passed ID or falling back to user object ID
    const effectiveUserId = targetUserId || user?.id;

    // NOTE: JWT sub field = email (not user ID). We MUST use user?.id from auth state.
    // If user state isn't set yet (called from onAuthSuccess before React re-renders),
    // return WITHOUT setting the guard so the user?.id useEffect can retry correctly.
    if (!effectiveUserId) return;

    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      // Find first user message to use as title
      const firstUserMsg = guestMsgs.find((m) => m.type === 'user');
      const title = firstUserMsg
        ? firstUserMsg.content.slice(0, 60) + (firstUserMsg.content.length > 60 ? '...' : '')
        : 'Imported Guest Conversation';

      // Create a new conversation under the authenticated user's UUID
      const newConv = await conversationService.createConversation(effectiveUserId, {
        title,
        language: detectedLanguage,
      });

      // Persist each message in order
      for (const msg of guestMsgs) {
        try {
          await conversationService.addMessage(newConv.id, {
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content,
          });
        } catch {
          // Silently skip individual message failures
        }
      }

      // Restore the conversation in the UI
      setCurrentConversationId(newConv.id);

      // Restore messages with proper Date objects
      const restored: Message[] = guestMsgs.map((m) => ({
        id: m.id,
        type: m.type,
        content: m.content,
        timestamp: new Date(m.timestamp),
      }));
      setMessages(restored);
      setInitialLoad(false);
    } catch (err) {
      console.error('Failed to sync guest messages:', err);
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(true); // Keep syncing overlay for a split second for UX
      setTimeout(() => setIsSyncing(false), 800);
      clearGuestData(); // Always clear after attempting sync
    }
  }, [loadGuestMessages, clearGuestData, detectedLanguage, user?.id]);

  // ── Auto-sync when user logs in while on the chat page ────────────────────
  const prevUserRef = useRef<string | null>(null);
  useEffect(() => {
    const currentUserId = user?.id ?? null;
    const wasGuest = prevUserRef.current === null;
    const justLoggedIn = wasGuest && currentUserId !== null;

    if (justLoggedIn) {
      syncGuestMessagesAfterLogin(currentUserId);
    }
    prevUserRef.current = currentUserId;
  }, [user?.id, syncGuestMessagesAfterLogin]);

  // ── Load a conversation from sidebar ──────────────────────────────────────
  const handleSelectConversation = async (id: string) => {
    // Before switching, consolidate the memory of the current conversation
    if (currentConversationId && user?.id && currentConversationId !== id) {
      conversationService.triggerMemoryConsolidation(currentConversationId, user.id).catch(e => {
        console.warn('Background memory consolidation failed:', e);
      });
    }

    setCurrentConversationId(id);
    setInitialLoad(false);
    setIsLoading(true);
    setIsResumingConversation(true);
    try {
      const conv = await conversationService.getConversation(id);
      setConversationTitle(conv.title || undefined);
      const uiMessages: Message[] = conv.messages.map((msg) => ({
        id: msg.id,
        type: msg.role === 'user' ? 'user' : 'bot',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        confidence_score: msg.confidence_score,
        processing_time: msg.processing_time,
        sources: msg.sources ? msg.sources.map(s => ({ verse: s, score: 1, text: s })) : [],
      }));
      setMessages(uiMessages);
    } catch (error) {
      console.error('Failed to load conversation', error);
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
    }
  };

  const handleNewChat = () => {
    // Before creating new, consolidate the memory of the current conversation
    if (currentConversationId && user?.id) {
      conversationService.triggerMemoryConsolidation(currentConversationId, user.id).catch(e => {
        console.warn('Background memory consolidation failed:', e);
      });
    }

    setCurrentConversationId(undefined);
    setMessages([]);
    setInitialLoad(true);
    setIsResumingConversation(false);
    setConversationTitle(undefined);
  };

  const handleExampleQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => askQuestion(question), 100);
  };

  // ── Core ask question logic ────────────────────────────────────────────────
  const askQuestion = async (questionInput?: string) => {
    const questionToAsk = questionInput || input;
    if (!questionToAsk.trim()) return;

    // ── Guest limit gate ──────────────────────────────────────────────────
    if (!isLoggedIn) {
      const allowed = checkLimit();
      if (!allowed) return; // Modal is shown by checkLimit
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: questionToAsk,
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setInitialLoad(false);
    setIsLoading(true);

    // Initialize bot message placeholder
    const botMessageId = (Date.now() + 1).toString();
    const botMessagePlaceholder: Message = {
      id: botMessageId,
      type: 'bot',
      content: '', // Start empty
      timestamp: new Date(),
      sources: [],
      contexts: [],
    };

    setMessages((prev) => [...prev, botMessagePlaceholder]);
    setStreamingMessageId(botMessageId);

    try {
      // ── Persist conversation for logged-in users ──────────────────────
      let conversationId = currentConversationId;

      if (!conversationId && user) {
        try {
          const newConv = await conversationService.createConversation(user.id, {
            title: questionToAsk.slice(0, 50) + (questionToAsk.length > 50 ? '...' : ''),
            language: detectedLanguage,
          });
          conversationId = newConv.id;
          setCurrentConversationId(conversationId);
        } catch (e) {
          console.error('Failed to create conversation', e);
        }
      }

      if (conversationId && user) {
        try {
          await conversationService.addMessage(conversationId, {
            role: 'user',
            content: questionToAsk,
          });
        } catch (e) {
          console.error('Failed to persist user message', e);
        }
      }

      // ── Build conversation context (STM/LTM) ────────────────────────
      let conversationHistory = '';
      if (conversationId && user) {
        try {
          const ctx = await conversationService.getConversationContext(conversationId, 5);
          // Build STM context string from recent messages
          if (ctx.stm.messages.length > 0) {
            conversationHistory = ctx.stm.messages
              .map(m => `${m.role}: ${m.content}`)
              .join('\n');
          }
          // Prepend LTM summary if available
          if (ctx.ltm.summary) {
            conversationHistory = `[Conversation Summary: ${ctx.ltm.summary}]\n${conversationHistory}`;
          }
        } catch {
          // Fallback: build from local messages
          const recentMsgs = messages.slice(-10);
          conversationHistory = recentMsgs
            .map(m => `${m.type === 'user' ? 'user' : 'assistant'}: ${m.content}`)
            .join('\n');
        }
      } else if (messages.length > 0) {
        // For guests or new conversations, use local messages
        const recentMsgs = messages.slice(-6);
        conversationHistory = recentMsgs
          .map(m => `${m.type === 'user' ? 'user' : 'assistant'}: ${m.content}`)
          .join('\n');
      }

      // ── Stream Response ─────────────────────────────────────────────
      let fullAnswer = '';
      const sources: Source[] = [];
      let confidenceScore = 0;
      let processingTime = 0;
      let followUpQuestions: string[] = [];

      for await (const event of textService.streamQuestion(questionToAsk, user?.id, selectedLanguage, conversationHistory, conversationId)) {
        switch (event.type) {
          case 'token':
            fullAnswer += event.data.token;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId ? { ...msg, content: fullAnswer } : msg
              )
            );
            break;

          case 'source':
            // Robustly handle source data
            const sourceData: Source = {
              verse: event.data.verse,
              score: event.data.score,
              text: event.data.text,
              sanskrit: event.data.sanskrit,
              translation: event.data.translation,
              chapter: event.data.chapter
            };
            sources.push(sourceData);

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId
                  ? { ...msg, sources: [...(msg.sources || []), sourceData] }
                  : msg
              )
            );
            break;

          case 'follow_up':
            followUpQuestions = event.data.questions;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId
                  ? { ...msg, follow_up_questions: followUpQuestions }
                  : msg
              )
            );
            break;

          case 'metadata':
            confidenceScore = event.data.confidence;
            processingTime = event.data.processing_time;
            if (event.data.language) setDetectedLanguage(event.data.language);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId
                  ? {
                    ...msg,
                    confidence_score: event.data.confidence,
                    processing_time: event.data.processing_time,
                  }
                  : msg
              )
            );
            break;

          case 'error':
            console.error('Streaming error:', event.data.error);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId
                  ? { ...msg, content: msg.content + '\n\n[Error: ' + event.data.error + ']' }
                  : msg
              )
            );
            break;
        }
      }

      // ── Count this as a successful guest message ──────────────────────
      if (!isLoggedIn) {
        incrementCount();
      }

      if (conversationId && user) {
        try {
          // Just save verse strings to DB for compatibility
          const sourceVerses = sources.map(s => s.verse);
          conversationService.addMessage(conversationId, {
            role: 'assistant',
            content: fullAnswer,
            confidence_score: confidenceScore,
            processing_time: processingTime,
            sources: sourceVerses,
          });
        } catch (e) {
          console.error('Failed to persist bot message', e);
        }
      }
    } catch (error) {
      console.error(error);
      // ── Network/server errors do NOT count toward the guest limit ─────
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'bot',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
    }
  };

  const handleFeedback = async (messageId: string, rating: 'excellent' | 'good' | 'needs_improvement') => {
    console.log('Feedback:', messageId, rating);
  };

  // Custom renderer for messages content to include TTS and Follow-ups
  const renderMessageContent = (msg: Message, isStreaming?: boolean) => {
    return (
      <div className="w-full text-white/90">
        {/* Use StreamingText for smooth typing animation during streaming */}
        {isStreaming ? (
          <StreamingText
            content={msg.content}
            isStreaming={isStreaming}
            className="text-white/90"
          />
        ) : (
          <div className="whitespace-pre-wrap leading-relaxed font-normal text-[15px] tracking-wide">{msg.content}</div>
        )}

        {/* Sources */}
        {msg.sources && msg.sources.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-2">Sources</div>
            <div className="grid gap-2">
              {msg.sources.map((source, idx) => (
                <SourceCard key={idx} source={source} index={idx} />
              ))}
            </div>
          </div>
        )}

        {/* TTS Button - hide during streaming */}
        {msg.type === 'bot' && !isLoading && !isStreaming && (
          <div className="mt-3 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              disabled={msg.isLoadingAudio}
              onClick={() => handlePlayAudio()}
              className="h-8 px-2 text-white/40 hover:text-white hover:bg-white/5 gap-2"
            >
              {msg.isLoadingAudio ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : msg.isPlayingAudio ? (
                <StopCircle className="w-4 h-4 text-cyan-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
              <span className="text-xs">{msg.isPlayingAudio ? 'Stop' : 'Listen'}</span>
            </Button>
          </div>
        )}

        {/* Follow-up Questions - hide during streaming */}
        {!isStreaming && msg.follow_up_questions && msg.follow_up_questions.length > 0 && (
          <FollowUpQuestions
            questions={msg.follow_up_questions}
            onQuestionClick={(q) => askQuestion(q)}
            disabled={isLoading}
          />
        )}
      </div>
    );
  };

  // Computed states for UI rendering
  const streamingMsg = messages.find(m => m.id === streamingMessageId);
  const isWaitingForToken = streamingMsg && !streamingMsg.content && (!streamingMsg.sources || streamingMsg.sources.length === 0);
  const displayMessages = messages.filter(m => !(m.id === streamingMessageId && isWaitingForToken));
  const showLoadingState = isLoading && (!streamingMessageId || isWaitingForToken);

  return (
    <div className="h-full w-full relative bg-transparent overflow-hidden pt-16">
      <GrainOverlay />

      {/* Language Selector moved to ChatInput */}

      {/* ── Guest Limit Modal ───────────────────────────────────────────────── */}
      <GuestLimitModal
        isOpen={showLimitModal}
        onClose={dismissModal}
        guestCount={guestCount}
        onAuthSuccess={syncGuestMessagesAfterLogin}
      />

      {/* ── Sync overlay ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div
            key="sync-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/90 border border-violet-500/20 rounded-2xl px-8 py-6 flex flex-col items-center gap-4 shadow-2xl"
            >
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-2xl bg-violet-500/30 blur-xl animate-pulse" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/30 to-indigo-600/20 border border-white/12 flex items-center justify-center">
                  <span className="text-xl font-serif text-white">ॐ</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-[15px] font-semibold text-white">Syncing your conversation…</div>
                <div className="text-[12px] text-white/40 mt-1">Importing your guest messages to your account</div>
              </div>
              <div className="w-48 h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  style={{ width: '50%' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ChatLayout
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={setIsSidebarOpen}
        sidebarContent={
          <ChatSidebar
            embedded
            currentConversationId={currentConversationId}
            onSelectConversation={(id) => {
              handleSelectConversation(id);
              setIsSidebarOpen(false);
            }}
            onNewChat={() => {
              handleNewChat();
              setIsSidebarOpen(false);
            }}
          />
        }
      >
        {/* ── Main Scrollable Area ─────────────────────────────────────────── */}
        <div className="flex-1 w-full overflow-y-auto scrollbar-custom relative">
          <div className="min-h-full flex flex-col pb-8 md:pb-12 px-3 md:px-6 pt-16 md:pt-4">

            {/* Welcome screen */}
            <AnimatePresence>
              {initialLoad && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col items-center justify-center my-auto"
                >
                  <WelcomeScreen
                    onExampleClick={handleExampleQuestion}
                    className="text-white max-w-2xl mx-auto px-4"
                    userName={user?.full_name}
                    avatarUrl={user?.avatar_url}
                    suggestedQuestions={suggestedQuestions}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Conversation title + continuation indicator */}
            <AnimatePresence>
              {!initialLoad && conversationTitle && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="max-w-3xl mx-auto w-full mb-4"
                >
                  <div className="flex items-center gap-3 px-1 py-4">
                    <div className="h-px flex-1 bg-white/6" />
                    <span className="text-[11px] font-medium text-white/25 uppercase tracking-wider truncate max-w-[200px]">
                      {conversationTitle}
                    </span>
                    {isResumingConversation && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-medium">
                        Continuing
                      </span>
                    )}
                    <div className="h-px flex-1 bg-white/6" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages area */}
            <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col justify-end">
              <ChatMessages
                messages={displayMessages}
                onFeedback={handleFeedback}
                streamingMessageId={streamingMessageId}
                renderContent={renderMessageContent}
              />
              {showLoadingState && (
                <LoadingState
                  isTyping
                  message="Seeking wisdom from ancient teachings..."
                  className="mt-2"
                />
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Guest banner - shown inline after messages */}
            {!isLoggedIn && isHydrated && (
              <div className="max-w-3xl mx-auto w-full mt-4 mb-2">
                <GuestMessageBanner
                  remainingMessages={remainingMessages}
                  isNearLimit={isNearLimit}
                  isLimitReached={isLimitReached}
                  onUpgradeClick={openModal}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Input Area ───────────────────────────────────────────────────── */}
        <div className="shrink-0 w-full z-30 pt-2 pb-2 md:pb-4 relative bg-linear-to-t from-slate-950 via-slate-950/90 to-transparent">
          <ChatInput
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            onSubmit={askQuestion}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            className="px-0 sm:px-2"
            placeholder={
              !isLoggedIn && isHydrated && isLimitReached
                ? 'Sign up to continue chatting...'
                : 'Ask the universe anything...'
            }
          />

          {/* Guest message counter pill - shown in input area when not at/near limit */}
          {!isLoggedIn && isHydrated && !isNearLimit && !isLimitReached && guestCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mt-2 absolute -top-8 left-1/2 -translate-x-1/2"
            >
              <button
                onClick={openModal}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur border border-white/10 hover:bg-slate-800/80 hover:border-white/20 transition-all duration-200 group shadow-lg"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400/60 group-hover:bg-violet-400 transition-colors" />
                <span className="text-[11px] text-white/50 group-hover:text-white/70 transition-colors">
                  {remainingMessages} of {10} free messages left
                </span>
              </button>
            </motion.div>
          )}
        </div>
      </ChatLayout>
    </div>
  );
}
