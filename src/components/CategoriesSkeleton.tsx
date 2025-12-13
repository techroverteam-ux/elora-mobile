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

  const renderSkeletonCard = (index: number) => (
    <View key={index} style={[styles.categoryCard, { 
      width: cardWidth, 
      height: cardHeight,
      borderRadius: isTabletDevice ? 20 : 16,
      marginBottom: 15,
      padding: isTabletDevice ? 20 : 15,
      backgroundColor: '#f3f4f6'
    }]}>
      {/* Icon skeleton */}
      <View style={{
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: isTabletDevice ? 18 : 14,
        marginBottom: isTabletDevice ? 14 : 10,
        alignSelf: 'flex-start'
      }}>
        <SkeletonItem 
          width={isTabletDevice ? 36 : 28} 
          height={isTabletDevice ? 36 : 28} 
          borderRadius={isTabletDevice ? 18 : 14}
        />
      </View>
      
      {/* Title skeleton */}
      <SkeletonItem 
        width={cardWidth * 0.8} 
        height={isTabletDevice ? 18 : 15} 
        borderRadius={8}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.grid, { 
        paddingHorizontal: horizontalPadding, 
        paddingTop: isTabletDevice ? 20 : 10,
        paddingBottom: 20
      }]}>
        {[...Array(8)].map((_, index) => renderSkeletonCard(index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    flex: 1,
  },
  categoryCard: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
});

export default CategoriesSkeleton;