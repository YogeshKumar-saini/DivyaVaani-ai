import { useEffect, useRef, useState } from 'react';

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

export function useAudioAnalyzer(stream: MediaStream | null, isRecording: boolean) {
    const [volume, setVolume] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const requestRef = useRef<number | null>(null);

    useEffect(() => {
        if (isRecording && stream) {
            if (!audioContextRef.current) {
                const AudioCtx = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
                if (AudioCtx) {
                    audioContextRef.current = new AudioCtx();
                }
            }

            const ctx = audioContextRef.current;
            if (!ctx) return;

            analyserRef.current = ctx.createAnalyser();
            analyserRef.current.fftSize = 256;

            sourceRef.current = ctx.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);

            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVolume = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);

                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                setVolume(Math.min(average / 128, 1));

                requestRef.current = requestAnimationFrame(updateVolume);
            };

            updateVolume();
        } else {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            setVolume(0);

            // Disconnect the source but keep the AudioContext alive for reuse
            if (sourceRef.current) {
                try { sourceRef.current.disconnect(); } catch { /* already disconnected */ }
                sourceRef.current = null;
            }
            analyserRef.current = null;
        }

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isRecording, stream]);

    return volume;
}
