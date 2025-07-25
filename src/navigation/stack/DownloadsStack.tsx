import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Downloads from '../../screens/downloads/Downloads';

const Stack = createNativeStackNavigator();

const DownloadsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="DownloadsMain" component={Downloads} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export default DownloadsStack;
