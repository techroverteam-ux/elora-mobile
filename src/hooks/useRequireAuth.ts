import { useAuth } from '../context/AuthContext';
import { useRedirect } from '../context/RedirectContext';
import { useNavigation } from '@react-navigation/native';

export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const { setRedirect } = useRedirect();
  const navigation = useNavigation<any>();

  const requireAuth = (target: any, params?: any) => {
    if (!isAuthenticated) {
      setRedirect(target, params);
      navigation.navigate('AuthModal');
      return false;
    }
    return true;
  };

  return { requireAuth };
};
