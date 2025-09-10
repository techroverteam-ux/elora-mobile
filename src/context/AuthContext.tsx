import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchAndFormatStorage } from '../utils/storageLogger';
import { AUTH_KEY, USER_KEY } from '../constants/storageKeys';

export interface UserType {
  id?: string;
  name: string;
  email: string;
  role?: string;
  token?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: UserType | null;
  login: (userData: UserType) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem(AUTH_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        if (storedAuth === 'true' && storedUser) {
          setIsAuthenticated(true);
          setUser(JSON.parse(storedUser));
        }
        setLoading(false); // add delay
      } catch (e) {
        console.log("Failed to load auth state", e); // add delay
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const login = async (userData: UserType) => {
    try {
      await AsyncStorage.setItem(AUTH_KEY, 'true');
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    } catch (e) {
      console.log("Failed to persist login", e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([AUTH_KEY, USER_KEY]);
      setUser(null);
      setIsAuthenticated(false);
      await fetchAndFormatStorage();
    } catch (e) {
      console.log("Failed to persist logout", e);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};