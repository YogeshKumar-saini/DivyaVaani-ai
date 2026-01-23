'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface EnhancedToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    className: 'bg-gradient-to-r from-emerald-500/90 to-green-500/90 border-emerald-400/50',
    iconColor: 'text-white',
  },
  error: {
    icon: AlertCircle,
    className: 'bg-gradient-to-r from-red-500/90 to-rose-500/90 border-red-400/50',
    iconColor: 'text-white',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-gradient-to-r from-amber-500/90 to-orange-500/90 border-amber-400/50',
    iconColor: 'text-white',
  },
  info: {
    icon: Info,
    className: 'bg-gradient-to-r from-blue-500/90 to-indigo-500/90 border-blue-400/50',
    iconColor: 'text-white',
  },
};

export function EnhancedToast({ toast, onClose }: EnhancedToastProps) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  React.useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(
        'relative flex items-center gap-3 p-4 pr-12 rounded-2xl shadow-2xl backdrop-blur-xl border min-w-[320px] max-w-md overflow-hidden',
        config.className
      )}
    >
      {/* Animated shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />

      <Icon className={cn('h-5 w-5 flex-shrink-0', config.iconColor)} />
      
      <p className="text-sm font-medium text-white flex-1">{toast.message}</p>
      
      <button
        onClick={() => onClose(toast.id)}
        className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="h-4 w-4 text-white" />
      </button>
    </motion.div>
  );
}

export function EnhancedToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <EnhancedToast key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}
