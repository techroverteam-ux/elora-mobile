import api, { performTokenRefresh } from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  logout: async () => {
    try {
      const { data } = await api.post('/auth/logout');
      return data;
    } catch {
      // ignore network errors on logout
    } finally {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
    }
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  refresh: async () => {
    return await performTokenRefresh();
  },
};