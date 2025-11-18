'use client';

import { useRouter } from 'next/navigation';
import { SAMPLE_QUESTIONS, ROUTES } from '@/lib/utils/constants';
import { MessageSquare } from 'lucide-react';

interface SampleQuestionsProps {
  onQuestionClick?: (question: string) => void;
}

export function SampleQuestions({ onQuestionClick }: SampleQuestionsProps) {
  const router = useRouter();

  const handleQuestionClick = (question: string) => {
    if (onQuestionClick) {
      onQuestionClick(question);
    } else {
      // Navigate to chat with question as query param
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
    <section className="relative py-24 overflow-hidden">
      {/* ETHEREAL BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/40 via-orange-50/30 to-red-50/20"></div>

      {/* FLUID ANIMATIONS */}
      <div className="absolute inset-0">
        <div className="absolute top-12 right-12 w-72 h-72 rounded-full bg-gradient-to-br from-yellow-200/12 to-orange-200/12 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-16 left-12 w-80 h-80 rounded-full bg-gradient-to-br from-orange-200/8 to-red-200/8 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          {/* INCREDIBLE TITLE */}
          <h2 className="text-5xl md:text-7xl font-bold mb-8">
            <span className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Explore Sample Questions
            </span>
          </h2>

          <div className="relative inline-block">
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium">
              Discover profound wisdom through thoughtfully crafted inquiries. Find inspiration or ask your own unique question.
            </p>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-48 h-2.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-400 rounded-full opacity-70"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SAMPLE_QUESTIONS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleQuestionClick(item.question)}
              className="group relative text-left bg-gradient-to-br from-white/95 via-gray-50/70 to-orange-50/40 backdrop-blur-2xl rounded-2xl p-8 border-2 border-white/60 shadow-xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:-translate-y-3 animate-fade-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* SUBTLE GLOW EFFECT */}
              {/* <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/5 via-orange-200/5 to-red-200/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div> */}

              <div className="flex items-start space-x-4 mb-6 relative z-10">
                {/* MAGICAL ICON CONTAINER */}
                <div className="relative">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${categoryColors[item.category as keyof typeof categoryColors]} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-125 transition-all duration-500 border-2 border-white/50`}>
                    <MessageSquare className="h-6 w-6 text-white drop-shadow-md" />
                  </div>
                  {/* ORBITING PARTICLES */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-70"></div>
                  <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse opacity-80" style={{ animationDelay: '0.7s' }}></div>
                </div>

                <div className="flex-1">
                  <span className="text-sm font-bold text-gray-600 uppercase tracking-wider group-hover:text-orange-600 transition-colors duration-300">
                    {item.category}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed group-hover:text-gray-900 group-hover:font-medium transition-all duration-300 relative z-10">
                {item.question}
              </p>

              {/* BOTTOM DECORATION */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
          ))}
        </div>

        {/* MAGICAL CTA */}
        <div className="text-center mt-20">
          <div className="relative inline-block">
            {/* GLOWING BACKDROP */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-red-400/20 to-yellow-400/20 blur-xl rounded-3xl transform scale-110"></div>

            <button
              onClick={() => router.push(ROUTES.CHAT)}
              className="relative px-16 py-6 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 text-white font-bold text-xl rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-110 hover:translate-y-2 transition-all duration-500 group"
            >
              <span className="flex items-center gap-4">
                📖 Ask Your Own Question
                <svg className="w-8 h-8 group-hover:translate-x-3 transition-transform duration-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              {/* RIPPLE EFFECT */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-red-400/20 rounded-3xl animate-pulse opacity-60"></div>
            </button>

            {/* FALLING STARS EFFECT */}
            <div className="absolute -top-4 -left-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute -bottom-3 -right-4 w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 -left-8 w-1 h-1 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </div>

          {/* ENCHANTING SUBTEXT */}
          <div className="mt-8 p-6 bg-gradient-to-br from-orange-50/80 via-yellow-50/80 to-orange-50/80 backdrop-blur-lg rounded-2xl border border-white/50 shadow-xl max-w-2xl mx-auto">
            <div className="text-lg text-gray-700 font-medium">
              🌟 Your spiritual journey is just one question away. Every inquiry opens doorways to ancient wisdom.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
