
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

interface FollowUpQuestionsProps {
    questions: string[];
    onQuestionClick: (question: string) => void;
    disabled?: boolean;
}

export function FollowUpQuestions({ questions, onQuestionClick, disabled }: FollowUpQuestionsProps) {
    if (!questions || questions.length === 0) return null;

    return (
        <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-white/40 uppercase tracking-widest px-1">
                <Sparkles size={12} className="text-amber-400" />
                <span>Explore Further</span>
            </div>
            <div className="grid gap-2">
                {questions.map((question, idx) => (
                    <motion.button
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => onQuestionClick(question)}
                        disabled={disabled}
                        className="group flex items-center justify-between w-full text-left p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all active:scale-[0.99]"
                    >
                        <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                            {question}
                        </span>
                        <ArrowRight
                            size={14}
                            className="text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all"
                        />
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
