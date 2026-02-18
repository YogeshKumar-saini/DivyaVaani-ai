'use client';

import { useState } from 'react';
import { X, Mic, Volume2, Languages, Activity, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { GrainOverlay } from '@/components/ui/GrainOverlay';


interface VoiceSidebarProps {
  onClose: () => void;
  isPanel?: boolean;
}

export function VoiceSidebar({ onClose, isPanel = false }: VoiceSidebarProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [voiceVolume, setVoiceVolume] = useState(70);
  const [micSensitivity, setMicSensitivity] = useState(60);
  const [noiseReduction, setNoiseReduction] = useState(true);

  return (
    <div className={cn("flex h-full flex-col relative overflow-hidden bg-black/40 text-foreground", isPanel && "bg-transparent")}>
      <GrainOverlay />

      {/* Background gradients - adjust for panel */}
      {!isPanel && (
        <>
          <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none" />
        </>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-6 relative z-10 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center border border-white/10 shadow-lg">
            <Activity className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-white">Voice Settings</h2>
            <p className="text-xs text-white/50">Configure your audio experience</p>
          </div>
        </div>
        {!isPanel && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10 scrollbar-thin">
        {/* Language Selection */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Languages className="h-4 w-4 text-cyan-400" />
            <Label className="text-sm font-medium text-white/90">Language Model</Label>
          </div>

          <div className="p-1 rounded-xl bg-black/40 border border-white/10 backdrop-blur-sm">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-full bg-transparent border-none text-white focus:ring-0 focus:ring-offset-0 h-10">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-white/10 text-white backdrop-blur-xl">
                <SelectGroup>
                  <SelectLabel className="text-white/50 text-xs uppercase tracking-wider">Available Languages</SelectLabel>
                  <SelectItem value="auto" className="focus:bg-white/10 focus:text-white">Auto-detect (Smart)</SelectItem>
                  <SelectItem value="en" className="focus:bg-white/10 focus:text-white">🇺🇸 English US</SelectItem>
                  <SelectItem value="hi" className="focus:bg-white/10 focus:text-white">🇮🇳 हिन्दी (Hindi)</SelectItem>
                  <SelectItem value="sa" className="focus:bg-white/10 focus:text-white">🕉️ संस्कृत (Sanskrit)</SelectItem>
                  <SelectItem value="bn" className="focus:bg-white/10 focus:text-white">🇮🇳 বাংলা (Bengali)</SelectItem>
                  <SelectItem value="te" className="focus:bg-white/10 focus:text-white">🇮🇳 తెలుగు (Telugu)</SelectItem>
                  <SelectItem value="ta" className="focus:bg-white/10 focus:text-white">🇮🇳 தமிழ் (Tamil)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-white/40 px-1">AI automatically detects your language, but you can force a specific one.</p>
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Voice Volume */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-purple-400" />
              <Label className="text-sm font-medium text-white/90">Output Volume</Label>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-mono">{voiceVolume}%</span>
          </div>

          <div className="px-1">
            <Slider
              value={[voiceVolume]}
              onValueChange={(val) => setVoiceVolume(val[0])}
              min={0}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Microphone Settings */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Mic className="h-4 w-4 text-amber-400" />
            <Label className="text-sm font-medium text-white/90">Microphone Input</Label>
          </div>

          <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-white/60">
                <span>Sensitivity Threshold</span>
                <span>{micSensitivity}%</span>
              </div>
              <Slider
                value={[micSensitivity]}
                onValueChange={(val) => setMicSensitivity(val[0])}
                min={10}
                max={100}
                step={1}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="noise-reduction" className="text-sm font-medium text-white">Noise Reduction</Label>
                <span className="text-xs text-white/40">Filter background static</span>
              </div>
              <Switch
                id="noise-reduction"
                checked={noiseReduction}
                onCheckedChange={setNoiseReduction}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>
        </section>

        {/* Voice Test */}
        <section className="pt-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-noise opacity-30" />
            <div className="relative z-10 flex flex-col items-center text-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white mb-1 shadow-inner backdrop-blur-sm">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="font-medium text-white">Test Audio Output</h4>
                <p className="text-xs text-white/50 mt-1">Play a sample to verify your settings</p>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">
                Play Sample
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="p-4 bg-black/40 border-t border-white/5 backdrop-blur-xl relative z-10">
        <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-purple-900/20" onClick={onClose}>
          <Check className="h-4 w-4 mr-2" /> {isPanel ? "Save Settings" : "Save & Close"}
        </Button>
      </div>
    </div>
  );
}
