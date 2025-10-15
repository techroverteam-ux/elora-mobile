import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

import AppBarHeader from '../../components/AppBarHeader';
import CustomVerticalFlatlist from '../../components/CustomVerticalFlatlist';
import { CategoriesStackParamList } from '../../navigation/types';
import {
  useGetAzureBlobMutation,
  useGetCategoriesMutation,
} from '../../data/redux/services/sectionsApi';
import { getErrorMessage } from '../../data/redux/services/baseQuery';
import { useAzureBlobImage } from '../../hooks/useAzureBlobImage';

const CategorieDataList = () => {
  const route = useRoute<RouteProp<CategoriesStackParamList, 'CategorieDataList'>>();
  const { title, id } = route.params;

  type CategorieDataListNavigationProp = NativeStackNavigationProp<
    CategoriesStackParamList,
    'CategorieDataList'
  >;
  const { navigate } = useNavigation<CategorieDataListNavigationProp>();

  const [getCategoriesRequest, { data, error, isLoading }] = useGetCategoriesMutation();
  const [getAsureBlobRequest, { isLoading: isBlobLoading }] = useGetAzureBlobMutation();

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
            onItemPress={(item) => navigate('BlogPage', { item })}
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
