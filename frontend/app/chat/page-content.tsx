'use client';

import { useState, useEffect, useRef } from 'react';
import { textService } from '@/lib/api/text-service';
import { conversationService } from '@/lib/api/conversation-service';
import { useAuth } from '@/lib/context/auth-provider';
import { LanguageDetector } from '@/components/LanguageSelector';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessages } from '@/components/chat/ChatMessage';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { LoadingState, WelcomeScreen } from '@/components/chat/LoadingStates';
import { Menu, MessageSquarePlus, Sparkles, Gauge, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GrainOverlay } from '@/components/ui/GrainOverlay';
import { motion, AnimatePresence } from 'framer-motion';

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

const quickPrompts = [
  'How do I stay calm during uncertainty?',
  'What is detached action in daily work?',
  'How can I improve focus in meditation?',
];

export default function ChatPageContent() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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

  const askQuestion = async (questionInput?: string) => {
    const questionToAsk = questionInput || input;
    if (!questionToAsk.trim()) return;

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

  return (
    <div className="min-h-screen pt-24 pb-6 px-3 sm:px-4 relative overflow-hidden">
      <GrainOverlay />
      <div className="mx-auto max-w-[1600px] h-[calc(100vh-7.5rem)] rounded-3xl border border-white/10 bg-black/20 backdrop-blur-3xl overflow-hidden shadow-2xl relative z-10 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="flex h-full relative z-10">
          <ChatSidebar
            isOpen={isSidebarOpen}
            onOpenChange={setIsSidebarOpen}
            currentConversationId={currentConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            isCollapsed={isSidebarCollapsed}
            onCollapseChange={setIsSidebarCollapsed}
          />

          <div
            className={cn(
              'relative z-10 flex flex-col h-full w-full transition-all duration-300',
              isSidebarCollapsed ? 'md:pl-[80px]' : 'md:pl-[320px]'
            )}
          >
            <div className="border-b border-white/10 bg-black/20 backdrop-blur-md px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewChat}
                    className="border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <MessageSquarePlus className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>
                </div>

                <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5">
                  <LanguageDetector currentDetectedLanguage={detectedLanguage} disabled />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5" /> Wisdom Mode
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                  <Gauge className="h-3.5 w-3.5" /> High Accuracy
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                  <ShieldCheck className="h-3.5 w-3.5" /> Safety Filters On
                </span>
              </div>
            </div>

            <div className="border-b border-white/5 bg-black/10 px-4 py-3 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleExampleQuestion(prompt)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-all hover:scale-105"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin py-6 relative">
              {initialLoad && messages.length === 0 ? (
                <WelcomeScreen onExampleClick={handleExampleQuestion} className="text-white" />
              ) : (
                <div className="px-2 sm:px-4">
                  <ChatMessages messages={messages} onFeedback={handleFeedback} />
                </div>
              )}
              {isLoading && <LoadingState isTyping className="px-6 mt-4 text-white/60" />}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/10 bg-black/20 backdrop-blur-md p-3 sm:p-4">
              <ChatInput
                input={input}
                setInput={setInput}
                isLoading={isLoading}
                onSubmit={() => askQuestion()}
                placeholder="Ask for guidance, clarity, or practical steps..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
