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
  sources?: string[];
  contexts?: Context[];
  language?: string;
  confidence_score?: number;
  processing_time?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatPageContent() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);
  // Guard: prevent double-sync if both onAuthSuccess + user?.id effect fire simultaneously
  const isSyncingRef = useRef(false);

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

  // ── Sync guest messages after login ───────────────────────────────────────
  const syncGuestMessagesAfterLogin = useCallback(async () => {
    // Prevent concurrent double-sync (onAuthSuccess + user?.id effect both fire)
    if (isSyncingRef.current) return;

    const guestMsgs = loadGuestMessages();
    if (!guestMsgs || guestMsgs.length === 0) {
      clearGuestData();
      return;
    }

    // NOTE: JWT sub field = email (not user ID). We MUST use user?.id from auth state.
    // If user state isn't set yet (called from onAuthSuccess before React re-renders),
    // return WITHOUT setting the guard so the user?.id useEffect can retry correctly.
    if (!user?.id) return;

    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      // Find first user message to use as title
      const firstUserMsg = guestMsgs.find((m) => m.type === 'user');
      const title = firstUserMsg
        ? firstUserMsg.content.slice(0, 60) + (firstUserMsg.content.length > 60 ? '...' : '')
        : 'Imported Guest Conversation';

      // Create a new conversation under the authenticated user's UUID
      const newConv = await conversationService.createConversation(user.id, {
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
      setIsSyncing(false);
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
      syncGuestMessagesAfterLogin();
    }
    prevUserRef.current = currentUserId;
  }, [user?.id, syncGuestMessagesAfterLogin]);

  // ── Load a conversation from sidebar ──────────────────────────────────────
  const handleSelectConversation = async (id: string) => {
    setCurrentConversationId(id);
    setInitialLoad(false);
    setIsLoading(true);
    try {
      const conv = await conversationService.getConversation(id);
      const uiMessages: Message[] = conv.messages.map((msg) => ({
        id: msg.id,
        type: msg.role === 'user' ? 'user' : 'bot',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        confidence_score: msg.confidence_score,
        processing_time: msg.processing_time,
        sources: msg.sources,
      }));
      setMessages(uiMessages);
    } catch (error) {
      console.error('Failed to load conversation', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(undefined);
    setMessages([]);
    setInitialLoad(true);
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

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setInitialLoad(false);
    setIsLoading(true);

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

      // ── Actual AI request ─────────────────────────────────────────────
      const response = await textService.askQuestion(questionToAsk);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.answer || "I'm processing your request...",
        timestamp: new Date(),
        sources: response.sources,
        contexts: response.contexts,
        language: response.language,
        confidence_score: response.confidence || response.confidence_score,
        processing_time: response.processing_time,
      };

      setMessages((prev) => [...prev, botMessage]);
      if (response.language) setDetectedLanguage(response.language);

      // ── Count this as a successful guest message ──────────────────────
      if (!isLoggedIn) {
        incrementCount();
      }

      if (conversationId && user) {
        try {
          conversationService.addMessage(conversationId, {
            role: 'assistant',
            content: response.answer,
            confidence_score: response.confidence,
            processing_time: response.processing_time,
            sources: response.sources,
          });
        } catch (e) {
          console.error('Failed to persist bot message', e);
        }
      }
    } catch (error) {
      console.error(error);
      // ── Network/server errors do NOT count toward the guest limit ─────
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageId: string, rating: 'excellent' | 'good' | 'needs_improvement') => {
    console.log('Feedback:', messageId, rating);
  };

  // ── Determine if input should be disabled ─────────────────────────────────
  const isInputDisabled = isLoading || (!isLoggedIn && isHydrated && isLimitReached);

  // ── Handle input submit with limit check ──────────────────────────────────
  const handleSubmit = () => {
    if (!isLoggedIn && isLimitReached) {
      openModal();
      return;
    }
    askQuestion();
  };

  return (
    <div className="h-full w-full relative bg-transparent overflow-hidden pt-16">
      <GrainOverlay />

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
          <div className="min-h-full flex flex-col pb-4 px-3 md:px-6 pt-14 md:pt-3">

            {/* Welcome screen */}
            <AnimatePresence>
              {initialLoad && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col items-center justify-center"
                >
                  <WelcomeScreen
                    onExampleClick={handleExampleQuestion}
                    className="text-white max-w-2xl mx-auto"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages area */}
            <div className="flex-1 pt-4 max-w-3xl mx-auto w-full">
              <ChatMessages messages={messages} onFeedback={handleFeedback} />
              {isLoading && (
                <LoadingState
                  isTyping
                  message="Seeking wisdom from ancient teachings..."
                  className="mt-2"
                />
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Guest banner - shown inline after messages */}
            {!isLoggedIn && isHydrated && (
              <div className="max-w-3xl mx-auto w-full mt-3 mb-1">
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
        <div className="shrink-0 w-full z-30 px-3 md:px-6 pb-5 pt-2">
          <ChatInput
            input={input}
            setInput={setInput}
            isLoading={isInputDisabled}
            onSubmit={handleSubmit}
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
              className="flex justify-center mt-2"
            >
              <button
                onClick={openModal}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/4 border border-white/6 hover:bg-white/7 hover:border-white/10 transition-all duration-200 group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400/60 group-hover:bg-violet-400 transition-colors" />
                <span className="text-[11px] text-white/25 group-hover:text-white/45 transition-colors">
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
