import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { RouteProp, useRoute } from '@react-navigation/native';
import AppBarHeader from '../../components/AppBarHeader';

type SubCategorieRouteParams = {
  SubCategorie: { item: any };
};

const SubCategorie = () => {
  const route = useRoute<RouteProp<SubCategorieRouteParams, 'SubCategorie'>>();
  const { item } = route.params;

  return (
    <View>
      <AppBarHeader title={item?.title || 'SubCategorie'} />

      <Text>SubCategorie</Text>
      <Text>{JSON.stringify(item)}</Text>
    </View>
  )
}

export default SubCategorie

const styles = StyleSheet.create({})