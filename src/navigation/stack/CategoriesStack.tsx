import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Categories from '../../screens/categories/Categories';
import { CategoriesStackParamList } from '../types';
import CategorieDataList from '../../screens/categories/CategorieDataList';

const Stack = createNativeStackNavigator<CategoriesStackParamList>();

const CategoriesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CategoriesMain" component={Categories} />
    <Stack.Screen name="CategorieDataList" component={CategorieDataList} />
  </Stack.Navigator>
);

export default CategoriesStack;
