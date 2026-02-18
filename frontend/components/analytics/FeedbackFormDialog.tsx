'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  MessageSquarePlus, Star, Send, Loader2, CheckCircle2,
  AlertCircle, X, Sparkles, Bug, Zap, ShieldCheck, Activity
} from 'lucide-react';
import { analyticsService } from '@/lib/api/analytics-service';
import { handleAPIError } from '@/lib/api/client';
import { cn } from '@/lib/utils';

interface FeedbackFormDialogProps {
  onSubmit?: () => void;
}

const feedbackTypes = [
  { value: 'general', label: 'General', icon: Sparkles, color: 'text-violet-400', border: 'border-violet-500/30', bg: 'bg-violet-500/10' },
  { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10' },
  { value: 'feature', label: 'Feature', icon: Zap, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  { value: 'accuracy', label: 'Accuracy', icon: ShieldCheck, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  { value: 'performance', label: 'Performance', icon: Activity, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
];

export function FeedbackFormDialog({ onSubmit }: FeedbackFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState({
    type: 'general',
    content: '',
    rating: 0,
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.content.trim()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await analyticsService.submitFeedback({
        type: feedback.type,
        content: feedback.content,
        user_id: feedback.name.trim() || undefined,
      });

      setSubmitStatus('success');

      setTimeout(() => {
        setIsOpen(false);
        setTimeout(() => {
          setSubmitStatus('idle');
          setFeedback({ type: 'general', content: '', rating: 0, name: '' });
          setHoveredStar(0);
        }, 300);
        onSubmit?.();
      }, 2200);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(handleAPIError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsOpen(false);
    setTimeout(() => {
      setSubmitStatus('idle');
      setFeedback({ type: 'general', content: '', rating: 0, name: '' });
      setHoveredStar(0);
      setErrorMessage('');
    }, 300);
  };

  const selectedType = feedbackTypes.find(t => t.value === feedback.type);

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v ? handleClose() : setIsOpen(true)}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-white/10 bg-white/5 text-white/70 hover:bg-violet-500/15 hover:border-violet-500/40 hover:text-white transition-all duration-200"
        >
          <MessageSquarePlus className="h-4 w-4 text-violet-400" />
          Share Feedback
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] bg-[#0e0e16] border border-white/10 text-white shadow-2xl shadow-black/60 p-0 overflow-hidden">
        {/*
          Always-present accessible header (visually hidden).
          Radix requires DialogTitle to be present whenever DialogContent
          is mounted — even when AnimatePresence swaps to the success screen.
        */}
        <DialogHeader className="sr-only">
          <DialogTitle>Share Feedback</DialogTitle>
          <DialogDescription>
            Submit your feedback to help us improve DivyaVaani
          </DialogDescription>
        </DialogHeader>

        {/* Top accent line */}
        <div className="h-px w-full bg-linear-to-r from-transparent via-violet-500/50 to-transparent" />

        <AnimatePresence mode="wait">
          {submitStatus === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-16 px-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-5">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Feedback Received!</h3>
              <p className="text-[14px] text-white/45 leading-relaxed max-w-xs">
                Thank you for helping us improve DivyaVaani. Your input shapes what we build next.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
                      <MessageSquarePlus className="h-4 w-4 text-violet-400" />
                    </div>
                    <div>
                      <DialogTitle className="text-[16px] font-semibold text-white leading-none">Share Feedback</DialogTitle>
                      <p className="text-[11px] text-white/35 mt-0.5">Saved to our database instantly</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/8 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">

                {/* Feedback Type */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-white/35 font-semibold mb-2.5">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {feedbackTypes.map((type) => {
                      const isSelected = feedback.type === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFeedback(prev => ({ ...prev, type: type.value }))}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all duration-150',
                            isSelected
                              ? `${type.bg} ${type.border} ${type.color}`
                              : 'border-white/8 bg-white/3 text-white/40 hover:border-white/15 hover:text-white/60'
                          )}
                        >
                          <type.icon className="h-3 w-3" />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Star Rating */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-white/35 font-semibold mb-2.5">
                    Overall Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            'h-6 w-6 transition-colors duration-100',
                            star <= (hoveredStar || feedback.rating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-white/15'
                          )}
                        />
                      </button>
                    ))}
                    {feedback.rating > 0 && (
                      <span className="ml-2 text-[12px] text-white/35">
                        {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][feedback.rating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Name (optional) */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-white/35 font-semibold mb-2">
                    Your Name <span className="normal-case text-white/20 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={feedback.name}
                    onChange={(e) => setFeedback(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Anonymous"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/4 border border-white/8 text-white/80 placeholder-white/20 text-[13px] focus:outline-none focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500/40 transition-colors"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-white/35 font-semibold mb-2">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={feedback.content}
                    onChange={(e) => setFeedback(prev => ({ ...prev, content: e.target.value }))}
                    placeholder={
                      feedback.type === 'bug' ? 'Describe what happened and steps to reproduce...' :
                      feedback.type === 'feature' ? 'What feature would you like to see?' :
                      feedback.type === 'accuracy' ? 'Which answer was inaccurate and why?' :
                      'Tell us what you think about DivyaVaani...'
                    }
                    rows={4}
                    required
                    className="w-full px-3.5 py-3 rounded-xl bg-white/4 border border-white/8 text-white/80 placeholder-white/20 text-[13px] focus:outline-none focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500/40 transition-colors resize-none leading-relaxed"
                  />
                  <div className="flex justify-between items-center mt-1.5">
                    <div className="flex items-center gap-1 text-[11px] text-white/25">
                      {selectedType && (
                        <>
                          <selectedType.icon className={cn('h-3 w-3', selectedType.color)} />
                          <span>{selectedType.label} feedback</span>
                        </>
                      )}
                    </div>
                    <span className={cn(
                      'text-[11px] tabular-nums',
                      feedback.content.length > 480 ? 'text-red-400' : 'text-white/25'
                    )}>
                      {feedback.content.length}/500
                    </span>
                  </div>
                </div>

                {/* Error state */}
                <AnimatePresence>
                  {submitStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3"
                    >
                      <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-[13px] text-red-300/80">{errorMessage}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting || !feedback.content.trim() || feedback.content.length > 500}
                  className="w-full bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
