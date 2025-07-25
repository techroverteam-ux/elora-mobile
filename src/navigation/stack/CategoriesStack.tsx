import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Categories from '../../screens/categories/Categories';

const Stack = createNativeStackNavigator();

const CategoriesStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="CategoriesMain" component={Categories} options={{ headerShown: false }} />
    {/* <Stack.Screen name="CategoryDetail" component={CategoryDetail} /> */}
  </Stack.Navigator>
);

export default CategoriesStack;
