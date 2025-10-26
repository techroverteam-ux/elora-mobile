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
import { useTranslation } from 'react-i18next';
import { CategoriesStackParamList } from '../../navigation/types';
import { useGetSectionsMutation } from '../../data/redux/services/sectionsApi';
import { useAuth } from '../../context/AuthContext';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

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

// Spiritual icons for categories
const getSpiritualIcon = (title: string, id: string) => {
  const titleLower = title.toLowerCase();
  
  // Match by title keywords
  if (titleLower.includes('gita') || titleLower.includes('geeta')) return 'book-open-variant';
  if (titleLower.includes('bhajan') || titleLower.includes('song')) return 'music-note';
  if (titleLower.includes('story') || titleLower.includes('katha')) return 'book-account';
  if (titleLower.includes('mantra') || titleLower.includes('chant')) return 'meditation';
  if (titleLower.includes('yoga') || titleLower.includes('meditation')) return 'meditation';
  if (titleLower.includes('prayer') || titleLower.includes('aarti')) return 'hands-pray';
  if (titleLower.includes('festival') || titleLower.includes('celebration')) return 'star-circle';
  if (titleLower.includes('temple') || titleLower.includes('mandir')) return 'home-variant';
  if (titleLower.includes('guru') || titleLower.includes('teacher')) return 'account-star';
  if (titleLower.includes('wisdom') || titleLower.includes('knowledge')) return 'lightbulb-on';
  if (titleLower.includes('peace') || titleLower.includes('shanti')) return 'peace';
  if (titleLower.includes('devotion') || titleLower.includes('bhakti')) return 'heart';
  
  // Fallback spiritual icons based on ID
  const spiritualIcons = [
    'om', 'meditation', 'book-open-variant', 'music-note', 'hands-pray', 
    'star-circle', 'lightbulb-on', 'heart', 'peace', 'account-star',
    'flower', 'candle', 'home-variant', 'book-account', 'star-four-points'
  ];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % spiritualIcons.length;
  return spiritualIcons[index];
};

const getRandomColor = (id: string) => {
  const colors = ['#FADBD8', '#FDEBD0', '#D6EAF8', '#D5F5E3', '#FCF3CF', '#E8DAEF', '#D1F2EB', '#FEF9E7', '#EBDEF0', '#D0ECE7'];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

const Categories = () => {
  const { t } = useTranslation();
  const [getSectionRequest, { data: sectionData, isLoading, isError }] = useGetSectionsMutation();

  useEffect(() => {
    try {
      console.log('Categories - Fetching sections...');
      getSectionRequest({});
    } catch (error) {
      console.error('Categories - Error fetching sections:', error);
    }
  }, [getSectionRequest]);

  // Debug logging
  console.log('Categories - Section data:', sectionData);
  console.log('Categories - Is loading:', isLoading);
  console.log('Categories - Is error:', isError);
  console.log('Categories - Sections count:', sectionData?.data?.length || 0);

  const renderItem = useCallback(
    ({ item }: { item: CategoryItem }) => <CategoryCard item={item} />,
    []
  );

  const keyExtractor = useCallback((item: CategoryItem, index: number) => item?._id || index.toString(), []);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#F8803B" />
        <Text style={styles.loaderText}>{t('screens.categories.loadingCategories')}</Text>
      </View>
    );
  }

  if (isError) {
    console.error('Categories - API Error:', isError);
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Error loading sections</Text>
        <Text style={styles.errorDetails}>Please check your internet connection</Text>
        <TouchableOpacity onPress={() => getSectionRequest({})} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!sectionData?.data?.length) {
    console.log('Categories - No sections data:', sectionData);
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('screens.categories.noCategories')}</Text>
        <TouchableOpacity onPress={() => getSectionRequest({})} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sectionData?.data || []}
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
  const navigation = useNavigation<CategoriesNavigationProp>();
  const { requireAuth } = useRequireAuth();

  const handlePress = () => {
    try {
      console.log('CategoryCard - Pressed category:', item.title, 'ID:', item._id);
      requireAuth(() => {
        // This callback runs only if user is authenticated
        console.log('CategoryCard - Navigating to CategorieDataList with:', {
          title: item.title || 'Category',
          id: item._id,
        });
        navigation.navigate('CategorieDataList', {
          title: item.title || 'Category',
          id: item._id,
        });
      });
    } catch (error) {
      console.error('CategoryCard - Navigation error:', error);
    }
  };

  return (
    <TouchableOpacity
      accessible
      accessibilityLabel={`Category: ${item.title}`}
      accessibilityRole="button"
      style={[styles.card, { backgroundColor: item.color || getRandomColor(item._id) }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.iconWrapper}>
        <MaterialDesignIcons 
          name={item.icon || getSpiritualIcon(item.title, item._id)} 
          size={28} 
          color="#F8803B" 
        />
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
  errorDetails: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
