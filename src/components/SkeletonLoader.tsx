import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { wp, hp, normalize } from '../utils/responsive';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

const SkeletonItem: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4, 
  style 
}) => {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.2, 0.8, 0.2],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E8E8E8',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.9)',
          opacity,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
};

export const CarouselSkeleton: React.FC = () => {
  return (
    <View style={styles.carouselContainer}>
      <SkeletonItem 
        width="100%" 
        height={200} 
        borderRadius={20} 
        style={styles.carouselSkeleton}
      />
      <View style={styles.dotsContainer}>
        {[...Array(3)].map((_, index) => (
          <SkeletonItem 
            key={index}
            width={8} 
            height={8} 
            borderRadius={4} 
            style={styles.dotSkeleton}
          />
        ))}
      </View>
    </View>
  );
};

export const GallerySkeleton: React.FC = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const { width, height } = Dimensions.get('window');
    setDimensions({ width, height });
    
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);
  
  const is7Inch = dimensions.width >= 600 && dimensions.width < 800;
  const is10Inch = dimensions.width >= 800;
  const itemWidth = is10Inch ? 200 : is7Inch ? 160 : wp(30);
  const itemHeight = is10Inch ? 240 : is7Inch ? 192 : wp(36);
  const spacing = is10Inch ? 20 : is7Inch ? 14 : wp(2.5);
  
  return (
    <View style={styles.galleryContainer}>
      <View style={styles.galleryHeader}>
        <View style={styles.titleRow}>
          <SkeletonItem width={is10Inch ? 32 : is7Inch ? 26 : 24} height={is10Inch ? 32 : is7Inch ? 26 : 24} borderRadius={12} />
          <SkeletonItem width={wp(40)} height={is10Inch ? 24 : is7Inch ? 20 : 16} borderRadius={8} style={{ marginLeft: 8 }} />
        </View>
        <SkeletonItem width={wp(20)} height={is10Inch ? 15 : 13} borderRadius={8} />
      </View>
      <View style={styles.galleryItems}>
        {[...Array(4)].map((_, index) => (
          <View key={index} style={[styles.galleryItemSkeleton, { marginRight: index < 3 ? spacing : 0 }]}>
            <SkeletonItem 
              width={itemWidth} 
              height={itemHeight} 
              borderRadius={14} 
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export const MediaListSkeleton: React.FC = () => {
  return (
    <View style={styles.mediaListContainer}>
      <View style={styles.mediaListHeader}>
        <View style={styles.titleRow}>
          <SkeletonItem width={24} height={24} borderRadius={12} />
          <SkeletonItem width={wp(35)} height={18} borderRadius={9} style={{ marginLeft: 8 }} />
        </View>
        <SkeletonItem width={wp(18)} height={16} borderRadius={8} />
      </View>
      <View style={styles.mediaListItems}>
        {[...Array(3)].map((_, index) => (
          <View key={index} style={styles.mediaItemSkeleton}>
            <SkeletonItem 
              width={wp(32)} 
              height={wp(40)} 
              borderRadius={12} 
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export const ListViewSkeleton: React.FC = () => {
  return (
    <View style={styles.listViewContainer}>
      {[...Array(8)].map((_, index) => (
        <View key={index} style={styles.listItemSkeleton}>
          <SkeletonItem width={60} height={60} borderRadius={8} />
          <View style={styles.listItemContent}>
            <SkeletonItem width={wp(50)} height={16} borderRadius={8} />
            <SkeletonItem width={wp(35)} height={14} borderRadius={7} style={{ marginTop: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
};

export const GridViewSkeleton: React.FC = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const { width, height } = Dimensions.get('window');
    setDimensions({ width, height });
    
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);
  
  const is10Inch = dimensions.width >= 800;
  const numColumns = is10Inch ? 4 : 3;
  const itemWidth = (dimensions.width - (16 * 2) - (8 * (numColumns - 1))) / numColumns;
  
  return (
    <View style={styles.gridViewContainer}>
      {[...Array(12)].map((_, index) => (
        <View key={index} style={[styles.gridItemSkeleton, { width: itemWidth, marginRight: (index + 1) % numColumns === 0 ? 0 : 8 }]}>
          <SkeletonItem width={itemWidth} height={itemWidth * 0.75} borderRadius={12} />
          <View style={styles.gridItemContent}>
            <SkeletonItem width={itemWidth * 0.8} height={14} borderRadius={7} style={{ marginTop: 8 }} />
            <SkeletonItem width={itemWidth * 0.6} height={12} borderRadius={6} style={{ marginTop: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    marginBottom: 6,
  },
  carouselSkeleton: {
    marginHorizontal: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  dotSkeleton: {
    marginHorizontal: 5,
  },
  galleryContainer: {
    marginBottom: 12,
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  galleryItems: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  galleryItemSkeleton: {
    marginRight: wp(2.5),
  },
  mediaListContainer: {
    marginBottom: 12,
  },
  mediaListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  mediaListItems: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  mediaItemSkeleton: {
    marginRight: 10,
  },
  listViewContainer: {
    padding: 16,
  },
  listItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
  },
  listItemContent: {
    marginLeft: 12,
    flex: 1,
  },
  gridViewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'flex-start',
  },
  gridItemSkeleton: {
    marginBottom: 16,
    marginHorizontal: 4,
  },
  gridItemContent: {
    alignItems: 'flex-start',
  },
});

export default SkeletonItem;