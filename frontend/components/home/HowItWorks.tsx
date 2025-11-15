import { MessageCircle, Brain, Sparkles } from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '@/lib/utils/constants';

const iconMap = {
  MessageCircle,
  Brain,
  Sparkles,
};

export function HowItWorks() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Three simple steps to receive divine guidance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Lines (hidden on mobile) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-orange-300 via-orange-400 to-orange-300 transform -translate-y-1/2 z-0"></div>

          {HOW_IT_WORKS_STEPS.map((step, idx) => {
            const Icon = iconMap[step.icon as keyof typeof iconMap];
            return (
              <div key={step.number} className="relative z-10">
                <div className="bg-white rounded-2xl p-8 border-2 border-orange-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  {/* Step Number */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center shadow-lg">
                        <span className="text-3xl font-bold text-white">{step.number}</span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full bg-white border-2 border-orange-400 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
