import { MessageCircle, Brain, Sparkles } from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '@/lib/utils/constants';

const iconMap = {
  MessageCircle,
  Brain,
  Sparkles,
};

export function HowItWorks() {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* DYNAMIC BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-orange-50/25 to-yellow-50/20"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          {/* COMPACT TITLE */}
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>

          <div className="relative inline-block">
            <p className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Three divine steps to unlock ancient wisdom through modern AI technology
            </p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-green-400 via-orange-500 to-yellow-400 rounded-full opacity-60"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* ENHANCED CONNECTING LINES */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 transform -translate-y-1/2 z-0">
            <div className="w-full h-1 bg-gradient-to-r from-orange-300 via-yellow-400 to-red-400 rounded-full opacity-80 shadow-lg"></div>
            {/* Animated dots on the line */}
            <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse shadow-glow"></div>
            <div className="absolute top-1/2 left-2/3 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-orange-500 rounded-full animate-pulse shadow-glow" style={{ animationDelay: '0.5s' }}></div>
          </div>

          {HOW_IT_WORKS_STEPS.map((step, index) => {
            const Icon = iconMap[step.icon as keyof typeof iconMap];
            return (
              <div key={step.number} className="relative z-10" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="group relative bg-gradient-to-br from-white/95 via-orange-50/50 to-yellow-50/40 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2">
                  {/* STEP NUMBER WITH SIMPLIFIED EFFECTS */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      {/* Main circle */}
                      <div className="h-18 w-18 rounded-full bg-gradient-to-br from-green-400 via-orange-500 to-yellow-500 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-transform duration-300">
                        <span className="text-2xl font-bold text-white">{step.number}</span>
                      </div>

                      {/* Simple orbiting icon */}
                      <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-green-500 flex items-center justify-center shadow-md border-2 border-white">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* TITLE */}
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-800 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4 text-center group-hover:scale-105 transition-transform duration-300">
                    {step.title}
                  </h3>

                  {/* DESCRIPTION */}
                  <p className="text-gray-700 text-center leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* COMPACT CTA */}
        <div className="text-center mt-12">
          <div className="inline-block p-6 bg-gradient-to-br from-green-100/40 via-orange-50/40 to-yellow-50/40 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">
            <p className="text-gray-800 text-lg font-medium mb-4 max-w-xl mx-auto">
              Join thousands who have discovered divine wisdom through our spiritual AI companion
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-green-500 via-orange-500 to-yellow-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                <span className="flex items-center gap-2">
                  Begin Your Quest
                  <svg className="w-5 h-5" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>

              <button className="px-6 py-3 bg-white/70 backdrop-blur-sm text-orange-600 font-medium rounded-xl border border-orange-200/50 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
                <span className="flex items-center gap-2">
                  Learn More
                  <svg className="w-5 h-5" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
