"use client";

import { useState, useEffect, useRef } from "react";
import { textService } from "@/lib/api/text-service";
import { conversationService } from "@/lib/api/conversation-service";
import { useAuth } from "@/lib/context/auth-provider";
import { LanguageDetector } from "@/components/LanguageSelector";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessages } from "@/components/chat/ChatMessage";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { LoadingState, WelcomeScreen } from "@/components/chat/LoadingStates";
import { Info, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { cn } from "@/lib/utils";

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

export default function ChatPageContent() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState("en");
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSelectConversation = async (id: string) => {
    setCurrentConversationId(id);
    setInitialLoad(false);
    setIsLoading(true);
    try {
      const conv = await conversationService.getConversation(id);

      // Convert API messages to UI messages
      const uiMessages: Message[] = conv.messages.map(msg => ({
        id: msg.id,
        type: msg.role === 'user' ? 'user' : 'bot',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        confidence_score: msg.confidence_score,
        processing_time: msg.processing_time,
        sources: msg.sources,
        // Contexts might not be persisted in simple message structure, 
        // need to check if backend returns them in detailed view or not. 
        // For now, mapping what we have.
      }));

      setMessages(uiMessages);
    } catch (error) {
      console.error("Failed to load conversation", error);
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
    // Slight delay to allow state update before submitting
    setTimeout(() => {
      askQuestion(question);
    }, 100);
  };

  const askQuestion = async (questionInput?: string) => {
    const questionToAsk = questionInput || input;
    if (!questionToAsk.trim()) return;

    // UI Optimistic Update
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: questionToAsk,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setInitialLoad(false);
    setIsLoading(true);

    try {
      let conversationId = currentConversationId;

      // 1. Create conversation if needed
      if (!conversationId && user) {
        try {
          const newConv = await conversationService.createConversation(user.id, {
            title: questionToAsk.slice(0, 50) + (questionToAsk.length > 50 ? "..." : ""),
            language: detectedLanguage
          });
          conversationId = newConv.id;
          setCurrentConversationId(conversationId);
        } catch (e) {
          console.error("Failed to create conversation", e);
        }
      }

      // 2. Persist User Message
      if (conversationId && user) {
        try {
          await conversationService.addMessage(conversationId, {
            role: 'user',
            content: questionToAsk
          });
        } catch (e) {
          console.error("Failed to persist user message", e);
        }
      }

      // 3. Get AI Response
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
        processing_time: response.processing_time
      };

      setMessages(prev => [...prev, botMessage]);
      if (response.language) {
        setDetectedLanguage(response.language);
      }

      // 4. Persist Bot Message
      if (conversationId && user) {
        try {
          conversationService.addMessage(conversationId, {
            role: 'assistant',
            content: response.answer,
            confidence_score: response.confidence,
            processing_time: response.processing_time,
            sources: response.sources
          });
        } catch (e) {
          console.error("Failed to persist bot message", e);
        }
      }

    } catch (error) {
      console.error(error);
      const errorContent = "I apologize, but I encountered an error. ";

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: errorContent + "Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageId: string, rating: 'excellent' | 'good' | 'needs_improvement') => {
    console.log("Feedback:", messageId, rating);
  };

  return (
    <AuroraBackground className="h-screen w-full !block" showRadialGradient={true}>
      <div className="flex h-full">
        {/* Sidebar */}
        <ChatSidebar
          isOpen={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          isCollapsed={isSidebarCollapsed}
          onCollapseChange={setIsSidebarCollapsed}
        />

        <div className={cn(
          "relative z-10 flex flex-col h-full w-full pt-20 transition-all duration-300",
          isSidebarCollapsed ? "md:pl-[80px]" : "md:pl-[320px]"
        )}>

          {/* Header / Info / Mobile Menu Toggle */}
          <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
            {/* Mobile Menu Trigger */}
            <div className="pointer-events-auto md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 rounded-full h-10 w-10 text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1" />

            {/* Info Button */}
            <div className="pointer-events-auto relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowInfo(!showInfo)}
                className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 rounded-full h-10 w-10 text-white"
              >
                <Info className="h-5 w-5" />
              </Button>
              {/* Info Popup */}
              {showInfo && (
                <div className="absolute top-12 right-0 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[250px]">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Language</div>
                      <LanguageDetector
                        currentDetectedLanguage={detectedLanguage}
                        isDetecting={false}
                        confidence={1.0}
                        disabled={true}
                      />
                    </div>
                    <div className="h-px bg-white/10" />
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                      <span className="text-sm text-white font-medium">Online</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 relative z-10 w-full max-w-5xl mx-auto">
            {/* Messages Container */}
            <div className="absolute inset-0 pt-0 pb-32 sm:pb-40 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent px-4">
              <div className="min-h-full w-full flex flex-col">
                {/* Welcome Screen */}
                {initialLoad && (
                  <div className="flex-1 flex items-center justify-center py-10">
                    <WelcomeScreen onExampleClick={handleExampleQuestion} />
                  </div>
                )}

                {/* Chat Messages */}
                {!initialLoad && ( // Only show messages context when not initial load (or if messages exist)
                  <div className="pb-8 space-y-6 w-full pt-10">
                    <ChatMessages
                      messages={messages}
                      onFeedback={handleFeedback}
                      feedbackSubmitted={false}
                    />

                    {/* Loading State */}
                    {isLoading && (
                      <div className="py-4">
                        <LoadingState isTyping={true} />
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* Fixed Input Section */}
          <div className={cn(
            "fixed bottom-0 right-0 z-20 pb-6 pt-12 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none transition-all duration-300",
            isSidebarCollapsed ? "left-0 md:left-[80px]" : "left-0 md:left-[320px]"
          )}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pointer-events-auto">
              <ChatInput
                input={input}
                setInput={setInput}
                isLoading={isLoading}
                onSubmit={() => askQuestion()}
                placeholder="Ask about dharma, karma, yoga..."
                maxLength={2000}
                className="shadow-2xl shadow-black/20"
              />
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}
