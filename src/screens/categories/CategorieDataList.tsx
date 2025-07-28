import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';

// Define type for route params
type RootStackParamList = {
  CategorieDataList: { title: string };
};

const CategorieDataList = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'CategorieDataList'>>();
  const { title } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Category Title: {title}</Text>
    </View>
  );
};

export default CategorieDataList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
});
