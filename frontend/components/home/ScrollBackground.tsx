'use client';

import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

// Wide cross-fade: each scene fades over `width` of scroll range — no hard cuts
function useFade(p: MotionValue<number>, peak: number, width = 0.35) {
  const half = width / 2;
  const a = clamp01(peak - half);
  const b = clamp01(peak - half * 0.25);
  const c = clamp01(peak + half * 0.25);
  const d = clamp01(peak + half);
  return useTransform(p, [a, b, c, d], [0, 1, 1, 0], { clamp: true });
}

// ── scene definitions ─────────────────────────────────────────────────────────
// All scenes share the same deep-black base; colour only in the radials
const S = {
  // Hero: deep indigo + pink nebula
  s0: 'radial-gradient(ellipse 140% 80% at 10% 10%, rgba(99,102,241,0.30) 0%, transparent 55%), radial-gradient(ellipse 100% 70% at 85% 30%, rgba(236,72,153,0.20) 0%, transparent 55%), radial-gradient(ellipse 120% 90% at 40% 110%, rgba(249,115,22,0.14) 0%, transparent 55%), #04020c',
  // Features: violet + blue
  s1: 'radial-gradient(ellipse 130% 80% at 80% 20%, rgba(124,58,237,0.28) 0%, transparent 60%), radial-gradient(ellipse 110% 70% at 10% 75%, rgba(59,130,246,0.22) 0%, transparent 60%), radial-gradient(ellipse 90% 60% at 55% 110%, rgba(249,115,22,0.12) 0%, transparent 55%), #03020e',
  // Stats / HowItWorks: warm ember
  s2: 'radial-gradient(ellipse 120% 80% at 5% 35%, rgba(249,115,22,0.26) 0%, transparent 58%), radial-gradient(ellipse 110% 70% at 85% 65%, rgba(220,38,38,0.20) 0%, transparent 60%), radial-gradient(ellipse 100% 60% at 55% 5%, rgba(147,51,234,0.18) 0%, transparent 55%), #070308',
  // Languages / Testimonials: midnight blue
  s3: 'radial-gradient(ellipse 130% 80% at 60% 10%, rgba(59,130,246,0.22) 0%, transparent 60%), radial-gradient(ellipse 110% 70% at 10% 80%, rgba(249,115,22,0.18) 0%, transparent 62%), radial-gradient(ellipse 90% 60% at 90% 65%, rgba(147,51,234,0.18) 0%, transparent 60%), #02020c',
  // Newsletter / Footer: deep teal close
  s4: 'radial-gradient(ellipse 140% 80% at 50% 15%, rgba(6,182,212,0.20) 0%, transparent 58%), radial-gradient(ellipse 110% 70% at 15% 85%, rgba(245,158,11,0.18) 0%, transparent 60%), radial-gradient(ellipse 90% 60% at 90% 55%, rgba(99,102,241,0.16) 0%, transparent 60%), #020910',
} as const;

const STARS =
  'radial-gradient(1px 1px at 20px 30px,rgba(255,255,255,0.85),transparent),radial-gradient(1px 1px at 140px 90px,rgba(255,255,255,0.65),transparent),radial-gradient(1px 1px at 40px 170px,rgba(255,255,255,0.75),transparent),radial-gradient(1px 1px at 220px 40px,rgba(255,255,255,0.6),transparent),radial-gradient(1px 1px at 260px 190px,rgba(255,255,255,0.55),transparent),radial-gradient(1px 1px at 380px 55px,rgba(255,255,255,0.5),transparent),radial-gradient(1px 1px at 90px 280px,rgba(255,255,255,0.45),transparent)';

export function ScrollBackground() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Very soft spring — barely visible lag, smooth transitions
  const spring = useSpring(scrollYProgress, {
    stiffness: reduced ? 1000 : 45,
    damping: reduced ? 100 : 22,
    mass: 0.8,
  });
  const p = reduced ? scrollYProgress : spring;

  // Each scene peaks at a fraction of the page, with wide 35% overlap windows
  const o0 = useFade(p, 0.05, 0.40); // hero (top)
  const o1 = useFade(p, 0.28, 0.40); // features
  const o2 = useFade(p, 0.52, 0.40); // stats / how
  const o3 = useFade(p, 0.74, 0.40); // languages
  const o4 = useFade(p, 0.96, 0.30); // footer

  // Gentle parallax orb that drifts diagonally while scrolling
  const orbX = useTransform(p, [0, 1], reduced ? [0, 0] : [-180, 180]);
  const orbY = useTransform(p, [0, 1], reduced ? [0, 0] : [60, -60]);
  // Vignette darkens slightly as user scrolls deep
  const vigOpacity = useTransform(p, [0, 1], [0.55, 0.72], { clamp: true });

  return (
    <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
      {/* ── Base coat: always-on deep black ── */}
      <div className="absolute inset-0 bg-[#03020c]" />

      {/* ── Scene layers: wide cross-fades, no hard cuts ── */}
      <motion.div className="absolute inset-0 will-change-transform" style={{ opacity: o0, backgroundImage: S.s0 }} />
      <motion.div className="absolute inset-0 will-change-transform" style={{ opacity: o1, backgroundImage: S.s1 }} />
      <motion.div className="absolute inset-0 will-change-transform" style={{ opacity: o2, backgroundImage: S.s2 }} />
      <motion.div className="absolute inset-0 will-change-transform" style={{ opacity: o3, backgroundImage: S.s3 }} />
      <motion.div className="absolute inset-0 will-change-transform" style={{ opacity: o4, backgroundImage: S.s4 }} />

      {/* ── Starfield ── */}
      <div
        className="absolute inset-0 opacity-[0.22] mix-blend-screen"
        style={{ backgroundImage: STARS, backgroundSize: '320px 320px' }}
      />

      {/* ── Animated orb: drifts as you scroll ── */}
      <motion.div
        className="absolute rounded-full blur-[160px] mix-blend-screen will-change-transform"
        style={{
          width: 900,
          height: 900,
          left: '50%',
          top: '40%',
          translateX: '-50%',
          translateY: '-50%',
          x: orbX,
          y: orbY,
          background: 'radial-gradient(circle, rgba(249,115,22,0.22) 0%, rgba(147,51,234,0.14) 40%, transparent 65%)',
          opacity: 0.6,
        }}
      />

      {/* ── Hue-shifting glow at centre-bottom ── */}
      <div
        className="absolute inset-x-0 bottom-0 h-[50vh] opacity-[0.18]"
        style={{
          background: 'linear-gradient(to top, rgba(6,182,212,0.3) 0%, rgba(99,102,241,0.1) 40%, transparent 80%)',
        }}
      />

      {/* ── Top vignette ── */}
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: vigOpacity,
          background:
            'radial-gradient(ellipse 130% 70% at 50% 0%, transparent 40%, rgba(0,0,0,0.65) 100%)',
        }}
      />

      {/* ── Grain / noise texture for depth ── */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />
    </div>
  );
}


