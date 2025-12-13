import React, { useCallback, useEffect, memo, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { createRefreshControl, enhancedRefreshConfig } from '../../utils/refreshUtils';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { CategoriesStackParamList } from '../../navigation/types';
import { useGetSectionsMutation } from '../../data/redux/services/sectionsApi';
import { useAuth } from '../../context/AuthContext';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useContentTranslation } from '../../hooks/useContentTranslation';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CategoriesSkeleton from '../../components/CategoriesSkeleton';

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
  const { translateItems } = useContentTranslation();
  const [getSectionRequest, { data: sectionData, isLoading, isError }] = useGetSectionsMutation();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getSectionRequest({});
    } catch (error) {
      console.error('Categories - Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };
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
  
  console.log('Categories - Screen width:', width);
  console.log('Categories - Is tablet:', isTabletDevice);
  console.log('Categories - Num columns:', numColumns);

  // Translate sections data when language changes
  const translatedSections = useMemo(() => {
    if (!sectionData?.data) return [];
    
    console.log('Categories - Original sections:', sectionData.data.map(item => ({ title: item.title, description: item.description })));
    
    const translated = translateItems(sectionData.data, ['title', 'description']);
    
    console.log('Categories - Translated sections:', translated.map(item => ({ title: item.title, description: item.description })));
    
    return translated;
  }, [sectionData?.data, translateItems]);

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



  const keyExtractor = useCallback((item: CategoryItem, index: number) => item?._id || index.toString(), []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <CategoriesSkeleton />
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

  const horizontalPadding = isTabletDevice ? 40 : 20;
  const columnSpacing = isTabletDevice ? 20 : 15;
  const cardWidth = (width - horizontalPadding * 2 - columnSpacing * (numColumns - 1)) / numColumns;
  
  return (
    <View style={styles.container}>
      <FlatList
        data={translatedSections as CategoryItem[]}
        renderItem={({ item }) => <CategoryCard item={item} cardWidth={cardWidth} isTablet={isTabletDevice} />}
        keyExtractor={keyExtractor}
        key={numColumns}
        numColumns={numColumns}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 15 }}
        contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingTop: isTabletDevice ? 20 : 10, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            {...createRefreshControl(refreshing, onRefresh, {
              ...enhancedRefreshConfig,
              title: 'Pull to refresh categories'
            })}
          />
        }
      />
    </View>
  );
};

const CategoryCard = memo(({ item, cardWidth, isTablet }: { item: CategoryItem; cardWidth: number; isTablet: boolean }) => {
  type CategoriesNavigationProp = NativeStackNavigationProp<
    CategoriesStackParamList,
    'CategoriesMain'
  >;
  const navigation = useNavigation<CategoriesNavigationProp>();
  const { requireAuth } = useRequireAuth();

  const handlePress = () => {
    try {
      console.log('CategoryCard - Pressed category:', item.title, 'ID:', item._id, 'ContentType:', item.contentType);
      requireAuth(() => {
        // Check if it's a blog section
        if (item.contentType === 'blog') {
          console.log('CategoryCard - Blog section, navigating to CategorieDataList');
          navigation.navigate('CategorieDataList', {
            title: item.title || 'Category',
            id: item._id,
          });
        } else if (item.contentType === 'attractive') {
          // For attractive sections with action buttons, navigate to buttons screen
          console.log('CategoryCard - Attractive section with buttons, navigating to AttractiveButtonsScreen');
          (navigation as any).navigate('AttractiveButtonsScreen', {
            sectionId: item._id,
            title: item.title,
          });
        } else {
          // Default: navigate to category list
          navigation.navigate('CategorieDataList', {
            title: item.title || 'Category',
            id: item._id,
          });
        }
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
      style={{
        width: cardWidth,
        height: isTablet ? cardWidth * 0.85 : cardWidth * 0.9,
        borderRadius: isTablet ? 20 : 16,
        padding: isTablet ? 20 : 15,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundColor: item.color || getRandomColor(item._id),
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      }}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={{
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: isTablet ? 18 : 14,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        marginBottom: isTablet ? 14 : 10,
      }}>
        <MaterialDesignIcons 
          name={(item.icon || getSpiritualIcon(item.title, item._id)) as any} 
          size={isTablet ? 36 : 28} 
          color="#F8803B" 
        />
      </View>
      <Text style={{ fontSize: isTablet ? 18 : 15, fontWeight: '600', color: '#333' }}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
});

export default Categories;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
