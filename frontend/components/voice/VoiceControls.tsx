
'use client';

import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Duplicate interface to avoid circular dependency if VoiceChat imports VoiceControls
interface Message {
    id: string;
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
    audioUrl?: string;
    transcription?: string;
    duration?: number;
}

interface VoiceControlsProps {
    currentMessage: Message | null;
    isPlaying: boolean;
    isMuted: boolean;
    volume: number;
    onTogglePlayback: () => void;
    onReset: () => void;
    onMuteToggle: () => void;
    onVolumeChange: (val: number) => void;
    onClose?: () => void;
}

export function VoiceControls({
    currentMessage,
    isPlaying,
    isMuted,
    volume,
    onTogglePlayback,
    onReset,
    onMuteToggle,
    onVolumeChange,
    onClose
}: VoiceControlsProps) {

    const formatTime = (seconds: number) => {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.ceil(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const hasMessage = !!currentMessage;

    return (
        <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            className="w-full max-w-xl mx-auto"
        >
            <div className="relative rounded-2xl bg-slate-950/70 backdrop-blur-2xl border border-white/8 shadow-2xl shadow-black/40 overflow-hidden">
                {/* Subtle violet top accent */}
                <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-violet-500/40 to-transparent" />

                <div className="flex items-center gap-4 px-5 py-4">

                    {/* Reset button */}
                    <button
                        onClick={onReset}
                        disabled={!hasMessage}
                        className={cn(
                            'h-9 w-9 flex items-center justify-center rounded-xl transition-all duration-200',
                            hasMessage
                                ? 'text-white/50 hover:text-white/90 hover:bg-white/8'
                                : 'text-white/20 cursor-not-allowed'
                        )}
                        title="Restart"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>

                    {/* Play / Pause */}
                    <button
                        onClick={onTogglePlayback}
                        disabled={!hasMessage}
                        className={cn(
                            'h-11 w-11 flex items-center justify-center rounded-xl transition-all duration-300 shadow-lg',
                            hasMessage
                                ? isPlaying
                                    ? 'bg-white text-slate-950 hover:bg-white/90 shadow-white/10'
                                    : 'bg-linear-to-br from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-violet-900/30'
                                : 'bg-white/5 text-white/20 cursor-not-allowed'
                        )}
                        title={isPlaying ? 'Pause' : 'Play'}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={isPlaying ? 'pause' : 'play'}
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.7, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                {isPlaying
                                    ? <Pause className="h-4 w-4 fill-current" />
                                    : <Play className="h-4 w-4 fill-current ml-0.5" />
                                }
                            </motion.div>
                        </AnimatePresence>
                    </button>

                    {/* Status / time */}
                    <div className="flex flex-col min-w-14">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={isPlaying ? 'playing' : 'ready'}
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                transition={{ duration: 0.2 }}
                                className={cn(
                                    'text-[10px] uppercase font-bold tracking-wider',
                                    isPlaying ? 'text-violet-400' : 'text-white/30'
                                )}
                            >
                                {isPlaying ? 'Playing' : hasMessage ? 'Ready' : 'Idle'}
                            </motion.span>
                        </AnimatePresence>
                        <span className="text-[12px] font-mono text-white/60 tabular-nums">
                            {hasMessage && isPlaying
                                ? formatTime(currentMessage?.duration ?? 0)
                                : formatTime(0)
                            }
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="h-8 w-px bg-white/8 mx-1 hidden sm:block" />

                    {/* Volume */}
                    <div className="hidden sm:flex items-center gap-3 flex-1 min-w-0">
                        <button
                            onClick={onMuteToggle}
                            className="text-white/35 hover:text-white/80 transition-colors duration-200 shrink-0"
                            title={isMuted ? 'Unmute' : 'Mute'}
                        >
                            {isMuted
                                ? <VolumeX className="h-4 w-4 text-red-400/70" />
                                : <Volume2 className="h-4 w-4" />
                            }
                        </button>
                        <div className="flex-1 min-w-0">
                            <Slider
                                value={[isMuted ? 0 : volume]}
                                min={0}
                                max={100}
                                step={1}
                                onValueChange={(val) => onVolumeChange(val[0])}
                                className="cursor-pointer"
                            />
                        </div>
                        <span className="text-[11px] font-mono text-white/25 w-8 text-right shrink-0">
                            {isMuted ? '0' : volume}
                        </span>
                    </div>

                    {/* Close */}
                    {onClose && (
                        <>
                            <div className="h-8 w-px bg-white/8 ml-1 shrink-0" />
                            <button
                                onClick={onClose}
                                className="h-9 w-9 flex items-center justify-center rounded-xl text-white/30 hover:text-red-400/80 hover:bg-red-500/10 transition-all duration-200 shrink-0"
                                title="Close"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>

                {/* Playing progress shimmer */}
                {isPlaying && (
                    <div className="h-0.5 w-full bg-white/5 overflow-hidden">
                        <motion.div
                            className="h-full bg-linear-to-r from-violet-600 via-indigo-400 to-violet-600"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            style={{ width: '50%' }}
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
}
