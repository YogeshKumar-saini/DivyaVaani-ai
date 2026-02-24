'use client';

import { useState } from 'react';
import { VoiceChat } from '@/components/voice/VoiceChat';
import { VoiceSidebar } from '@/components/voice/VoiceSidebar';
import { LanguageSelector } from '@/components/chat/LanguageSelector';
import { Settings, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';



export default function VoicePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [autoListen, setAutoListen] = useState(false);

  return (
    <div className="h-full min-h-0 w-full relative overflow-hidden flex flex-col pt-16 sm:pt-20">

      {/* Ambient background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-amber-300/10 blur-[90px]" />
      </div>

      {/* Voice Interface Controls - Now relative to take up space and avoid overlap */}
      <div className="relative z-40 w-full max-w-4xl mx-auto px-3 sm:px-6 mb-3 sm:mb-4 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-0.5 pointer-events-auto">
          <h1 className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white/90">Voice Mode</h1>
          <p className="text-[9px] sm:text-[10px] text-white/30 font-medium">DivyaVaani Live</p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-2xl p-0.5 shadow-2xl">
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              className="bg-transparent border-none text-white/50 hover:text-white h-8 text-[11px] font-bold uppercase tracking-wider px-3"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 text-white/40 hover:text-white hover:bg-white/10 rounded-2xl h-9 w-9 shadow-2xl"
            aria-label="Open voice settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tip banner */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-30 mx-auto mt-2 sm:mt-4 max-w-2xl px-3 sm:px-6 shrink-0"
          >
            <div className="flex items-center gap-2 sm:gap-3 rounded-xl bg-violet-500/10 border border-violet-500/20 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-[11px] text-violet-200/70 backdrop-blur-md">
              <Info size={13} className="shrink-0 text-cyan-200" />
              <span className="flex-1">Tap the orb or press <kbd className="px-1 py-0.5 rounded bg-white/10 text-white/50 font-mono text-[10px]">Space</kbd> to begin speaking.</span>
              <button
                onClick={() => setShowTip(false)}
                className="ml-auto text-white/30 hover:text-white/60 shrink-0 transition-colors"
                aria-label="Dismiss tip"
              >
                <X size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Voice Area */}
      <main className="flex-1 min-h-0 relative z-10 flex flex-col overflow-hidden">
        <VoiceChat
          selectedLanguage={selectedLanguage}
          autoListen={autoListen}
          onAutoListenChange={setAutoListen}
        />
      </main>
      {/* Settings Panel - using VoiceSidebar component */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[380px] bg-slate-950/98 border-l border-white/10 backdrop-blur-2xl text-white p-0 overflow-hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Voice Settings</SheetTitle>
          </SheetHeader>
          <VoiceSidebar onClose={() => setSidebarOpen(false)} isPanel />
        </SheetContent>
      </Sheet>
    </div>
  );
}
