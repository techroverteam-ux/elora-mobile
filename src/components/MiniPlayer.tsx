import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from './CustomFastImage';
import { useAudioPlayerContext } from '../context/AudioPlayerContext';
import { usePlaylist } from '../context/PlaylistContext';
import { useCurrentPlayer } from '../context/CurrentPlayerContext';

const { width } = Dimensions.get('window');

interface MiniPlayerProps {
  currentItem?: any;
  onClose?: () => void;
  type?: 'audio' | 'video';
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ currentItem, onClose, type = 'audio' }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { isPlaying, play, pause, reset, currentTime, duration } = useAudioPlayerContext();
  const { nextTrack, previousTrack, hasNext, hasPrevious } = usePlaylist();
  const { switchToAudio, setAudioPlayerVisible } = useCurrentPlayer();
  const [isLoadingTrack, setIsLoadingTrack] = React.useState(false);
  const insets = useSafeAreaInsets();
  const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
  
  const translateX = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;
  
  // Calculate dynamic bottom position
  const getBottomPosition = () => {
    if (Platform.OS === 'ios') {
      return Math.max(insets.bottom + 65, 85);
    }
    // For Android, check if device has gesture navigation
    const hasGestureNav = screenHeight > 800 && insets.bottom > 0;
    return hasGestureNav ? Math.max(insets.bottom + 70, 90) : 75;
  };

  // Calculate progress percentage
  const progress = duration && duration > 0 ? (currentTime / duration) * 100 : 0;
  
  // Auto-play when new track is loaded
  React.useEffect(() => {
    if (duration > 0 && isLoadingTrack) {
      setIsLoadingTrack(false);
      // Auto-play the new track
      setTimeout(() => {
        play();
      }, 100);
    }
  }, [duration, isLoadingTrack, play]);
  
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );
  
  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX: tx, translationY: ty } = event.nativeEvent;
      
      // Snap to edges or return to original position
      let finalX = 0;
      let finalY = 0;
      
      // Horizontal snapping
      if (Math.abs(tx) > 50) {
        finalX = tx > 0 ? screenWidth - 350 : -(screenWidth - 350);
      }
      
      // Vertical constraints
      const maxY = screenHeight - 300;
      const minY = -200;
      finalY = Math.max(minY, Math.min(maxY, ty));
      
      Animated.spring(translateX, {
        toValue: finalX,
        useNativeDriver: true,
      }).start();
      
      Animated.spring(translateY, {
        toValue: finalY,
        useNativeDriver: true,
      }).start();
    }
  };

  if (!currentItem) {
    console.log('MiniPlayer: No current item');
    return null;
  }
  
  console.log('MiniPlayer rendering:', currentItem.title, 'isPlaying:', isPlaying, 'currentTime:', currentTime, 'duration:', duration);

  const handlePress = () => {
    if (type === 'audio') {
      // Navigate to full audio player without affecting current playback
      setAudioPlayerVisible(false); // Hide mini player
      (navigation as any).navigate('EnhancedAudioPlayer', { item: currentItem });
    } else {
      (navigation as any).navigate('EnhancedVideoPlayer', { item: currentItem });
    }
  };

  const getIcon = () => {
    return type === 'audio' ? 'music-note' : 'video';
  };

  const getPlayIcon = () => {
    if (type === 'video') return 'play'; // Videos don't use the audio player context
    return isPlaying ? 'pause' : 'play';
  };

  const handlePlayPause = async () => {
    console.log('MiniPlayer play/pause clicked, isPlaying:', isPlaying, 'duration:', duration);
    if (type === 'audio') {
      if (!duration || duration <= 0) {
        console.log('No audio loaded yet');
        return;
      }
      
      try {
        if (isPlaying) {
          console.log('Pausing from mini player');
          await pause();
        } else {
          console.log('Playing from mini player');
          await play();
        }
      } catch (error) {
        console.error('Error in mini player play/pause:', error);
      }
    } else {
      handlePress();
    }
  };

  const handleClose = async () => {
    // Stop audio and reset player when closing mini player
    try {
      await pause();
      reset();
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
    onClose?.();
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View style={[
        styles.container, 
        { 
          backgroundColor: colors.surface || '#FFFFFF',
          bottom: getBottomPosition(),
          transform: [{ translateX }, { translateY }],
        }
      ]}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBackground, { backgroundColor: colors.surfaceVariant }]} />
        <View 
          style={[
            styles.progressBar, 
            { 
              backgroundColor: colors.primary || '#007AFF',
              width: `${Math.max(0, Math.min(100, progress))}%`
            }
          ]} 
        />
      </View>
      
      {/* Title at top */}
      <View style={styles.titleContainer}>
        <Text style={[styles.topTitle, { color: colors.onSurface }]} numberOfLines={1}>
          {currentItem.title}
        </Text>
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity style={styles.leftContent} onPress={handlePress}>
          <View style={styles.imageContainer}>
            {currentItem.imageUrl ? (
              <CustomFastImage style={styles.image} imageUrl={currentItem.imageUrl} />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: colors.surfaceVariant }]}>
                <MaterialDesignIcons name={getIcon()} size={20} color={colors.primary} />
              </View>
            )}
          </View>
          
          <View style={styles.textContainer}>
            <View style={styles.artistRow}>
              <Text style={[styles.artist, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                {currentItem.artist || 'Unknown Artist'}
              </Text>
              {type === 'audio' && duration > 0 && (
                <Text style={[styles.timeText, { color: colors.onSurfaceVariant || '#666' }]}>
                  {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.controls}>
        {type === 'audio' && (
          <TouchableOpacity 
            onPress={() => {
              const prev = previousTrack();
              if (prev) {
                setIsLoadingTrack(true);
                pause();
                reset();
                switchToAudio(prev);
                setAudioPlayerVisible(true);
              }
            }} 
            style={[styles.controlButton, { opacity: hasPrevious ? 1 : 0.3 }]}
            disabled={!hasPrevious || isLoadingTrack}
          >
            {isLoadingTrack ? (
              <ActivityIndicator size={20} color="#FF6B35" />
            ) : (
              <MaterialDesignIcons name="skip-previous" size={24} color="#FF6B35" />
            )}
          </TouchableOpacity>
        )}
        
        <TouchableOpacity onPress={handlePlayPause} style={styles.playButton} disabled={isLoadingTrack}>
          {isLoadingTrack ? (
            <ActivityIndicator size={28} color="#FFFFFF" />
          ) : (
            <MaterialDesignIcons
              name={getPlayIcon()}
              size={32}
              color="#FFFFFF"
            />
          )}
        </TouchableOpacity>
        
        {type === 'audio' && (
          <TouchableOpacity 
            onPress={() => {
              const next = nextTrack();
              if (next) {
                setIsLoadingTrack(true);
                pause();
                reset();
                switchToAudio(next);
                setAudioPlayerVisible(true);
              }
            }} 
            style={[styles.controlButton, { opacity: hasNext ? 1 : 0.3 }]}
            disabled={!hasNext || isLoadingTrack}
          >
            {isLoadingTrack ? (
              <ActivityIndicator size={20} color="#FF6B35" />
            ) : (
              <MaterialDesignIcons name="skip-next" size={24} color="#FF6B35" />
            )}
          </TouchableOpacity>
        )}
        
        {onClose && (
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialDesignIcons name="close" size={20} color="#999999" />
          </TouchableOpacity>
        )}
        </View>
      </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 95,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    zIndex: 1000,
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  progressBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 4,
    backgroundColor: '#FF6B35',
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  topTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'left',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  imageContainer: {
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  placeholderImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 4,
    color: '#1A1A1A',
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  artist: {
    fontSize: 13,
    lineHeight: 16,
    color: '#666666',
    fontWeight: '500',
    flex: 1,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B35',
    fontVariant: ['tabular-nums'],
    marginLeft: 8,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    marginHorizontal: 3,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});

export default MiniPlayer;