
'use client';

import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Volume2, VolumeX, X, Headphones } from 'lucide-react';
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
    availableVoices?: string[];
    selectedVoice?: string;
    autoListen?: boolean;
    onTogglePlayback: () => void;
    onReset: () => void;
    onMuteToggle: () => void;
    onVolumeChange: (val: number) => void;
    onVoiceChange?: (voice: string) => void;
    onAutoListenToggle?: () => void;
    onClose?: () => void;
}

export function VoiceControls({
    currentMessage,
    isPlaying,
    isMuted,
    volume,
    availableVoices = [],
    selectedVoice = 'default',
    autoListen,
    onTogglePlayback,
    onReset,
    onMuteToggle,
    onVolumeChange,
    onVoiceChange,
    onAutoListenToggle,
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

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-4">

                    {/* Reset button */}
                    <button
                        onClick={onReset}
                        disabled={!hasMessage}
                        className={cn(
                            'h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl transition-all duration-200',
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
                            'h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center rounded-xl transition-all duration-300 shadow-lg',
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
                    <div className="flex flex-col min-w-12 sm:min-w-14">
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

                    {/* Volume */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-[150px]">
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

                    {/* Voice selector */}
                    {onVoiceChange && (
                        <select
                            id="voice-select"
                            value={selectedVoice}
                            onChange={(e) => onVoiceChange(e.target.value)}
                            className="h-9 min-w-[120px] sm:min-w-[170px] rounded-xl border border-white/10 bg-slate-900/70 px-2 text-xs text-white/85 outline-none focus:ring-2 focus:ring-violet-500/40 shrink-0"
                            title="Select TTS voice"
                        >
                            {availableVoices.map((voice) => (
                                <option key={voice} value={voice}>
                                    {voice}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Auto-Listen Toggle */}
                    {onAutoListenToggle && (
                        <button
                            onClick={onAutoListenToggle}
                            className={cn(
                                'h-9 px-2.5 sm:px-3 flex items-center justify-center gap-1.5 rounded-xl transition-all duration-200 shrink-0',
                                autoListen
                                    ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                                    : 'text-white/50 bg-white/5 hover:text-white/70 hover:bg-white/10'
                            )}
                            title={autoListen ? 'Auto-listen ON (tap to turn off)' : 'Auto-listen OFF (tap to turn on)'}
                        >
                            <Headphones className="h-4 w-4" />
                            <span className="text-[11px] font-medium">Auto</span>
                        </button>
                    )}

                    {/* Close */}
                    {onClose && (
                        <>
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
