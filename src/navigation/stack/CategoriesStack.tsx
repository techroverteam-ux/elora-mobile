import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Categories from '../../screens/categories/Categories';
import { CategoriesStackParamList } from '../types';
import CategorieDataList from '../../screens/categories/CategorieDataList';
import BlogPage from '../../screens/categories/BlogPage';
import SubCategorie from '../../screens/categories/SubCategorie';

const Stack = createNativeStackNavigator<CategoriesStackParamList>();

const CategoriesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CategoriesMain" component={Categories} />
    <Stack.Screen name="CategorieDataList" component={CategorieDataList} />
    <Stack.Screen name="BlogPage" component={BlogPage} />
    <Stack.Screen name="SubCategorie" component={SubCategorie} />
  </Stack.Navigator>
);

export default CategoriesStack;
