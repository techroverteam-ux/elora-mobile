import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import DashboardNavigator from './DashboardNavigator';
import AuthNavigator from './AuthNavigator';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    // <NavigationContainer>
    //   {isAuthenticated ? <DashboardNavigator /> : <AuthNavigator />}
    // </NavigationContainer>

    isAuthenticated ? <DashboardNavigator /> : <AuthNavigator />
  );
};

export default AppNavigator;