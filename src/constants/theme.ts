/**
 * Sentinel Drive Sense — Design System
 * Dark premium theme with blue/glow accents
 */

export const Colors = {
  // Backgrounds
  bg: '#0A0E1A',
  bgCard: '#121829',
  bgCardLight: '#1A2236',
  bgModal: '#0D1222',

  // Primary accent — blue glow
  primary: '#3B82F6',
  primaryGlow: '#60A5FA',
  primaryDim: '#1E3A5F',
  primarySoft: 'rgba(59, 130, 246, 0.15)',

  // Semantic
  success: '#22C55E',
  successSoft: 'rgba(34, 197, 94, 0.15)',
  warning: '#F59E0B',
  warningSoft: 'rgba(245, 158, 11, 0.15)',
  danger: '#EF4444',
  dangerSoft: 'rgba(239, 68, 68, 0.15)',

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0A0E1A',

  // Borders
  border: '#1E293B',
  borderLight: '#334155',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 48,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  glow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;
