'use client';

import { useState } from 'react';
import { BookOpen, Globe, Mic, Compass, Users, Sparkles, ShieldCheck, BrainCircuit, Languages, ArrowRight, ChevronDown, MessageCircle, Cpu, Database, Zap, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const pillars = [
  {
    icon: Globe,
    title: 'Universal Knowledge Base',
    desc: 'Insights from multiple traditions presented with a respectful and balanced voice. No gatekeeping — all wisdom is welcome.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/5 border-blue-500/15',
    glow: 'from-blue-500/5',
  },
  {
    icon: Mic,
    title: 'Natural Voice Experience',
    desc: 'Speak and listen naturally with low-latency interactions designed for focus. A conversation that feels human.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/5 border-violet-500/15',
    glow: 'from-violet-500/5',
  },
  {
    icon: BookOpen,
    title: 'Scripture-Aware Guidance',
    desc: 'Responses grounded in context with transparent citations from wisdom sources — Vedas, Upanishads, and more.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/5 border-amber-500/15',
    glow: 'from-amber-500/5',
  },
  {
    icon: Compass,
    title: 'Personal Path Clarity',
    desc: 'Actionable reflections for decisions, values conflicts, and daily practice. Guidance tailored to your situation.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/5 border-emerald-500/15',
    glow: 'from-emerald-500/5',
  },
  {
    icon: Users,
    title: 'Inclusive by Design',
    desc: 'Built for seekers from all backgrounds — without gatekeeping or dogma. Everyone deserves access to wisdom.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/5 border-pink-500/15',
    glow: 'from-pink-500/5',
  },
  {
    icon: Sparkles,
    title: 'Mindful Product Craft',
    desc: 'A calm, premium interface that respects your focus. No distractions, no noise — just clarity.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/5 border-cyan-500/15',
    glow: 'from-cyan-500/5',
  },
];

const stats = [
  { value: '12+', label: 'Languages Supported', icon: Languages, color: 'text-violet-400' },
  { value: '10K+', label: 'Wisdom Passages', icon: BookOpen, color: 'text-amber-400' },
  { value: '<200ms', label: 'Avg Response Time', icon: Zap, color: 'text-emerald-400' },
  { value: '98%', label: 'Uptime Target', icon: Star, color: 'text-blue-400' },
];

const techStack = [
  { name: 'RAG Pipeline', desc: 'Retrieval-augmented generation for accurate, grounded answers', icon: Database, color: 'text-indigo-400' },
  { name: 'Vector Search', desc: 'Semantic similarity search across thousands of scripture passages', icon: Cpu, color: 'text-cyan-400' },
  { name: 'Voice AI', desc: 'Real-time speech recognition and synthesis for natural conversation', icon: Mic, color: 'text-violet-400' },
  { name: 'Multilingual LLM', desc: 'Language models fine-tuned for spiritual and philosophical context', icon: BrainCircuit, color: 'text-amber-400' },
];

const faqs = [
  {
    q: 'Is DivyaVaani tied to one tradition?',
    a: 'No. DivyaVaani is designed to respect multiple wisdom traditions — from Vedic philosophy and Buddhism to Sufi poetry and universal ethics. It highlights commonalities while preserving contextual nuance of each tradition.',
  },
  {
    q: 'Does DivyaVaani replace spiritual teachers?',
    a: 'No, and it never will. DivyaVaani is a guide companion and research tool, not a substitute for personal discernment, lived experience, or the wisdom of trusted spiritual mentors. Think of it as a knowledgeable study partner.',
  },
  {
    q: 'Can I use it in my native language?',
    a: 'Yes. DivyaVaani supports multilingual interaction and provides language-aware responses. You can ask questions in Hindi, Sanskrit, Tamil, and many other languages, and receive responses in the same language.',
  },
  {
    q: 'How accurate are the answers?',
    a: 'All responses are grounded in verified scripture passages through our RAG pipeline. Each answer includes the source context used for generation, so you can verify citations directly. We continuously improve accuracy through user feedback.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. Conversations are processed to generate responses but are not used for model training without explicit consent. You can delete your history at any time from your profile settings.',
  },
];

const fadeUp: import('framer-motion').Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] }
  })
};

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="visible"
      className="rounded-xl border border-white/8 bg-white/2 overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/4 transition-colors"
      >
        <span className="text-[14px] font-medium text-white/80 pr-4">{q}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-white/30 shrink-0 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="px-5 pb-5 pt-1 border-t border-white/5">
              <p className="text-[13px] text-white/45 leading-relaxed font-light">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen py-4 pb-12 px-4 sm:px-6 lg:px-8 relative">

      {/* Ambient */}
      <div className="fixed top-0 right-0 w-[500px] h-[400px] bg-violet-900/6 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-indigo-900/5 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-5xl space-y-10 relative z-10">

        {/* Hero Section */}
        <motion.section
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-white/7 bg-white/2 p-8 md:p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-violet-500/30 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-br from-violet-600/5 to-transparent pointer-events-none" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase text-white/50 mb-6">
              <Sparkles className="h-3 w-3 text-amber-300" /> About DivyaVaani
            </span>

            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white leading-[1.15] tracking-tight mb-5">
              Ancient insight,<br />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-violet-300 to-indigo-300">modern intelligence.</span>
            </h1>

            <p className="max-w-2xl text-[16px] text-white/50 leading-relaxed font-light mb-8">
              DivyaVaani transforms timeless wisdom from the world&apos;s great spiritual traditions into clear, practical guidance for modern life — whether you&apos;re navigating decisions, seeking emotional balance, or exploring inner growth.
            </p>

            <div className="flex flex-wrap gap-3">
              {["For seekers & learners", "Contextual AI retrieval", "Calm, mindful UX"].map((text, i) => (
                <span key={i} className="flex items-center gap-2 rounded-xl border border-white/7 bg-white/3 px-4 py-2 text-[13px] text-white/55 font-light">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              custom={i + 1}
              initial="hidden"
              animate="visible"
              className="rounded-2xl border border-white/7 bg-white/2 p-5 flex flex-col items-center text-center group hover:bg-white/4 transition-colors"
            >
              <stat.icon className={cn('h-4 w-4 mb-3', stat.color)} />
              <p className={cn('text-2xl font-bold tracking-tight', stat.color)}>{stat.value}</p>
              <p className="text-[11px] text-white/35 font-light mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Pillars Grid */}
        <div>
          <motion.h2
            variants={fadeUp}
            custom={5}
            initial="hidden"
            animate="visible"
            className="text-[11px] uppercase tracking-[0.2em] text-white/30 font-semibold mb-5"
          >
            Core Pillars
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pillars.map((pillar, i) => (
              <motion.article
                key={pillar.title}
                variants={fadeUp}
                custom={i + 6}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -3 }}
                className={cn(
                  "group rounded-2xl border p-6 transition-all duration-300 hover:shadow-xl relative overflow-hidden",
                  pillar.bg
                )}
              >
                <div className={cn(
                  "absolute inset-0 bg-linear-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                  pillar.glow
                )} />

                <div className={cn(
                  "mb-4 w-10 h-10 rounded-xl border flex items-center justify-center",
                  pillar.bg, pillar.color
                )}>
                  <pillar.icon className="h-5 w-5" />
                </div>

                <h2 className="text-[14px] font-semibold text-white mb-2">{pillar.title}</h2>
                <p className="text-[12px] text-white/45 leading-relaxed font-light">{pillar.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>

        {/* Trust & Promise */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <motion.div
            variants={fadeUp}
            custom={12}
            initial="hidden"
            animate="visible"
            className="lg:col-span-3 rounded-2xl border border-white/7 bg-white/2 p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-violet-600/4 to-indigo-600/4 pointer-events-none" />
            <h2 className="text-2xl font-serif font-bold text-white mb-2 relative z-10">Core Promise</h2>
            <div className="h-0.5 w-16 bg-linear-to-r from-violet-500 to-indigo-500 rounded-full mb-5 relative z-10" />
            <p className="text-[14px] text-white/50 leading-relaxed font-light relative z-10 mb-6">
              We combine responsible AI with spiritual scholarship to provide guidance that is clear, practical, and compassionate.
              DivyaVaani is not a replacement for personal discernment — it is a thoughtful companion for your path.
            </p>
            <div className="grid grid-cols-3 gap-3 relative z-10">
              {["12+ languages", "Text & Voice", "Calm clarity"].map((text, i) => (
                <div key={i} className="rounded-xl border border-white/8 bg-white/4 p-3 text-center text-[12px] text-white/50 font-medium">
                  {text}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={13}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 rounded-2xl border border-white/7 bg-white/2 p-8 space-y-3"
          >
            <h3 className="text-[15px] font-semibold text-white flex items-center gap-2 mb-4">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Trust & Quality
            </h3>
            {[
              { icon: ShieldCheck, text: "Safety-conscious answers with transparent limitations and clear citations.", color: "text-emerald-400" },
              { icon: BrainCircuit, text: "Contextually grounded, reasoned responses backed by scripture passages.", color: "text-blue-400" },
              { icon: Languages, text: "Multilingual support so everyone can access wisdom in their own language.", color: "text-violet-400" },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 p-3.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-colors">
                <item.icon className={cn("h-4 w-4 shrink-0 mt-0.5", item.color)} />
                <p className="text-[12px] text-white/50 leading-relaxed font-light">{item.text}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Technology */}
        <motion.section
          variants={fadeUp}
          custom={14}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-white/7 bg-white/2 p-7"
        >
          <div className="flex items-center gap-2 mb-6">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <h2 className="text-[16px] font-semibold text-white">Powered By</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {techStack.map((tech, i) => (
              <div key={i} className="flex items-start gap-3.5 rounded-xl border border-white/6 bg-white/2 hover:bg-white/5 p-4 transition-colors group">
                <div className={cn('p-2 rounded-lg bg-white/5 shrink-0', tech.color)}>
                  <tech.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white/80">{tech.name}</p>
                  <p className="text-[12px] text-white/35 font-light mt-0.5 leading-relaxed">{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* FAQ - Accordion */}
        <section>
          <motion.div
            variants={fadeUp}
            custom={15}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-3 mb-5"
          >
            <MessageCircle className="h-4 w-4 text-violet-400" />
            <h2 className="text-[16px] font-semibold text-white">Common Questions</h2>
            <span className="text-[11px] text-white/25 font-light">{faqs.length} questions</span>
          </motion.div>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} index={i + 16} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          custom={22}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-violet-500/15 bg-white/2 p-8 md:p-10 relative overflow-hidden text-center"
        >
          <div className="absolute inset-0 bg-linear-to-br from-violet-600/6 via-transparent to-indigo-600/5 pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-violet-500/30 to-transparent" />

          <div className="relative">
            <Sparkles className="h-6 w-6 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
              Begin Your Journey
            </h2>
            <p className="text-[14px] text-white/45 font-light mb-7 max-w-sm mx-auto leading-relaxed">
              Ask your first question, explore ancient wisdom, or simply listen. DivyaVaani is ready when you are.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-[15px] transition-all duration-300 shadow-2xl shadow-violet-900/30 hover:shadow-violet-900/50 hover:scale-[1.03]"
              >
                Start Chatting <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/voice"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl border border-white/12 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white font-medium text-[14px] transition-all duration-200"
              >
                <Mic className="h-4 w-4" /> Try Voice
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
