import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RecentlyPlayedContextType {
  recentItems: any[];
  addRecentItem: (item: any) => void;
}

const RecentlyPlayedContext = createContext<RecentlyPlayedContextType | undefined>(undefined);

export const RecentlyPlayedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recentItems, setRecentItems] = useState<any[]>([]);

  useEffect(() => {
    loadRecentItems();
  }, []);

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
    const filtered = recentItems.filter(recent => recent._id !== item._id);
    const newItems = [{ ...item, playedAt: Date.now() }, ...filtered].slice(0, 50);
    saveRecentItems(newItems);
  };

  return (
    <RecentlyPlayedContext.Provider value={{ recentItems, addRecentItem }}>
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