'use client';

import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { SampleQuestions } from '@/components/home/SampleQuestions';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* DIVINE BACKGROUND DECORATIONS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Floating Om Symbols */}
        <div className="absolute top-20 left-10 text-orange-300/20 text-8xl animate-pulse" style={{ animationDelay: '0s' }}>
          ॐ
        </div>
        <div className="absolute top-40 right-16 text-yellow-300/15 text-6xl animate-pulse" style={{ animationDelay: '2s' }}>
          🪷
        </div>
        <div className="absolute bottom-60 left-8 text-orange-400/10 text-9xl animate-pulse" style={{ animationDelay: '4s' }}>
          ॰
        </div>
        <div className="absolute bottom-40 right-12 text-yellow-300/20 text-7xl animate-pulse" style={{ animationDelay: '1s' }}>
          ॐ
        </div>

        {/* Sacred Geometry Patterns */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-yellow-400/40 rounded-full animate-ping" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-orange-500/20 rounded-full animate-ping" style={{ animationDelay: '4.5s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-yellow-500/30 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* MAIN CONTENT */}
      <HeroSection />
      <div className="-mt-16">
        <FeaturesSection />
      </div>
      <div className="-mt-16">
        <HowItWorks />
      </div>
      <div className="-mt-32">
        <SampleQuestions />
      </div>

      {/* Footer with enhanced background */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-orange-50/50 via-transparent to-transparent pointer-events-none"></div>
        <Footer />
      </div>
    </div>
  );
}
