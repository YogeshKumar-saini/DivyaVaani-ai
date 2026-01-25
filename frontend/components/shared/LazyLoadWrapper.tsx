'use client';

import { useEffect, useRef, useState } from 'react';
import { createAnimationVariants, useIntersectionObserver } from '@/lib/design-system/performance-utils';
import { motion } from 'framer-motion';

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  fallback?: React.ReactNode;
  animationType?: 'fadeIn' | 'slideUp' | 'slideIn' | 'scaleIn' | 'none';
  className?: string;
}

export const LazyLoadWrapper = ({
  children,
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
  fallback = null,
  animationType = 'fadeIn',
  className = ''
}: LazyLoadWrapperProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(elementRef, { threshold, rootMargin });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isIntersecting) {
      setIsVisible(true);
    } else if (!triggerOnce) {
      setIsVisible(false);
    }
  }, [isIntersecting, triggerOnce]);

  if (!isMounted) {
    return <>{fallback}</>;
  }

  const variants = animationType === 'none' ? undefined : createAnimationVariants(false);

  return (
    <div ref={elementRef} className={className} style={{ minHeight: animationType !== 'none' ? '50px' : undefined }}>
      {animationType === 'none' ? (
        isVisible ? <>{children}</> : <>{fallback}</>
      ) : (
        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={variants}
          style={{
            opacity: isVisible ? 1 : 0,
            willChange: isVisible ? 'auto' : 'opacity, transform'
          }}
        >
          {isVisible ? children : fallback}
        </motion.div>
      )}
    </div>
  );
};

// Preloader component for images
interface ImagePreloaderProps {
  src: string;
  fallback?: React.ReactNode;
  children: (loaded: boolean) => React.ReactNode;
}

export const ImagePreloader = ({ src, fallback, children }: ImagePreloaderProps) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    const handleLoad = () => setLoaded(true);
    const handleError = () => setLoaded(false);

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    // Check if already cached
    if (img.complete) {
      handleLoad();
    }

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src]);

  return <>{loaded ? children(true) : fallback || children(false)}</>;
};

// Code splitting lazy load wrapper for routes
export const withLazyLoad = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<LazyLoadWrapperProps, 'children'>
) => {
  return function LazyLoadedComponent(props: P) {
    return (
      <LazyLoadWrapper {...options}>
        <Component {...props} />
      </LazyLoadWrapper>
    );
  };
};