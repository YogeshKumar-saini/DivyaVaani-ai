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
    <section className="relative py-16 md:py-32 overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center justify-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-4 backdrop-blur-sm">
            <span className="text-sm font-medium text-orange-200 uppercase tracking-widest">Simple Process</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white">
            How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">Works</span>
          </h2>

          <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed font-light">
            Three divine steps to unlock ancient wisdom through modern AI technology.
            Simple, intuitive, and profound.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Animated Connecting SVG Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 transform -translate-y-1/2 z-0 h-24 pointer-events-none opacity-30">
            <svg className="w-full h-full" preserveAspectRatio="none">
              <motion.path
                d="M 50 48 L 950 48"
                fill="none"
                stroke="url(#gradient-line)"
                strokeWidth="2"
                strokeDasharray="8 8"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              <defs>
                <linearGradient id="gradient-line" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ea580c" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {HOW_IT_WORKS_STEPS.map((step, index) => {
            const Icon = iconMap[step.icon as keyof typeof iconMap];
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="relative z-10"
              >
                <div className="group relative bg-gradient-to-br from-indigo-100/15 via-white/10 to-purple-100/15 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 border border-indigo-200/30 transition-all duration-500 hover:-translate-y-3 hover:bg-indigo-100/20 hover:border-indigo-400/50 hover:shadow-[0_20px_50px_rgba(79,70,229,0.12)]">

                  {/* Step Number Badge */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 border border-indigo-300/40 flex items-center justify-center shadow-xl text-white font-bold text-xl z-20 group-hover:scale-120 transition-transform duration-300 ring-4 ring-indigo-200/20">
                      <span className="bg-gradient-to-br from-white to-indigo-100 bg-clip-text text-transparent">{step.number}</span>
                    </div>
                  </div>

                  <div className="pt-10 flex flex-col items-center text-center">
                    <div className="mb-8 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-200/20 via-white/15 to-purple-200/20 border border-indigo-300/40 flex items-center justify-center group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-lg ring-2 ring-indigo-200/20">
                      <Icon className="h-11 w-11 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-100 transition-colors">
                      {step.title}
                    </h3>

                    <p className="text-base text-gray-300 leading-relaxed font-light group-hover:text-gray-200 transition-colors">
                      {step.description}
                    </p>
                  </div>

                  {/* shine effect */}
                  <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
