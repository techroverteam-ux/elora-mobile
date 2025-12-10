import { RefreshControlProps } from 'react-native';

export interface CustomRefreshConfig {
  colors?: string[];
  tintColor?: string;
  progressBackgroundColor?: string;
  size?: 'default' | 'large';
  title?: string;
  titleColor?: string;
}

export const createRefreshControl = (
  refreshing: boolean,
  onRefresh: () => void,
  config: CustomRefreshConfig = {}
): RefreshControlProps => {
  const {
    colors = ['#F8803B', '#FF6B35', '#F7931E'],
    tintColor = '#F8803B',
    progressBackgroundColor = '#FFFFFF',
    size = 'default',
    title,
    titleColor = '#666666',
  } = config;

  return {
    refreshing,
    onRefresh,
    colors,
    tintColor,
    progressBackgroundColor,
    size,
    title,
    titleColor,
  };
};

export const defaultRefreshConfig: CustomRefreshConfig = {
  colors: ['#F8803B', '#FF6B35', '#F7931E'],
  tintColor: '#F8803B',
  progressBackgroundColor: '#FFFFFF',
  size: 'default',
};

export const enhancedRefreshConfig: CustomRefreshConfig = {
  colors: ['#F8803B', '#FF6B35', '#F7931E', '#FFB74D'],
  tintColor: '#F8803B',
  progressBackgroundColor: '#F5F5F5',
  size: 'large',
  title: 'Pull to refresh',
  titleColor: '#666666',
};

export default {
  createRefreshControl,
  defaultRefreshConfig,
  enhancedRefreshConfig,
};