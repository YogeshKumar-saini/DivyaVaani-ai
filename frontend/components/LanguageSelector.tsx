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
        <Globe className="h-4 w-4 text-gray-500" />
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-50/50 cursor-default'
              }`}
              onClick={() => !disabled && setShowDetails(!showDetails)}
            >
              <Languages className="h-3 w-3 text-gray-400" />
              <span className="text-base">{language.flag}</span>
              <span className="text-xs font-medium text-gray-600">{language.native}</span>
              {isDetecting && (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">
                <span className="mr-2">{language.flag}</span>
                Auto-detected: {language.name}
              </p>
              <p className="text-xs text-gray-500">
                Language automatically detected from your question
              </p>
              {confidence < 1.0 && (
                <p className="text-xs text-amber-600">
                  Detection confidence: {Math.round(confidence * 100)}%
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
        
        {showDetails && !disabled && (
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
            Auto-detected
          </Badge>
        )}
      </div>
    </TooltipProvider>
  );
}