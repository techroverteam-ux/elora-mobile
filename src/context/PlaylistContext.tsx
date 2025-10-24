import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PlaylistContextType {
  currentPlaylist: any[];
  currentIndex: number;
  setPlaylist: (playlist: any[], startIndex?: number) => void;
  nextTrack: () => any | null;
  previousTrack: () => any | null;
  hasNext: boolean;
  hasPrevious: boolean;
  getCurrentTrack: () => any | null;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

interface PlaylistProviderProps {
  children: ReactNode;
}

export const PlaylistProvider: React.FC<PlaylistProviderProps> = ({ children }) => {
  const [currentPlaylist, setCurrentPlaylist] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const setPlaylist = (playlist: any[], startIndex: number = 0) => {
    setCurrentPlaylist(playlist);
    setCurrentIndex(startIndex);
  };

  const nextTrack = () => {
    if (currentIndex < currentPlaylist.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      return currentPlaylist[newIndex];
    }
    return null;
  };

  const previousTrack = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      return currentPlaylist[newIndex];
    }
    return null;
  };

  const getCurrentTrack = () => {
    return currentPlaylist[currentIndex] || null;
  };

  const hasNext = currentIndex < currentPlaylist.length - 1;
  const hasPrevious = currentIndex > 0;

  return (
    <PlaylistContext.Provider
      value={{
        currentPlaylist,
        currentIndex,
        setPlaylist,
        nextTrack,
        previousTrack,
        hasNext,
        hasPrevious,
        getCurrentTrack,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylist = (): PlaylistContextType => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
};