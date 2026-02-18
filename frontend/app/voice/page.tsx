'use client';

import { useState } from 'react';
import { VoiceChat } from '@/components/voice/VoiceChat';
import { VoiceSidebar } from '@/components/voice/VoiceSidebar';
import { Settings, Mic, Volume2, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { GrainOverlay } from '@/components/ui/GrainOverlay';
import { motion } from 'framer-motion';

const quickTips = [
  { icon: Mic, text: 'Speak naturally in your preferred language.' },
  { icon: Volume2, text: 'Use clear pauses for better transcription quality.' },
  { icon: Shield, text: 'Avoid sharing sensitive personal data in voice prompts.' },
];

export default function VoicePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen pt-24 pb-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <GrainOverlay />

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />

      <motion.div
        className="mx-auto max-w-7xl space-y-6 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <section className="rounded-3xl border border-white/10 bg-black/20 p-5 md:p-6 backdrop-blur-2xl relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-300/80 font-semibold">Voice Studio</p>
              <h1 className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/70 mt-1">Speak with DivyaVaani</h1>
              <p className="mt-2 text-sm text-white/60 font-light max-w-2xl">Real-time voice guidance with intelligent responses and smooth playback.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                <Sparkles className="h-3.5 w-3.5" />
                Premium Voice Mode
              </div>
              <Button
                variant="outline"
                onClick={() => setSidebarOpen(true)}
                className="border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
            {quickTips.map((tip, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70 flex items-center gap-3 hover:bg-white/5 transition-colors">
                <div className="p-1.5 rounded-full bg-white/5">
                  <tip.icon className="h-4 w-4 text-cyan-200" />
                </div>
                <span>{tip.text}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-3xl border border-white/10 bg-black/20 backdrop-blur-3xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.5)] h-[calc(100vh-21rem)] min-h-[500px] relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
          <VoiceChat />
        </div>
      </motion.div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-[420px] max-w-[95vw] bg-black/80 border-l border-white/10 backdrop-blur-2xl z-[100] text-white">
          <VoiceSidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
