import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Linking,
} from 'react-native';
import React, { useEffect, useMemo } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

import AppBarHeader from '../../components/AppBarHeader';
import CustomVerticalFlatlist from '../../components/CustomVerticalFlatlist';
import { CategoriesStackParamList } from '../../navigation/types';
import { useGetCategoriesMutation, useGetCategoryDetailsMutation } from '../../data/redux/services/sectionsApi';
import { useContentTranslation } from '../../hooks/useContentTranslation';
import { CategoryListSkeleton } from '../../components/CategoryListSkeleton';
import BlogLayoutRenderer from '../../components/BlogLayoutRenderer';
import BlogLayoutSkeleton from '../../components/BlogLayoutSkeleton';

const CategorieDataList = () => {
  const { t } = useTranslation();
  const { translateItems, translateText } = useContentTranslation();
  const route = useRoute<RouteProp<CategoriesStackParamList, 'CategorieDataList'>>();
  const { title, id, sectionContentType } = route.params;
  
  // Translate the title from route params
  const translatedTitle = translateText(title);

  type CategorieDataListNavigationProp = NativeStackNavigationProp<
    CategoriesStackParamList,
    'CategorieDataList'
  >;
  const navigation = useNavigation<CategorieDataListNavigationProp>();
  const { navigate } = navigation;

  const [getCategoriesRequest, { data, error, isLoading }] = useGetCategoriesMutation();
  const [getCategoryDetails] = useGetCategoryDetailsMutation();
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
    if (id) {
      getCategoriesRequest(id);
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
  const isListType = contentType === 'list' || sectionContentType === 'list';
  const [showText, setShowText] = React.useState(true);
  const [isGridView, setIsGridView] = React.useState(false);

  React.useEffect(() => {
    if (isListType) {
      const timer = setTimeout(() => setShowText(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isListType]);

  const handleWhatsAppPress = () => {
    const whatsappUrl = 'https://chat.whatsapp.com/your-group-link';
    Linking.openURL(whatsappUrl).catch(err => console.error('Error opening WhatsApp:', err));
  };
  


  return (
    <View style={{ flex: 1 }}>
      <AppBarHeader 
        title={translatedTitle} 
        onBack={() => navigation.goBack()} 
        showViewToggle={true}
        isGridView={isGridView}
        onToggleView={() => setIsGridView(!isGridView)}
        showDownload={false}
      />

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
        <ScrollView 
          style={{ flex: 1 }} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#F8803B', '#FF6B35', '#F7931E']}
              tintColor="#F8803B"
              progressBackgroundColor="#FFFFFF"
              title="Pull to refresh"
              titleColor="#666666"
            />
          }
        >
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
              imageUrl={(item) => item.headerImage}
              scrollEnabled={false}
              nestedScrollEnabled={true}
              isGridView={isGridView}
              onItemPress={async (item) => {
                  if (isListType) {
                    try {
                      console.log('🔍 Checking for content list - Category ID:', item._id);
                      console.log('🔍 API URL:', `https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api/categories/${item._id}`);
                      
                      // First check if contentList is already available in the item
                      if (item.contentList && item.contentList.length > 0) {
                        console.log('✅ Content list found in category data:', item.contentList.length, 'items');
                        console.log('📋 CONTENT LIST DATA:', JSON.stringify(item.contentList, null, 2));
                        navigate('ContentListView', {
                          contentList: item.contentList,
                          title: item.title || item.name,
                          categoryData: item
                        });
                        return;
                      }
                      
                      // If not available, fetch category details
                      const categoryDetails = await getCategoryDetails(item._id);
                      console.log('📡 API Response:', JSON.stringify(categoryDetails, null, 2));
                      
                      if (categoryDetails.data?.success && categoryDetails.data?.data?.contentList?.length > 0) {
                        console.log('✅ Content list found in API response:', categoryDetails.data.data.contentList.length, 'items');
                        console.log('📋 CONTENT LIST DATA:', JSON.stringify(categoryDetails.data.data.contentList, null, 2));
                        navigate('ContentListView', {
                          contentList: categoryDetails.data.data.contentList,
                          title: item.title || item.name,
                          categoryData: categoryDetails.data.data
                        });
                      } else {
                        console.log('⚠️ No content list found, navigating to subcategories');
                        navigate('SubCategorie', {
                          sectionId: id,
                          categoryId: item._id,
                          title: item.title || item.name,
                          categoryData: item
                        });
                      }
                    } catch (error) {
                      console.error('❌ Error fetching category details:', error);
                      navigate('SubCategorie', {
                        sectionId: id,
                        categoryId: item._id,
                        title: item.title || item.name,
                        categoryData: item
                      });
                    }
                  } else {
                    navigate('BlogPage', { categoryData: item });
                  }
                }
              }
            />
          )}
        </ScrollView>
      )}
      {isListType && (
        <TouchableOpacity 
          style={[styles.whatsappFloating, showText && styles.whatsappExpanded]} 
          onPress={handleWhatsAppPress}
        >
          <MaterialDesignIcons name="whatsapp" size={28} color="#FFFFFF" />
          {showText && <Text style={styles.whatsappText}>Join us for more content</Text>}
        </TouchableOpacity>
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
  whatsappFloating: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 1000,
    flexDirection: 'row',
  },
  whatsappExpanded: {
    width: 'auto',
    paddingHorizontal: 16,
    borderRadius: 28,
  },
  whatsappText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
