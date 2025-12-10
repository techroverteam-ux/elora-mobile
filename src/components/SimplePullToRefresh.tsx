import React from 'react';
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useTheme } from 'react-native-paper';

interface SimplePullToRefreshProps {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
  style?: any;
  contentContainerStyle?: any;
  showsVerticalScrollIndicator?: boolean;
}

const SimplePullToRefresh: React.FC<SimplePullToRefreshProps> = ({
  refreshing,
  onRefresh,
  children,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
}) => {
  const { colors } = useTheme();


  const CustomRefreshControl = () => (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[colors.primary]}
      tintColor={colors.primary}
      progressBackgroundColor={colors.surface}
      style={styles.refreshControl}
    />
  );

  return (
    <ScrollView
      style={[styles.scrollView, style]}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      refreshControl={<CustomRefreshControl />}
      bounces={true}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  refreshControl: {
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
});

export default SimplePullToRefresh;