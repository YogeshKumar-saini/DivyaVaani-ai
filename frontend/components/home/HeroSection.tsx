'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/utils/constants';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ChevronDown, MessageCircle, Mic, Globe2, Shield } from 'lucide-react';
import { useMemo } from 'react';

const heroStats = [
  { label: 'Guided Answers', value: '1M+' },
  { label: 'Languages', value: '12+' },
  { label: 'Community Rating', value: '4.9★' },
  { label: 'Active Seekers', value: '50K+' },
];

const FLOAT_PARTICLES = [
  { top: '12%', left: '6%', size: 'h-1.5 w-1.5', delay: 0, dur: 7 },
  { top: '25%', left: '90%', size: 'h-1 w-1', delay: 1.2, dur: 5.5 },
  { top: '72%', left: '4%', size: 'h-2 w-2', delay: 0.6, dur: 9 },
  { top: '80%', left: '88%', size: 'h-1.5 w-1.5', delay: 2, dur: 6.5 },
  { top: '50%', left: '96%', size: 'h-1 w-1', delay: 0.3, dur: 8 },
  { top: '38%', left: '2%', size: 'h-1 w-1', delay: 1.8, dur: 7.5 },
];

export function HeroSection() {
  const router = useRouter();

  const quickQuestions = useMemo(
    () => [
      { q: 'How can I stay calm when life feels uncertain?', icon: MessageCircle },
      { q: 'What does karma mean in daily choices?', icon: Globe2 },
      { q: 'Give me a morning reflection for gratitude.', icon: Mic },
    ],
    []
  );

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* ── Video background ── */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover scale-105"
          src="/background.mp4"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg,rgba(6,182,212,0.22) 0%,rgba(245,158,11,0.12) 55%,transparent 100%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-black/90 to-transparent" />
      </div>

      {/* Floating particles */}
      {FLOAT_PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className={`absolute ${p.size} rounded-full bg-cyan-300/60 blur-[1px] pointer-events-none`}
          style={{ top: p.top, left: p.left }}
          animate={{ y: [0, -18, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: p.dur, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* Decorative glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-40 left-1/2 h-128 w-240 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-amber-300/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-violet-400/10 blur-[120px]" />
      </div>

      {/* ── Main content ── */}
      <div className="section-shell flex flex-1 flex-col justify-center gap-14 py-32 lg:flex-row lg:items-center lg:gap-12">

        {/* Left column */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="flex-1 space-y-8 lg:max-w-[54%]"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="status-pill w-fit"
          >
            <Sparkles className="mr-2 h-3.5 w-3.5 animate-pulse" />
            Spiritual guidance · Modern interface
          </motion.div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Seek clarity with
              <span className="text-gradient mt-1 block">AI grounded in<br />timeless wisdom.</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-300/90 sm:text-lg">
              DivyaVaani helps you ask difficult questions and receive thoughtful answers
              rooted in spiritual texts — contextualised for your everyday life.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => router.push(ROUTES.CHAT || '/chat')}
              className="group h-[3.25rem] rounded-full border border-cyan-200/50 bg-linear-to-r from-cyan-300 to-amber-200 px-8 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.35)] transition-all hover:shadow-[0_0_50px_rgba(6,182,212,0.55)] hover:scale-[1.03]"
            >
              Start a Conversation
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="h-[3.25rem] rounded-full border-white/20 bg-white/5 px-8 text-sm text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/35"
            >
              Explore Features
            </Button>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-white/10 pt-6"
          >
            {heroStats.map((item) => (
              <div key={item.label} className="text-center sm:text-left">
                <p className="text-2xl font-bold text-white">{item.value}</p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-2 text-xs text-slate-400"
          >
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            100% private · No data sold · Open-source friendly
          </motion.div>
        </motion.div>

        {/* Right column — card */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="w-full lg:max-w-[42%]"
        >
          <div className="relative rounded-3xl border border-white/10 bg-white/5 p-1 backdrop-blur-2xl shadow-[0_32px_80px_rgba(2,6,23,0.55)]">
            {/* Coloured glow ring behind card */}
            <div className="absolute -inset-px rounded-3xl bg-linear-to-br from-cyan-400/20 via-transparent to-amber-300/15 opacity-60 blur-sm pointer-events-none" />

            <div className="relative rounded-[1.4rem] border border-white/8 bg-black/30 p-5 sm:p-6">
              {/* Card header */}
              <div className="mb-5 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/80">
                  Live Prompt Ideas
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 border border-emerald-400/25">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Available now
                </span>
              </div>

              {/* Questions */}
              <div className="space-y-3">
                {quickQuestions.map(({ q, icon: Icon }, index) => (
                  <motion.button
                    key={q}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.015, x: 4 }}
                    onClick={() => router.push(`${ROUTES.CHAT || '/chat'}?q=${encodeURIComponent(q)}`)}
                    className="w-full rounded-2xl border border-white/8 bg-white/5 p-4 text-left transition-all duration-200 hover:border-cyan-300/30 hover:bg-white/8 hover:shadow-[0_8px_24px_rgba(6,182,212,0.15)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0 rounded-xl border border-cyan-200/30 bg-cyan-300/12 p-2 text-cyan-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-sm leading-relaxed text-slate-200">{q}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Tip */}
              <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/8 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/70">Tip</p>
                <p className="pt-1 text-sm text-amber-50/90">
                  Ask short, specific questions first — then follow up to go deeper.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll down indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
        aria-label="Scroll down"
      >
        <span className="text-[10px] uppercase tracking-[0.2em]">Explore</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.button>
    </section>
  );
}
