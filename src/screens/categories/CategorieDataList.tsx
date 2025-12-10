import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import SimplePullToRefresh from '../../components/SimplePullToRefresh';
import React, { useEffect, useMemo } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import AppBarHeader from '../../components/AppBarHeader';
import CustomVerticalFlatlist from '../../components/CustomVerticalFlatlist';
import { CategoriesStackParamList } from '../../navigation/types';
import { useGetCategoriesMutation } from '../../data/redux/services/sectionsApi';
import { useContentTranslation } from '../../hooks/useContentTranslation';
import { CategoryListSkeleton } from '../../components/CategoryListSkeleton';
import BlogLayoutRenderer from '../../components/BlogLayoutRenderer';
import BlogLayoutSkeleton from '../../components/BlogLayoutSkeleton';

const CategorieDataList = () => {
  const { t } = useTranslation();
  const { translateItems, translateText } = useContentTranslation();
  const route = useRoute<RouteProp<CategoriesStackParamList, 'CategorieDataList'>>();
  const { title, id } = route.params;
  
  // Translate the title from route params
  const translatedTitle = translateText(title);

  type CategorieDataListNavigationProp = NativeStackNavigationProp<
    CategoriesStackParamList,
    'CategorieDataList'
  >;
  const { navigate } = useNavigation<CategorieDataListNavigationProp>();

  const [getCategoriesRequest, { data, error, isLoading }] = useGetCategoriesMutation();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getCategoriesRequest(id);
    } finally {
      setRefreshing(false);
    }
  };

  // Translate categories data when language changes
  const translatedCategories = useMemo(() => {
    if (!data?.data) return [];
    return translateItems(data.data, ['title', 'description', 'name']);
  }, [data?.data, translateItems]);

  useEffect(() => {
    console.log('CategorieDataList - Fetching categories for section ID:', id);
    if (id) {
      getCategoriesRequest(id).then((result) => {
        console.log('CategorieDataList - API Response:', result);
        if (result.error) {
          console.error('CategorieDataList - API Error:', result.error);
        }
      }).catch((err) => {
        console.error('CategorieDataList - Request failed:', err);
      });
    } else {
      console.error('CategorieDataList - No section ID provided');
    }
  }, [getCategoriesRequest, id]);

  // Check content type and layout
  const categories = data?.data || [];
  const contentType = data?.contentType;
  const layout = data?.layout;
  const isBlogLayout = data?.isBlogLayout || categories.some(cat => cat.isBlogLayout);
  const isVideoLayout = categories.some(cat => cat.isVideoLayout);
  const isAudioLayout = categories.some(cat => cat.isAudioLayout);
  const isGalleryLayout = categories.some(cat => cat.isGalleryLayout);
  
  // Debug logging
  console.log('CategorieDataList - Content Type:', contentType);
  console.log('CategorieDataList - Layout:', layout);
  console.log('CategorieDataList - Layout Flags:', { isBlogLayout, isVideoLayout, isAudioLayout, isGalleryLayout });
  console.log('CategorieDataList - Categories count:', categories.length);

  return (
    <View style={{ flex: 1 }}>
      <AppBarHeader title={translatedTitle} />

      {isLoading ? (
        <CategoryListSkeleton />
      ) : error ? (
        <View style={styles.loaderContainer}>
          <Text style={styles.errorText}>{t('screens.categories.errorLoading')}</Text>
          <Text style={styles.errorDetails}>Section ID: {id}</Text>
          <Text style={styles.errorDetails}>{JSON.stringify(error)}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => getCategoriesRequest(id)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SimplePullToRefresh refreshing={refreshing} onRefresh={onRefresh}>
          {translatedCategories.length === 0 ? (
            <View style={styles.loaderContainer}>
              <Text style={styles.errorText}>No categories found for this section</Text>
              <Text style={styles.errorDetails}>Section ID: {id}</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={() => getCategoriesRequest(id)}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <CustomVerticalFlatlist
              data={translatedCategories}
              imageUrl={(item) => {
                console.log('🖼️ CategorieDataList - Full item data:', JSON.stringify(item, null, 2));
                console.log('🖼️ CategorieDataList - imageUrl function called for:', item.title, 'headerImage:', item.headerImage);
                return item.headerImage;
              }}
              onItemPress={(item) => {
                console.log('Item pressed:', item);
                navigate('BlogPage', { categoryData: item });
              }}
            />
          )}
        </SimplePullToRefresh>
      )}
    </View>
  );
};

export default CategorieDataList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  errorDetails: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  debugText: {
    fontSize: 14,
    color: '#333',
    padding: 10,
    textAlign: 'center',
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
  noImageContainer: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
  },
  noImageText: {
    fontSize: 14,
    color: '#777',
  },
});
