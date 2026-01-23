'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ className, type, label, error, helperText, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            type={type}
            className={cn(
              'flex w-full rounded-2xl border bg-white/5 backdrop-blur-xl px-4 py-3 text-base text-white placeholder:text-white/40 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50',
              isFocused
                ? 'border-orange-500/40 ring-2 ring-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
                : 'border-white/10 hover:border-white/20',
              error && 'border-red-500/40 ring-2 ring-red-500/20',
              className
            )}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {/* Animated glow on focus */}
          {isFocused && (
            <motion.div
              layoutId="input-glow"
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-orange-500/10 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </div>

        {/* Helper text or error */}
        {(helperText || error) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'mt-2 text-sm',
              error ? 'text-red-400' : 'text-gray-400'
            )}
          >
            {error || helperText}
          </motion.p>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

export { EnhancedInput };
