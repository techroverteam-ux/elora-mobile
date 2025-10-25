import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../../screens/home/Home';
import { HomeStackParamList } from '../types';
import VideoPlayer from '../../components/VideoPlayer';
import AudioPlayer from '../../components/AudioPlayer';
import EnhancedAudioPlayer from '../../components/EnhancedAudioPlayer';
import EnhancedVideoPlayer from '../../components/EnhancedVideoPlayer';
import EnhancedAllAudios from '../../screens/home/EnhancedAllAudios';
import EnhancedAllVideos from '../../screens/home/EnhancedAllVideos';
import AllAudios from '../../screens/home/AllAudios';
import AllVideos from '../../screens/home/AllVideos';
import AllPDFs from '../../screens/home/AllPDFs';
import AudioCategoryScreen from '../../screens/home/AudioCategoryScreen';
import SearchScreen from '../../screens/SearchScreen';
import GalleryListScreen from '../../screens/GalleryListScreen';
import PdfViewer from '../../components/PdfViewer';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="HomeMain" component={Home} options={{ headerShown: false }} />
    <Stack.Screen name="AllAudios" component={AllAudios} options={{ headerShown: false }} />
    <Stack.Screen name="AllPDFs" component={AllPDFs} options={{ headerShown: false }} />
    <Stack.Screen name="AudioCategoryScreen" component={AudioCategoryScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AllVideos" component={AllVideos} options={{ headerShown: false }} />
    <Stack.Screen name="SearchScreen" component={SearchScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AudioPlayer" component={AudioPlayer} options={{ headerShown: false }} />
    <Stack.Screen name="VideoPlayer" component={VideoPlayer} options={{ headerShown: false }} />
    <Stack.Screen name="EnhancedAudioPlayer" component={EnhancedAudioPlayer} options={{ headerShown: false }} />
    <Stack.Screen name="EnhancedVideoPlayer" component={EnhancedVideoPlayer} options={{ headerShown: false }} />
    <Stack.Screen name="EnhancedAllAudios" component={EnhancedAllAudios} options={{ headerShown: false }} />
    <Stack.Screen name="EnhancedAllVideos" component={EnhancedAllVideos} options={{ headerShown: false }} />
    <Stack.Screen name="GalleryList" component={GalleryListScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PdfViewer" component={PdfViewer} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export default HomeStack;
