import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}) => {
  const { darkMode } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };
    shimmer();
  }, [shimmerAnim]);

  const colors = {
    skeleton: darkMode ? '#1E293B' : '#F1F5F9',
    shimmer: darkMode ? '#334155' : '#E2E8F0',
  };

  return (
    <View style={[{ width, height, backgroundColor: colors.skeleton, borderRadius }, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.shimmer,
            borderRadius,
            opacity: shimmerAnim,
          },
        ]}
      />
    </View>
  );
};

export const SkeletonCard: React.FC = () => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Skeleton width={60} height={60} borderRadius={12} />
      <View style={styles.cardInfo}>
        <Skeleton width={150} height={16} />
        <Skeleton width={100} height={12} style={{ marginTop: 8 }} />
      </View>
      <Skeleton width={24} height={24} borderRadius={12} />
    </View>
    <Skeleton width="100%" height={1} style={{ marginVertical: 16 }} />
    <View style={styles.cardContent}>
      <Skeleton width="100%" height={12} />
      <Skeleton width="80%" height={12} style={{ marginTop: 8 }} />
      <Skeleton width="60%" height={12} style={{ marginTop: 8 }} />
    </View>
  </View>
);

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <View>
    {Array.from({ length: items }).map((_, index) => (
      <View key={index} style={styles.listItem}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.listContent}>
          <Skeleton width={120} height={14} />
          <Skeleton width={80} height={10} style={{ marginTop: 6 }} />
        </View>
        <Skeleton width={60} height={12} />
      </View>
    ))}
  </View>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <View>
    {/* Header */}
    <View style={styles.tableHeader}>
      <Skeleton width={80} height={16} />
      <Skeleton width={100} height={16} />
      <Skeleton width={60} height={16} />
      <Skeleton width={40} height={16} />
    </View>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, index) => (
      <View key={index} style={styles.tableRow}>
        <Skeleton width={70} height={14} />
        <Skeleton width={90} height={14} />
        <Skeleton width={50} height={14} />
        <Skeleton width={30} height={14} />
      </View>
    ))}
  </View>
);

export const PageSkeleton: React.FC<{ type?: 'dashboard' | 'list' | 'table' }> = ({ 
  type = 'dashboard' 
}) => {
  const { darkMode } = useTheme();
  
  const colors = {
    bg: darkMode ? '#0F172A' : '#FFFFFF',
  };

  if (type === 'dashboard') {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.statCard}>
              <Skeleton width={40} height={40} borderRadius={8} />
              <Skeleton width={60} height={12} style={{ marginTop: 8 }} />
              <Skeleton width={40} height={16} style={{ marginTop: 4 }} />
            </View>
          ))}
        </View>
        
        {/* Main Cards */}
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  if (type === 'table') {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <SkeletonTable rows={8} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SkeletonList items={8} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardContent: {
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
  },
});

export default PageSkeleton;