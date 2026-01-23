'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/utils/constants';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, ArrowRight, PlayCircle } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

const TypingDemo = () => {
  const [text, setText] = useState('');
  const fullText = "What is the meaning of Dharma in my daily life?";
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (isTyping) {
      if (text.length < fullText.length) {
        const timeout = setTimeout(() => {
          setText(fullText.slice(0, text.length + 1));
        }, 80);
        return () => clearTimeout(timeout);
      } else {
        setIsTyping(false);
      }
    }
  }, [text, isTyping]);

  return (
    <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-3xl relative overflow-hidden group hover:border-indigo-200 transition-colors duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/30 via-white/10 to-purple-200/30 pointer-events-none" />

      <div className="flex items-center space-x-2 mb-8 relative z-10">
        <div className="w-3 h-3 rounded-full bg-red-400/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-400/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
        <div className="w-3 h-3 rounded-full bg-green-400/80 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
      </div>

      <div className="space-y-8 relative z-10">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center text-lg font-bold text-orange-700 shrink-0 shadow-xl">
            You
          </div>
          <div className="bg-white/10 rounded-2xl rounded-tl-none px-5 py-3 text-sm md:text-base text-white/90 backdrop-blur-md border border-white/5 font-medium tracking-wide">
            {text}<span className="animate-pulse text-orange-400">|</span>
          </div>
        </div>

        {!isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-start space-x-4"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shrink-0 border border-white/10 shadow-[0_0_15px_rgba(249,115,22,0.6)]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border border-orange-500/20 rounded-2xl rounded-tr-none px-5 py-4 text-sm md:text-base text-gray-100 leading-relaxed backdrop-blur-md shadow-inner">
              <span className="text-orange-200 font-semibold block mb-1">DivyaVaani Analysis:</span>
              Dharma is your essential nature and righteous duty. In daily life, it means acting with integrity, compassion, and aligning your actions with the greater good of all beings.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export function HeroSection() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const handleStartChat = () => {
    router.push(ROUTES.CHAT || '/chat');
  };

  const handleLearnMore = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={containerRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Video Background Restored */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-black/40 z-10" />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-110"
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black z-20" />
      </motion.div>

      <motion.div
        style={{ y, opacity }}
        className="container relative z-20 px-4 pt-20 grid lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-80px)]"
      >
        {/* Text Content */}
        <div className="text-center lg:text-left space-y-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 py-1.5 md:px-5 md:py-2 mb-4 md:mb-6 shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:bg-white/10 transition-colors cursor-default"
          >
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-orange-400 animate-pulse" />
            <span className="text-orange-100 text-xs md:text-sm font-medium tracking-wide uppercase">Next Gen Spiritual AI</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[1.05]"
            >
              Wisdom of <br />
              <span className="text-white">the Ages,</span>
            </motion.h1>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-200 to-orange-400 animate-gradient-x pb-2">
                Powered by AI
              </span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-gray-300/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light tracking-wide"
          >
            DivyaVaani unifies knowledge from all major spiritual traditions to provide you with profound, personalized guidance on your life&apos;s journey.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 w-full sm:w-auto"
          >
            <Button
              size="lg"
              onClick={handleStartChat}
              className="h-14 sm:h-16 px-8 sm:px-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:scale-110 active:scale-95 transition-all duration-300 font-bold text-base sm:text-lg shadow-[0_0_40px_rgba(79,70,229,0.5)] hover:shadow-[0_0_80px_rgba(79,70,229,0.7)] border-none w-full sm:w-auto overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-300 via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700" />
              <span className="relative z-10 flex items-center justify-center">
                Start Journey <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleLearnMore}
              className="h-14 sm:h-16 px-8 sm:px-10 rounded-full bg-indigo-950/30 border-indigo-300/40 text-white hover:bg-indigo-900/50 hover:border-indigo-300/70 hover:scale-105 active:scale-95 backdrop-blur-xl w-full sm:w-auto font-medium text-base sm:text-lg transition-all duration-300 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <PlayCircle className="mr-2 w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" /> 
              <span className="relative z-10">How it Works</span>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-y-4 gap-x-6 sm:gap-10 text-white/40 text-sm font-medium tracking-widest uppercase"
          >
            <div className="flex items-center gap-2">
              <span className="block text-xl font-bold text-white">1M+</span> Answers
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="block text-xl font-bold text-white">12+</span> Languages
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="block text-xl font-bold text-white">4.9</span> Rating
            </div>
          </motion.div>
        </div>

        {/* Visual / Demo */}
        <motion.div
          initial={{ opacity: 0, x: 50, rotate: 5 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 1.2, delay: 0.6, type: "spring", bounce: 0.3 }}
          className="hidden lg:flex justify-end relative perspective-1000"
        >
          {/* Abstract Glow Behind Card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-indigo-500/25 to-purple-500/20 rounded-full blur-[100px] -z-10 animate-pulse-slow" />

          <div className="transform transition-transform hover:scale-[1.02] duration-500 hover:-rotate-1">
            <TypingDemo />
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black via-black/50 to-transparent z-20 pointer-events-none" />
    </div>
  );
}
