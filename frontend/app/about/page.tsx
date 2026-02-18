'use client';

import { BookOpen, Globe, Mic, Compass, Users, Sparkles, ShieldCheck, BrainCircuit, Languages } from 'lucide-react';

const pillars = [
  {
    icon: Globe,
    title: 'Universal Knowledge Base',
    desc: 'Insights from multiple traditions, presented with a respectful and balanced voice.',
  },
  {
    icon: Mic,
    title: 'Natural Voice Experience',
    desc: 'Speak and listen naturally with low-latency interactions designed for focus.',
  },
  {
    icon: BookOpen,
    title: 'Scripture-Aware Guidance',
    desc: 'Responses are grounded in context and transparent about supporting wisdom sources.',
  },
  {
    icon: Compass,
    title: 'Personal Path Clarity',
    desc: 'Actionable reflections for difficult decisions, values conflicts, and daily practice.',
  },
  {
    icon: Users,
    title: 'Inclusive by Design',
    desc: 'Built for seekers from different backgrounds without gatekeeping or dogma.',
  },
  {
    icon: Sparkles,
    title: 'Modern Product Craft',
    desc: 'Reliable infrastructure with a calm, premium interface that stays out of your way.',
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

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="relative overflow-hidden rounded-3xl border border-cyan-200/20 bg-slate-900/55 p-8 md:p-12 backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_45%)]" />
          <div className="relative">
            <p className="inline-flex rounded-full border border-cyan-200/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold tracking-[0.2em] uppercase text-cyan-100">
              About DivyaVaani
            </p>
            <h1 className="mt-5 text-4xl md:text-6xl font-semibold text-slate-50 leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
              Ancient insight, modern intelligence.
            </h1>
            <p className="mt-5 max-w-3xl text-slate-300 text-lg leading-relaxed">
              DivyaVaani transforms timeless wisdom into clear, practical guidance for modern life decisions, emotional balance, and inner growth.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-cyan-200/15 bg-cyan-300/10 px-4 py-3 text-slate-100 text-sm">Built for seekers and learners</div>
              <div className="rounded-xl border border-cyan-200/15 bg-cyan-300/10 px-4 py-3 text-slate-100 text-sm">Trusted AI + contextual retrieval</div>
              <div className="rounded-xl border border-cyan-200/15 bg-cyan-300/10 px-4 py-3 text-slate-100 text-sm">Calm and distraction-free UX</div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-2xl border border-cyan-200/15 bg-slate-900/45 p-6 backdrop-blur-lg hover:border-cyan-200/35 hover:bg-slate-900/70 transition-all"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-200/20 bg-cyan-300/10">
                <pillar.icon className="h-5 w-5 text-cyan-100" />
              </div>
              <h2 className="text-lg font-semibold text-slate-100">{pillar.title}</h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">{pillar.desc}</p>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 rounded-3xl border border-cyan-200/20 bg-slate-900/55 p-8 backdrop-blur-xl">
            <h2 className="text-2xl md:text-3xl text-slate-50" style={{ fontFamily: 'var(--font-playfair)' }}>Core Promise</h2>
            <p className="mt-4 text-slate-300 leading-relaxed max-w-4xl">
              We combine responsible AI with spiritual scholarship to provide guidance that is clear, practical, and compassionate. DivyaVaani is not a replacement for personal discernment or trusted mentors; it is a thoughtful companion for your path.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-cyan-200/15 bg-cyan-300/5 p-4 text-slate-200">12+ supported languages</div>
              <div className="rounded-xl border border-cyan-200/15 bg-cyan-300/5 p-4 text-slate-200">Real-time text and voice guidance</div>
              <div className="rounded-xl border border-cyan-200/15 bg-cyan-300/5 p-4 text-slate-200">Built for calm and clarity</div>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-200/20 bg-slate-900/55 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-xl text-slate-50" style={{ fontFamily: 'var(--font-playfair)' }}>Trust & Quality</h3>
            <div className="rounded-xl border border-cyan-200/15 bg-slate-900/70 p-4">
              <ShieldCheck className="h-5 w-5 text-cyan-200" />
              <p className="mt-2 text-sm text-slate-300">Safety-conscious answers and transparent limitations.</p>
            </div>
            <div className="rounded-xl border border-cyan-200/15 bg-slate-900/70 p-4">
              <BrainCircuit className="h-5 w-5 text-cyan-200" />
              <p className="mt-2 text-sm text-slate-300">Reasoned responses with contextual grounding.</p>
            </div>
            <div className="rounded-xl border border-cyan-200/15 bg-slate-900/70 p-4">
              <Languages className="h-5 w-5 text-cyan-200" />
              <p className="mt-2 text-sm text-slate-300">Multilingual support for accessible spiritual guidance.</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-cyan-200/20 bg-slate-900/55 p-8 backdrop-blur-xl">
          <h2 className="text-2xl md:text-3xl text-slate-50" style={{ fontFamily: 'var(--font-playfair)' }}>Common Questions</h2>
          <div className="mt-6 space-y-4">
            {faqs.map((faq) => (
              <article key={faq.q} className="rounded-2xl border border-cyan-200/15 bg-slate-900/70 p-5">
                <h3 className="text-slate-100 font-semibold">{faq.q}</h3>
                <p className="mt-2 text-slate-300 text-sm leading-relaxed">{faq.a}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
