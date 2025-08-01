import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Account from '../../screens/account/Account';
import SelectLanguage from '../../screens/account/SelectLanguage';
import { AccountStackParamList } from '../types';
import PdfViewer from '../../components/PdfViewer';
import AudioPlayer from '../../components/AudioPlayer';
import VideoPlayer from '../../components/VideoPlayer';

const Stack = createNativeStackNavigator<AccountStackParamList>();

const AccountStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="AccountMain" component={Account} options={{ headerShown: false }} />
    <Stack.Screen name="SelectLanguage" component={SelectLanguage} options={{ headerShown: false }} />
    <Stack.Screen name="PdfViewer" component={PdfViewer} options={{ headerShown: false }} />
    <Stack.Screen name="AudioPlayer" component={AudioPlayer} options={{ headerShown: false }} />
    <Stack.Screen name="VideoPlayer" component={VideoPlayer} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export default AccountStack;
