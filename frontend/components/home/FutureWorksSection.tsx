'use client';

import { motion } from 'framer-motion';
import {
  Telescope,
  Smartphone,
  Users,
  Music4,
  BookOpen,
  Brain,
  Globe2,
  Watch,
  Sparkles,
  Wand2,
  Map,
  Mic2,
  ArrowRight,
  Rocket,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface RoadmapItem {
  icon: React.ElementType;
  title: string;
  description: string;
  quarter: string;
  status: 'planned' | 'in-progress' | 'coming-soon';
  color: string;
  glow: string;
  tag?: string;
}

const roadmap: RoadmapItem[] = [
  {
    icon: Smartphone,
    title: 'Mobile App (iOS & Android)',
    description: 'Native app with offline access to wisdom, push notifications for daily mantras, and seamless voice guidance on the go.',
    quarter: 'Q2 2025',
    status: 'in-progress',
    color: 'from-violet-500/20 to-indigo-500/10',
    glow: 'bg-violet-500/20',
    tag: 'In Development',
  },
  {
    icon: Brain,
    title: 'Personalized Spiritual Journeys',
    description: 'AI-curated learning paths tailored to your spiritual goals — from beginner meditation to advanced Vedanta philosophy.',
    quarter: 'Q2 2025',
    status: 'in-progress',
    color: 'from-cyan-500/20 to-blue-500/10',
    glow: 'bg-cyan-500/15',
    tag: 'In Development',
  },
  {
    icon: Users,
    title: 'Community Satsang Circles',
    description: 'Live group meditation sessions and discussion spaces where seekers connect with shared wisdom in real time.',
    quarter: 'Q3 2025',
    status: 'coming-soon',
    color: 'from-emerald-500/20 to-teal-500/10',
    glow: 'bg-emerald-500/15',
    tag: 'Coming Soon',
  },
  {
    icon: Music4,
    title: 'Sacred Music & Mantra Generator',
    description: 'AI-composed personalized bhajans, mantras, and shloka recitations in your preferred raag, tempo, and tradition.',
    quarter: 'Q3 2025',
    status: 'coming-soon',
    color: 'from-amber-500/20 to-orange-500/10',
    glow: 'bg-amber-500/15',
    tag: 'Coming Soon',
  },
  {
    icon: BookOpen,
    title: 'Multi-Scripture Cross-Reference',
    description: 'Discover parallels and connections across Bhagavad Gita, Upanishads, Vedas, Bible, Quran, and Buddhist texts side by side.',
    quarter: 'Q3 2025',
    status: 'planned',
    color: 'from-rose-500/20 to-pink-500/10',
    glow: 'bg-rose-500/15',
    tag: 'Planned',
  },
  {
    icon: Globe2,
    title: 'Sanskrit Learning with AI',
    description: 'Conversational AI tutor teaching Devanagari script, Sanskrit grammar, and pronunciation through interactive dialogue.',
    quarter: 'Q4 2025',
    status: 'planned',
    color: 'from-indigo-500/20 to-purple-500/10',
    glow: 'bg-indigo-500/15',
    tag: 'Planned',
  },
  {
    icon: Telescope,
    title: 'AR Meditation Spaces',
    description: 'Augmented reality environments — sacred temples, Himalayan peaks, forest ashrams — for immersive guided meditation.',
    quarter: 'Q4 2025',
    status: 'planned',
    color: 'from-sky-500/20 to-blue-500/10',
    glow: 'bg-sky-500/15',
    tag: 'Planned',
  },
  {
    icon: Watch,
    title: 'Wearable & Smart Device Integration',
    description: 'Mindfulness nudges, breathing guides, and spiritual quotes on Apple Watch, Wear OS, and smart speakers.',
    quarter: '2026',
    status: 'planned',
    color: 'from-violet-500/20 to-fuchsia-500/10',
    glow: 'bg-violet-500/15',
    tag: 'Future',
  },
  {
    icon: Mic2,
    title: 'Live Guided Rituals & Puja AI',
    description: 'Real-time voice-guided havan, puja, and ritual ceremonies with correct mantras, steps, and timing cues.',
    quarter: '2026',
    status: 'planned',
    color: 'from-orange-500/20 to-amber-500/10',
    glow: 'bg-orange-500/15',
    tag: 'Future',
  },
  {
    icon: Map,
    title: 'Visual Philosophy Mind Maps',
    description: 'Interactive knowledge graphs connecting concepts across Advaita, Dvaita, Yoga, Tantra, and Samkhya philosophies.',
    quarter: '2026',
    status: 'planned',
    color: 'from-teal-500/20 to-emerald-500/10',
    glow: 'bg-teal-500/15',
    tag: 'Future',
  },
  {
    icon: Wand2,
    title: 'Dream Journal & Spiritual Analysis',
    description: 'Log dreams and receive AI-powered interpretations through the lens of Jungian psychology and Vedic dream science.',
    quarter: '2026',
    status: 'planned',
    color: 'from-purple-500/20 to-violet-500/10',
    glow: 'bg-purple-500/15',
    tag: 'Future',
  },
  {
    icon: Sparkles,
    title: 'Guru Connect — Teacher Matchmaking',
    description: 'Get matched with verified spiritual teachers, monks, and practitioners for one-on-one virtual satsang sessions.',
    quarter: '2026',
    status: 'planned',
    color: 'from-cyan-500/20 to-indigo-500/10',
    glow: 'bg-cyan-500/15',
    tag: 'Future',
  },
];

const statusConfig = {
  'in-progress': {
    label: 'In Development',
    icon: Rocket,
    className: 'text-cyan-300 border-cyan-400/30 bg-cyan-500/10',
    dot: 'bg-cyan-400 animate-pulse',
  },
  'coming-soon': {
    label: 'Coming Soon',
    icon: Clock,
    className: 'text-amber-300 border-amber-400/30 bg-amber-500/10',
    dot: 'bg-amber-400 animate-pulse',
  },
  'planned': {
    label: 'Planned',
    icon: CheckCircle2,
    className: 'text-white/30 border-white/10 bg-white/3',
    dot: 'bg-white/30',
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.07,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  }),
};

export function FutureWorksSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Section ambient glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-violet-700/8 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-cyan-700/8 blur-[140px] pointer-events-none rounded-full" />

      <div className="section-shell relative z-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/8 px-4 py-1.5 mb-6">
            <Rocket className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-300">Product Roadmap</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            What&apos;s{' '}
            <span className="bg-gradient-to-r from-violet-300 via-cyan-300 to-amber-300 bg-clip-text text-transparent">
              Coming Next
            </span>
          </h2>
          <p className="max-w-xl mx-auto text-[15px] text-white/40 font-light leading-relaxed">
            DivyaVaani is constantly evolving. Here&apos;s a glimpse of features and experiences we&apos;re building to deepen your spiritual journey.
          </p>

          {/* Status legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {(Object.entries(statusConfig) as [keyof typeof statusConfig, typeof statusConfig[keyof typeof statusConfig]][]).map(([, cfg]) => (
              <div key={cfg.label} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium ${cfg.className}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roadmap.map((item, i) => {
            const scfg = statusConfig[item.status];
            return (
              <motion.div
                key={item.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                className="group relative rounded-2xl border border-white/8 bg-slate-950/60 backdrop-blur-xl overflow-hidden hover:border-white/14 transition-all duration-300 hover:-translate-y-0.5"
              >
                {/* Card top shimmer */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Background glow blob */}
                <div className={`absolute -top-10 -right-10 w-40 h-40 ${item.glow} blur-[60px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Gradient tint strip */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-50`} />

                <div className="relative z-10 p-5">
                  {/* Top row: icon + quarter badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <item.icon className="h-5 w-5 text-white/70" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-white/25 uppercase tracking-wider">{item.quarter}</span>
                      <div className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${scfg.className}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${scfg.dot}`} />
                        {item.tag}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-[14px] font-bold text-white mb-2 leading-snug group-hover:text-white/90 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[12px] text-white/35 font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── CTA Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14 relative rounded-2xl border border-white/8 bg-slate-950/60 backdrop-blur-xl overflow-hidden"
        >
          {/* Top shimmer */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
          {/* Glows */}
          <div className="absolute -left-16 top-0 w-40 h-full bg-violet-600/10 blur-[60px]" />
          <div className="absolute -right-16 top-0 w-40 h-full bg-cyan-600/8 blur-[60px]" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-6">
            <div className="text-center sm:text-left">
              <p className="text-[11px] uppercase tracking-widest text-white/25 font-semibold mb-1">Shape the Future</p>
              <h3 className="text-[17px] font-bold text-white">
                Have a feature idea? We&apos;d love to hear it.
              </h3>
              <p className="text-[13px] text-white/35 font-light mt-1">
                Join our community and help us build the next evolution of spiritual AI.
              </p>
            </div>
            <a
              href="/about#contact"
              className="group shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-6 py-3 text-[13px] font-semibold text-white shadow-lg shadow-violet-900/30 transition-all duration-300 whitespace-nowrap"
            >
              Share Feedback
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
