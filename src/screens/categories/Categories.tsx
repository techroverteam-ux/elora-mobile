import React, { useCallback, useEffect, memo } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CategoriesStackParamList } from '../../navigation/types';
import { useGetSectionsMutation } from '../../data/redux/services/sectionsApi';
import { useAuth } from '../../context/AuthContext';
import { useRequireAuth } from '../../hooks/useRequireAuth';

const { width } = Dimensions.get('window');

type CategoryItem = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  contentType?: string;
  color?: string;
  icon?: string;
};

const Categories = () => {
  const [getSectionRequest, { data: sectionData, isLoading, isError }] = useGetSectionsMutation();

  useEffect(() => {
    getSectionRequest({});
  }, [getSectionRequest]);

  const renderItem = useCallback(
    ({ item }: { item: CategoryItem }) => <CategoryCard item={item} />,
    []
  );

  const keyExtractor = useCallback((item: CategoryItem) => item._id, []);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loaderText}>Loading categories...</Text>
      </View>
    );
  }

  if (isError || !sectionData?.data?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No categories available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sectionData.data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// Separate memoized card to prevent unnecessary re-renders
const CategoryCard = memo(({ item }: { item: CategoryItem }) => {
  type CategoriesNavigationProp = NativeStackNavigationProp<
    CategoriesStackParamList,
    'CategoriesMain'
  >;
  const { navigate } = useNavigation<CategoriesNavigationProp>();
  const { requireAuth } = useRequireAuth();

  const handlePress = () => {
    if (!requireAuth('App', {
      screen: 'Categories',   // tab navigator screen
      params: {
        screen: 'CategorieDataList', // stack screen inside the tab
        params: { title: item.title, id: item._id },
      },
    })) return;

    // If already logged in, navigate directly
    navigate('CategorieDataList', {
      title: item.title,
      id: item._id,
    });
  };

  return (
    <TouchableOpacity
      accessible
      accessibilityLabel={`Category: ${item.title}`}
      accessibilityRole="button"
      style={[styles.card, { backgroundColor: item.color || '#f2f2f2' }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.iconWrapper}>
        <Text style={styles.icon}>{item.icon || '📁'}</Text>
      </View>
      <Text style={styles.title}>
        {item.title}
      </Text>
      {/* <Text>{item.contentType}</Text> */}
    </TouchableOpacity>
  );
});

export default Categories;

const horizontalPadding = 20;
const columnSpacing = 15;
const CARD_WIDTH = (width - horizontalPadding * 2 - columnSpacing) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    paddingHorizontal: horizontalPadding,
    paddingTop: 10,
    paddingBottom: 20,
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
    backgroundColor: '#eee',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  iconWrapper: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
