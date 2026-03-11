import React, { createContext, useContext, useRef } from 'react';

interface AudioState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  currentItem: any;
}

interface MediaPlayerManagerContextType {
  registerAudioPlayer: (player: any) => void;
  registerVideoPlayer: (player: any) => void;
  stopAllAudio: () => void;
  stopAllVideo: () => void;
  stopAllMedia: () => void;
  saveAudioState: () => void;
  restoreAudioState: () => void;
  hasAudioState: () => boolean;
}

const MediaPlayerManagerContext = createContext<MediaPlayerManagerContextType | null>(null);

export const MediaPlayerManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioPlayersRef = useRef<Set<any>>(new Set());
  const videoPlayersRef = useRef<Set<any>>(new Set());
  const savedAudioStateRef = useRef<AudioState | null>(null);

  const registerAudioPlayer = (player: any) => {
    audioPlayersRef.current.add(player);
  };

  const registerVideoPlayer = (player: any) => {
    videoPlayersRef.current.add(player);
  };

  const saveAudioState = () => {
    audioPlayersRef.current.forEach(player => {
      try {
        if (player.currentTime !== undefined && player.duration && player.duration > 0) {
          savedAudioStateRef.current = {
            currentTime: player.currentTime,
            duration: player.duration,
            isPlaying: player.isPlaying,
            currentItem: null // Will be set by CurrentPlayerContext
          };
        }
      } catch (error) {
        // Error saving audio state - continue silently
      }
    });
  };

  const stopAllAudio = () => {
    // Save state before stopping
    saveAudioState();
    
    audioPlayersRef.current.forEach(player => {
      try {
        if (player.pause) player.pause();
        if (player.reset) player.reset();
      } catch (error) {
        // Error stopping audio player - continue silently
      }
    });
  };

  const stopAllVideo = () => {
    videoPlayersRef.current.forEach(player => {
      try {
        if (player.setPaused) player.setPaused(true);
      } catch (error) {
        // Error stopping video player - continue silently
      }
    });
  };

  const restoreAudioState = () => {
    if (savedAudioStateRef.current) {
      const state = savedAudioStateRef.current;
      audioPlayersRef.current.forEach(player => {
        try {
          if (player.seekTo && state.currentTime > 0) {
            setTimeout(() => {
              player.seekTo(state.currentTime);
              if (state.isPlaying && player.play) {
                setTimeout(() => player.play(), 200);
              }
            }, 500);
          }
        } catch (error) {
          // Error restoring audio state - continue silently
        }
      });
    }
  };

  const hasAudioState = () => {
    return savedAudioStateRef.current !== null && savedAudioStateRef.current.duration > 0;
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
      saveAudioState,
      restoreAudioState,
      hasAudioState,
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