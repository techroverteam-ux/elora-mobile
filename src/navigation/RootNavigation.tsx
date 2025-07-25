// RootNavigation.tsx
import React from 'react';
import { NavigationContainer, Theme as NavigationThemeType } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './AppNavigator';
import ImageViewer from '../screens/modals/ImageViewer';

export type RootStackParamList = {
  App: undefined;
  ImageViewer: { uri: string };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  theme: NavigationThemeType;
};

const RootNavigation: React.FC<Props> = ({ theme }) => {
  return (
    <NavigationContainer theme={theme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="App" component={AppNavigator} />
        <RootStack.Screen
          name="ImageViewer"
          component={ImageViewer}
          options={{ presentation: 'modal' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
