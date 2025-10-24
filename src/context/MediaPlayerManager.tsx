import React, { createContext, useContext, useRef } from 'react';

interface MediaPlayerManagerContextType {
  registerAudioPlayer: (player: any) => void;
  registerVideoPlayer: (player: any) => void;
  stopAllAudio: () => void;
  stopAllVideo: () => void;
  stopAllMedia: () => void;
}

const MediaPlayerManagerContext = createContext<MediaPlayerManagerContextType | null>(null);

export const MediaPlayerManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioPlayersRef = useRef<Set<any>>(new Set());
  const videoPlayersRef = useRef<Set<any>>(new Set());

  const registerAudioPlayer = (player: any) => {
    audioPlayersRef.current.add(player);
  };

  const registerVideoPlayer = (player: any) => {
    videoPlayersRef.current.add(player);
  };

  const stopAllAudio = () => {
    audioPlayersRef.current.forEach(player => {
      try {
        if (player.pause) player.pause();
        if (player.reset) player.reset();
      } catch (error) {
        console.log('Error stopping audio player:', error);
      }
    });
  };

  const stopAllVideo = () => {
    videoPlayersRef.current.forEach(player => {
      try {
        if (player.setPaused) player.setPaused(true);
      } catch (error) {
        console.log('Error stopping video player:', error);
      }
    });
  };

  const stopAllMedia = () => {
    stopAllAudio();
    stopAllVideo();
  };

  return (
    <MediaPlayerManagerContext.Provider value={{
      registerAudioPlayer,
      registerVideoPlayer,
      stopAllAudio,
      stopAllVideo,
      stopAllMedia,
    }}>
      {children}
    </MediaPlayerManagerContext.Provider>
  );
};

export const useMediaPlayerManager = () => {
  const context = useContext(MediaPlayerManagerContext);
  if (!context) {
    throw new Error('useMediaPlayerManager must be used within MediaPlayerManagerProvider');
  }
  return context;
};