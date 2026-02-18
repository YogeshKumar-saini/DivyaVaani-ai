"use client";

import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { SampleQuestions } from "@/components/home/SampleQuestions";
import { Footer } from "@/components/layout/Footer";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { StatsSection } from "@/components/home/StatsSection";
import { LanguagesSection } from "@/components/home/LanguagesSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { CursorGlow } from "@/components/ui/cursor-glow";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative text-foreground overflow-x-hidden">
      <ScrollProgress />
      <CursorGlow />

      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div className="relative z-10 space-y-24 pb-24">
        <FeaturesSection />
        <HowItWorks />
        <StatsSection />
        <LanguagesSection />
        <TestimonialsSection />
        <SampleQuestions />
        <NewsletterSection />
      </div>

      {/* Footer */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
