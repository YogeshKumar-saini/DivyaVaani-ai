'use client';

import { useState } from 'react';
import { VoiceChat } from '@/components/voice/VoiceChat';
import { VoiceSidebar } from '@/components/voice/VoiceSidebar';
import { Settings, Mic, Volume2, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';

const voiceFeatures = [
  { icon: Mic, label: 'Multi-language', desc: 'Speak in Hindi, English, Sanskrit & more' },
  { icon: Volume2, label: 'AI Voice Response', desc: 'Hear answers in natural, clear speech' },
  { icon: Info, label: 'Scripture-based', desc: 'Responses grounded in ancient wisdom' },
];

export default function VoicePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTip, setShowTip] = useState(true);

  return (
    <div className="h-full w-full relative overflow-hidden flex flex-col bg-transparent pt-16">

      {/* Ambient background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-amber-300/10 blur-[90px]" />
      </div>

      {/* Top bar - voice mode header */}
      <header className="relative z-40 flex items-center justify-between px-6 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-300 to-amber-200 flex items-center justify-center ring-1 ring-white/20 shadow-lg shadow-cyan-900/30">
            <span className="text-slate-950 text-sm font-bold">ॐ</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm tracking-wide">Voice Mode</h1>
            <p className="text-white/30 text-[11px]">Speak · Listen · Discover</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="text-white/40 hover:text-white hover:bg-white/10 rounded-xl h-9 w-9"
          aria-label="Open voice settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </header>

      {/* Tip banner */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-30 mx-6 mt-2 shrink-0"
          >
            <div className="flex items-center gap-3 rounded-xl bg-cyan-300/10 border border-cyan-300/25 px-4 py-2.5 text-[12px] text-cyan-100/80">
              <Info size={13} className="shrink-0 text-cyan-200" />
              <span className="flex-1">Tap the orb to begin speaking. Ask about dharma, karma, moksha or any spiritual topic.</span>
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
      <main className="flex-1 relative z-10 flex flex-col overflow-hidden min-h-0">
        <VoiceChat />
      </main>

      {/* Feature pills - bottom decoration */}
      <div className="relative z-20 flex justify-center gap-2 sm:gap-3 px-6 pb-4 shrink-0 flex-wrap">
        {voiceFeatures.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-[11px] text-white/50"
          >
            <Icon size={11} className="text-cyan-200/60" />
            <span>{label}</span>
          </div>
        ))}
      </div>

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
