'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FloatingActionButtonProps extends React.ComponentProps<'button'> {
  icon: LucideIcon;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent';
}

const positionClasses = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
};

const sizeClasses = {
  sm: 'h-12 w-12',
  md: 'h-14 w-14',
  lg: 'h-16 w-16',
};

const variantClasses = {
  primary: 'bg-gradient-to-br from-indigo-500 to-purple-500 hover:shadow-[0_0_40px_rgba(79,70,229,0.6)]',
  secondary: 'bg-gradient-to-br from-gray-700 to-gray-800 hover:shadow-[0_0_40px_rgba(75,85,99,0.6)]',
  accent: 'bg-gradient-to-br from-orange-500 to-red-600 hover:shadow-[0_0_40px_rgba(249,115,22,0.6)]',
};

export function FloatingActionButton({
  icon: Icon,
  label,
  position = 'bottom-right',
  size = 'md',
  variant = 'primary',
  className,
  ...props
}: FloatingActionButtonProps) {
  const [showLabel, setShowLabel] = React.useState(false);

  return (
    <motion.div
      className={cn('fixed z-50', positionClasses[position])}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
    >
      <div className="relative flex items-center gap-3">
        <AnimatePresence>
          {showLabel && label && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute right-full mr-3 whitespace-nowrap bg-black/90 backdrop-blur-xl text-white px-4 py-2 rounded-full text-sm font-medium shadow-xl border border-white/10"
            >
              {label}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            'rounded-full shadow-2xl text-white transition-all duration-300 flex items-center justify-center overflow-hidden relative group',
            sizeClasses[size],
            variantClasses[variant],
            className
          )}
          {...props}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700" />
          
          <Icon className="h-6 w-6 relative z-10" />
        </motion.button>
      </div>
    </motion.div>
  );
}
