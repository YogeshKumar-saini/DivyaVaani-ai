/**
 * DivyaVaani Design System
 * Premium dark theme matching the web app's glassmorphic aesthetic
 */

import { Platform } from 'react-native';

// ─── Color Palette ──────────────────────────────────────────────────────────
export const Colors = {
  // Primary brand — vibrant violet/indigo
  primary: '#8B5CF6',
  primaryDark: '#5B21B6',
  primaryLight: '#C4B5FD',

  // Accent — deep cyan / teal
  accent: '#06B6D4',
  accentLight: '#67E8F9',
  accentDark: '#0E7490',

  // Backgrounds
  background: '#030014', // Very deep, premium dark
  backgroundLight: '#09090B',
  card: 'rgba(255,255,255,0.03)',
  cardLight: 'rgba(255,255,255,0.06)',
  surface: 'rgba(9, 9, 11, 0.8)',

  // Text
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#020617',

  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',
  borderPrimary: 'rgba(139, 92, 246, 0.3)',

  // Status
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Glassmorphic
  glass: 'rgba(15, 23, 42, 0.65)',
  glassLight: 'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(255, 255, 255, 0.09)',

  // Tab bar
  tabBar: '#030014',
  tabIconDefault: '#64748B',
  tabIconSelected: '#8B5CF6',

  // Chat
  userBubble: '#8B5CF6',
  botBubble: 'rgba(255,255,255,0.03)',
  inputBackground: 'rgba(255,255,255,0.06)',

  // Theme variants (kept for backward compat w/ Expo template)
  light: {
    text: '#020617',
    background: '#F8FAFC',
    tint: '#8B5CF6',
    icon: '#64748B',
    tabIconDefault: '#64748B',
    tabIconSelected: '#8B5CF6',
  },
  dark: {
    text: '#F8FAFC',
    background: '#030014',
    tint: '#8B5CF6',
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: '#8B5CF6',
  },
};

// ─── Gradients ──────────────────────────────────────────────────────────────
export const Gradients = {
  primary: ['#6D28D9', '#8B5CF6'] as const,
  accent: ['#0891B2', '#06B6D4'] as const,
  background: ['#030014', '#09090B'] as const,
  card: ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)'] as const,
  hero: ['#030014', '#1E1B4B', '#030014'] as const,
  primaryToAccent: ['#8B5CF6', '#06B6D4'] as const,
};

// ─── Spacing ────────────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// ─── Border Radius ──────────────────────────────────────────────────────────
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

// ─── Shadows ────────────────────────────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  glow: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ─── Typography ─────────────────────────────────────────────────────────────
export const Typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600' as const },
  label: { fontSize: 14, fontWeight: '500' as const },
} as const;

// ─── Fonts (platform-specific) ─────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Menlo',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    mono: 'monospace',
  },
});
