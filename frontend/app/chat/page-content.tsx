"use client";

import { useState, useEffect, useRef } from "react";
import { textService } from "@/lib/api/text-service";
import { LanguageDetector } from "@/components/LanguageSelector";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessages } from "@/components/chat/ChatMessage";
import { LoadingState, WelcomeScreen } from "@/components/chat/LoadingStates";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

import { AuroraBackground } from "@/components/ui/AuroraBackground";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState("en");
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Add welcome message on initial load
  // Add welcome message on initial load - REMOVED to avoid duplication with WelcomeScreen
  // useEffect(() => {
  //   if (messages.length === 0) {
  //     const welcomeMessage: Message = {
  //       id: 'welcome',
  //       type: 'bot',
  //       content: "🕉️ Welcome to DivyaVaani AI - Your spiritual companion powered by Bhagavad Gita wisdom. Ask me about dharma, karma, yoga, or any spiritual question.",
  //       timestamp: new Date()
  //     };
  //     setMessages([welcomeMessage]);
  //   }
  // }, []);

  const handleExampleQuestion = (question: string) => {
    setInput(question);
    setInitialLoad(false);

    // Auto-submit the example question
    setTimeout(() => {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: question,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      textService.askQuestion(question)
        .then(response => {
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
        })
        .catch(error => {
          console.error(error);
          let errorContent = "I apologize, but I encountered an error. ";

          // Type guard to check if error is an Error object
          const isErrorWithMessage = (err: unknown): err is { message?: string } => {
            return typeof err === 'object' && err !== null && 'message' in err;
          };

          const isErrorWithStatusCode = (err: unknown): err is { statusCode: number } => {
            return typeof err === 'object' && err !== null && 'statusCode' in err;
          };

          // Provide more helpful error messages
          if (isErrorWithMessage(error) && (error.message?.includes('fetch') || error.message?.includes('network'))) {
            errorContent += "Please check if the backend server is running and try again.";
          } else if (isErrorWithStatusCode(error) && error.statusCode === 503) {
            errorContent += "The system is still initializing. Please wait a moment and try again.";
          } else if (isErrorWithStatusCode(error) && error.statusCode === 429) {
            errorContent += "Too many requests. Please wait a moment before trying again.";
          } else {
            errorContent += "Please try again or rephrase your question.";
          }

          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: errorContent,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 100);
  };

  const askQuestion = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setInitialLoad(false);
    setIsLoading(true);

    try {
      const response = await textService.askQuestion(input);

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
    } catch (error) {
      console.error(error);
      let errorContent = "I apologize, but I encountered an error. ";

      // Type guard to check if error is an Error object
      const isErrorWithMessage = (err: unknown): err is { message?: string } => {
        return typeof err === 'object' && err !== null && 'message' in err;
      };

      const isErrorWithStatusCode = (err: unknown): err is { statusCode: number } => {
        return typeof err === 'object' && err !== null && 'statusCode' in err;
      };

      // Provide more helpful error messages
      if (isErrorWithMessage(error) && (error.message?.includes('fetch') || error.message?.includes('network'))) {
        errorContent += "Please check if the backend server is running and try again.";
      } else if (isErrorWithStatusCode(error) && error.statusCode === 503) {
        errorContent += "The system is still initializing. Please wait a moment and try again.";
      } else if (isErrorWithStatusCode(error) && error.statusCode === 429) {
        errorContent += "Too many requests. Please wait a moment before trying again.";
      } else {
        errorContent += "Please try again or rephrase your question.";
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: errorContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageId: string, rating: 'excellent' | 'good' | 'needs_improvement') => {
    console.log("Feedback:", messageId, rating);
    // Implement feedback logic here
  };

  return (
    <AuroraBackground className="h-screen w-full !block" showRadialGradient={true}>
      <div className="relative z-10 flex flex-col h-full w-full pt-24">

        {/* Floating Info Button - Top Right */}
        <div className="absolute top-4 right-4 z-50">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInfo(!showInfo)}
              className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 rounded-full h-12 w-12"
            >
              <Info className="h-5 w-5 text-white" />
            </Button>

            {/* Info Popup */}
            {showInfo && (
              <div className="absolute top-14 right-0 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[250px]">
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
        <main className="flex-1 relative z-10">
          {/* Messages Container */}
          <div className="absolute inset-0 pt-0 pb-32 sm:pb-40 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
              <div className="flex flex-col min-h-full w-full">
                {/* Welcome Screen - show on initial load */}
                {initialLoad && (
                  <div className="flex-1 flex items-center justify-center">
                    <WelcomeScreen onExampleClick={handleExampleQuestion} />
                  </div>
                )}

                {/* Chat Messages - always show if there are messages */}
                {messages.length > 0 && (
                  <div className="pb-8 space-y-6 w-full">
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
          </div>
        </main>

        {/* Fixed Input Section at bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-20 pb-6 pt-12 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pointer-events-auto">
            <ChatInput
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              onSubmit={askQuestion}
              placeholder="Ask about dharma, karma, yoga..."
              maxLength={2000}
              className="shadow-2xl shadow-black/20"
            />
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}
