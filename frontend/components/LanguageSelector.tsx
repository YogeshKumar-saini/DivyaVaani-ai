"use client";

import { useState } from "react";
import { Globe, Languages } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LanguageDetectorProps {
  currentDetectedLanguage: string;
  isDetecting?: boolean;
  confidence?: number;
  disabled?: boolean;
}

const languageInfo = {
  "en": { name: "English", flag: "🇺🇸", native: "English" },
  "hi": { name: "हिंदी", flag: "🇮🇳", native: "हिंदी" },
  "sa": { name: "संस्कृत", flag: "🕉️", native: "संस्कृत" }
};

export function LanguageDetector({
  currentDetectedLanguage,
  isDetecting = false,
  confidence = 1.0,
  disabled = false
}: LanguageDetectorProps) {
  const [showDetails, setShowDetails] = useState(false);

  const language = languageInfo[currentDetectedLanguage as keyof typeof languageInfo] || languageInfo.en;

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2">
        <Globe className="h-4 w-4 text-white/30 shrink-0" />
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg transition-all duration-200 ${
                disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-white/8 cursor-default'
              }`}
              onClick={() => !disabled && setShowDetails(!showDetails)}
            >
              <Languages className="h-3 w-3 text-white/30" />
              <span className="text-sm">{language.flag}</span>
              <span className="text-[12px] font-medium text-white/55">{language.native}</span>
              {isDetecting && (
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-xs bg-slate-900/95 border border-white/10 text-white backdrop-blur-xl rounded-xl"
          >
            <div className="space-y-1 p-1">
              <p className="font-medium text-[13px]">
                <span className="mr-2">{language.flag}</span>
                Auto-detected: {language.name}
              </p>
              <p className="text-[11px] text-white/45">
                Language automatically detected from your question
              </p>
              {confidence < 1.0 && (
                <p className="text-[11px] text-amber-400/80">
                  Detection confidence: {Math.round(confidence * 100)}%
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {showDetails && !disabled && (
          <Badge
            variant="outline"
            className="text-[10px] border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
          >
            Auto-detected
          </Badge>
        )}
      </div>
    </TooltipProvider>
  );
}
