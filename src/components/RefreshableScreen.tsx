import React from 'react';
import {
  View,
  ScrollView,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { createRefreshControl, enhancedRefreshConfig } from '../utils/refreshUtils';
import SimplePullToRefresh from './SimplePullToRefresh';

interface RefreshableScreenProps {
  children: React.ReactNode;
  refreshing: boolean;
  onRefresh: () => void;
  variant?: 'scroll' | 'flatlist' | 'custom';
  data?: any[];
  renderItem?: ({ item, index }: { item: any; index: number }) => React.ReactElement;
  keyExtractor?: (item: any, index: number) => string;
  numColumns?: number;
  horizontal?: boolean;
  contentContainerStyle?: any;
  style?: any;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  refreshTitle?: string;
}

const RefreshableScreen: React.FC<RefreshableScreenProps> = ({
  children,
  refreshing,
  onRefresh,
  variant = 'scroll',
  data,
  renderItem,
  keyExtractor,
  numColumns,
  horizontal = false,
  contentContainerStyle,
  style,
  showsVerticalScrollIndicator = false,
  showsHorizontalScrollIndicator = false,
  refreshTitle = 'Pull to refresh',
}) => {
  const { colors } = useTheme();

  const refreshControlProps = createRefreshControl(refreshing, onRefresh, {
    ...enhancedRefreshConfig,
    title: refreshTitle,
    progressBackgroundColor: colors.surface,
  });

  switch (variant) {
    case 'flatlist':
      if (!data || !renderItem) {
        throw new Error('FlatList variant requires data and renderItem props');
      }
      return (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={numColumns}
          horizontal={horizontal}
          style={[styles.container, style]}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
          refreshControl={<RefreshControl {...refreshControlProps} />}
        />
      );

    case 'custom':
      return (
        <SimplePullToRefresh
          refreshing={refreshing}
          onRefresh={onRefresh}
          style={[styles.container, style]}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        >
          {children}
        </SimplePullToRefresh>
      );

    case 'scroll':
    default:
      return (
        <ScrollView
          style={[styles.container, style]}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
          refreshControl={<RefreshControl {...refreshControlProps} />}
        >
          {children}
        </ScrollView>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default RefreshableScreen;