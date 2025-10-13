import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { categoryListData } from '../../data/categoryData';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import AppBarHeader from '../../components/AppBarHeader';
import { CategoriesStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomFastImage from '../../components/CustomFastImage';
import CustomVerticalFlatlist from '../../components/CustomVerticalFlatlist';
import { useGetCategoriesMutation } from '../../data/redux/services/sectionsApi';
import { getErrorMessage } from '../../data/redux/services/baseQuery';

const CategorieDataList = () => {
  const route = useRoute<RouteProp<CategoriesStackParamList, 'CategorieDataList'>>();
  const { title, id } = route.params;

  type CategorieDataListNavigationProp = NativeStackNavigationProp<CategoriesStackParamList, 'CategorieDataList'>;
  const { navigate } = useNavigation<CategorieDataListNavigationProp>();

  const [getCategoriesRequest, { data, error, isLoading }] = useGetCategoriesMutation();

  useEffect(() => {
    getCategoriesRequest(id);
  }, [getCategoriesRequest]);

  return (
    <View style={{ flex: 1 }}>

      <AppBarHeader title={title} />

      <Text>{JSON.stringify(id)}</Text>
      <Text>{getErrorMessage(error)}</Text>
      <Text>DATA: {JSON.stringify(data, null, 2)}</Text>

      <View style={styles.container}>
        <CustomVerticalFlatlist
          // data={categoryListData}
          data={data?.data}
          onItemPress={(item) => navigate("BlogPage", { item })}
        />
      </View>
    </View>
  );
};

export default CategorieDataList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
});
