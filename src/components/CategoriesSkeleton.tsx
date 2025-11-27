import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SkeletonItem from './SkeletonLoader';
import { wp, hp } from '../utils/responsive';

const { width } = Dimensions.get('window');
const getNumColumns = () => width > 768 ? 3 : 2;
const getItemWidth = () => (width - wp(8) - (getNumColumns() - 1) * wp(4)) / getNumColumns();

export const CategoriesSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header skeleton */}
      <View style={styles.header}>
        <SkeletonItem width={wp(60)} height={24} borderRadius={12} />
      </View>
      
      {/* Categories grid skeleton */}
      <View style={styles.grid}>
        {[...Array(6)].map((_, index) => (
          <View key={index} style={styles.categoryItem}>
            <SkeletonItem width={getItemWidth()} height={wp(30)} borderRadius={wp(3)} />
            <SkeletonItem width={getItemWidth() * 0.7} height={wp(4)} borderRadius={wp(2)} style={styles.categoryTitle} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: wp(2),
  },
  categoryItem: {
    width: getItemWidth(),
    marginBottom: wp(5),
    alignItems: 'center',
  },
  categoryTitle: {
    marginTop: wp(2),
  },
});

export default CategoriesSkeleton;