"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { API_BASE_URL } from "@/lib/api/client";

interface MemoryOverview {
    user_id: string;
    profile: {
        top_topics: Array<{ topic: string; count: number }>;
        preferred_language: string | null;
        spiritual_stage: string;
        total_conversations: number;
        total_facts: number;
        personality_traits: string[];
    } | null;
    fact_count: number;
    episode_count: number;
    memory_status: string;
}

interface MemoryIndicatorProps {
    userId: string | null;
}

export function MemoryIndicator({ userId }: MemoryIndicatorProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [overview, setOverview] = useState<MemoryOverview | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMemoryOverview = async () => {
            if (!userId) return;
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/api/v1/memory/user/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setOverview(data);
                } else {
                    setError("Failed to load");
                }
            } catch {
                setError("Unavailable");
            } finally {
                setLoading(false);
            }
        };

        if (userId && isExpanded) {
            fetchMemoryOverview();
        }
    }, [userId, isExpanded]);

    if (!userId) return null;

    const hasMemory = overview && (overview.fact_count > 0 || overview.episode_count > 0);

    return (
        <div className="relative">
            {/* Compact badge */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-medium transition-all duration-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] text-white/40 hover:text-white/70"
                title="Memory status"
            >
                <Brain size={12} className={hasMemory ? "text-cyan-400/80" : "text-white/30"} />
                <span className="uppercase tracking-wider">
                    {loading ? "..." : hasMemory ? "Memory Active" : "Memory"}
                </span>
                {hasMemory && (
                    <span className="flex items-center gap-0.5 text-cyan-400/60">
                        <Sparkles size={8} />
                        <span>{overview?.fact_count}</span>
                    </span>
                )}
                {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>

            {/* Expanded panel */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full right-0 mb-2 w-64 z-50 rounded-2xl border border-white/[0.08] bg-slate-950/95 backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden"
                    >
                        <div className="p-3.5">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-cyan-400/20 to-purple-400/20 flex items-center justify-center">
                                        <Brain size={11} className="text-cyan-300" />
                                    </div>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                                        Memory System
                                    </span>
                                </div>
                            </div>

                            {error ? (
                                <p className="text-[10px] text-red-400/60">{error}</p>
                            ) : loading ? (
                                <div className="flex items-center gap-2 py-4 justify-center">
                                    <div className="w-3 h-3 rounded-full border border-cyan-400/40 border-t-cyan-400 animate-spin" />
                                    <span className="text-[10px] text-white/30">Loading...</span>
                                </div>
                            ) : overview ? (
                                <div className="space-y-2.5">
                                    {/* Stats grid */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-white/[0.03] rounded-xl p-2 text-center">
                                            <div className="text-sm font-bold text-cyan-300/80">{overview.fact_count}</div>
                                            <div className="text-[8px] uppercase tracking-wider text-white/25 mt-0.5">Facts</div>
                                        </div>
                                        <div className="bg-white/[0.03] rounded-xl p-2 text-center">
                                            <div className="text-sm font-bold text-amber-300/80">{overview.episode_count}</div>
                                            <div className="text-[8px] uppercase tracking-wider text-white/25 mt-0.5">Episodes</div>
                                        </div>
                                        <div className="bg-white/[0.03] rounded-xl p-2 text-center">
                                            <div className="text-sm font-bold text-purple-300/80">
                                                {overview.profile?.total_conversations ?? 0}
                                            </div>
                                            <div className="text-[8px] uppercase tracking-wider text-white/25 mt-0.5">Convos</div>
                                        </div>
                                    </div>

                                    {/* Spiritual Stage */}
                                    {overview.profile && (
                                        <div className="flex items-center gap-2 bg-white/[0.02] rounded-xl px-2.5 py-1.5">
                                            <span className="text-[9px] uppercase tracking-wider text-white/25">Stage:</span>
                                            <span className="text-[10px] text-cyan-300/70 capitalize font-medium">
                                                {overview.profile.spiritual_stage}
                                            </span>
                                        </div>
                                    )}

                                    {/* Top Topics */}
                                    {overview.profile?.top_topics?.length ? (
                                        <div>
                                            <div className="text-[8px] uppercase tracking-wider text-white/20 mb-1.5">
                                                Top Interests
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {overview.profile.top_topics.slice(0, 5).map((t, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-400/[0.06] border border-cyan-400/10 text-[9px] text-cyan-300/60"
                                                    >
                                                        {t.topic}
                                                        <span className="text-white/20">×{t.count}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* No memory state */}
                                    {!hasMemory && (
                                        <p className="text-[10px] text-white/25 text-center py-2">
                                            No memories yet. Chat to build your spiritual profile.
                                        </p>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
