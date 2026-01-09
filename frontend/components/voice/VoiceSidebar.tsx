'use client';

import { useState } from 'react';
import { X, Mic, Volume2, Languages, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface VoiceSidebarProps {
  onClose: () => void;
}

export function VoiceSidebar({ onClose }: VoiceSidebarProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [voiceVolume, setVoiceVolume] = useState(70);
  const [micSensitivity, setMicSensitivity] = useState(60);
  const [noiseReduction, setNoiseReduction] = useState(true);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2 font-semibold">
          <Activity className="h-5 w-5" />
          Voice Settings
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Language Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Languages className="h-4 w-4" /> Language
          </Label>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Languages</SelectLabel>
                <SelectItem value="auto">Auto-detect</SelectItem>
                <SelectItem value="en">🇺🇸 English</SelectItem>
                <SelectItem value="hi">🇮🇳 हिन्दी (Hindi)</SelectItem>
                <SelectItem value="sa">🕉️ संस्कृत (Sanskrit)</SelectItem>
                <SelectItem value="bn">🇮🇳 বাংলা (Bengali)</SelectItem>
                <SelectItem value="te">🇮🇳 తెలుగు (Telugu)</SelectItem>
                <SelectItem value="ta">🇮🇳 தமிழ் (Tamil)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="h-px bg-border" />

        {/* Voice Volume */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Volume2 className="h-4 w-4" /> Voice Volume: {voiceVolume}%
          </Label>
          <Slider
            value={[voiceVolume]}
            onValueChange={(val) => setVoiceVolume(val[0])}
            min={10}
            max={100}
            step={1}
          />
        </div>

        <div className="h-px bg-border" />

        {/* Microphone Settings */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Mic className="h-4 w-4" /> Microphone
          </Label>

          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Sensitivity: {micSensitivity}%
            </div>
            <Slider
              value={[micSensitivity]}
              onValueChange={(val) => setMicSensitivity(val[0])}
              min={20}
              max={100}
              step={1}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Label htmlFor="noise-reduction" className="text-sm font-normal">
              Noise Reduction
            </Label>
            <Switch
              id="noise-reduction"
              checked={noiseReduction}
              onCheckedChange={setNoiseReduction}
            />
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Voice Test */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Voice Test</Label>
          <p className="text-xs text-muted-foreground">
            Test your current voice settings
          </p>
          <Button variant="outline" size="sm" className="w-full">
            Play Sample Audio
          </Button>
        </div>
      </div>
    </div>
  );
}
