import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, ScrollView, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { categoryListData } from '../../data/categoryData';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import AppBarHeader from '../../components/AppBarHeader';
import { CategoriesStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomFastImage from '../../components/CustomFastImage';
import CustomVerticalFlatlist from '../../components/CustomVerticalFlatlist';
import { useGetAzureBlobMutation, useGetCategoriesMutation } from '../../data/redux/services/sectionsApi';
import { getErrorMessage } from '../../data/redux/services/baseQuery';

const CategorieDataList = () => {
  const route = useRoute<RouteProp<CategoriesStackParamList, 'CategorieDataList'>>();
  const { title, id } = route.params;

  type CategorieDataListNavigationProp = NativeStackNavigationProp<CategoriesStackParamList, 'CategorieDataList'>;
  const { navigate } = useNavigation<CategorieDataListNavigationProp>();

  const [getCategoriesRequest, { data, error, isLoading }] = useGetCategoriesMutation();
  const [getAsureBlobRequest, { data: blobData, isLoading: isBlobLoading }] = useGetAzureBlobMutation();

  const [base64Image, setBase64Image] = useState<string | null>(null);

  console.log("base64Image:", base64Image);

  useEffect(() => {
    getCategoriesRequest(id);
  }, [getCategoriesRequest, id]);

  useEffect(() => {
    if (data?.data?.[0]?.headerImage) {
      const originalUrl = data.data[0].headerImage;
      const encodedUrl = encodeURIComponent(originalUrl);

      getAsureBlobRequest(encodedUrl)
        .unwrap()
        .then((res) => {
          // Assuming res.data contains the base64 string
          setBase64Image(res?.data);
        })
        .catch((err) => {
          // console.error('Azure Blob fetch failed:', err);
        });
    }
  }, [data, getAsureBlobRequest]);

  return (
    <View style={{ flex: 1 }}>
      <AppBarHeader title={title} />

      {/* Show loading indicator */}
      {(isLoading || isBlobLoading) ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      ) : (
        <View style={styles.container}>
          {/* Render header image if available */}

          <Image
            source={{ uri: "https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api/azure-blob/file?blobUrl=https%3A%2F%2Fgbsprod.blob.core.windows.net%2Fgbsdata%2Fsections%2Fgeeta-bal-sanskar-offline%2Fcategories%2Fchildrens-gita-learning%2Fheader_childgeetalearn_heading_1760268256176_glkyfb.jpeg" }}
            style={{ width: '100%', height: 200, resizeMode: 'cover' }}
          />


          <CustomVerticalFlatlist
            data={data?.data}
            onItemPress={(item) => navigate("BlogPage", { item })}
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
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
});
