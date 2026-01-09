'use client';

import { useState } from 'react';
import { MessageSquare, Send, Star, Loader2 } from 'lucide-react';
import { analyticsService } from '@/lib/api/analytics-service';
import { handleAPIError } from '@/lib/api/client';

interface FeedbackFormProps {
  onSubmit?: () => void;
  compact?: boolean;
}

export function FeedbackForm({ onSubmit, compact = false }: FeedbackFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({
    type: 'general',
    content: '',
    rating: 0,
  });
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.content.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      await analyticsService.submitFeedback({
        type: feedback.type,
        content: feedback.content,
        user_id: undefined, // Will be set by backend if available
      });

      setSubmitStatus({
        type: 'success',
        message: 'Thank you for your feedback! Your input helps us improve.',
      });

      // Reset form
      setFeedback({ type: 'general', content: '', rating: 0 });

      // Close form after success
      setTimeout(() => {
        setIsOpen(false);
        setSubmitStatus({ type: null, message: '' });
        onSubmit?.();
      }, 2000);
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: handleAPIError(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackTypes = [
    { value: 'general', label: 'General Feedback' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'accuracy', label: 'Answer Accuracy' },
    { value: 'performance', label: 'Performance Issue' },
  ];

  if (compact) {
    return (
      <div className=" rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
            Share Your Feedback
          </h3>
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Open Form
            </button>
          )}
        </div>

        {isOpen && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback Type
              </label>
              <select
                value={feedback.type}
                onChange={(e) => setFeedback(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {feedbackTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Feedback
              </label>
              <textarea
                value={feedback.content}
                onChange={(e) => setFeedback(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Tell us what you think..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                required
              />
            </div>

            {submitStatus.type && (
              <div className={`p-3 rounded-md text-sm ${
                submitStatus.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {submitStatus.message}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSubmitting || !feedback.content.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Submit
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className=" rounded-2xl p-4 sm:p-6 shadow-professional border border-blue-200/50 card-professional">
      <div className="flex items-center space-x-3 mb-6">
        <MessageSquare className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Share Your Feedback</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            How would you rate your experience?
          </label>
          <div className="flex space-x-1 justify-center sm:justify-start">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                className="focus:outline-none p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`h-6 w-6 sm:h-8 sm:w-8 ${
                    star <= feedback.rating
                      ? 'text-yellow-400 fill-current drop-shadow-sm'
                      : 'text-gray-300'
                  } hover:text-yellow-400 transition-all duration-200`}
                />
              </button>
            ))}
          </div>
          {feedback.rating > 0 && (
            <p className="text-sm text-gray-600 mt-3 text-center sm:text-left font-medium">
              {feedback.rating} star{feedback.rating !== 1 ? 's' : ''} - {
                feedback.rating >= 4 ? 'Excellent!' :
                feedback.rating >= 3 ? 'Good' :
                feedback.rating >= 2 ? 'Fair' : 'Needs improvement'
              }
            </p>
          )}
        </div>

        {/* Feedback Type and Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Feedback Type */}
          <div className="sm:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              value={feedback.type}
              onChange={(e) => setFeedback(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm input-professional"
              required
            >
              {feedbackTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Feedback Content */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Feedback
            </label>
            <textarea
              value={feedback.content}
              onChange={(e) => setFeedback(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Please share your thoughts, suggestions, or report any issues you've encountered..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm input-professional"
              rows={4}
              required
            />
          </div>
        </div>

        {/* Submit Status */}
        {submitStatus.type && (
          <div className={`p-4 rounded-xl text-center shadow-sm ${
            submitStatus.type === 'success'
              ? 'bg-gradient-calm text-green-800 border border-green-200'
              : 'bg-gradient-warm text-red-800 border border-red-200'
          }`}>
            {submitStatus.message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !feedback.content.trim()}
          className="w-full bg-gradient-professional text-white px-6 py-4 rounded-xl font-bold hover:shadow-professional disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 btn-professional"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Submit Feedback
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500 font-medium">
        Your feedback helps us improve the spiritual guidance experience for everyone.
      </div>
    </div>
  );
}
