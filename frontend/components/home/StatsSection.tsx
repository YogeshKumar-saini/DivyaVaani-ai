'use client';

import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { STATS } from '@/lib/utils/constants';
import { TrendingUp, Users, Globe2, Star } from 'lucide-react';

const iconMap = {
  'Spiritual Answers': TrendingUp,
  'Languages': Globe2,
  'Active Users': Users,
  'User Rating': Star,
};

function AnimatedCounter({ value, duration = 2 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000 });
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (isInView) {
      // Extract numeric value
      const numericValue = value.replace(/[^0-9.]/g, '');
      const target = parseFloat(numericValue);

      if (!isNaN(target)) {
        motionValue.set(target);
      }
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    springValue.on('change', (latest) => {
      if (ref.current) {
        // Format based on original value
        if (value.includes('M')) {
          ref.current.textContent = `${latest.toFixed(1)}M+`;
        } else if (value.includes('K')) {
          ref.current.textContent = `${Math.floor(latest)}K+`;
        } else if (value.includes('+')) {
          ref.current.textContent = `${Math.floor(latest)}+`;
        } else if (value.includes('.')) {
          ref.current.textContent = latest.toFixed(1);
        } else {
          ref.current.textContent = Math.floor(latest).toString();
        }
      }
    });
  }, [springValue, value]);

  return <span ref={ref}>0</span>;
}

export function StatsSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-orange-950/5 to-black pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[150px] animate-pulse-slow" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4">
        {/* Grid of Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {STATS.map((stat, idx) => {
            const Icon = iconMap[stat.label as keyof typeof iconMap];

            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6, type: 'spring', bounce: 0.4 }}
                className="relative group"
              >
                <div className="h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10 transition-all duration-500 hover:border-orange-500/40 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(249,115,22,0.2)]">
                  {/* Icon */}
                  {Icon && (
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 group-hover:scale-110 transition-transform duration-500">
                      <Icon className="h-6 w-6 text-orange-400" />
                    </div>
                  )}

                  {/* Value */}
                  <div className="mb-2">
                    <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-orange-100 to-orange-400 group-hover:from-orange-300 group-hover:to-orange-500 transition-all duration-500">
                      <AnimatedCounter value={stat.value} />
                    </div>
                  </div>

                  {/* Label */}
                  <div className="mb-1 text-base md:text-lg font-bold text-white/90 group-hover:text-orange-200 transition-colors">
                    {stat.label}
                  </div>

                  {/* Description */}
                  <div className="text-xs md:text-sm text-gray-400 font-light group-hover:text-gray-300 transition-colors">
                    {stat.description}
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Border Glow */}
                  <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Divider Line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-16 md:mt-24 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"
        />
      </div>
    </section>
  );
}
