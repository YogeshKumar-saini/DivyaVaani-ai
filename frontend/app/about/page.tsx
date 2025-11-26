'use client';

import { BookOpen, Globe, Mic, Zap, Heart, Compass, Users, Sparkles } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-linear-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg--to-br from-orange-500 to-red-600 shadow-xl mb-6 mx-auto">
            <span className="text-3xl font-bold text-white">ॐ</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">About DivyaVaani AI</h1>
          <p className="text-lg text-gray-600">Universal Spiritual Wisdom Meets Modern AI</p>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-2xl p-8 shadow-lg border border-orange-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is DivyaVaani?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              DivyaVaani AI is an advanced spiritual companion powered by artificial intelligence and the collective wisdom of all spiritual traditions throughout human history. Our system combines cutting-edge natural language processing with deep knowledge from scriptures, philosophies, and spiritual teachings across cultures to provide universal spiritual guidance.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Whether you're seeking answers about dharma, karma, yoga, meditation, love, or life's deeper questions, DivyaVaani offers insights from the rich tapestry of global spiritual traditions, delivered through modern AI technology.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-8 shadow-lg border border-orange-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: Globe, title: '12+ Languages Supported', desc: 'Ask questions in English, Hindi, Sanskrit, and more languages' },
                { icon: Mic, title: 'Voice Interaction', desc: 'Speak your questions and hear divine responses in voice' },
                { icon: BookOpen, title: 'Universal Wisdom Library', desc: 'Access to spiritual teachings from all major traditions' },
                { icon: Zap, title: 'Real-time AI Responses', desc: 'Get instant, personalized spiritual guidance' },
                { icon: Compass, title: 'Personalized Guidance', desc: 'AI-tailored recommendations based on your spiritual journey' },
                { icon: Users, title: 'Inclusive & Welcoming', desc: 'Open to seekers from all backgrounds and belief systems' },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-lg bg-linear-to-br from-orange-400 to-red-600 flex items-center justify-center shrink-0">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl p-8 shadow-lg border border-orange-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Global Spiritual Wisdom</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              DivyaVaani draws from the timeless wisdom of spiritual traditions across the world, including but not limited to Hinduism, Buddhism, Christianity, Islam, Sikhism, Taoism, and many other sacred teachings. We honor the essential truths that unite humanity's spiritual heritage.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Our AI has been trained on sacred texts, philosophical works, and spiritual teachings from multiple cultures to provide contextually rich, compassionate, and insightful responses to your spiritual questions.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {['Bhagavad Gita', 'Dhammapada', 'Bible', 'Quran', 'Guru Granth Sahib', 'Tao Te Ching', 'Upanishads', 'Four Noble Truths'].map((tradition) => (
                <span key={tradition} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                  {tradition}
                </span>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl p-8 shadow-lg border border-orange-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this system free to use?', a: 'Yes, DivyaVaani AI is currently free to use for all spiritual seekers.' },
                { q: 'What languages are supported?', a: 'We support 12+ languages including English, Hindi, Sanskrit, and many more.' },
                { q: 'How does it handle different spiritual traditions?', a: 'Our AI provides guidance respectful to all traditions while focusing on universal spiritual principles.' },
                { q: 'Can I use this for academic research?', a: 'Yes, but please verify important information with original authentic texts and scholars.' },
                { q: 'Is this a replacement for religious authorities?', a: 'No, DivyaVaani provides general spiritual insights and guidance, not religious authority.' },
              ].map((faq, idx) => (
                <div key={idx} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-linear-to-r from-orange-50 to-red-50 rounded-2xl p-8 text-center border border-orange-200/50">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-12 w-12 text-orange-600 mr-3" />
              <Heart className="h-12 w-12 text-red-500 ml-3" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
              To create a bridge between ancient spiritual wisdom and modern seekers, fostering understanding, compassion, and personal growth across all cultural and religious boundaries through accessible, intelligent spiritual guidance.
            </p>
          </section>
        </div>
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}
