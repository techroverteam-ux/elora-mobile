import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useMediaPlayerManager } from './MediaPlayerManager';

interface CurrentPlayerContextType {
  currentAudioItem: any | null;
  currentVideoItem: any | null;
  isAudioPlayerVisible: boolean;
  isVideoPlayerVisible: boolean;
  setCurrentAudioItem: (item: any | null) => void;
  setCurrentVideoItem: (item: any | null) => void;
  setAudioPlayerVisible: (visible: boolean) => void;
  setVideoPlayerVisible: (visible: boolean) => void;
  clearCurrentPlayer: () => void;
  clearAudioPlayer: () => void;
  clearVideoPlayer: () => void;
  switchToAudio: (item: any) => void;
  switchToVideo: (item: any) => void;
}

const CurrentPlayerContext = createContext<CurrentPlayerContextType | undefined>(undefined);

interface CurrentPlayerProviderProps {
  children: ReactNode;
}

export const CurrentPlayerProvider: React.FC<CurrentPlayerProviderProps> = ({ children }) => {
  const [currentAudioItem, setCurrentAudioItem] = useState<any | null>(null);
  const [currentVideoItem, setCurrentVideoItem] = useState<any | null>(null);
  const [isAudioPlayerVisible, setAudioPlayerVisible] = useState(false);
  const [isVideoPlayerVisible, setVideoPlayerVisible] = useState(false);
  const { stopAllAudio, saveAudioState, restoreAudioState, hasAudioState } = useMediaPlayerManager();

  const clearCurrentPlayer = useCallback(() => {
    setCurrentAudioItem(null);
    setCurrentVideoItem(null);
    setAudioPlayerVisible(false);
    setVideoPlayerVisible(false);
  }, []);

  const clearAudioPlayer = useCallback(() => {
    setCurrentAudioItem(null);
    setAudioPlayerVisible(false);
  }, []);

  const clearVideoPlayer = useCallback(() => {
    setCurrentVideoItem(null);
    setVideoPlayerVisible(false);
  }, []);

  const switchToAudio = useCallback((item: any) => {
    console.log('Switching to audio player:', item?.title);
    // Clear video player first
    setCurrentVideoItem(null);
    setVideoPlayerVisible(false);
    // Set audio player - always update the item even if same ID (for track switching)
    setCurrentAudioItem(item);
    setAudioPlayerVisible(true);
    
    // Restore audio state if returning to same audio without new item
    if (!item && hasAudioState()) {
      setTimeout(() => {
        restoreAudioState();
      }, 1000);
    }
  }, [hasAudioState, restoreAudioState]);

  const switchToVideo = useCallback((item: any) => {
    console.log('Switching to video player:', item?.title);
    // Save current audio state before switching
    if (currentAudioItem) {
      saveAudioState();
    }
    // Stop and clear audio player completely
    stopAllAudio();
    setCurrentAudioItem(null);
    setAudioPlayerVisible(false);
    // Set video player
    setCurrentVideoItem(item);
    setVideoPlayerVisible(true);
  }, [currentAudioItem, saveAudioState, stopAllAudio]);

  return (
    <CurrentPlayerContext.Provider
      value={{
        currentAudioItem,
        currentVideoItem,
        isAudioPlayerVisible,
        isVideoPlayerVisible,
        setCurrentAudioItem,
        setCurrentVideoItem,
        setAudioPlayerVisible,
        setVideoPlayerVisible,
        clearCurrentPlayer,
        clearAudioPlayer,
        clearVideoPlayer,
        switchToAudio,
        switchToVideo,
      }}
    >
      {children}
    </CurrentPlayerContext.Provider>
  );
};

export const useCurrentPlayer = (): CurrentPlayerContextType => {
  const context = useContext(CurrentPlayerContext);
  if (!context) {
    throw new Error('useCurrentPlayer must be used within a CurrentPlayerProvider');
  }
  return context;
};