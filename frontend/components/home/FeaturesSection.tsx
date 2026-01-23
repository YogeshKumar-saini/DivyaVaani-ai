'use client';

import { useRouter } from 'next/navigation';
import { Globe, Mic, BookOpen, Zap, LucideIcon, Sparkles } from 'lucide-react';
import { FEATURES, ROUTES } from '@/lib/utils/constants';
import { Button } from '@/components/ui/button';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { MouseEvent } from 'react';

const iconMap: Record<string, LucideIcon> = {
  Globe,
  Mic,
  BookOpen,
  Zap,
};

const FeatureCard = ({ feature, index }: { feature: typeof FEATURES[number]; index: number }) => {
  const Icon = iconMap[feature.icon as keyof typeof iconMap] || Globe;
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onMouseMove={handleMouseMove}
      className="group relative flex flex-col items-center rounded-3xl border border-indigo-100/30 bg-gradient-to-br from-white/10 via-indigo-50/10 to-purple-50/10 p-8 md:p-10 text-center backdrop-blur-xl shadow-2xl transition-all duration-500 hover:shadow-[0_20px_60px_rgba(249,115,22,0.15)]"
    >
      {/* Hover Gradient Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100 bg-gradient-to-br from-indigo-200/40 via-white/10 to-purple-200/40"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255, 100, 50, 0.15),
              transparent 80%
            )
          `,
        }}
      />

      {/* Icon Container with Glow */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-orange-500/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse" />
        <motion.div
          whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.15 }}
          transition={{ duration: 0.5 }}
          className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.2)] border border-orange-500/30 group-hover:shadow-[0_0_40px_rgba(249,115,22,0.4)]`}
        >
          <Icon className="h-8 w-8 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
        </motion.div>
      </div>

      <h3 className="mb-3 text-xl font-bold text-foreground transition-colors group-hover:text-orange-400">
        {feature.title}
      </h3>

      <p className="text-sm leading-relaxed text-muted-foreground/90 relative z-10 transition-colors group-hover:text-muted-foreground">
        {feature.description}
      </p>

      {/* Decorative Shine */}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 group-hover:ring-orange-500/40 transition-all duration-500" />
      
      {/* Bottom gradient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
};

export function FeaturesSection() {
  const router = useRouter();

  const handleExplore = () => {
    router.push(ROUTES.CHAT || '/chat');
  };

  return (
    <section id="features" className="relative py-16 md:py-32 px-4 overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -z-10 mix-blend-screen animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -z-10 mix-blend-screen animate-pulse-slow delay-1000" />

      <div className="container relative z-10 mx-auto max-w-7xl">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24 text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center space-x-2 bg-indigo-600/15 backdrop-blur-sm border border-indigo-400/30 rounded-full px-4 py-1.5 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-200 tracking-wide uppercase">Why Choose DivyaVaani?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white">
            Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">Features</span>
          </h2>

          <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
            Experience spiritual wisdom through cutting-edge AI technology and divine guidance,
            designed to bring clarity and peace to your daily life.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="mb-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, idx) => (
            <FeatureCard key={feature.id} feature={feature} index={idx} />
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-block relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 rounded-full" />
            <Button
              size="lg"
              onClick={handleExplore}
              className="relative w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-12 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-base sm:text-lg font-bold text-white shadow-xl group-hover:scale-105 transition-all duration-300 border border-white/20 whitespace-normal"
            >
              Explore Spiritual Wisdom
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
