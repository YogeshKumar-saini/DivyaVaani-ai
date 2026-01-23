'use client';

import { cn } from '@/lib/utils';

interface ShimmerProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Shimmer({ className, width = 'w-full', height = 'h-4', rounded = 'md' }: ShimmerProps) {
  const roundedClass = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }[rounded];

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-white/5',
        width,
        height,
        roundedClass,
        className
      )}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
          backgroundSize: '1000px 100%',
        }}
      />
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10', className)}>
      <Shimmer width="w-16" height="h-16" rounded="xl" />
      <Shimmer width="w-3/4" height="h-6" rounded="lg" />
      <Shimmer width="w-full" height="h-4" rounded="md" />
      <Shimmer width="w-full" height="h-4" rounded="md" />
      <Shimmer width="w-5/6" height="h-4" rounded="md" />
    </div>
  );
}

export function SkeletonMessage({ type = 'bot' }: { type?: 'user' | 'bot' }) {
  return (
    <div className={`flex gap-3 ${type === 'user' ? 'justify-end' : 'justify-start'}`}>
      {type === 'bot' && <Shimmer width="w-9" height="h-9" rounded="full" />}
      <div className={`space-y-2 ${type === 'user' ? 'max-w-[85%]' : 'max-w-[85%]'}`}>
        <Shimmer width="w-full" height="h-20" rounded="xl" />
        <Shimmer width="w-24" height="h-3" rounded="md" />
      </div>
      {type === 'user' && <Shimmer width="w-9" height="h-9" rounded="full" />}
    </div>
  );
}
