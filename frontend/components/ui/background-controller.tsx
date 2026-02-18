"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundController = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    const { scrollYProgress } = useScroll();

    // Smooth out the scroll progress
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Dynamic gradient colors based on scroll
    const backgroundGradient = useTransform(
        smoothProgress,
        [0, 0.2, 0.5, 0.8, 1],
        [
            "linear-gradient(to bottom right, #0f172a, #1e1b4b, #312e81)", // Initial deep blue/indigo
            "linear-gradient(to bottom right, #1e1b4b, #4c1d95, #5b21b6)", // Purple transition
            "linear-gradient(to bottom right, #312e81, #1e1b4b, #0f172a)", // Back to deep indigo
            "linear-gradient(to bottom right, #4c1d95, #581c87, #6b21a8)", // Richer purple
            "linear-gradient(to bottom right, #020617, #0f172a, #1e293b)", // Final deep slate
        ]
    );

    // Overlay opacity for depth effect
    const overlayOpacity = useTransform(smoothProgress, [0, 0.5, 1], [0.3, 0.5, 0.7]);

    return (
        <div className={cn("relative min-h-screen w-full overflow-hidden", className)}>
            {/* Fixed Background Layer */}
            <motion.div
                className="fixed inset-0 z-[-1]"
                style={{
                    background: backgroundGradient,
                }}
            />

            {/* Animated Noise Overlay */}
            <div className="fixed inset-0 z-[-1] opacity-20 pointer-events-none mix-blend-overlay">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 animate-noise"></div>
            </div>

            {/* Floating Orbs / Glows */}
            <motion.div
                className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/20 blur-[120px]"
                animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <motion.div
                className="fixed bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/10 blur-[150px]"
                animate={{
                    x: [0, -50, 0],
                    y: [0, -100, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <motion.div
                style={{ opacity: overlayOpacity }}
                className="fixed inset-0 z-[-1] bg-black/10 backdrop-blur-[1px]"
            />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};
