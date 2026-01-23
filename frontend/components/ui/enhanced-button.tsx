'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from './button';
import type { VariantProps } from 'class-variance-authority';

interface EnhancedButtonProps
  extends React.ComponentProps<typeof Button>,
    VariantProps<typeof buttonVariants> {
  ripple?: boolean;
  glow?: boolean;
  magneticEffect?: boolean;
}

export function EnhancedButton({
  children,
  className,
  ripple = true,
  glow = false,
  magneticEffect = false,
  variant,
  size,
  ...props
}: EnhancedButtonProps) {
  const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const id = Date.now();

      setRipples((prev) => [...prev, { x, y, id }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
      }, 600);
    }

    props.onClick?.(event);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (magneticEffect && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      setMousePosition({ x: x * 0.3, y: y * 0.3 });
    }
  };

  const handleMouseLeave = () => {
    if (magneticEffect) {
      setMousePosition({ x: 0, y: 0 });
    }
  };

  return (
    <motion.div
      animate={magneticEffect ? { x: mousePosition.x, y: mousePosition.y } : {}}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      className="inline-block"
    >
      <Button
        ref={buttonRef}
        className={cn(
          'relative overflow-hidden',
          glow && 'animate-glow',
          className
        )}
        variant={variant}
        size={size}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          whileHover={{
            translateX: '200%',
            transition: { duration: 0.6, ease: 'easeInOut' },
          }}
        />

        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 animate-ping"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: '20px',
              height: '20px',
              transform: 'translate(-50%, -50%)',
              animationDuration: '600ms',
            }}
          />
        ))}

        <span className="relative z-10">{children}</span>
      </Button>
    </motion.div>
  );
}
