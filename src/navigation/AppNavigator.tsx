import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import DashboardNavigator from './DashboardNavigator';
import AuthNavigator from './AuthNavigator';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // You can style this however you like (e.g., splash screen, branded screen)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <DashboardNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;