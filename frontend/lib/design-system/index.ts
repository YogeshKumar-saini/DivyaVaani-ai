/**
 * Design System
 * Central export for all design system tokens and utilities
 */

export { designTokens } from './tokens';
export type { DesignTokens } from './tokens';

export {
  getColor,
  getSpacing,
  getShadow,
  getBorderRadius,
  createTransition,
  createGradient,
  getBreakpoint,
  mediaQuery,
  clamp,
  hexToRgba,
  getContrastColor,
  createColoredShadow,
  createFocusRing,
  truncateText,
  createGlassmorphism,
} from './utils';
