import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';
import { AppState, DeviceEventEmitter } from 'react-native';

interface User {
  _id: string;
  email: string;
  name: string;
  roles: Role[];
  isActive: boolean;
}

interface Role {
  _id: string;
  name: string;
  code: string;
  permissions: Record<string, PermissionSet>;
}

interface PermissionSet {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  isAdmin: () => boolean;
  isFieldWorker: () => boolean;
  canViewCommercialInfo: () => boolean;
  canViewElementRates: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle app state changes to check token validity
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && user) {
        // Check auth when app becomes active
        checkAuth();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [user]);

  // Handle token expiration events
  useEffect(() => {
    const handleTokenExpired = () => {
      logout();
    };

    // Use React Native's DeviceEventEmitter for cross-component communication
    const subscription = DeviceEventEmitter.addListener('tokenExpired', handleTokenExpired);
    return () => subscription.remove();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if we have stored tokens first
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setUser(null);
        return;
      }
      
      // Use same endpoint as web portal
      const response = await api.get('/auth/me');
      
      if (response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error: any) {
      // If it's a 401 error, try to refresh token first
      if (error?.response?.status === 401) {
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          // Retry auth check with new token
          try {
            const retryResponse = await api.get('/auth/me');
            if (retryResponse.data) {
              setUser(retryResponse.data);
              return;
            }
          } catch (retryError) {
            // Retry failed
          }
        }
      }
      
      // Clear invalid tokens and logout user
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    
    // Set up periodic token validation (every 5 minutes)
    const tokenCheckInterval = setInterval(() => {
      if (user) {
        checkAuth();
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(tokenCheckInterval);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Use same login approach as web portal
      const response = await api.post('/auth/login', { email, password });
      
      // Store tokens if provided
      if (response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('access_token', response.data.token);
      }
      if (response.data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      // After successful login, fetch user data like web portal
      const userResponse = await api.get('/auth/me');
      if (userResponse.data) {
        setUser(userResponse.data);
        return { success: true };
      } else {
        throw new Error('Login failed - no user data received');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, message };
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (!storedRefreshToken) {
        return false;
      }
      
      const response = await api.post('/auth/refresh', { refreshToken: storedRefreshToken });
      
      if (response.data.token) {
        // Store new tokens
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('access_token', response.data.token);
        
        if (response.data.refreshToken) {
          await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      // Clear all tokens on refresh failure
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refreshToken');
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call logout API to clear server-side session
      await api.post('/auth/logout');
    } catch (error) {
      // Logout API call failed, continue with local cleanup
    } finally {
      // Clear all local data
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  // Role checking utilities
  const isAdmin = (): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => 
      role.name === 'ADMIN' || 
      role.name === 'SUPER_ADMIN' || 
      role.name === 'MANAGER'
    );
  };

  const isFieldWorker = (): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => 
      role.name === 'RECCE' || 
      role.name === 'INSTALLATION' ||
      role.name === 'FIELD_WORKER'
    );
  };

  const canViewCommercialInfo = (): boolean => {
    // Only super admins, admins, and managers can view commercial information
    // RECCE and INSTALLATION users should not see pricing
    if (!user || !user.roles) return false;
    
    return user.roles.some(role => 
      role.name === 'ADMIN' || 
      role.name === 'SUPER_ADMIN' || 
      role.name === 'MANAGER'
    );
  };

  const canViewElementRates = (): boolean => {
    // Only super admins can view element rates
    // RECCE and INSTALLATION users should not see rates
    if (!user || !user.roles) return false;
    
    return user.roles.some(role => role.name === 'SUPER_ADMIN');
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
        refreshToken,
        isAdmin,
        isFieldWorker,
        canViewCommercialInfo,
        canViewElementRates,
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