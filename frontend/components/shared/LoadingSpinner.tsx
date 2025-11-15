/**
 * Loading Spinner Component
 * Displays loading states with multiple variants
 */

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'spiritual' | 'minimal';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export function LoadingSpinner({
  size = 'md',
  variant = 'default',
  text,
  className,
}: LoadingSpinnerProps) {
  if (variant === 'spiritual') {
    return (
      <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
        <div className="relative">
          <div className={cn(
            'animate-spin rounded-full border-4 border-orange-200',
            sizeClasses[size]
          )}>
            <div className="absolute inset-0 rounded-full border-t-4 border-orange-500 animate-spin" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-orange-600 font-bold text-lg">ॐ</span>
          </div>
        </div>
        {text && (
          <p className="text-sm text-gray-600 animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <Loader2 className={cn('animate-spin text-orange-500', sizeClasses[size])} />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-3', className)}>
      <Loader2 className={cn('animate-spin text-orange-500', sizeClasses[size])} />
      {text && (
        <p className="text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
}

/**
 * Loading Skeleton Component
 * For content placeholders
 */
interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export function LoadingSkeleton({ className, count = 1 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded',
            className
          )}
        />
      ))}
    </>
  );
}

/**
 * Page Loading Component
 * Full-page loading state
 */
export function PageLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      <LoadingSpinner size="xl" variant="spiritual" text="Loading..." />
    </div>
  );
}
