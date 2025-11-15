import React, { useState, useCallback } from 'react';
import { ThumbsUp, ThumbsDown, Zap, Check, Loader2 } from 'lucide-react';

interface FeedbackSystemProps {
  onFeedback: (rating: 'excellent' | 'good' | 'needs_improvement') => Promise<void> | void;
  feedbackSubmitted?: boolean;
  className?: string;
}

export function FeedbackSystem({ 
  onFeedback, 
  feedbackSubmitted = false,
  className = '' 
}: FeedbackSystemProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localSubmitted, setLocalSubmitted] = useState(false);

  const handleFeedback = useCallback(async (rating: 'excellent' | 'good' | 'needs_improvement') => {
    if (feedbackSubmitted || localSubmitted || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onFeedback(rating);
      setLocalSubmitted(true);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [feedbackSubmitted, localSubmitted, isSubmitting, onFeedback]);

  if (feedbackSubmitted || localSubmitted) {
    return (
      <div className={`flex items-center justify-center gap-2 bg-green-50/40 dark:bg-green-900/30 text-green-700 dark:text-green-200 px-3 py-1.5 rounded-full border border-green-200/20 text-xs font-medium ${className}`}>
        <Check className="h-3.5 w-3.5" />
        <span>Feedback received!</span>
      </div>
    );
  }

  const feedbackOptions = [
    {
      rating: 'excellent' as const,
      icon: ThumbsUp,
      title: 'Excellent',
      description: 'This response was very helpful',
      className: 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400'
    },
    {
      rating: 'good' as const,
      icon: Zap,
      title: 'Good',
      description: 'This response was helpful',
      className: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
    },
    {
      rating: 'needs_improvement' as const,
      icon: ThumbsDown,
      title: 'Needs Work',
      description: 'This response could be better',
      className: 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400'
    }
  ];

  return (
    <div className={`flex items-center gap-1 ${className}`} role="group" aria-label="Rate this response">
      {feedbackOptions.map(({ rating, icon: Icon, title, description, className: buttonClass }) => (
        <button
          key={rating}
          onClick={() => handleFeedback(rating)}
          disabled={isSubmitting}
          title={title}
          className={`p-1.5 rounded-full transition-all duration-200 ${buttonClass} ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
          }`}
          aria-label={`${description} - ${title}`}
        >
          {isSubmitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
          )}
        </button>
      ))}
    </div>
  );
}