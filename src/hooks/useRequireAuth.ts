import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation();

  const requireAuth = (callback: () => void) => {
    if (isAuthenticated) {
      callback();
    } else {
      // Navigate to auth modal
      (navigation as any).navigate('AuthModal');
    }
  };

  return { requireAuth, isAuthenticated };
};