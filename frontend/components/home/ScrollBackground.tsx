'use client';

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function useSceneOpacity(progress: MotionValue<number>, start: number, end: number, fade = 0.08) {
  if (start <= 0) {
    const outEnd = clamp01(end + fade);
    return useTransform(progress, [0, end, outEnd], [1, 1, 0], { clamp: true });
  }

  if (end >= 1) {
    const inStart = clamp01(start - fade);
    return useTransform(progress, [inStart, start, 1], [0, 1, 1], { clamp: true });
  }

  const inStart = clamp01(start - fade);
  const outEnd = clamp01(end + fade);
  return useTransform(progress, [inStart, start, end, outEnd], [0, 1, 1, 0], { clamp: true });
}

function useSceneScale(progress: MotionValue<number>, start: number, end: number) {
  const mid = (start + end) / 2;
  return useTransform(progress, [start, mid, end], [1.04, 1, 1.02], { clamp: true });
}

const STARFIELD_BG =
  "radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.8), rgba(0,0,0,0)), radial-gradient(1px 1px at 140px 90px, rgba(255,255,255,0.6), rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 170px, rgba(255,255,255,0.7), rgba(0,0,0,0)), radial-gradient(1px 1px at 220px 40px, rgba(255,255,255,0.55), rgba(0,0,0,0)), radial-gradient(1px 1px at 260px 190px, rgba(255,255,255,0.5), rgba(0,0,0,0))";

const SCENES = {
  deepSpace:
    'radial-gradient(1200px circle at 10% 10%, rgba(99,102,241,0.22), transparent 55%), radial-gradient(900px circle at 80% 30%, rgba(236,72,153,0.16), transparent 60%), radial-gradient(1000px circle at 40% 110%, rgba(249,115,22,0.14), transparent 55%), linear-gradient(180deg, #05030a 0%, #060312 45%, #000000 100%)',
  indigoNebula:
    'radial-gradient(1100px circle at 15% 70%, rgba(124,58,237,0.22), transparent 60%), radial-gradient(900px circle at 90% 30%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(700px circle at 55% 20%, rgba(249,115,22,0.10), transparent 55%), linear-gradient(180deg, #040412 0%, #070624 55%, #02010a 100%)',
  emberGlow:
    'radial-gradient(1000px circle at 10% 35%, rgba(249,115,22,0.22), transparent 58%), radial-gradient(900px circle at 80% 65%, rgba(220,38,38,0.18), transparent 62%), radial-gradient(800px circle at 55% 0%, rgba(147,51,234,0.14), transparent 55%), linear-gradient(180deg, #07030c 0%, #12040a 55%, #000000 100%)',
  calmFinish:
    'radial-gradient(1100px circle at 55% 10%, rgba(59,130,246,0.16), transparent 60%), radial-gradient(900px circle at 15% 80%, rgba(249,115,22,0.14), transparent 62%), radial-gradient(700px circle at 90% 65%, rgba(147,51,234,0.14), transparent 60%), linear-gradient(180deg, #03030a 0%, #040416 60%, #000000 100%)',
} as const;

export function ScrollBackground() {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const springProgress = useSpring(scrollYProgress, {
    stiffness: reducedMotion ? 500 : 70,
    damping: reducedMotion ? 80 : 28,
    mass: 0.6,
  });

  const progress = reducedMotion ? scrollYProgress : springProgress;

  const s0Opacity = useSceneOpacity(progress, 0, 0.22);
  const s1Opacity = useSceneOpacity(progress, 0.18, 0.5);
  const s2Opacity = useSceneOpacity(progress, 0.46, 0.78);
  const s3Opacity = useSceneOpacity(progress, 0.74, 1);

  const s0Scale = useSceneScale(progress, 0, 0.22);
  const s1Scale = useSceneScale(progress, 0.18, 0.5);
  const s2Scale = useSceneScale(progress, 0.46, 0.78);
  const s3Scale = useSceneScale(progress, 0.74, 1);

  const spotlightX = useTransform(progress, (v) => (reducedMotion ? 0 : (v - 0.5) * 400));
  const spotlightY = useTransform(progress, (v) => (reducedMotion ? 0 : (0.5 - v) * 260));
  const spotlightOpacity = useTransform(progress, [0, 0.15, 0.8, 1], [0.2, 0.35, 0.28, 0.22], {
    clamp: true,
  });

  const horizonOpacity = useTransform(progress, [0, 0.5, 1], [0.12, 0.22, 0.35], { clamp: true });

  return (
    <div className="fixed inset-0 -z-50 pointer-events-none">
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{
          opacity: s0Opacity,
          scale: s0Scale,
          backgroundImage: SCENES.deepSpace,
        }}
      />
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{
          opacity: s1Opacity,
          scale: s1Scale,
          backgroundImage: SCENES.indigoNebula,
        }}
      />
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{
          opacity: s2Opacity,
          scale: s2Scale,
          backgroundImage: SCENES.emberGlow,
        }}
      />
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{
          opacity: s3Opacity,
          scale: s3Scale,
          backgroundImage: SCENES.calmFinish,
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.16] mix-blend-screen"
        style={{
          backgroundImage: STARFIELD_BG,
          backgroundSize: '280px 280px',
        }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 h-[950px] w-[950px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px] mix-blend-screen"
        style={{
          x: spotlightX,
          y: spotlightY,
          opacity: spotlightOpacity,
          background:
            'radial-gradient(circle, rgba(249,115,22,0.22) 0%, rgba(147,51,234,0.12) 35%, transparent 65%)',
        }}
      />

      <motion.div
        className="absolute inset-x-0 bottom-0 h-[55vh]"
        style={{
          opacity: horizonOpacity,
          background:
            'linear-gradient(to top, rgba(249,115,22,0.18), rgba(99,102,241,0.06), transparent 70%)',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(1200px circle at 50% 20%, rgba(255,255,255,0.06), transparent 60%), radial-gradient(900px circle at 50% 110%, rgba(0,0,0,0.8), rgba(0,0,0,0))',
        }}
      />
    </div>
  );
}
