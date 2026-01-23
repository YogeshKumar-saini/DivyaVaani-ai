'use client';

import * as React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MagneticCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragEnter' | 'onDragExit' | 'onDragLeave' | 'onDragOver' | 'onDragStart' | 'onDrop'> {
  children: React.ReactNode;
  magneticStrength?: number;
  tiltStrength?: number;
  glowEffect?: boolean;
}

export function MagneticCard({
  children,
  className,
  magneticStrength = 0.3,
  tiltStrength = 10,
  glowEffect = true,
  ...props
}: MagneticCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [-tiltStrength, tiltStrength]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [tiltStrength, -tiltStrength]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const xPct = (mouseX / width - 0.5) * magneticStrength;
    const yPct = (mouseY / height - 0.5) * magneticStrength;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative rounded-3xl p-6 backdrop-blur-xl transition-all duration-300',
        glowEffect && 'hover:shadow-[0_0_40px_rgba(249,115,22,0.15)]',
        className
      )}
      {...props}
    >
      {/* Glow effect on hover */}
      {glowEffect && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/0 via-purple-500/0 to-orange-500/0 opacity-0 hover:from-orange-500/5 hover:via-purple-500/5 hover:to-orange-500/5 hover:opacity-100 transition-all duration-500 pointer-events-none" />
      )}
      
      <div style={{ transform: 'translateZ(20px)' }} className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
