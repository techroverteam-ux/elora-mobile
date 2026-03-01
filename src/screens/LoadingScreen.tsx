import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const LoadingScreen = () => {
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
    bg: darkMode ? '#0F172A' : '#FFFFFF',
    skeleton: darkMode ? '#1E293B' : '#F1F5F9',
    shimmer: darkMode ? '#334155' : '#E2E8F0',
  };

  const SkeletonBox = ({ width, height, style }: any) => (
    <View style={[{ width, height, backgroundColor: colors.skeleton, borderRadius: 8 }, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.shimmer,
            borderRadius: 8,
            opacity: shimmerAnim,
          },
        ]}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <SkeletonBox width={40} height={40} style={{ borderRadius: 8 }} />
        <SkeletonBox width={200} height={24} />
        <SkeletonBox width={40} height={40} style={{ borderRadius: 20 }} />
      </View>

      {/* Content Skeleton */}
      <View style={styles.content}>
        {/* Cards */}
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.card}>
            <View style={styles.cardHeader}>
              <SkeletonBox width={60} height={60} style={{ borderRadius: 12 }} />
              <View style={styles.cardInfo}>
                <SkeletonBox width={150} height={16} />
                <SkeletonBox width={100} height={12} style={{ marginTop: 8 }} />
              </View>
              <SkeletonBox width={24} height={24} style={{ borderRadius: 12 }} />
            </View>
            <SkeletonBox width="100%" height={1} style={{ marginVertical: 16 }} />
            <View style={styles.cardContent}>
              <SkeletonBox width="100%" height={12} />
              <SkeletonBox width="80%" height={12} style={{ marginTop: 8 }} />
              <SkeletonBox width="60%" height={12} style={{ marginTop: 8 }} />
            </View>
          </View>
        ))}

        {/* List Items */}
        <View style={styles.listSection}>
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={styles.listItem}>
              <SkeletonBox width={40} height={40} style={{ borderRadius: 20 }} />
              <View style={styles.listContent}>
                <SkeletonBox width={120} height={14} />
                <SkeletonBox width={80} height={10} style={{ marginTop: 6 }} />
              </View>
              <SkeletonBox width={60} height={12} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'transparent',
    marginBottom: 16,
    padding: 16,
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
  listSection: {
    marginTop: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
  },
});

export default LoadingScreen;