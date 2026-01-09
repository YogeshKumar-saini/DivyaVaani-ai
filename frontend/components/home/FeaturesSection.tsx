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
      onMouseMove={handleMouseMove}
      className="group relative flex flex-col items-center rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md transition-all duration-500 hover:-translate-y-2"
    >
      {/* Hover Gradient Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
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
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-orange-500/10 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-[0_0_15px_rgba(255,165,0,0.1)] border border-primary/20`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>

      <h3 className="mb-3 text-xl font-bold text-foreground transition-colors group-hover:text-primary">
        {feature.title}
      </h3>

      <p className="text-sm leading-relaxed text-muted-foreground/90 relative z-10">
        {feature.description}
      </p>

      {/* Decorative Shine */}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 group-hover:ring-primary/30 transition-all duration-500" />
    </motion.div>
  );
};

export function FeaturesSection() {
  const router = useRouter();

  const handleExplore = () => {
    router.push(ROUTES.CHAT || '/chat');
  };

  return (
    <section id="features" className="relative py-32 px-4 overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] -z-10 mix-blend-screen animate-pulse-slow" />
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
          <div className="inline-flex items-center justify-center space-x-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-1.5 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary tracking-wide uppercase">Why Choose DivyaVaani?</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
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
              className="relative h-16 px-12 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-lg font-bold text-white shadow-xl group-hover:scale-105 transition-all duration-300 border border-white/20"
            >
              Explore Spiritual Wisdom
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
