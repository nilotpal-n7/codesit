/**
 * Design tokens for the Team Budget Tracker app.
 * Provides light and dark themes, category color mapping,
 * spacing scale, border radii, font sizes, and elevation presets.
 */

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  secondary: string;
  secondaryLight: string;
  accent: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  shadow: string;
  gradient: [string, string];
  tabBar: string;
  tabBarBorder: string;
  income: string;
  expense: string;
}

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    primary: '#6C5CE7',
    primaryLight: '#A29BFE',
    secondary: '#00B894',
    secondaryLight: '#55EFC4',
    accent: '#FD79A8',
    background: '#F8F9FE',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F3F8',
    card: '#FFFFFF',
    text: '#1A1A2E',
    textSecondary: '#636E72',
    textMuted: '#B2BEC3',
    border: '#E8ECF4',
    error: '#FF6B6B',
    success: '#00B894',
    warning: '#FDCB6E',
    shadow: 'rgba(108, 92, 231, 0.08)',
    gradient: ['#6C5CE7', '#A29BFE'],
    tabBar: '#FFFFFF',
    tabBarBorder: '#F0F0F5',
    income: '#00B894',
    expense: '#E17055',
  },
  dark: {
    primary: '#A29BFE',
    primaryLight: '#6C5CE7',
    secondary: '#55EFC4',
    secondaryLight: '#00B894',
    accent: '#FD79A8',
    background: '#0D1117',
    surface: '#161B22',
    surfaceVariant: '#1C2333',
    card: '#161B22',
    text: '#F0F6FC',
    textSecondary: '#8B949E',
    textMuted: '#484F58',
    border: '#21262D',
    error: '#FF6B6B',
    success: '#55EFC4',
    warning: '#FDCB6E',
    shadow: 'rgba(0, 0, 0, 0.3)',
    gradient: ['#6C5CE7', '#A29BFE'],
    tabBar: '#161B22',
    tabBarBorder: '#21262D',
    income: '#55EFC4',
    expense: '#E17055',
  },
};

export interface CategoryColorDef {
  color: string;
  gradient: [string, string];
  icon: string;
}

export const CategoryColors: Record<string, CategoryColorDef> = {
  Travel: { color: '#6C5CE7', gradient: ['#6C5CE7', '#A29BFE'], icon: 'airplane' },
  Food: { color: '#E17055', gradient: ['#E17055', '#FAB1A0'], icon: 'restaurant' },
  Equipment: { color: '#00B894', gradient: ['#00B894', '#55EFC4'], icon: 'construct' },
  Software: { color: '#0984E3', gradient: ['#0984E3', '#74B9FF'], icon: 'code-slash' },
  Operations: { color: '#FDAA5E', gradient: ['#FDAA5E', '#FDCB6E'], icon: 'settings' },
  Misc: { color: '#636E72', gradient: ['#636E72', '#B2BEC3'], icon: 'ellipsis-horizontal' },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
} as const;

export const Shadows = {
  small: {
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  large: {
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;
