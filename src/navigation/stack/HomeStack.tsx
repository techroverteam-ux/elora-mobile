import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../../screens/home/Home';
import { HomeStackParamList } from '../types';
import VideoPlayer from '../../components/VideoPlayer';
import AudioPlayer from '../../components/AudioPlayer';
import AllAudios from '../../screens/home/AllAudios';
import AllVideos from '../../screens/home/AllVideos';
import AudioCategoryScreen from '../../screens/home/AudioCategoryScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="HomeMain" component={Home} options={{ headerShown: false }} />
    <Stack.Screen name="AllAudios" component={AllAudios} options={{ headerShown: false }} />
    <Stack.Screen name="AudioCategoryScreen" component={AudioCategoryScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AllVideos" component={AllVideos} options={{ headerShown: false }} />
    <Stack.Screen name="AudioPlayer" component={AudioPlayer} options={{ headerShown: false }} />
    <Stack.Screen name="VideoPlayer" component={VideoPlayer} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export default HomeStack;
