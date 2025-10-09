// RootNavigation.tsx
import React, { useRef } from 'react';
import { NavigationContainer, Theme as NavigationThemeType, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './AppNavigator';
import ImageViewer from '../screens/modals/ImageViewer';
import { store } from '../data/redux/store';
import { setPreviousRoute } from '../data/redux/slices/navigationSlice';
import { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import AuthModalWrapper from './AuthModalWrapper';

const RootStack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  theme: NavigationThemeType;
};

const RootNavigation: React.FC<Props> = ({ theme }) => {
  const routeNameRef = useRef<string | null>(null);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  return (
    <NavigationContainer
      theme={theme}
      ref={navigationRef}
      onReady={() => {
        const current = navigationRef.current?.getCurrentRoute();
        routeNameRef.current = current?.name || null;
        console.log(
          `\x1b[44m[Navigation]\x1b[0m Initial route: \x1b[36m${current?.name}\x1b[0m`
        );
      }}

      onStateChange={() => {
        const current = navigationRef.current?.getCurrentRoute();
        const previous = routeNameRef.current;

        if (current?.name && previous !== current.name) {
          console.log(
            `\x1b[44m[Navigation]\x1b[0m Navigated from \x1b[33m${previous}\x1b[0m to \x1b[32m${current.name}\x1b[0m`
          );
          store.dispatch(setPreviousRoute(previous));
          routeNameRef.current = current.name;
        }
      }}
    >
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="App" component={AppNavigator} />
        <RootStack.Screen
          name="ImageViewer"
          component={ImageViewer}
          options={{ presentation: 'modal' }}
        />
        <RootStack.Screen
          name="AuthModal"
          component={AuthModalWrapper}
          options={{
            presentation: 'containedTransparentModal', // allows custom height
            animation: 'slide_from_bottom',
            gestureEnabled: true,
            headerShown: false,
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
