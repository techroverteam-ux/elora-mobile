import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Based on iPhone 6/7/8 dimensions
const baseWidth = 375;
const baseHeight = 667;

export const wp = (percentage: number) => {
  const value = (percentage * SCREEN_WIDTH) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

export const hp = (percentage: number) => {
  const value = (percentage * SCREEN_HEIGHT) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

export const normalize = (size: number) => {
  const scale = SCREEN_WIDTH / baseWidth;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const isTablet = () => {
  return SCREEN_WIDTH >= 768;
};

export const isSmallScreen = () => {
  return SCREEN_WIDTH < 375;
};

export const isVerySmallScreen = () => {
  return SCREEN_WIDTH < 320;
};

export const isOldPhone = () => {
  return SCREEN_WIDTH < 375 || SCREEN_HEIGHT < 667;
};

export const getResponsiveSize = (small: number, medium: number, large: number) => {
  if (SCREEN_WIDTH < 320) return small * 0.9; // Very old phones
  if (SCREEN_WIDTH < 375) return small;
  if (SCREEN_WIDTH < 768) return medium;
  return large;
};

export const getResponsiveFontSize = (baseSize: number) => {
  if (SCREEN_WIDTH < 320) return baseSize * 0.85;
  if (SCREEN_WIDTH < 375) return baseSize * 0.9;
  return baseSize;
};

export const SCREEN_DIMENSIONS = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};