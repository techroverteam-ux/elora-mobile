import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useMemo } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import AppBarHeader from '../../components/AppBarHeader';
import CustomVerticalFlatlist from '../../components/CustomVerticalFlatlist';
import { CategoriesStackParamList } from '../../navigation/types';
import { useGetCategoriesMutation } from '../../data/redux/services/sectionsApi';
import { useContentTranslation } from '../../hooks/useContentTranslation';

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

  // Translate categories data when language changes
  const translatedCategories = useMemo(() => {
    if (!data?.data) return [];
    return translateItems(data.data, ['title', 'description', 'name']);
  }, [data?.data, translateItems]);

  useEffect(() => {
    console.log('CategorieDataList - Fetching categories for section ID:', id);
    getCategoriesRequest(id);
  }, [getCategoriesRequest, id]);

  // Debug logging
  console.log('CategorieDataList - Categories data:', data);
  console.log('CategorieDataList - Is loading:', isLoading);
  console.log('CategorieDataList - Error:', error);
  console.log('CategorieDataList - Categories count:', data?.data?.length || 0);

  return (
    <View style={{ flex: 1 }}>
      <AppBarHeader title={translatedTitle} />

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      ) : error ? (
        <View style={styles.loaderContainer}>
          <Text style={styles.errorText}>{t('screens.categories.errorLoading')}</Text>
          <Text style={styles.errorDetails}>{JSON.stringify(error)}</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <Text style={styles.debugText}>Data count: {translatedCategories?.length || 0}</Text>
          <CustomVerticalFlatlist
            data={translatedCategories}
            onItemPress={(item) => {
              console.log('Item pressed:', item);
              navigate('BlogPage', { categoryData: item });
            }}
          />
        </View>
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
