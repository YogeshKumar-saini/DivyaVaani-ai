'use client';

import { BookOpen, Globe, Mic, Zap, Heart, Compass, Users, Sparkles } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { GrainOverlay } from '@/components/ui/GrainOverlay';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col relative bg-background text-foreground">
      <GrainOverlay />
      <AuroraBackground className="flex-1 w-full min-h-0 h-full relative" showRadialGradient={false}>
        <div className="w-full relative z-10 pt-32 pb-12">
          <div className="max-w-4xl mx-auto px-4">
            {/* Header Section */}
            <div className="text-center mb-16 relative">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/80 to-red-600/80 shadow-[0_0_30px_rgba(234,88,12,0.5)] mb-6 mx-auto backdrop-blur-sm border border-white/20">
                <span className="text-4xl font-bold text-white drop-shadow-md">ॐ</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">About DivyaVaani AI</h1>
              <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                Universal Spiritual Wisdom Meets Modern AI
              </p>
            </div>

            <div className="space-y-8">
              {/* Introduction Card */}
              <section className="bg-white/5 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/10 hover:border-orange-500/30 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-foreground mb-4">What is DivyaVaani?</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed text-lg">
                  <p>
                    DivyaVaani AI is an advanced spiritual companion powered by artificial intelligence and the collective wisdom of all spiritual traditions throughout human history. Our system combines cutting-edge natural language processing with deep knowledge from scriptures, philosophies, and spiritual teachings across cultures to provide universal spiritual guidance.
                  </p>
                  <p>
                    Whether you&rsquo;re seeking answers about dharma, karma, yoga, meditation, love, or life&rsquo;s deeper questions, DivyaVaani offers insights from the rich tapestry of global spiritual traditions, delivered through modern AI technology.
                  </p>
                </div>
              </section>

              {/* Key Features Grid */}
              <section className="bg-white/5 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/10">
                <h2 className="text-2xl font-bold text-foreground mb-8">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { icon: Globe, title: '12+ Languages Supported', desc: 'Ask questions in English, Hindi, Sanskrit, and more languages' },
                    { icon: Mic, title: 'Voice Interaction', desc: 'Speak your questions and hear divine responses in voice' },
                    { icon: BookOpen, title: 'Universal Wisdom Library', desc: 'Access to spiritual teachings from all major traditions' },
                    { icon: Zap, title: 'Real-time AI Responses', desc: 'Get instant, personalized spiritual guidance' },
                    { icon: Compass, title: 'Personalized Guidance', desc: 'AI-tailored recommendations based on your spiritual journey' },
                    { icon: Users, title: 'Inclusive & Welcoming', desc: 'Open to seekers from all backgrounds and belief systems' },
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start space-x-4 group p-4 rounded-xl hover:bg-white/5 transition-colors duration-300">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center shrink-0 border border-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1 text-lg">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Global Wisdom Section */}
              <section className="bg-white/5 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/10">
                <h2 className="text-2xl font-bold text-foreground mb-6">Global Spiritual Wisdom</h2>
                <div className="text-muted-foreground leading-relaxed mb-8 space-y-4">
                  <p>
                    DivyaVaani draws from the timeless wisdom of spiritual traditions across the world, including but not limited to Hinduism, Buddhism, Christianity, Islam, Sikhism, Taoism, and many other sacred teachings. We honor the essential truths that unite humanity&apos;s spiritual heritage.
                  </p>
                  <p>
                    Our AI has been trained on sacred texts, philosophical works, and spiritual teachings from multiple cultures to provide contextually rich, compassionate, and insightful responses to your spiritual questions.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  {['Bhagavad Gita', 'Dhammapada', 'Bible', 'Quran', 'Guru Granth Sahib', 'Tao Te Ching', 'Upanishads', 'Four Noble Truths'].map((tradition) => (
                    <span key={tradition} className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-colors cursor-default">
                      {tradition}
                    </span>
                  ))}
                </div>
              </section>

              {/* FAQ Section */}
              <section className="bg-white/5 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/10">
                <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {[
                    { q: 'Is this system free to use?', a: 'Yes, DivyaVaani AI is currently free to use for all spiritual seekers.' },
                    { q: 'What languages are supported?', a: 'We support 12+ languages including English, Hindi, Sanskrit, and many more.' },
                    { q: 'How does it handle different spiritual traditions?', a: 'Our AI provides guidance respectful to all traditions while focusing on universal spiritual principles.' },
                    { q: 'Can I use this for academic research?', a: 'Yes, but please verify important information with original authentic texts and scholars.' },
                    { q: 'Is this a replacement for religious authorities?', a: 'No, DivyaVaani provides general spiritual insights and guidance, not religious authority&rsquo;s.' },
                  ].map((faq, idx) => (
                    <div key={idx} className="border-b border-white/5 last:border-0 pb-6 last:pb-0">
                      <h3 className="font-semibold text-foreground mb-2 text-lg">{faq.q}</h3>
                      <p className="text-muted-foreground">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Mission Section */}
              <section className="relative overflow-hidden rounded-2xl p-8 text-center border border-white/10 group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-600/10 opacity-50" />
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-6">
                    <Sparkles className="h-10 w-10 text-orange-500 mr-2 animate-pulse" />
                    <Heart className="h-10 w-10 text-red-500 ml-2" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
                  <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto text-lg">
                    To create a bridge between ancient spiritual wisdom and modern seekers, fostering understanding, compassion, and personal growth across all cultural and religious boundaries through accessible, intelligent spiritual guidance.
                  </p>
                </div>
              </section>
            </div>
          </div>

          <div className="mt-16">
            <Footer />
          </div>
        </div>
      </AuroraBackground>
    </div>
  );
}
