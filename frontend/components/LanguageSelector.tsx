"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  disabled?: boolean;
}

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "sa", name: "संस्कृत", flag: "🕉️" },
];

export function LanguageSelector({ selectedLanguage, onLanguageChange, disabled }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-gray-500" />
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="h-8 px-2 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100/50 transition-all duration-200"
          >
            <span className="mr-1">{currentLanguage.flag}</span>
            <span className="max-w-[60px] truncate">{currentLanguage.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-48 bg-white/95 backdrop-blur-sm border border-gray-200/60 shadow-lg"
        >
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => {
                onLanguageChange(language.code);
                setIsOpen(false);
              }}
              className={`cursor-pointer flex items-center space-x-3 py-2 px-3 hover:bg-orange-50/80 transition-colors ${
                selectedLanguage === language.code ? 'bg-orange-50/90 text-orange-800' : 'text-gray-700'
              }`}
            >
              <span className="text-base">{language.flag}</span>
              <span className="font-medium">{language.name}</span>
              {selectedLanguage === language.code && (
                <Badge variant="secondary" className="ml-auto text-xs bg-orange-100 text-orange-700">
                  Active
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}