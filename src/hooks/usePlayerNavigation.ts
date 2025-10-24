import { useEffect } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCurrentPlayer } from '../context/CurrentPlayerContext';

// Hook to handle player navigation and mini player visibility
export const usePlayerNavigation = (playerType: 'audio' | 'video', currentItem: any) => {
  const navigation = useNavigation();
  const { 
    setAudioPlayerVisible, 
    setVideoPlayerVisible,
    switchToAudio,
    switchToVideo 
  } = useCurrentPlayer();

  // Handle back navigation - show mini player when leaving full screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (currentItem) {
        if (playerType === 'audio') {
          switchToAudio(currentItem);
          setAudioPlayerVisible(true);
        } else {
          switchToVideo(currentItem);
          setVideoPlayerVisible(true);
        }
      }
    });

    return unsubscribe;
  }, [navigation, currentItem, playerType, setAudioPlayerVisible, setVideoPlayerVisible, switchToAudio, switchToVideo]);

  // Handle screen focus - hide mini player when entering full screen
  useFocusEffect(() => {
    if (currentItem) {
      if (playerType === 'audio') {
        setAudioPlayerVisible(false);
      } else {
        setVideoPlayerVisible(false);
      }
    }
  });

  return {
    goBackWithMiniPlayer: () => {
      if (currentItem) {
        if (playerType === 'audio') {
          switchToAudio(currentItem);
          setAudioPlayerVisible(true);
        } else {
          switchToVideo(currentItem);
          setVideoPlayerVisible(true);
        }
      }
      navigation.goBack();
    }
  };
};