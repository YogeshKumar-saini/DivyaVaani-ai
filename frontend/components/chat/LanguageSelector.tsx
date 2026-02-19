'use client';

import { useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const LANGUAGES = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
];

interface LanguageSelectorProps {
    selectedLanguage: string;
    onLanguageChange: (code: string) => void;
    className?: string;
}

export function LanguageSelector({
    selectedLanguage,
    onLanguageChange,
    className
}: LanguageSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const currentLanguage = LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[0];

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 group",
                        isOpen
                            ? "bg-white/10 border-violet-500/50 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white",
                        className
                    )}
                >
                    <div className={cn(
                        "p-1 rounded-full transition-colors",
                        isOpen ? "bg-violet-500/20 text-violet-300" : "bg-white/5 text-white/50 group-hover:text-white/80"
                    )}>
                        <Globe className="h-3.5 w-3.5" />
                    </div>

                    <div className="flex flex-col items-start leading-none">
                        <span className="text-[10px] uppercase tracking-wider opacity-50 font-medium">Language</span>
                        <span className="text-[13px] font-medium">{currentLanguage.native}</span>
                    </div>

                    <ChevronDown className={cn(
                        "h-3.5 w-3.5 ml-1 opacity-50 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )} />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-56 p-2 bg-[#0B0F19]/95 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden z-[100]"
            >
                <div className="px-2 py-1.5 mb-1">
                    <h4 className="text-[11px] font-semibold uppercase tracking-widest text-white/30">Select Language</h4>
                </div>

                <div className="max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {LANGUAGES.map((language) => (
                        <DropdownMenuItem
                            key={language.code}
                            onClick={() => onLanguageChange(language.code)}
                            className={cn(
                                "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer mb-1 last:mb-0 transition-all focus:bg-white/5 focus:text-white",
                                selectedLanguage === language.code
                                    ? "bg-violet-500/15 text-white border border-violet-500/20"
                                    : "text-white/70 hover:bg-white/5 hover:text-white border border-transparent"
                            )}
                        >
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[13px] font-medium">{language.native}</span>
                                <span className="text-[11px] text-white/30 font-light">{language.name}</span>
                            </div>

                            {selectedLanguage === language.code && (
                                <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/40">
                                    <Check className="h-3 w-3 text-violet-300" />
                                </div>
                            )}
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
