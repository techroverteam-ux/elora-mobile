import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { wp, hp, normalize } from '../utils/responsive';
import { useThemeContext } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EnhancedBlogSkeletonProps {
  sectionsCount?: number;
}

const EnhancedBlogSkeleton: React.FC<EnhancedBlogSkeletonProps> = ({
  sectionsCount = 5,
}) => {
  const { colors } = useTheme();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };

    shimmer();
  }, [shimmerAnimation]);

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const SkeletonBox: React.FC<{ width: number | string; height: number; style?: any }> = ({
    width,
    height,
    style,
  }) => (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: isDark ? '#2a2a2a' : '#e0e0e0',
          borderRadius: normalize(8),
          opacity: shimmerOpacity,
        },
        style,
      ]}
    />
  );

  const styles = getStyles(isDark);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <SkeletonBox width={normalize(24)} height={normalize(24)} />
        <View style={styles.headerContent}>
          <SkeletonBox width="70%" height={normalize(16)} />
          <SkeletonBox width="40%" height={normalize(12)} style={{ marginTop: hp(0.5) }} />
        </View>
        <SkeletonBox width={normalize(24)} height={normalize(24)} />
      </View>

      {/* Progress Bar Skeleton */}
      <View style={styles.progressContainer}>
        <SkeletonBox width="30%" height={3} style={{ borderRadius: 0 }} />
      </View>

      {/* Content Skeleton */}
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <SkeletonBox width={wp(20)} height={normalize(24)} style={{ borderRadius: normalize(12) }} />
          <SkeletonBox width="90%" height={normalize(32)} style={{ marginTop: hp(2) }} />
          <SkeletonBox width="70%" height={normalize(18)} style={{ marginTop: hp(1) }} />
          
          <View style={styles.metaInfo}>
            <SkeletonBox width={wp(25)} height={normalize(16)} />
            <SkeletonBox width={wp(25)} height={normalize(16)} />
          </View>
        </View>

        {/* Intro Section */}
        <View style={styles.introSection}>
          <SkeletonBox width="100%" height={normalize(16)} />
          <SkeletonBox width="95%" height={normalize(16)} style={{ marginTop: hp(0.8) }} />
          <SkeletonBox width="80%" height={normalize(16)} style={{ marginTop: hp(0.8) }} />
        </View>

        {/* Content Fields */}
        {Array.from({ length: sectionsCount }).map((_, index) => (
          <View key={index} style={styles.fieldSection}>
            {/* Header */}
            <View style={styles.fieldHeader}>
              <SkeletonBox width={wp(12)} height={4} style={{ borderRadius: 2 }} />
              <SkeletonBox width="60%" height={normalize(24)} style={{ marginTop: hp(1) }} />
            </View>

            {/* Content based on field type simulation */}
            {index % 3 === 0 ? (
              // Image field
              <View style={styles.imageField}>
                <SkeletonBox width="100%" height={hp(25)} />
                <SkeletonBox width="50%" height={normalize(14)} style={{ marginTop: hp(1), alignSelf: 'center' }} />
              </View>
            ) : index % 3 === 1 ? (
              // Description field
              <View style={styles.descriptionField}>
                <SkeletonBox width="100%" height={normalize(16)} />
                <SkeletonBox width="95%" height={normalize(16)} style={{ marginTop: hp(0.8) }} />
                <SkeletonBox width="90%" height={normalize(16)} style={{ marginTop: hp(0.8) }} />
                <SkeletonBox width="75%" height={normalize(16)} style={{ marginTop: hp(0.8) }} />
              </View>
            ) : (
              // Media field (video/pdf)
              <View style={styles.mediaField}>
                <View style={styles.mediaHeader}>
                  <SkeletonBox width={normalize(24)} height={normalize(24)} />
                  <SkeletonBox width="40%" height={normalize(18)} style={{ marginLeft: wp(2) }} />
                </View>
                <SkeletonBox width="100%" height={hp(20)} />
              </View>
            )}
          </View>
        ))}

        {/* Conclusion Section */}
        <View style={styles.conclusionSection}>
          <SkeletonBox width="100%" height={normalize(16)} />
          <SkeletonBox width="85%" height={normalize(16)} style={{ marginTop: hp(0.8) }} />
          <SkeletonBox width="70%" height={normalize(16)} style={{ marginTop: hp(0.8) }} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <SkeletonBox width="60%" height={normalize(14)} />
        </View>
      </View>
    </View>
  );
};

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#2a2a2a' : '#e0e0e0',
  },
  headerContent: {
    flex: 1,
    marginHorizontal: wp(3),
  },
  progressContainer: {
    height: 3,
    backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  heroSection: {
    paddingTop: hp(3),
    paddingBottom: hp(2),
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    marginTop: hp(2),
  },
  introSection: {
    padding: wp(4),
    backgroundColor: isDark ? '#1e1e1e' : '#f8f9fa',
    borderRadius: normalize(12),
    marginBottom: hp(3),
    borderLeftWidth: 4,
    borderLeftColor: '#F8803B',
  },
  fieldSection: {
    marginVertical: hp(2),
  },
  fieldHeader: {
    marginBottom: hp(1.5),
  },
  imageField: {
    marginVertical: hp(1),
  },
  descriptionField: {
    marginVertical: hp(1),
  },
  mediaField: {
    marginVertical: hp(1),
  },
  mediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  conclusionSection: {
    padding: wp(4),
    backgroundColor: isDark ? '#1e1e1e' : '#f8f9fa',
    borderRadius: normalize(12),
    marginTop: hp(3),
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  footer: {
    padding: wp(4),
    marginTop: hp(4),
    alignItems: 'center',
  },
});

export default EnhancedBlogSkeleton;