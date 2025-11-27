import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SkeletonItem from './SkeletonLoader';
import { wp } from '../utils/responsive';

const { width } = Dimensions.get('window');
const getNumColumns = () => 3;
const getItemWidth = () => (width - wp(8) - 2 * wp(4)) / 3;

export const CategoriesFullSkeleton: React.FC = () => {
  const numColumns = getNumColumns();
  
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {[...Array(12)].map((_, index) => (
          <View key={index} style={styles.categoryItem}>
            <SkeletonItem width={getItemWidth()} height={getItemWidth() * 0.9} borderRadius={wp(4)} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp(5),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  categoryItem: {
    width: getItemWidth(),
    marginBottom: wp(4),
  },
});

export default CategoriesFullSkeleton;