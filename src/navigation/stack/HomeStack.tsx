import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../../screens/home/Home';
import { HomeStackParamList } from '../types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="HomeMain" component={Home} options={{ headerShown: false }} />
    {/* <Stack.Screen name="HomeDetail" component={HomeDetail} /> */}
  </Stack.Navigator>
);

export default HomeStack;
