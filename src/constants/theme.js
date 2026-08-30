/**
 * Design tokens for the Ayurveda IPR Assistant — Premium Ayurvedic Theme.
 *
 * Color philosophy:
 * - Deep botanical greens (neem, tulsi) for trust & authority
 * - Warm turmeric gold for premium accents & highlights
 * - Parchment whites (NOT cold #FFF) for warm, scholarly surfaces
 * - Heritage browns for readable, warm text
 *
 * This is the single source of truth for color, type, spacing and radius.
 */
import { Platform } from 'react-native';

// ─── Botanical Green Scale ───────────────────────────────────────────
const green = {
  950: '#0A1F17',
  900: '#12332A',
  800: '#1A4D3E',
  700: '#2D6A4F', // PRIMARY — deep botanical green
  600: '#40916C', // ACCENT — interactive states
  500: '#52B788',
  400: '#74C69D',
  300: '#95D5B2',
  200: '#B7E4C7',
  100: '#D8F3DC',
  50:  '#F0FAF3',
};

// ─── Warm Gold Scale (Turmeric / Sandalwood) ─────────────────────────
const gold = {
  900: '#5C3D0A',
  800: '#7A5210',
  700: '#996B1D',
  600: '#B8862D',
  500: '#D4A373', // PRIMARY gold — accents, highlights
  400: '#DEB887',
  300: '#E8CFA0',
  200: '#F2E2C0',
  100: '#F9F0DD',
  50:  '#FDFAF2',
};

// ─── Warm Neutral Scale ──────────────────────────────────────────────
const neutral = {
  900: '#1B1B18',
  800: '#2E2E28',
  700: '#484840',
  600: '#6B6B60',
  500: '#8E8E82',
  400: '#AEAE9F',
  300: '#CDCDC0',
  200: '#E4E4DA',
  100: '#F0F0E8',
  50:  '#F8F8F3',
  0:   '#FEFCF6', // Warm parchment white
};

export const colors = {
  green,
  gold,
  neutral,

  // ─── Semantic Tokens ─────────────────────────────────────────────
  brand:         green[700],
  brandLight:    green[600],
  brandMuted:    green[500],
  brandSubtle:   green[100],
  accent:        gold[500],
  accentLight:   gold[400],
  accentSubtle:  gold[100],

  // Surfaces
  bg:            neutral[0],
  bgSubtle:      neutral[50],
  bgMuted:       neutral[100],
  surface:       neutral[0],
  surfaceRaised: '#FFFFFF',
  surfaceSunken: gold[50],

  // Borders
  border:        neutral[200],
  borderStrong:  neutral[300],
  borderAccent:  gold[300],

  // Text
  textPrimary:   neutral[900],
  textSecondary: neutral[700],
  textMuted:     neutral[600],
  textOnBrand:   '#FFFFFF',
  textOnAccent:  neutral[900],

  // Navigation (deep forest sidebar)
  navBg:           green[900],
  navSurface:      green[800],
  navBorder:       green[700],
  navTextActive:   '#FFFFFF',
  navTextInactive: green[300],
  navAccent:       gold[500],

  // Chat
  chatHeaderBg:    neutral[0],
  chatHeaderBorder: neutral[200],
  userBubble:      green[700],
  userBubbleText:  '#FFFFFF',
  assistantBg:     neutral[0],

  // Badges
  badgeBg:       green[100],
  badgeText:     green[700],

  // Status colors
  danger:    '#C1121F',
  dangerBg:  '#FDE8E8',
  warning:   '#E09F3E',
  warningBg: '#FEF3D7',
  success:   green[600],
  successBg: green[100],

  // Confidence colors
  confidenceHigh:   '#2D6A4F',
  confidenceHighBg: '#D8F3DC',
  confidenceMed:    '#E09F3E',
  confidenceMedBg:  '#FEF3D7',
  confidenceLow:    '#C1121F',
  confidenceLowBg:  '#FDE8E8',
};

export const radii = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// Google Fonts loaded via global.css on web; native uses system fonts.
const fontFamily = Platform.select({
  web: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

const fontFamilySerif = Platform.select({
  web: "'Crimson Pro', Georgia, 'Times New Roman', serif",
  default: 'serif',
});

export const typography = {
  fontFamily,
  fontFamilySerif,

  // Display — for hero headings
  display: {
    fontFamily: fontFamilySerif,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },

  // Title — section headings
  title: {
    fontFamily,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },

  // Subtitle
  subtitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: colors.textMuted,
  },

  // Body text
  body: {
    fontFamily,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
    color: colors.textPrimary,
  },

  // Small body
  bodySmall: {
    fontFamily,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
    color: colors.textSecondary,
  },

  // Labels
  label: {
    fontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Button text
  button: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textOnBrand,
    letterSpacing: 0.1,
  },

  // Code / mono
  mono: {
    fontFamily: Platform.select({
      web: "'JetBrains Mono', 'Fira Code', monospace",
      default: 'monospace',
    }),
    fontSize: 13,
    lineHeight: 20,
  },
};

export const shadow = {
  sm: {
    shadowColor: 'rgba(45, 35, 20, 0.06)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  card: {
    shadowColor: 'rgba(45, 35, 20, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: 'rgba(45, 35, 20, 0.12)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  overlay: {
    shadowColor: 'rgba(10, 10, 5, 0.25)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
};

export default { colors, radii, spacing, typography, shadow };
