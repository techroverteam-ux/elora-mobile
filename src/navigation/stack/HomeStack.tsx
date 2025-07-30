import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../../screens/home/Home';
import { HomeStackParamList } from '../types';
import VideoPlayer from '../../components/VideoPlayer';
import AudioPlayer from '../../components/AudioPlayer';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="HomeMain" component={Home} options={{ headerShown: false }} />
    <Stack.Screen name="AudioPlayer" component={AudioPlayer} options={{ headerShown: false }} />
    <Stack.Screen name="VideoPlayer" component={VideoPlayer} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export default HomeStack;
