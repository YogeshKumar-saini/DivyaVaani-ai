'use client';

import { useRouter } from 'next/navigation';
import { Globe, Mic, BookOpen, Zap, LucideIcon } from 'lucide-react';
import { FEATURES, ROUTES } from '@/lib/utils/constants';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const iconMap: Record<string, LucideIcon> = {
  Globe,
  Mic,
  BookOpen,
  Zap,
};

export function FeaturesSection() {
  const router = useRouter();

  return (
    <section id="features" className="relative py-16 sm:py-20">
      <div className="section-shell">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mb-10 space-y-3 text-center sm:mb-14"
        >
          <div className="status-pill mx-auto">Platform capabilities</div>
          <h2 className="section-title">
            Built for reflective <span className="text-gradient">conversations</span>
          </h2>
          <p className="section-subtitle mx-auto">
            Designed to balance speed, spiritual depth, and multi-language accessibility across chat and voice modes.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, idx) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap] || Globe;
            const glowColors = [
              'hover:shadow-[0_0_40px_rgba(6,182,212,0.22)]',
              'hover:shadow-[0_0_40px_rgba(245,158,11,0.22)]',
              'hover:shadow-[0_0_40px_rgba(147,51,234,0.22)]',
              'hover:shadow-[0_0_40px_rgba(16,185,129,0.22)]',
            ];
            const borderColors = [
              'hover:border-cyan-300/40',
              'hover:border-amber-300/40',
              'hover:border-violet-400/40',
              'hover:border-emerald-400/40',
            ];
            const iconColors = [
              'border-cyan-200/30 bg-cyan-300/12 text-cyan-200',
              'border-amber-200/30 bg-amber-300/12 text-amber-200',
              'border-violet-200/30 bg-violet-300/12 text-violet-200',
              'border-emerald-200/30 bg-emerald-300/12 text-emerald-200',
            ];

            return (
              <motion.article
                key={feature.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.07 }}
                whileHover={{ y: -6 }}
                className={`group relative h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 transition-all duration-300 ${glowColors[idx % 4]} ${borderColors[idx % 4]}`}
              >
                {/* Top gradient line */}
                <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className={`mb-4 inline-flex rounded-xl border p-2.5 ${iconColors[idx % 4]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="pt-2 text-sm leading-relaxed text-slate-300/85">{feature.description}</p>
                {/* Hover shimmer */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
              </motion.article>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mt-12 text-center"
        >
          <Button
            size="lg"
            onClick={() => router.push(ROUTES.CHAT || '/chat')}
            className="h-12 rounded-full border border-cyan-200/45 bg-gradient-to-r from-cyan-300 to-amber-200 px-8 text-sm font-semibold text-slate-950"
          >
            Explore the chat experience
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
