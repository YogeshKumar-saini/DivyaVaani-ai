'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface VoiceVisualizerProps {
    state: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
    volume: number; // 0 to 1
    onClick?: () => void;
    errorMessage?: string;
    languageLabel?: string;
}

export function VoiceVisualizer({ state, volume, onClick, errorMessage, languageLabel }: VoiceVisualizerProps) {
    const [visualVolume, setVisualVolume] = useState(0);

    // Smooth volume interpolation
    useEffect(() => {
        let animationFrameId: number;

        const updateVolume = () => {
            setVisualVolume(prev => {
                const diff = volume - prev;
                // Faster attack, slower decay for more natural voice visualization
                const factor = diff > 0 ? 0.3 : 0.1;
                return prev + diff * factor;
            });
            animationFrameId = requestAnimationFrame(updateVolume);
        };

        updateVolume();
        return () => cancelAnimationFrame(animationFrameId);
    }, [volume]);

    // Determine scale based on state and volume
    const getScale = () => {
        if (state === 'error') return 0.9;
        if (state === 'idle') return 1;
        if (state === 'processing') return 1.05;
        // Map volume (0-1) to an scale multiplier (e.g., up to 40% larger)
        return 1 + (visualVolume * 0.4);
    };

    return (
        <div className="relative flex flex-col items-center justify-center w-full min-h-[170px] sm:min-h-[220px] md:min-h-[260px] px-2">
            {/* The Interactive Orb Container */}
            <div
                className="relative z-50 flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 cursor-pointer group"
                onClick={onClick}
            >
                {/* Outer Glow */}
                <motion.div
                    className={cn(
                        "absolute inset-0 rounded-full blur-2xl transition-all duration-1000",
                        state === 'error' ? "bg-red-500/20" :
                            state === 'idle' ? "bg-white/5 group-hover:bg-white/10" :
                                state === 'listening' ? "bg-violet-500/30" :
                                    state === 'processing' ? "bg-indigo-500/30" :
                                        "bg-emerald-500/30"
                    )}
                    animate={{
                        scale: state === 'speaking' || state === 'listening' ? 1 + visualVolume * 0.5 : 1
                    }}
                />

                {/* The Core Liquid Orb */}
                <motion.div
                    className={cn(
                        "absolute inset-0 shadow-2xl transition-all duration-500",
                        state === 'error' ? "shadow-red-500/30" :
                            state === 'idle' ? "shadow-white/10 group-hover:shadow-white/20" :
                                "shadow-indigo-500/40"
                    )}
                    animate={{
                        scale: getScale(),
                        borderRadius: state === 'listening' || state === 'speaking' || state === 'processing'
                            ? [
                                '40% 60% 70% 30% / 40% 50% 60% 50%',
                                '60% 40% 30% 70% / 60% 30% 70% 40%',
                                '50% 50% 50% 50% / 50% 50% 50% 50%',
                                '40% 60% 70% 30% / 40% 50% 60% 50%'
                            ]
                            : '50%',
                        rotate: state === 'processing' ? [0, 360] :
                            state === 'listening' ? [0, 180, 360] : 0
                    }}
                    transition={{
                        scale: { type: 'spring', damping: 15, stiffness: 200 },
                        borderRadius: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                        rotate: { duration: state === 'processing' ? 2 : 8, repeat: Infinity, ease: 'linear' }
                    }}
                    style={{
                        background: state === 'error'
                            ? 'linear-gradient(135deg, #ef4444, #7f1d1d)'
                            : state === 'idle'
                                ? 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))'
                                : state === 'listening'
                                    ? 'conic-gradient(from 0deg, #8b5cf6, #3b82f6, #ec4899, #8b5cf6)'
                                    : state === 'processing'
                                        ? 'conic-gradient(from 0deg, #4f46e5, #0ea5e9, #4f46e5)'
                                        : 'conic-gradient(from 0deg, #10b981, #06b6d4, #10b981)',
                        backdropFilter: 'blur(10px)',
                        border: state === 'idle' ? '1px solid rgba(255,255,255,0.2)' : 'none'
                    }}
                />

                {/* Inner Glass Sheen */}
                <motion.div
                    className="absolute inset-2 rounded-full pointer-events-none border border-white/20"
                    style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)',
                    }}
                    animate={{
                        scale: state !== 'idle' ? 0.95 : 1,
                    }}
                />

                {/* Center Icon / Feedback */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white z-20">
                    <AnimatePresence mode="wait">
                        {state === 'idle' && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 0.6, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="w-8 h-8 opacity-60"
                            >
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                                </svg>
                            </motion.div>
                        )}

                        {state === 'error' && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="w-8 h-8 text-white"
                            >
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </motion.div>
                        )}

                        {(state === 'listening' || state === 'speaking') && (
                            <motion.div
                                key="active"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 0.9, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="w-10 h-10 flex items-center justify-center gap-1"
                            >
                                {/* Minimal waveform block */}
                                <div className="w-2 h-2 rounded-full bg-white opacity-80" />
                                <div className="w-2 h-2 rounded-full bg-white opacity-80" />
                            </motion.div>
                        )}

                        {state === 'processing' && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 0.8, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="flex items-center justify-center gap-1"
                            >
                                <motion.div
                                    className="w-1.5 h-1.5 bg-white rounded-full"
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                />
                                <motion.div
                                    className="w-1.5 h-1.5 bg-white rounded-full"
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                />
                                <motion.div
                                    className="w-1.5 h-1.5 bg-white rounded-full"
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Status text below the orb in normal flow to avoid overlap on small screens */}
            <div className="mt-3 sm:mt-4 w-full text-center pointer-events-none px-2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={state}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {state === 'error' ? (
                            <div className="px-6 relative z-50">
                                <p className="text-red-400 font-medium text-sm">Microphone Access Error</p>
                                <p className="text-white/50 text-[11px] mt-1 max-w-xs mx-auto">{errorMessage || 'Ensure your browser has granted microphone permissions to this site.'}</p>
                            </div>
                        ) : (
                            <p className="text-white/60 font-medium tracking-widest uppercase text-[10px] md:text-xs">
                                {state === 'idle' ? 'Tap to Connect' :
                                    state === 'listening' ? 'Listening...' :
                                        state === 'processing' ? 'Consulting Wisdom...' :
                                            'Speaking'}
                            </p>
                        )}
                        {/* Language badge */}
                        {languageLabel && state !== 'error' && (
                            <p className="text-[9px] mt-2 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/30 font-medium tracking-wider uppercase">
                                {languageLabel}
                            </p>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
