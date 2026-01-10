'use client';

import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { SampleQuestions } from '@/components/home/SampleQuestions';
import { Footer } from '@/components/layout/Footer';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { GrainOverlay } from '@/components/ui/GrainOverlay';

export default function HomePage() {
  return (
    <div className="dark min-h-screen flex flex-col relative bg-black text-foreground">
      <GrainOverlay />

      {/* Hero with its own video background */}
      <HeroSection />

      {/* Main Content Areas with Aurora Background */}
      <AuroraBackground className="flex-1 w-full min-h-0 h-full relative" showRadialGradient={false}>
        <div className="w-full relative z-10">
          {/* Additional Decorative Gradients */}
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black to-transparent z-20" />

          <FeaturesSection />
          <HowItWorks />
          <TestimonialsSection />
          <SampleQuestions />
        </div>
      </AuroraBackground>

      {/* Footer with enhanced background */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
