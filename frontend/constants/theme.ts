/**
 * Design system — comprehensive theme tokens with proper dark mode mapping.
 *
 * NOT just color inversion — every token is hand-picked for legibility,
 * contrast, and aesthetic harmony in both light and dark modes.
 */

export const Colors = {
  light: {
    // Backgrounds
    bg: '#F5F5FA',             // Main screen background (warm gray)
    card: '#FFFFFF',            // Card / surface
    cardElevated: '#FFFFFF',    // Elevated card (modal, dropdown)
    input: '#F0F1F6',           // Input field background
    // Text
    text: '#1A1B2E',            // Primary text
    textSecondary: '#7C7D8A',   // Secondary / muted text
    textTertiary: '#A9AAB5',    // Hints, placeholders
    textInverse: '#FFFFFF',     // Text on dark/accent surfaces
    // Borders & dividers
    border: '#EAEAF0',          // Subtle borders
    borderStrong: '#D8D8E3',    // Emphasized borders
    divider: '#F0F1F6',         // Section dividers
    // Accent — Purple palette
    accent: '#6C5CE7',
    accentLight: '#A29BFE',
    accentSoft: '#EDE9FF',       // Accent tint for backgrounds
    accentSurface: '#F5F2FF',    // Very light accent bg
    // Status
    success: '#00B894',
    successSoft: '#E8FAF4',
    danger: '#FF6B6B',
    dangerSoft: '#FFF0F0',
    warning: '#FDCB6E',
    warningSoft: '#FFF8E1',
    info: '#0984E3',
    infoSoft: '#E8F4FD',
    // Category colors (consistent across themes)
    travel: '#6C5CE7',
    food: '#00B894',
    equipment: '#0984E3',
    software: '#E17055',
    operations: '#FDCB6E',
    misc: '#A29BFE',
    // Shadows
    shadowColor: 'rgba(108, 92, 231, 0.08)',
    shadowStrong: 'rgba(0, 0, 0, 0.06)',
    // Tab bar
    tabBar: '#FFFFFF',
    tabBarBorder: '#EAEAF0',
    tabInactive: '#B2B3BE',
  },
  dark: {
    // Backgrounds
    bg: '#0B0D17',              // Deep navy (not pure black)
    card: '#141625',            // Card surface
    cardElevated: '#1A1D30',    // Elevated card
    input: '#1A1D30',           // Input background
    // Text
    text: '#E8E9F0',            // Primary text (not pure white — less strain)
    textSecondary: '#8B8D9E',   // Secondary
    textTertiary: '#5E6072',    // Hints
    textInverse: '#FFFFFF',     // On accent
    // Borders
    border: '#232538',          // Subtle
    borderStrong: '#2D2F45',    // Emphasized
    divider: '#1A1D30',         // Section dividers
    // Accent — slightly brighter in dark mode for contrast
    accent: '#7C6EF7',
    accentLight: '#A29BFE',
    accentSoft: '#1E1A35',       // Accent tint
    accentSurface: '#17142B',    // Very dark accent bg
    // Status
    success: '#55EFC4',
    successSoft: '#0F2922',
    danger: '#FF7675',
    dangerSoft: '#2D1515',
    warning: '#FFEAA7',
    warningSoft: '#2D2810',
    info: '#74B9FF',
    infoSoft: '#0D1F2D',
    // Category colors — slightly boosted saturation for dark bg
    travel: '#7C6EF7',
    food: '#55EFC4',
    equipment: '#74B9FF',
    software: '#FAB1A0',
    operations: '#FFEAA7',
    misc: '#B5AEFF',
    // Shadows (minimal in dark mode — rely on border instead)
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowStrong: 'rgba(0, 0, 0, 0.4)',
    // Tab bar
    tabBar: '#141625',
    tabBarBorder: '#232538',
    tabInactive: '#5E6072',
  },
} as const;

export type ThemeColors = {
  [K in keyof typeof Colors.light]: string;
};

// Convenience hook helper
export const getTheme = (isDark: boolean): ThemeColors =>
  isDark ? Colors.dark : Colors.light;

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// ─── Radius ──────────────────────────────────────────────────────────────────

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const Typography = {
  displayLarge: { fontSize: 36, fontWeight: '800' as const, letterSpacing: -1 },
  displayMedium: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  headingLarge: { fontSize: 22, fontWeight: '700' as const },
  headingMedium: { fontSize: 18, fontWeight: '700' as const },
  headingSmall: { fontSize: 15, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, fontWeight: '500' as const },
  bodySemibold: { fontSize: 14, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  captionSmall: { fontSize: 11, fontWeight: '500' as const },
  label: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.5, textTransform: 'uppercase' as const },
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const Shadows = {
  card: (isDark: boolean) => ({
    shadowColor: isDark ? '#000' : '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.2 : 0.06,
    shadowRadius: 16,
    elevation: isDark ? 2 : 4,
  }),
  cardStrong: (isDark: boolean) => ({
    shadowColor: isDark ? '#000' : '#6C5CE7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 24,
    elevation: isDark ? 4 : 8,
  }),
  button: (isDark: boolean) => ({
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.2 : 0.25,
    shadowRadius: 12,
    elevation: isDark ? 3 : 6,
  }),
} as const;

// ─── Category meta (for icons & colors) ──────────────────────────────────────

export const CATEGORY_COLORS: Record<string, { light: string; dark: string; icon: string }> = {
  Travel: { light: '#6C5CE7', dark: '#7C6EF7', icon: 'airplane' },
  Food: { light: '#00B894', dark: '#55EFC4', icon: 'restaurant' },
  Equipment: { light: '#0984E3', dark: '#74B9FF', icon: 'hardware-chip' },
  Software: { light: '#E17055', dark: '#FAB1A0', icon: 'code-slash' },
  Operations: { light: '#FDCB6E', dark: '#FFEAA7', icon: 'settings' },
  Misc: { light: '#A29BFE', dark: '#B5AEFF', icon: 'ellipsis-horizontal' },
};
