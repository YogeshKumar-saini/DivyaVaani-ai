'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface StreamingTextProps {
  content: string;
  isStreaming: boolean;
  className?: string;
  speed?: number; // ms per character for typing effect
}

/**
 * StreamingText - ChatGPT-like smooth streaming text display
 * 
 * Features:
 * - Smooth typing animation when streaming
 * - Blinking cursor during active streaming
 * - Optimized to prevent janky re-renders
 * - Instant display when not streaming
 */
export function StreamingText({ 
  content, 
  isStreaming, 
  className,
  speed = 15 
}: StreamingTextProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const contentRef = useRef(content);
  const animationRef = useRef<number | null>(null);
  const displayedLengthRef = useRef(0);
  
  // Track content length for comparison
  const prevLengthRef = useRef(0);
  prevLengthRef.current = content.length;

  // Cursor blink effect
  useEffect(() => {
    if (!isStreaming) {
      setShowCursor(false);
      return;
    }

    const blinkInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(blinkInterval);
  }, [isStreaming]);

  // Smooth typing animation during streaming
  useEffect(() => {
    contentRef.current = content;
    
    if (!isStreaming) {
      // When streaming ends, show full content immediately
      setDisplayedContent(content);
      displayedLengthRef.current = content.length;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    // If content jumped significantly (more than 10 chars), catch up quickly
    const catchUpThreshold = 10;
    const needsCatchUp = content.length - displayedLengthRef.current > catchUpThreshold;

    if (needsCatchUp) {
      // Quick catch-up for large chunks
      setDisplayedContent(content);
      displayedLengthRef.current = content.length;
      return;
    }

    // Smooth typing animation using requestAnimationFrame
    let lastTime = performance.now();
    let running = true;
    
    const animate = (currentTime: number) => {
      if (!running) return;
      
      const delta = currentTime - lastTime;
      
      if (delta >= speed) {
        lastTime = currentTime;
        
        setDisplayedContent(prev => {
          const currentContent = contentRef.current;
          if (prev.length < currentContent.length) {
            // Add 1-2 characters at a time for smoother feel
            const charsToAdd = Math.min(2, currentContent.length - prev.length);
            const newContent = currentContent.slice(0, prev.length + charsToAdd);
            displayedLengthRef.current = newContent.length;
            return newContent;
          }
          return prev;
        });
      }
      
      // Continue animation if still streaming or haven't caught up
      if (contentRef.current.length > displayedLengthRef.current || isStreaming) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    // Start animation if we're behind
    if (displayedLengthRef.current < content.length) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      running = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [content, isStreaming, speed]);

  // Instant sync when content changes during streaming
  useEffect(() => {
    if (isStreaming && content.length - displayedLengthRef.current > 50) {
      // If we're falling behind by a lot, catch up
      setDisplayedContent(content);
      displayedLengthRef.current = content.length;
    }
  }, [content, isStreaming]);

  // Split content into paragraphs for proper rendering
  const paragraphs = useMemo(() => {
    return displayedContent.split('\n').map((line, idx, arr) => ({
      text: line,
      isLast: idx === arr.length - 1,
      isEmpty: line.trim() === ''
    }));
  }, [displayedContent]);

  return (
    <div className={cn("whitespace-pre-wrap leading-relaxed font-normal text-[15px] tracking-wide", className)}>
      {paragraphs.map((para, idx) => (
        <React.Fragment key={idx}>
          <span>{para.text}</span>
          {!para.isLast && <br />}
          {para.isLast && isStreaming && showCursor && (
            <StreamingCursor />
          )}
        </React.Fragment>
      ))}
      {/* Cursor when content is empty but streaming */}
      {displayedContent.length === 0 && isStreaming && showCursor && (
        <StreamingCursor />
      )}
    </div>
  );
}

/**
 * Animated typing cursor component
 */
function StreamingCursor() {
  return (
    <span 
      className="inline-block w-[3px] h-[18px] bg-violet-400 ml-0.5 align-middle"
      style={{
        animation: 'cursorBlink 1s ease-in-out infinite',
        borderRadius: '1px',
      }}
    />
  );
}

/**
 * Simplified streaming text for non-React-18 environments
 * Uses CSS animation for smoother performance
 */
export function StreamingTextSimple({ 
  content, 
  isStreaming, 
  className 
}: StreamingTextProps) {
  return (
    <span className={cn("relative", className)}>
      <span className="whitespace-pre-wrap leading-relaxed">{content}</span>
      {isStreaming && (
        <span 
          className="inline-block w-[3px] h-[18px] bg-violet-400 ml-0.5 align-middle animate-pulse"
          style={{ borderRadius: '1px' }}
        />
      )}
    </span>
  );
}

export default StreamingText;

