export const AppColors = {
  // Primary Brand Colors
  primary: '#F8803B',
  primaryDark: '#E6722A',
  primaryLight: '#FFA366',
  
  // Background Colors
  background: '#FFFFFF',
  backgroundDark: '#1A1A1A',
  surface: '#F8F9FA',
  surfaceDark: '#2D2D2D',
  
  // Text Colors
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textLight: '#FFFFFF',
  
  // Accent Colors
  accent: '#4CAF50',
  error: '#FF6B6B',
  warning: '#FFC107',
  info: '#2196F3',
  success: '#4CAF50',
  
  // Player Colors
  playerBackground: '#1A1A1A',
  playerSurface: '#2D2D2D',
  playerAccent: '#F8803B',
  
  // Category Colors
  categoryColors: [
    '#FADBD8', '#FDEBD0', '#D6EAF8', '#D5F5E3', 
    '#FCF3CF', '#E8DAEF', '#D1F2EB', '#FEF9E7', 
    '#EBDEF0', '#D0ECE7'
  ],
  
  // Gradients
  gradients: {
    primary: ['#F8803B', '#E6722A'],
    dark: ['#1A1A1A', '#2D2D2D'],
    overlay: ['transparent', 'rgba(0,0,0,0.7)'],
  },
  
  // Shadows
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 10,
    },
  },
};

export const AppTypography = {
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },
  
  // Font Weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const AppSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const AppBorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};