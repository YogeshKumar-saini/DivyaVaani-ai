
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Mic } from 'lucide-react';

interface VoiceVisualizerProps {
    state: 'idle' | 'listening' | 'processing' | 'speaking';
    volume: number; // 0 to 1
    onClick?: () => void;
}

const stateConfig = {
  idle: {
    gradient: 'from-white/10 to-white/5',
    borderColor: 'border-white/15',
    glowColor: 'rgba(139, 92, 246, 0.2)',
    outerGlow: 'bg-violet-900/20',
    label: 'Tap to speak',
    sublabel: 'Hold a question in mind',
  },
  listening: {
    gradient: 'from-violet-500 to-indigo-600',
    borderColor: 'border-violet-400/40',
    glowColor: 'rgba(139, 92, 246, 0.6)',
    outerGlow: 'bg-violet-600/20',
    label: 'Listening...',
    sublabel: 'Ask your question',
  },
  processing: {
    gradient: 'from-indigo-500 to-purple-600',
    borderColor: 'border-indigo-400/40',
    glowColor: 'rgba(99, 102, 241, 0.6)',
    outerGlow: 'bg-indigo-600/20',
    label: 'Seeking wisdom...',
    sublabel: 'Consulting ancient teachings',
  },
  speaking: {
    gradient: 'from-emerald-500 to-cyan-600',
    borderColor: 'border-emerald-400/40',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    outerGlow: 'bg-emerald-600/15',
    label: 'Speaking',
    sublabel: 'Wisdom in motion',
  },
};

export function VoiceVisualizer({ state, volume, onClick }: VoiceVisualizerProps) {
    const [visualVolume, setVisualVolume] = useState(0);
    const config = stateConfig[state];

    useEffect(() => {
        setVisualVolume(prev => prev + (volume - prev) * 0.25);
    }, [volume]);

    const orbScale = state === 'listening'
        ? 1 + visualVolume * 0.3
        : state === 'speaking'
            ? 1 + visualVolume * 0.15
            : 1;

    return (
        <div
            className="relative flex items-center justify-center w-56 h-56 md:w-72 md:h-72 cursor-pointer select-none"
            onClick={onClick}
        >

            {/* Outer ambient glow */}
            <motion.div
                animate={{
                    scale: state !== 'idle' ? 1 + visualVolume * 0.6 : 1,
                    opacity: state !== 'idle' ? 0.6 : 0.2,
                }}
                transition={{ duration: 0.15 }}
                className={cn("absolute inset-0 rounded-full blur-3xl", config.outerGlow)}
            />

            {/* Ring 1 - outermost */}
            {(state === 'listening' || state === 'speaking') && (
                <>
                    <motion.div
                        className="absolute rounded-full border border-white/6"
                        animate={{
                            width: `${100 + visualVolume * 40}%`,
                            height: `${100 + visualVolume * 40}%`,
                            opacity: 0.5 - visualVolume * 0.2,
                        }}
                        transition={{ duration: 0.15 }}
                    />
                    {/* Ripple rings */}
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className={cn("absolute rounded-full border", config.borderColor)}
                            initial={{ scale: 1, opacity: 0.4 }}
                            animate={{ scale: 1.8, opacity: 0 }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.6,
                                ease: 'easeOut',
                            }}
                            style={{ width: '100%', height: '100%' }}
                        />
                    ))}
                </>
            )}

            {/* Ring 2 - middle decorative */}
            <motion.div
                animate={{
                    rotate: state === 'processing' ? 360 : 0,
                    scale: state === 'listening' ? 0.85 + visualVolume * 0.1 : 0.85,
                }}
                transition={state === 'processing'
                    ? { rotate: { duration: 4, repeat: Infinity, ease: 'linear' } }
                    : { duration: 0.3 }
                }
                className="absolute w-3/4 h-3/4 rounded-full border border-white/6"
                style={state === 'processing' ? {
                    background: 'conic-gradient(from 0deg, transparent 70%, rgba(99,102,241,0.3) 100%)',
                } : {}}
            />

            {/* Core Orb */}
            <motion.div
                animate={{ scale: orbScale }}
                transition={{ type: 'spring', damping: 8, stiffness: 120 }}
                className={cn(
                    "relative z-10 w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center",
                    "bg-linear-to-br shadow-2xl ring-1",
                    config.gradient,
                    config.borderColor,
                )}
                style={{
                    boxShadow: `0 0 ${30 + visualVolume * 60}px ${config.glowColor}, 0 20px 60px rgba(0,0,0,0.5)`,
                }}
            >
                {/* Inner sheen */}
                <div className="absolute inset-0 rounded-full bg-linear-to-b from-white/20 to-transparent" />

                {/* Icon / State content */}
                <div className="relative z-10">
                    {state === 'idle' && (
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            className="flex items-center justify-center"
                        >
                            <Mic className="w-10 h-10 text-white/60" />
                        </motion.div>
                    )}
                    {state === 'listening' && (
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <Mic className="w-10 h-10 text-white" />
                        </motion.div>
                    )}
                    {state === 'processing' && (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            className="w-10 h-10 rounded-full border-t-2 border-r-2 border-white/70"
                        />
                    )}
                    {state === 'speaking' && (
                        <div className="flex items-end gap-1 h-8">
                            {[0,1,2,3,4].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-1.5 bg-white rounded-full"
                                    animate={{ height: ['30%', '100%', '30%'] }}
                                    transition={{
                                        duration: 0.6,
                                        repeat: Infinity,
                                        delay: i * 0.1,
                                        ease: 'easeInOut',
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* State label — below orb */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={state}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="absolute -bottom-16 text-center w-48"
                >
                    <p className="text-sm font-medium text-white/70 tracking-wide">{config.label}</p>
                    <p className="text-[11px] text-white/30 mt-0.5 font-light">{config.sublabel}</p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

