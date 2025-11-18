import { Globe, Mic, BookOpen, Zap, LucideIcon } from 'lucide-react';
import { FEATURES } from '@/lib/utils/constants';

const iconMap: Record<string, LucideIcon> = {
  Globe,
  Mic,
  BookOpen,
  Zap,
};

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative py-22 px-4 lg:px-8 overflow-hidden"
    >
      {/* BACKGROUND BLURRED LIGHTS */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-50 via-yellow-25 to-white opacity-40"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* TITLE */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-600 via-red-500 to-yellow-600 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>

          <div className="relative inline-block">
            <p className="text-base md:text-lg text-gray-700 max-w-xl mx-auto leading-relaxed">
              Experience spiritual wisdom through cutting-edge AI technology and divine guidance
            </p>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full opacity-60"></div>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, i) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap] || Globe;

            return (
              <div
                key={feature.id}
                className="group relative p-6 rounded-2xl
                border border-white/40 shadow-lg
                bg-gradient-to-br from-white/80 to-orange-50/50
                backdrop-blur-lg transition-all duration-300
                hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* ICON */}
                <div className="flex justify-center mb-4">
                  <div className="h-14 w-14 rounded-xl flex items-center justify-center
                  bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500
                  shadow-sm group-hover:shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* TITLE */}
                <h3 className="text-xl font-semibold text-center text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                  {feature.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="text-gray-700 text-center leading-relaxed">
                  {feature.description}
                </p>

                {/* MINI BAR DECOR */}
                <div className="mt-6 flex justify-center">
                  <div className="w-12 h-1 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA SECTION */}
        <div className="text-center mt-12">
          <div className="inline-block px-6 py-4 rounded-xl shadow-lg
          bg-gradient-to-br from-orange-100/30 via-yellow-50/30 to-orange-100/30
          backdrop-blur-sm border border-white/50">
            <p className="text-gray-800 text-lg font-medium mb-4 max-w-lg mx-auto">
              Experience the ancient wisdom that has guided millions through the ages
            </p>

            <button className="px-6 py-2 rounded-lg text-white font-medium
            bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500
            shadow-md hover:shadow-lg hover:scale-105 transition-all">
              <span className="flex items-center gap-2">
                Explore Spiritual Wisdom
                <svg className="w-4 h-4" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
