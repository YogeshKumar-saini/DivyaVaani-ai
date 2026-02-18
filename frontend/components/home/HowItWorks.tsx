'use client';

import { MessageCircle, Brain, Sparkles } from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '@/lib/utils/constants';
import { motion } from 'framer-motion';

const iconMap = {
  MessageCircle,
  Brain,
  Sparkles,
};

export function HowItWorks() {
  return (
    <section className="relative py-16 sm:py-20">
      <div className="section-shell">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mb-10 space-y-3 text-center sm:mb-14"
        >
          <div className="status-pill mx-auto">How it works</div>
          <h2 className="section-title">
            From question to <span className="text-gradient">clarity in 3 steps</span>
          </h2>
          <p className="section-subtitle mx-auto">
            Ask naturally, let the model reason over spiritual context, then receive practical and grounded guidance.
          </p>
        </motion.div>

        {/* Connecting line (desktop) */}
        <div className="relative">
          <div className="absolute top-[3.2rem] left-0 right-0 hidden md:flex items-center justify-center px-[12%] pointer-events-none">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {HOW_IT_WORKS_STEPS.map((step, index) => {
              const Icon = iconMap[step.icon as keyof typeof iconMap];
              return (
                <motion.article
                  key={step.number}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group relative h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 transition-all duration-300 hover:border-cyan-300/35 hover:shadow-[0_0_40px_rgba(6,182,212,0.18)]"
                >
                  {/* Step number badge */}
                  <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border border-cyan-200/30 bg-cyan-300/10 text-[10px] font-bold text-cyan-300">
                    {step.number}
                  </div>
                  {/* Icon with ring */}
                  <div className="relative mb-5 inline-flex">
                    <div className="absolute inset-0 rounded-xl bg-cyan-300/20 blur-[10px]" />
                    <div className="relative rounded-xl border border-cyan-200/30 bg-cyan-300/12 p-3 text-cyan-200">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  <p className="pt-2 text-sm leading-relaxed text-slate-300/85">{step.description}</p>
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
