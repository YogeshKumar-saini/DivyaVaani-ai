import React from 'react';
import { BookOpen, Clock, Target, Award } from 'lucide-react';
import { createTransition } from '@/lib/design-system';

interface Context {
  idx: number;
  score: number;
  verse: string;
  text: string;
  sanskrit: string;
  translation: string;
  hindi_translation?: string;
  relevance?: string;
  teaching_focus?: string;
  chapter?: string;
}

interface ContextCardProps {
  context: Context;
  className?: string;
}

const ContextCardComponent = ({ context, className = '' }: ContextCardProps) => {
  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
    if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
    return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 0.8) return <Award className="h-3 w-3" />;
    if (score >= 0.6) return <Target className="h-3 w-3" />;
    return <Clock className="h-3 w-3" />;
  };



  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-amber-400 dark:hover:border-amber-500 hover:scale-[1.02] ${className}`}
      role="article"
      aria-label={`Context reference from ${context.verse}`}
      style={{
        transition: createTransition(['all'], 'slow', 'easeOut'),
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <span className="font-bold text-gray-900 dark:text-gray-100 text-base">
          {context.verse}
        </span>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getScoreColor(context.score)}`}>
          {getScoreIcon(context.score)}
          <span>{(context.score * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Sanskrit Text */}
      {context.sanskrit && (
        <div className="text-gray-700 dark:text-gray-300 italic font-serif text-xs leading-relaxed mb-3 border-l-2 border-amber-300 dark:border-amber-600 pl-3">
          {context.sanskrit}
        </div>
      )}

      {/* Translation */}
      <div className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm mb-3">
        {context.translation.length > 120
          ? `${context.translation.substring(0, 120)}...`
          : context.translation
        }
      </div>

      {/* Teaching Focus */}
      {context.teaching_focus && (
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs font-medium bg-amber-50 dark:bg-amber-950 px-3 py-2 rounded-lg">
          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
          <span>{context.teaching_focus}</span>
        </div>
      )}

      {/* Chapter Info */}
      {context.chapter && (
        <div className="mt-2 flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
          <BookOpen className="h-3 w-3" />
          <span>{context.chapter}</span>
        </div>
      )}

      {/* Expandable Content */}
      {context.translation.length > 120 && (
        <details className="mt-3">
          <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            Read full translation
          </summary>
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200">
            {context.translation}
          </div>
        </details>
      )}
    </div>
  );
}

interface ContextGridProps {
  contexts: Context[];
  className?: string;
}

export function ContextGrid({ contexts, className = '' }: ContextGridProps) {
  if (!contexts || contexts.length === 0) return null;

  return (
    <div className={`mt-4 space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
        <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></div>
        <span>Source References ({contexts.length})</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {contexts.slice(0, 6).map((context, idx) => (
          <ContextCard key={idx} context={context} />
        ))}
      </div>
      {contexts.length > 6 && (
        <div className="text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing 6 of {contexts.length} references
          </span>
        </div>
      )}
    </div>
  );
}


export const ContextCard = React.memo(ContextCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.context.idx === nextProps.context.idx &&
    prevProps.context.score === nextProps.context.score
  );
});
