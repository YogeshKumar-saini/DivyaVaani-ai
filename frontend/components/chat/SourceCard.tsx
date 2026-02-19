
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Source {
    verse: string;
    score: number;
    text: string;
    sanskrit?: string;
    translation?: string;
    chapter?: string;
}

interface SourceCardProps {
    source: Source;
    index: number;
}

export function SourceCard({ source, index }: SourceCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-white/10 bg-white/5 rounded-xl overflow-hidden hover:bg-white/8 transition-colors"
        >
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 text-left"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                        <span className="text-xs font-serif font-bold">{index + 1}</span>
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-medium text-white/90 truncate">
                            {source.verse}
                        </h4>
                        <p className="text-xs text-white/50 truncate">
                            {source.chapter || 'Ancient Wisdom'}
                        </p>
                    </div>
                </div>
                <ChevronDown
                    size={16}
                    className={cn(
                        "text-white/40 transition-transform duration-200",
                        isExpanded && "rotate-180"
                    )}
                />
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-3 pt-0 text-sm space-y-3">
                            <div className="h-px w-full bg-white/10" />

                            {source.sanskrit && (
                                <div className="space-y-1">
                                    <div className="text-[10px] uppercase tracking-wider text-orange-400/80 font-semibold">
                                        Sanskrit
                                    </div>
                                    <p className="font-serif text-amber-100/90 italic leading-relaxed">
                                        {source.sanskrit}
                                    </p>
                                </div>
                            )}

                            {source.translation && (
                                <div className="space-y-1">
                                    <div className="text-[10px] uppercase tracking-wider text-blue-400/80 font-semibold">
                                        Translation
                                    </div>
                                    <p className="text-white/70 leading-relaxed">
                                        {source.translation}
                                    </p>
                                </div>
                            )}

                            {!source.sanskrit && !source.translation && (
                                <p className="text-white/70 leading-relaxed">
                                    {source.text}
                                </p>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-1">
                                <span className="text-[10px] text-white/30 px-2 py-0.5 rounded-full bg-white/5">
                                    Match: {Math.round(source.score * 100)}%
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
