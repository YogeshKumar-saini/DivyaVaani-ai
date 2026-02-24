'use client';

import { useRouter } from 'next/navigation';
import { SAMPLE_QUESTIONS, ROUTES } from '@/lib/utils/constants';
import { MessageSquare, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface SampleQuestionsProps {
  onQuestionClick?: (question: string) => void;
}

export function SampleQuestions({ onQuestionClick }: SampleQuestionsProps) {
  const router = useRouter();

  const handleQuestionClick = (question: string) => {
    if (onQuestionClick) {
      onQuestionClick(question);
    } else {
      router.push(`${ROUTES.CHAT}?q=${encodeURIComponent(question)}`);
    }
  };

  const categoryColors = {
    Dharma: 'from-orange-400 to-orange-600',
    Karma: 'from-blue-400 to-blue-600',
    Yoga: 'from-purple-400 to-purple-600',
    'Life Guidance': 'from-green-400 to-green-600',
  };

  return (
    <section className="relative py-16 md:py-32 overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-orange-300" />
            <span className="text-sm font-medium text-orange-100/80 uppercase tracking-widest">Start Your Journey</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
          >
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600">Sample Questions</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed font-light"
          >
            Discover profound wisdom through thoughtfully crafted inquiries. Find inspiration or ask your own unique question.
          </motion.p>
        </div>

        <div className="flex overflow-x-auto gap-6 pb-12 pt-4 px-4 -mx-4 sm:mx-0 sm:px-0 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden after:content-[''] after:w-px after:shrink-0">
          {SAMPLE_QUESTIONS.map((item, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuestionClick(item.question)}
              className="group relative text-left bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:border-orange-500/30 transition-all duration-300 h-full flex flex-col shrink-0 w-[85vw] sm:w-[320px] snap-center stretch"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${categoryColors[item.category as keyof typeof categoryColors]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 pt-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-orange-300 transition-colors">
                    {item.category}
                  </span>
                </div>
              </div>

              <p className="text-gray-200 font-medium leading-relaxed group-hover:text-white transition-colors flex-grow">
                {item.question}
              </p>

              {/* Card Shine */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-20"
        >
          <div className="inline-block relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300 rounded-full" />
            <button
              onClick={() => router.push(ROUTES.CHAT)}
              className="relative px-6 py-4 md:px-10 md:py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-full shadow-xl group-hover:scale-105 transition-all duration-300 border border-white/20"
            >
              Ask Your Own Question
            </button>
          </div>
          <p className="mt-6 text-gray-400 text-sm font-medium">
            Your spiritual journey is just one question away.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
