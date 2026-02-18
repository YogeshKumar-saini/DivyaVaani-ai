"use client";

import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { SampleQuestions } from "@/components/home/SampleQuestions";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { LanguagesSection } from "@/components/home/LanguagesSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { FutureWorksSection } from "@/components/home/FutureWorksSection";
import { ScrollBackground } from "@/components/home/ScrollBackground";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { CursorGlow } from "@/components/ui/cursor-glow";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative text-foreground overflow-x-hidden">
      <ScrollBackground />
      <ScrollProgress />
      <CursorGlow />

      <HeroSection />

      <div className="relative z-10 space-y-0 pb-24">
        <FeaturesSection />
        <HowItWorks />
        <LanguagesSection />
        <TestimonialsSection />
        <SampleQuestions />
        <FutureWorksSection />
        <NewsletterSection />
      </div>
    </div>
  );
}
