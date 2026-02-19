'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    MessageSquare,
    TrendingUp,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    Sun,
    Moon,
    Flame,
} from 'lucide-react';
import { conversationService, DailySummary } from '@/lib/api/conversation-service';

// ── Types ───────────────────────────────────────────────────────────────────

type Period = 'day' | 'month' | 'year';

interface ChatInsightsProps {
    userId: string;
}

// ── Mood config ─────────────────────────────────────────────────────────────

const MOOD_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    reflective: { icon: <Moon size={14} />, color: 'text-indigo-400', label: 'Reflective' },
    seeking: { icon: <TrendingUp size={14} />, color: 'text-amber-400', label: 'Seeking' },
    contemplative: { icon: <Sun size={14} />, color: 'text-blue-400', label: 'Contemplative' },
    devotional: { icon: <Flame size={14} />, color: 'text-rose-400', label: 'Devotional' },
    transcendent: { icon: <Sparkles size={14} />, color: 'text-violet-400', label: 'Transcendent' },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function getDateRange(period: Period, offset: number): { start: string; end: string; label: string } {
    const now = new Date();

    if (period === 'day') {
        const d = new Date(now);
        d.setDate(d.getDate() + offset);
        const dateStr = d.toISOString().slice(0, 10);
        return { start: dateStr, end: dateStr, label: formatDate(dateStr) };
    }

    if (period === 'month') {
        const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        return {
            start: d.toISOString().slice(0, 10),
            end: end.toISOString().slice(0, 10),
            label: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        };
    }

    // year
    const year = now.getFullYear() + offset;
    return {
        start: `${year}-01-01`,
        end: `${year}-12-31`,
        label: `${year}`,
    };
}

// ── Component ───────────────────────────────────────────────────────────────

export default function ChatInsights({ userId }: ChatInsightsProps) {
    const [period, setPeriod] = useState<Period>('month');
    const [offset, setOffset] = useState(0);
    const [summaries, setSummaries] = useState<DailySummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const dateRange = getDateRange(period, offset);

    const fetchSummaries = useCallback(async () => {
        setLoading(true);
        try {
            const data = await conversationService.getDailySummaries(userId, dateRange.start, dateRange.end);
            setSummaries(data);
        } catch {
            setSummaries([]);
        } finally {
            setLoading(false);
        }
    }, [userId, dateRange.start, dateRange.end]);

    useEffect(() => {
        fetchSummaries();
    }, [fetchSummaries]);

    // Aggregate stats
    const totalConversations = summaries.reduce((s, d) => s + d.conversation_count, 0);
    const totalMessages = summaries.reduce((s, d) => s + d.message_count, 0);
    const allTopics = [...new Set(summaries.flatMap(s => s.topics))];
    const dominantMood = summaries.length > 0
        ? summaries.reduce((acc, s) => {
            if (s.mood) acc[s.mood] = (acc[s.mood] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
        : {};
    const topMood = Object.entries(dominantMood).sort((a, b) => b[1] - a[1])[0]?.[0] || 'reflective';

    // ── Calendar heatmap (for month view) ─────────────────────────────────────
    const renderHeatmap = () => {
        if (period !== 'month') return null;

        const start = new Date(dateRange.start + 'T00:00:00');
        const end = new Date(dateRange.end + 'T00:00:00');
        const days: { date: string; count: number }[] = [];
        const summaryMap = new Map(summaries.map(s => [s.date, s.message_count]));

        const current = new Date(start);
        while (current <= end) {
            const dateStr = current.toISOString().slice(0, 10);
            days.push({ date: dateStr, count: summaryMap.get(dateStr) || 0 });
            current.setDate(current.getDate() + 1);
        }

        const maxCount = Math.max(...days.map(d => d.count), 1);

        return (
            <div className="mt-6">
                <h4 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">Activity</h4>
                <div className="flex flex-wrap gap-1">
                    {days.map(({ date, count }) => {
                        const intensity = count / maxCount;
                        return (
                            <div
                                key={date}
                                title={`${formatDate(date)}: ${count} messages`}
                                className="w-4 h-4 rounded-sm transition-all duration-200 hover:scale-125 cursor-default"
                                style={{
                                    backgroundColor: count === 0
                                        ? 'rgba(255,255,255,0.04)'
                                        : `rgba(139, 92, 246, ${0.2 + intensity * 0.8})`,
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Period selector + Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/8">
                    {(['day', 'month', 'year'] as Period[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => { setPeriod(p); setOffset(0); }}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 capitalize ${period === p
                                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30'
                                    : 'text-white/40 hover:text-white/70'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setOffset(o => o - 1)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 transition-all border border-white/6"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-medium text-white/70 min-w-[140px] text-center">
                        {dateRange.label}
                    </span>
                    <button
                        onClick={() => setOffset(o => o + 1)}
                        disabled={offset >= 0}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 transition-all border border-white/6 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Stats overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Summaries', value: summaries.length, icon: <Calendar size={16} /> },
                    { label: 'Conversations', value: totalConversations, icon: <MessageSquare size={16} /> },
                    { label: 'Messages', value: totalMessages, icon: <BarChart3 size={16} /> },
                    {
                        label: 'Dominant Mood',
                        value: MOOD_CONFIG[topMood]?.label || 'Reflective',
                        icon: MOOD_CONFIG[topMood]?.icon || <Moon size={16} />,
                        textClass: MOOD_CONFIG[topMood]?.color,
                    },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="bg-white/4 border border-white/6 rounded-2xl p-4 hover:bg-white/6 transition-colors"
                    >
                        <div className="flex items-center gap-2 text-white/30 mb-2">
                            {stat.icon}
                            <span className="text-[10px] uppercase tracking-wider font-medium">{stat.label}</span>
                        </div>
                        <div className={`text-xl font-bold ${stat.textClass || 'text-white/90'}`}>
                            {stat.value}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Topics cloud */}
            {allTopics.length > 0 && (
                <div>
                    <h4 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">Topics Explored</h4>
                    <div className="flex flex-wrap gap-2">
                        {allTopics.slice(0, 12).map((topic, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium"
                            >
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Calendar heatmap */}
            {renderHeatmap()}

            {/* Summary cards */}
            <div className="space-y-3">
                <h4 className="text-xs font-medium text-white/30 uppercase tracking-wider">Daily Summaries</h4>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    </div>
                ) : summaries.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center">
                            <Calendar size={24} className="text-white/20" />
                        </div>
                        <p className="text-white/40 text-sm mb-1">No summaries yet</p>
                        <p className="text-white/20 text-xs">Chat summaries will appear here after conversations</p>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {summaries.map((summary, idx) => {
                            const isExpanded = expandedId === summary.id;
                            const moodCfg = MOOD_CONFIG[summary.mood || 'reflective'] || MOOD_CONFIG.reflective;

                            return (
                                <motion.div
                                    key={summary.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => setExpandedId(isExpanded ? null : summary.id)}
                                    className="bg-white/4 border border-white/6 rounded-2xl p-4 cursor-pointer hover:bg-white/6 hover:border-violet-500/20 transition-all"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-sm font-semibold text-white/80">
                                                    {formatDate(summary.date)}
                                                </span>
                                                <div className={`flex items-center gap-1 ${moodCfg.color}`}>
                                                    {moodCfg.icon}
                                                    <span className="text-[10px] font-medium uppercase tracking-wider">
                                                        {moodCfg.label}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className={`text-sm text-white/50 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                                                {summary.summary_text}
                                            </p>

                                            {/* Expanded details */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-3 pt-3 border-t border-white/6"
                                                    >
                                                        {summary.topics.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 mb-2">
                                                                {summary.topics.map((t, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-300 text-[10px] font-medium"
                                                                    >
                                                                        {t}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Right stats */}
                                        <div className="flex items-center gap-3 shrink-0 ml-4">
                                            <div className="text-center">
                                                <div className="text-sm font-bold text-white/70">{summary.conversation_count}</div>
                                                <div className="text-[9px] text-white/25 uppercase tracking-wider">Chats</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm font-bold text-white/70">{summary.message_count}</div>
                                                <div className="text-[9px] text-white/25 uppercase tracking-wider">Msgs</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
