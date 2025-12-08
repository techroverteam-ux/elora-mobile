import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SkeletonItem from './SkeletonLoader';
import { wp, hp } from '../utils/responsive';

export const CategoriesSkeleton: React.FC = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);
  
  const width = dimensions.width;
  const isTabletDevice = width >= 768;
  const numColumns = width >= 1024 ? 4 : width >= 768 ? 3 : 2;
  const horizontalPadding = isTabletDevice ? 40 : 20;
  const columnSpacing = isTabletDevice ? 20 : 15;
  const cardWidth = (width - horizontalPadding * 2 - columnSpacing * (numColumns - 1)) / numColumns;
  const cardHeight = isTabletDevice ? cardWidth * 0.85 : cardWidth * 0.9;

  return (
    <View style={styles.container}>
      <View style={[styles.grid, { paddingHorizontal: horizontalPadding, paddingTop: isTabletDevice ? 20 : 10 }]}>
        {[...Array(8)].map((_, index) => (
          <View key={index} style={[styles.categoryCard, { 
            width: cardWidth, 
            height: cardHeight,
            borderRadius: isTabletDevice ? 20 : 16,
            marginBottom: 15 
          }]}>
            <SkeletonItem 
              width={cardWidth} 
              height={cardHeight} 
              borderRadius={isTabletDevice ? 20 : 16}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
});

export default CategoriesSkeleton;