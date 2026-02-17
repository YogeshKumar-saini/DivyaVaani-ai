/**
 * Performance optimization utilities for the UI
 * Includes memoization, debouncing, throttling, and animation optimizations
 */

import { useCallback, useEffect, useRef, useState, memo } from 'react';

/**
 * Debounce hook to limit function calls
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  return debouncedCallback as T;
}

/**
 * Throttle hook to limit function execution rate
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    }
  }, [callback, delay]);

  return throttledCallback as T;
}

/**
 * Optimized scroll handler with requestAnimationFrame
 */

export function useOptimizedScroll(
  callback: (scrollY: number) => void,
  deps: React.DependencyList = []
): void {
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        callback(window.scrollY);
        ticking.current = false;
      });
      ticking.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, ...deps]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
}

/**
 * Intersection observer hook for lazy loading
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element | null>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.1, ...options });

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef, options]);

  return isVisible;
}

/**
 * Optimized resize handler with requestAnimationFrame
 */

export function useOptimizedResize(
  callback: () => void,
  deps: React.DependencyList = []
): void {
  const ticking = useRef(false);

  const handleResize = useCallback(() => {
    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        callback();
        ticking.current = false;
      });
      ticking.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, ...deps]);

  useEffect(() => {
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);
}

/**
 * Check if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Animation variant generator with reduced motion support
 */
export const createAnimationVariants = (prefersReducedMotion: boolean) => {
  const duration = prefersReducedMotion ? 0 : 0.5;
  const stiffness = prefersReducedMotion ? 0 : 100;
  const damping = prefersReducedMotion ? 0 : 20;

  return {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration } }
    },
    slideUp: {
      hidden: { y: 50, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { duration, type: 'spring', stiffness, damping } }
    },
    slideIn: {
      hidden: { x: 50, opacity: 0 },
      visible: { x: 0, opacity: 1, transition: { duration, type: 'spring', stiffness, damping } }
    },
    scaleIn: {
      hidden: { scale: 0.9, opacity: 0 },
      visible: { scale: 1, opacity: 1, transition: { duration, type: 'spring', stiffness, damping } }
    }
  };
};

/**
 * Memoized component wrapper for expensive renders
 */
export function Memoize<T extends React.ComponentType<object>>(
  Component: T,
  areEqual?: (prevProps: Readonly<object>, nextProps: Readonly<object>) => boolean
) {
  return memo(Component, areEqual);
}

/**
 * Optimized image loading with blur placeholder
 */
export function useImageWithFallback(
  src: string,
  fallback: string = '/images/placeholder.png'
) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = useCallback(() => {
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
    }
    setIsLoading(false);
  }, [imageSrc, fallback]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  return {
    src: imageSrc,
    isLoading,
    onError: handleImageError,
    onLoad: handleImageLoad
  };
}