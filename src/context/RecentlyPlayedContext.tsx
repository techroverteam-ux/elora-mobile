import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

interface RecentlyPlayedContextType {
  recentItems: any[];
  addRecentItem: (item: any) => void;
  removeRecentItem: (itemId: string) => void;
  clearRecentItems: () => void;
}

const RecentlyPlayedContext = createContext<RecentlyPlayedContextType | undefined>(undefined);

export const RecentlyPlayedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadRecentItems();
    } else {
      setRecentItems([]);
    }
  }, [isAuthenticated, user]);

  const loadRecentItems = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentlyPlayed');
      if (stored) {
        setRecentItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent items:', error);
    }
  };

  const saveRecentItems = async (newItems: any[]) => {
    try {
      await AsyncStorage.setItem('recentlyPlayed', JSON.stringify(newItems));
      setRecentItems(newItems);
    } catch (error) {
      console.error('Error saving recent items:', error);
    }
  };

  const addRecentItem = (item: any) => {
    if (!isAuthenticated || !user || !item?._id) return;
    
    // Remove existing item if it exists (prevents duplicates)
    const filtered = recentItems.filter(recent => recent._id !== item._id);
    // Add new item at the top with current timestamp
    const newItems = [{ ...item, playedAt: Date.now() }, ...filtered].slice(0, 50);
    saveRecentItems(newItems);
  };

  const removeRecentItem = (itemId: string) => {
    if (!isAuthenticated || !user || !itemId) return;
    
    const filtered = recentItems.filter(recent => recent._id !== itemId);
    saveRecentItems(filtered);
  };

  const clearRecentItems = async () => {
    try {
      await AsyncStorage.removeItem('recentlyPlayed');
      setRecentItems([]);
    } catch (error) {
      console.error('Error clearing recent items:', error);
    }
  };

  return (
    <RecentlyPlayedContext.Provider value={{ recentItems, addRecentItem, removeRecentItem, clearRecentItems }}>
      {children}
    </RecentlyPlayedContext.Provider>
  );
};

export const useRecentlyPlayed = () => {
  const context = useContext(RecentlyPlayedContext);
  if (!context) {
    throw new Error('useRecentlyPlayed must be used within RecentlyPlayedProvider');
  }
  return context;
};