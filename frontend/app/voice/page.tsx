'use client';

import { useState } from 'react';
import { VoiceChat } from '@/components/voice/VoiceChat';
import { VoiceSidebar } from '@/components/voice/VoiceSidebar';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { GrainOverlay } from '@/components/ui/GrainOverlay';

export default function VoicePage() {
  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-0 flex flex-col bg-background text-foreground overflow-hidden">
      <GrainOverlay />

      {/* Settings Modal */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-[400px] bg-black/90 border-l border-white/10 backdrop-blur-xl z-[100]">
          <VoiceSidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <AuroraBackground className="flex-1 w-full min-h-0 h-full relative" showRadialGradient={false}>
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 relative pt-20">
          {/* Settings button - positioned in top right */}
          <div className="absolute top-4 right-4 z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 rounded-full h-12 w-12"
            >
              <Settings className="h-6 w-6 text-white" />
            </Button>
          </div>

          <div className="flex-1 flex flex-col h-full relative overflow-hidden">
            {/* Voice Chat Area */}
            <div className="flex-1 w-full h-full relative">
              <VoiceChat />
            </div>
          </div>
        </div>
      </AuroraBackground>
    </div>
  );
}
