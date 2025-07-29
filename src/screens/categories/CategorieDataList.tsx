import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { categoryListData } from '../../data/categoryData';
import FastImage from 'react-native-fast-image';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import AppBarHeader from '../../components/AppBarHeader';
import { CategoriesStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define type for route params
type CategorieDataList = {
  CategorieDataList: { title: string };
};

const CategorieDataList = () => {
  const route = useRoute<RouteProp<CategorieDataList, 'CategorieDataList'>>();
  const { title } = route.params;

  type CategorieDataListNavigationProp = NativeStackNavigationProp<CategoriesStackParamList, 'CategorieDataList'>;
  const { navigate } = useNavigation<CategorieDataListNavigationProp>();

  return (
    <View style={{ flex: 1 }}>

      <AppBarHeader title={title} />

      <View style={styles.container}>
        <FlatList
          data={categoryListData}
          renderItem={({ item }) => (
            <View style={{ width: "90%", alignSelf: "center" }}>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                }}
                onPress={() => { navigate("BlogPage", { item }) }}
                activeOpacity={0.8}
              >
                <FastImage
                  style={{ width: 70, height: 70, borderRadius: 10 }}
                  source={{
                    uri: item.image,
                    headers: { Authorization: 'someAuthToken' },
                    priority: FastImage.priority.normal,
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                />

                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#6e6e6e", width: "75%" }} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>

                <MaterialDesignIcons name="chevron-right" size={24} color="#959595" />
              </TouchableOpacity>

              <View style={{ height: 1, backgroundColor: "#E5E5E5" }} />
            </View>
          )}
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
