'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 28,
    restDelta: 0.001,
  });

  const circumference = 2 * Math.PI * 18; // 2π × r=18 ≈ 113.1

  // strokeDashoffset goes from full circumference (empty) → 0 (full)
  const strokeDashoffset = useTransform(progress, [0, 1], [circumference, 0]);

  // Container fades in after 2% scroll, fades out at 98%
  const containerOpacity = useTransform(
    scrollYProgress,
    [0, 0.03, 0.97, 1],
    [0, 1, 1, 0],
  );

  // Centre dot opacity — appears once scrolling starts
  const dotOpacity = useTransform(progress, [0, 0.06], [0, 1]);

  return (
    <motion.div
      className="fixed bottom-8 right-8 z-50 flex items-center justify-center"
      style={{ opacity: containerOpacity }}
    >
      {/* Glow behind the ring */}
      <div className="absolute h-14 w-14 rounded-full bg-cyan-400/20 blur-[14px] pointer-events-none" />

      <svg
        width="52"
        height="52"
        viewBox="0 0 48 48"
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sp-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#67e8f9" />
            <stop offset="50%"  stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <circle
          cx="24" cy="24" r="18"
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="2.5"
        />

        {/* Progress arc */}
        <motion.circle
          cx="24" cy="24" r="18"
          fill="none"
          stroke="url(#sp-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
        />
      </svg>

      {/* Centre dot */}
      <motion.div
        className="absolute h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_rgba(103,232,249,0.8)]"
        style={{ opacity: dotOpacity }}
      />
    </motion.div>
  );
}
