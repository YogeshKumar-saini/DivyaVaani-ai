'use client';

import { useRouter } from 'next/navigation';
import { SAMPLE_QUESTIONS, ROUTES } from '@/lib/utils/constants';
import { MessageSquare } from 'lucide-react';

interface SampleQuestionsProps {
  onQuestionClick?: (question: string) => void;
}

export function SampleQuestions({ onQuestionClick }: SampleQuestionsProps) {
  const router = useRouter();

  const handleQuestionClick = (question: string) => {
    if (onQuestionClick) {
      onQuestionClick(question);
    } else {
      // Navigate to chat with question as query param
      router.push(`${ROUTES.CHAT}?q=${encodeURIComponent(question)}`);
    }
  };

  const categoryColors = {
    Dharma: 'from-orange-400 to-orange-600',
    Karma: 'from-blue-400 to-blue-600',
    Yoga: 'from-purple-400 to-purple-600',
    'Life Guidance': 'from-green-400 to-green-600',
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Explore Sample Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get inspired by these questions or ask your own
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SAMPLE_QUESTIONS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleQuestionClick(item.question)}
              className="group text-left bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-orange-300"
            >
              <div className="flex items-start space-x-3 mb-3">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${categoryColors[item.category as keyof typeof categoryColors]} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {item.category}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed group-hover:text-orange-600 transition-colors">
                {item.question}
              </p>
            </button>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => router.push(ROUTES.CHAT)}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300"
          >
            Ask Your Own Question
          </button>
        </div>
      </div>
    </section>
  );
}
