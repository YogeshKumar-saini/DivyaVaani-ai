'use client';

import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { SampleQuestions } from '@/components/home/SampleQuestions';
import { Footer } from '@/components/layout/Footer';
import { BackgroundDecorations } from '@/components/home/BackgroundDecorations';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* DIVINE BACKGROUND DECORATIONS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <BackgroundDecorations />
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <SampleQuestions />
      </main>

      {/* Footer with enhanced background */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-orange-50/50 via-transparent to-transparent pointer-events-none"></div>
        <Footer />
      </div>
    </div>
  );
}
