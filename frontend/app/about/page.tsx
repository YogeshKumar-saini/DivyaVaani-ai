'use client';

import { BookOpen, Globe, Mic, Compass, Users, Sparkles, ShieldCheck, BrainCircuit, Languages } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GrainOverlay } from '@/components/ui/GrainOverlay';

const pillars = [
  {
    icon: Globe,
    title: 'Universal Knowledge Base',
    desc: 'Insights from multiple traditions, presented with a respectful and balanced voice.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20'
  },
  {
    icon: Mic,
    title: 'Natural Voice Experience',
    desc: 'Speak and listen naturally with low-latency interactions designed for focus.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20'
  },
  {
    icon: BookOpen,
    title: 'Scripture-Aware Guidance',
    desc: 'Responses are grounded in context and transparent about supporting wisdom sources.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20'
  },
  {
    icon: Compass,
    title: 'Personal Path Clarity',
    desc: 'Actionable reflections for difficult decisions, values conflicts, and daily practice.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20'
  },
  {
    icon: Users,
    title: 'Inclusive by Design',
    desc: 'Built for seekers from different backgrounds without gatekeeping or dogma.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20'
  },
  {
    icon: Sparkles,
    title: 'Modern Product Craft',
    desc: 'Reliable infrastructure with a calm, premium interface that stays out of your way.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20'
  },
];

const faqs = [
  {
    q: 'Is DivyaVaani tied to one tradition?',
    a: 'No. It is built to respect multiple traditions and highlight common wisdom with contextual nuance.',
  },
  {
    q: 'Does DivyaVaani replace teachers or communities?',
    a: 'No. It is a guide companion, not a substitute for personal discernment or trusted spiritual mentors.',
  },
  {
    q: 'Can I use it in my native language?',
    a: 'Yes. DivyaVaani supports multilingual interaction and language-aware responses.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <GrainOverlay />

      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none" />

      <motion.div
        className="mx-auto max-w-6xl space-y-16 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.section
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-8 md:p-12 backdrop-blur-2xl shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />
          <div className="relative z-10">
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-white/80"
            >
              <Sparkles className="h-3 w-3 text-amber-300" /> About DivyaVaani
            </motion.p>

            <h1 className="mt-6 text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/70 leading-tight tracking-tight">
              Ancient insight, <br />
              <span className="text-white/40 font-serif italic">modern intelligence.</span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg md:text-xl text-white/70 leading-relaxed font-light">
              DivyaVaani transforms timeless wisdom into clear, practical guidance for modern life decisions, emotional balance, and inner growth.
            </p>

            <motion.div
              className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
              variants={containerVariants}
            >
              {[
                "Built for seekers and learners",
                "Trusted AI + contextual retrieval",
                "Calm and distraction-free UX"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white/80 text-sm backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {pillars.map((pillar, i) => (
            <motion.article
              key={pillar.title}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={cn(
                "group rounded-2xl border bg-black/20 p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl relative overflow-hidden",
                pillar.bg
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className={cn("mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border bg-black/40 backdrop-blur-md shadow-lg", pillar.color, pillar.bg)}>
                <pillar.icon className="h-6 w-6" />
              </div>

              <h2 className="text-lg font-bold text-white mb-3 group-hover:text-white/90 transition-colors">{pillar.title}</h2>
              <p className="text-sm text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">{pillar.desc}</p>
            </motion.article>
          ))}
        </motion.section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 rounded-3xl border border-white/10 bg-black/20 p-8 backdrop-blur-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">Core Promise</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-6" />

              <p className="text-white/70 leading-relaxed max-w-4xl text-lg font-light">
                We combine responsible AI with spiritual scholarship to provide guidance that is clear, practical, and compassionate. DivyaVaani is not a replacement for personal discernment or trusted mentors; it is a thoughtful companion for your path.
              </p>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  "12+ supported languages",
                  "Real-time text & voice",
                  "Built for calm & clarity"
                ].map((text, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/80 text-center font-medium hover:bg-white/10 transition-all cursor-default">
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-white/10 bg-black/20 p-8 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="relative z-10 space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" /> Trust & Quality
              </h3>

              <div className="space-y-4">
                {[
                  { icon: ShieldCheck, text: "Safety-conscious answers and transparent limitations.", color: "text-emerald-400" },
                  { icon: BrainCircuit, text: "Reasoned responses with contextual grounding.", color: "text-blue-400" },
                  { icon: Languages, text: "Multilingual support for accessible spiritual guidance.", color: "text-purple-400" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                    <item.icon className={cn("h-5 w-5 shrink-0", item.color)} />
                    <p className="text-sm text-white/70 leading-snug">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <motion.section
          variants={itemVariants}
          className="rounded-3xl border border-white/10 bg-black/20 p-8 md:p-12 backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl font-bold text-white mb-8 relative z-10">Common Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {faqs.map((faq, i) => (
              <article key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors">
                <h3 className="text-white font-semibold text-lg mb-3">{faq.q}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{faq.a}</p>
              </article>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
