'use client';

import { BookOpen, Globe, Mic, Zap, Heart } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-600 shadow-2xl mb-6">
            <span className="text-3xl font-bold text-white">ॐ</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About DivyaVaani AI</h1>
          <p className="text-xl text-gray-600">Ancient Wisdom Meets Modern AI</p>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-2xl p-8 shadow-lg border border-orange-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is DivyaVaani?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              DivyaVaani AI is an advanced spiritual companion powered by artificial intelligence and the timeless wisdom of the Bhagavad Gita. Our system combines cutting-edge natural language processing with deep knowledge of Sanskrit scriptures to provide personalized spiritual guidance.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Whether you&apos;re seeking answers about dharma, karma, yoga, or life&apos;s deeper questions, DivyaVaani offers insights rooted in ancient wisdom, delivered through modern technology.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-8 shadow-lg border border-orange-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: Globe, title: 'Multilingual Support', desc: 'Ask questions in English, Hindi, Sanskrit, and more' },
                { icon: Mic, title: 'Voice Interaction', desc: 'Speak your questions and hear responses' },
                { icon: BookOpen, title: 'Bhagavad Gita Knowledge', desc: 'Access to complete verses and teachings' },
                { icon: Zap, title: 'Real-time AI', desc: 'Instant responses powered by advanced AI' },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center flex-shrink-0">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Bhagavad Gita</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Bhagavad Gita is a 700-verse Hindu scripture that is part of the epic Mahabharata. It is a sacred dialogue between Prince Arjuna and Lord Krishna, who serves as his charioteer and spiritual guide.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The Gita addresses the moral and philosophical dilemmas faced by Arjuna on the battlefield, offering profound insights into duty, righteousness, devotion, and the nature of reality itself.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-8 shadow-lg border border-orange-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this system free to use?', a: 'Yes, DivyaVaani AI is currently free to use for all spiritual seekers.' },
                { q: 'What languages are supported?', a: 'We support English, Hindi, Sanskrit, and several other Indian languages.' },
                { q: 'How accurate are the responses?', a: 'Our AI is trained on authentic Bhagavad Gita texts and provides responses with confidence scores.' },
                { q: 'Can I use this for academic research?', a: 'Yes, but please verify important information with original texts and scholars.' },
              ].map((faq, idx) => (
                <div key={idx} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 text-center border border-orange-200/50">
            <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
              To make the timeless wisdom of the Bhagavad Gita accessible to everyone, everywhere, through the power of modern technology. We believe that ancient spiritual knowledge can guide us through contemporary challenges.
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
