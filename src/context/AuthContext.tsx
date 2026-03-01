import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';

interface User {
  _id: string;
  email: string;
  name: string;
  roles: any[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      console.log('AuthContext: Checking authentication...');
      
      // Check if we have stored tokens first
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('AuthContext: No stored token found');
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      // Use same endpoint as web portal
      const response = await api.get('/auth/me');
      console.log('AuthContext: Auth response:', response.data);
      
      if (response.data) {
        setUser(response.data);
        console.log('AuthContext: User authenticated', response.data.name);
      } else {
        setUser(null);
        console.log('AuthContext: No user data received');
      }
    } catch (error) {
      console.log('AuthContext: Auth check failed', error?.message || 'Network error');
      // Clear invalid token
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Attempting login for', email);
      
      // Use same login approach as web portal
      const response = await api.post('/auth/login', { email, password });
      console.log('AuthContext: Login response data:', response.data);
      
      // Store tokens if provided
      if (response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
      }
      if (response.data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      // After successful login, fetch user data like web portal
      const userResponse = await api.get('/auth/me');
      if (userResponse.data) {
        setUser(userResponse.data);
        console.log('AuthContext: Login successful for', userResponse.data.name);
        return { success: true };
      } else {
        throw new Error('Login failed - no user data received');
      }
    } catch (error: any) {
      console.error('AuthContext: Login failed', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Logging out user');
      // Call logout API to clear server-side session
      await api.post('/auth/logout');
    } catch (error) {
      console.error('AuthContext: Logout API call failed:', error);
    } finally {
      // Clear local data
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      setUser(null);
      console.log('AuthContext: User logged out');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};