import React, { useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

interface Props {
  children: React.ReactNode;
}

const RequireAuth: React.FC<Props> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute();

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        navigation.navigate('AuthModal', {
          redirectTo: route.name,
          redirectParams: route.params ?? null,
        });
      }
    }, [isAuthenticated, navigation, route.name, route.params])
  );

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default RequireAuth;