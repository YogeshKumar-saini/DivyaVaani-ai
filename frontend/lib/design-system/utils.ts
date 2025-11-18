/**
 * Design System Utility Functions
 * Helper functions for consistent styling and design token usage
 */

import { designTokens } from './tokens';

/**
 * Get color value from design tokens
 */
export function getColor(path: string): string {
  const keys = path.split('.');
  let value: Record<string, unknown> = designTokens.colors as Record<string, unknown>;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key] as Record<string, unknown>;
    } else {
      return '';
    }
  }
  
  return typeof value === 'string' ? value : '';
}

/**
 * Get spacing value from design tokens
 */
export function getSpacing(size: keyof typeof designTokens.spacing): string {
  return designTokens.spacing[size];
}

/**
 * Get shadow value from design tokens
 */
export function getShadow(size: keyof typeof designTokens.shadows): string {
  return designTokens.shadows[size];
}

/**
 * Get border radius value from design tokens
 */
export function getBorderRadius(size: keyof typeof designTokens.borderRadius): string {
  return designTokens.borderRadius[size];
}

/**
 * Create a CSS transition string
 */
export function createTransition(
  property: string | string[],
  duration: keyof typeof designTokens.transitions.duration = 'base',
  timing: keyof typeof designTokens.transitions.timing = 'easeInOut'
): string {
  const properties = Array.isArray(property) ? property : [property];
  const durationValue = designTokens.transitions.duration[duration];
  const timingValue = designTokens.transitions.timing[timing];
  
  return properties
    .map(prop => `${prop} ${durationValue} ${timingValue}`)
    .join(', ');
}

/**
 * Generate gradient background
 */
export function createGradient(
  direction: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-br' | 'to-bl' | 'to-tr' | 'to-tl',
  colors: string[]
): string {
  const directionMap = {
    'to-r': 'to right',
    'to-l': 'to left',
    'to-t': 'to top',
    'to-b': 'to bottom',
    'to-br': 'to bottom right',
    'to-bl': 'to bottom left',
    'to-tr': 'to top right',
    'to-tl': 'to top left',
  };
  
  return `linear-gradient(${directionMap[direction]}, ${colors.join(', ')})`;
}

/**
 * Get responsive breakpoint value
 */
export function getBreakpoint(size: keyof typeof designTokens.breakpoints): string {
  return designTokens.breakpoints[size];
}

/**
 * Create media query string
 */
export function mediaQuery(size: keyof typeof designTokens.breakpoints): string {
  return `@media (min-width: ${designTokens.breakpoints[size]})`;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Convert hex color to rgba
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get contrasting text color (black or white) based on background
 */
export function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? designTokens.colors.neutral[900] : '#FFFFFF';
}

/**
 * Generate box shadow with custom color
 */
export function createColoredShadow(color: string, intensity: 'sm' | 'md' | 'lg' = 'md'): string {
  const shadows = {
    sm: `0 2px 8px ${hexToRgba(color, 0.15)}`,
    md: `0 4px 16px ${hexToRgba(color, 0.2)}`,
    lg: `0 8px 32px ${hexToRgba(color, 0.25)}`,
  };
  
  return shadows[intensity];
}

/**
 * Create focus ring styles
 */
export function createFocusRing(color: string = designTokens.colors.primary.main): string {
  return `0 0 0 3px ${hexToRgba(color, 0.3)}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(lines: number = 1): Record<string, string | number> {
  if (lines === 1) {
    return {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };
  }
  
  return {
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };
}

/**
 * Create glassmorphism effect
 */
export function createGlassmorphism(
  blur: number = 10,
  opacity: number = 0.8
): Record<string, string> {
  return {
    background: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
  };
}
