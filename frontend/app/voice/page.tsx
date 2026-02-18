'use client';

import { useState } from 'react';
import { VoiceChat } from '@/components/voice/VoiceChat';
import { VoiceSidebar } from '@/components/voice/VoiceSidebar';
import { Settings, Mic, Volume2, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';

const quickTips = [
  { icon: Mic, text: 'Speak naturally in your preferred language.' },
  { icon: Volume2, text: 'Use clear pauses for better transcription quality.' },
  { icon: Shield, text: 'Avoid sharing sensitive personal data in voice prompts.' },
];

export default function VoicePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-cyan-200/20 bg-slate-900/55 p-5 md:p-6 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-200/80">Voice Studio</p>
              <h1 className="text-2xl md:text-3xl text-slate-100" style={{ fontFamily: 'var(--font-playfair)' }}>Speak with DivyaVaani</h1>
              <p className="mt-2 text-sm text-slate-300">Real-time voice guidance with intelligent responses and smooth playback.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1.5 text-xs text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" />
                Premium Voice Mode
              </div>
              <Button
                variant="outline"
                onClick={() => setSidebarOpen(true)}
                className="border-cyan-200/30 bg-cyan-300/10 text-slate-100 hover:bg-cyan-300/20"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickTips.map((tip) => (
              <div key={tip.text} className="rounded-xl border border-cyan-200/15 bg-slate-900/70 px-4 py-3 text-sm text-slate-200 flex items-center gap-2">
                <tip.icon className="h-4 w-4 text-cyan-200" />
                <span>{tip.text}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-3xl border border-cyan-200/20 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-[0_24px_60px_rgba(2,6,23,0.6)]">
          <div className="h-[calc(100vh-17rem)] min-h-[520px]">
            <VoiceChat />
          </div>
        </div>
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-[420px] max-w-[95vw] bg-slate-950/95 border-l border-cyan-200/15 backdrop-blur-xl z-[100]">
          <VoiceSidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
