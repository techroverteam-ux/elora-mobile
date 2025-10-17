import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AppBarHeader from '../../components/AppBarHeader';
import CustomVerticalFlatlist from '../../components/CustomVerticalFlatlist';
import { CategoriesStackParamList } from '../../navigation/types';
import { useGetCategoriesMutation } from '../../data/redux/services/sectionsApi';

const CategorieDataList = () => {
  const route = useRoute<RouteProp<CategoriesStackParamList, 'CategorieDataList'>>();
  const { title, id } = route.params;

  type CategorieDataListNavigationProp = NativeStackNavigationProp<
    CategoriesStackParamList,
    'CategorieDataList'
  >;
  const { navigate } = useNavigation<CategorieDataListNavigationProp>();

  const [getCategoriesRequest, { data, error, isLoading }] = useGetCategoriesMutation();

  useEffect(() => {
    getCategoriesRequest(id);
  }, [getCategoriesRequest, id]);

  return (
    <View style={{ flex: 1 }}>
      <AppBarHeader title={title} />

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>

          <CustomVerticalFlatlist
            data={data?.data}
            onItemPress={(item) => navigate('BlogPage', { categoryData: item })}
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
