import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useRef } from 'react';

export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const pendingActionRef = useRef<(() => void) | null>(null);

  const requireAuth = (callback: () => void) => {
    if (isAuthenticated) {
      callback();
    } else {
      // Store the pending action
      pendingActionRef.current = callback;
      // Navigate to auth modal with pending action
      (navigation as any).navigate('AuthModal', {
        onAuthSuccess: () => {
          // Execute pending action after successful auth
          if (pendingActionRef.current) {
            pendingActionRef.current();
            pendingActionRef.current = null;
          }
        }
      });
    }
  };

  return { requireAuth, isAuthenticated };
};