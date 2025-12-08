import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonItem from './SkeletonLoader';

export const CategoryListSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {[...Array(8)].map((_, index) => (
        <View key={index} style={styles.listItem}>
          <SkeletonItem width={70} height={70} borderRadius={10} />
          <View style={styles.textContainer}>
            <SkeletonItem width="80%" height={16} borderRadius={8} />
            <SkeletonItem width="60%" height={14} borderRadius={7} style={styles.subtitle} />
          </View>
          <SkeletonItem width={24} height={24} borderRadius={12} />
        </View>
      ))}
    </View>
  );
};

export const CategoryGridSkeleton: React.FC = () => {
  return (
    <View style={styles.gridContainer}>
      {[...Array(6)].map((_, index) => (
        <View key={index} style={styles.gridItem}>
          <SkeletonItem width="100%" height={120} borderRadius={12} />
          <SkeletonItem width="80%" height={14} borderRadius={7} style={styles.gridTitle} />
          <SkeletonItem width="60%" height={12} borderRadius={6} style={styles.gridSubtitle} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
    paddingTop: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  subtitle: {
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 16,
  },
  gridItem: {
    width: '45%',
    marginBottom: 16,
  },
  gridTitle: {
    marginTop: 8,
  },
  gridSubtitle: {
    marginTop: 4,
  },
});

export default CategoryListSkeleton;