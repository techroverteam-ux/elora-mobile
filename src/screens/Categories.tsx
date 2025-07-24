import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback } from 'react'
import FastImage from 'react-native-fast-image'
import { categoryData } from '../data/categoryData';

const { width } = Dimensions.get('window');

type CategoryItem = {
  id: string;
  title: string;
  icon: string;
  color: string;
};

const CategoryCard = ({ item }: { item: CategoryItem }) => (
  <TouchableOpacity
    accessible={true}
    accessibilityLabel={`Category: ${item.title}`}
    accessibilityRole="button"
    style={[styles.card, { backgroundColor: item.color }]}
    onPress={() => console.log(item.title)}>
    {/* <FastImage
        style={{ width: 60, height: 60, borderRadius: 100 }}
        source={{
          uri: "https://unsplash.it/400/400?image=1",
          headers: { Authorization: 'someAuthToken' },
          priority: FastImage.priority.normal,
        }}
        resizeMode={FastImage.resizeMode.contain}
      /> */}
    <View style={styles.iconWrapper}>
      <Text style={styles.icon}>{item.icon}</Text>
    </View>
    <Text style={styles.title}>{item.title}</Text>
  </TouchableOpacity>
);

const Categories = () => {
  const renderItem = useCallback(({ item }: { item: CategoryItem }) => <CategoryCard item={item} />, []);

  return (
    <View style={styles.container}>
      <Text>Categories</Text>

      <FlatList
        data={categoryData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
      />
    </View>
  )
}

export default Categories

const horizontalPadding = 20;
const columnSpacing = 15; // space between two cards

const CARD_WIDTH = (width - horizontalPadding * 2 - columnSpacing) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  grid: {
    paddingHorizontal: horizontalPadding,
    paddingTop: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 0.9,
    borderRadius: 16,
    padding: 15,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#eee', // fallback color
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  iconWrapper: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 10,
  },
  icon: {
    fontSize: 26,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
});
