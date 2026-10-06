import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { extractCookieValue, performTokenRefresh } from '../lib/api';
import { AppState, DeviceEventEmitter } from 'react-native';

export interface User {
  _id: string;
  email: string;
  name: string;
  roles: Role[];
  isActive: boolean;
}

export type UserType = User;

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
  const userRef = useRef<User | null>(null);

  // Keep userRef synchronized with state
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Handle app state changes: silently refresh token when returning to the app
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'active' && userRef.current) {
        try {
          await performTokenRefresh();
        } catch {
          // If refresh failed due to offline/network, do not kick out
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Handle token expiration events: only triggered when refresh token is definitively rejected (401/403)
  useEffect(() => {
    const handleTokenExpired = () => {
      logout();
    };

    const subscription = DeviceEventEmitter.addListener('tokenExpired', handleTokenExpired);
    return () => subscription.remove();
  }, []);

  // Proactive periodic token refresh: while user is logged in and working,
  // silently refresh the token every 5 minutes so it NEVER expires during continuous use.
  useEffect(() => {
    const interval = setInterval(async () => {
      if (userRef.current) {
        try {
          await performTokenRefresh();
        } catch {
          // Silent failure (e.g. temporary offline) will retry next interval or on demand
        }
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    try {
      // 1. Immediately hydrate cached user to avoid jarring screen transitions
      const cachedUser = await AsyncStorage.getItem('user');
      if (cachedUser && !userRef.current) {
        try {
          const parsed = JSON.parse(cachedUser);
          setUser(parsed);
          userRef.current = parsed;
          setIsLoading(false);
        } catch {}
      }

      // 2. Check if we have stored tokens
      const token = (await AsyncStorage.getItem('authToken')) || (await AsyncStorage.getItem('access_token'));
      if (!token) {
        setUser(null);
        userRef.current = null;
        return;
      }

      // 3. Validate user profile with backend
      const response = await api.get('/auth/me');
      if (response.data) {
        setUser(response.data);
        userRef.current = response.data;
        await AsyncStorage.setItem('user', JSON.stringify(response.data));
      } else {
        setUser(null);
        userRef.current = null;
      }
    } catch (error: any) {
      // If 401 error, try to refresh token first
      if (error?.response?.status === 401) {
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          try {
            const retryResponse = await api.get('/auth/me');
            if (retryResponse.data) {
              setUser(retryResponse.data);
              userRef.current = retryResponse.data;
              await AsyncStorage.setItem('user', JSON.stringify(retryResponse.data));
              return;
            }
          } catch {
            // Retry failed
          }
        }

        // Only clear tokens and log out if refresh was definitively rejected
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('user');
        setUser(null);
        userRef.current = null;
      } else {
        // Network error / timeout / offline: DO NOT log out the user!
        console.warn('checkAuth encountered non-auth error; preserving user session:', error?.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      // Store access tokens
      const token =
        response.data?.token ||
        response.data?.accessToken ||
        response.data?.data?.token ||
        response.data?.data?.accessToken;

      if (token) {
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('access_token', token);
      }

      // Extract refresh token from Set-Cookie header or response body
      const cookieRt = extractCookieValue(response.headers?.['set-cookie'], 'refresh_token');
      const bodyRt =
        response.data?.refreshToken ||
        response.data?.refresh_token ||
        response.data?.data?.refreshToken;
      const refreshTokenValue = cookieRt || bodyRt;

      if (refreshTokenValue) {
        await AsyncStorage.setItem('refreshToken', refreshTokenValue);
      }

      // Fetch user profile
      const userResponse = await api.get('/auth/me');
      if (userResponse.data) {
        setUser(userResponse.data);
        userRef.current = userResponse.data;
        await AsyncStorage.setItem('user', JSON.stringify(userResponse.data));
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
      const newToken = await performTokenRefresh();
      return !!newToken;
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('user');
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Logout API call failed, continue with local cleanup
    } finally {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      setUser(null);
      userRef.current = null;
    }
  };

  // Role checking utilities.
  // Match on the role's code OR name, normalised ("Super Admin" -> SUPER_ADMIN),
  // the same way the API does (store.controller roleKeys). The seeded super
  // admin role is name "Super Admin" / code "SUPER_ADMIN", so checking
  // role.name === 'SUPER_ADMIN' alone never matched it.
  const roleKeys = (role: any): string[] =>
    [role?.code, role?.name]
      .filter(Boolean)
      .map((v: any) => String(v).trim().toUpperCase().replace(/[\s-]+/g, '_'));

  const hasAnyRole = (...wanted: string[]): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.some((role) => roleKeys(role).some((k) => wanted.includes(k)));
  };

  const isAdmin = (): boolean => hasAnyRole('SUPER_ADMIN', 'ADMIN', 'SUB_ADMIN', 'MANAGER');

  const isFieldWorker = (): boolean => hasAnyRole('RECCE', 'INSTALLATION', 'FIELD_WORKER');

  // Only super admins, admins, and managers can view commercial information.
  // RECCE and INSTALLATION users should not see pricing.
  const canViewCommercialInfo = (): boolean => hasAnyRole('SUPER_ADMIN', 'ADMIN', 'SUB_ADMIN', 'MANAGER');

  // Only super admins can view element rates.
  const canViewElementRates = (): boolean => hasAnyRole('SUPER_ADMIN');

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