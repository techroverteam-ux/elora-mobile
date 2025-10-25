import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import Slider from '@react-native-community/slider';
import { useTheme } from 'react-native-paper';
import { useAudioPlayerContext } from '../context/AudioPlayerContext';
import { useCurrentPlayer } from '../context/CurrentPlayerContext';
import { usePlaylist } from '../context/PlaylistContext';
import { usePlayerNavigation } from '../hooks/usePlayerNavigation';
import CustomFastImage from './CustomFastImage';
import { useAzureAssets } from '../hooks/useAzureAssets';
import { getStreamingUrl, getImageUrl, processAzureUrl, createAzureProxyUrl, needsAzureProxy } from '../utils/azureUrlHelper';
import { debugAudioUrls, testAudioUrl } from '../utils/audioDebugHelper';
import { wp, hp, normalize } from '../utils/responsive';
import { useMediaPlayerManager } from '../context/MediaPlayerManager';

const { width, height } = Dimensions.get('window');

const EnhancedAudioPlayer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const item = (route.params as any)?.item;
  const playlist = (route.params as any)?.playlist;
  const { colors, dark } = useTheme();
  const { switchToAudio, setAudioPlayerVisible } = useCurrentPlayer();
  const { setPlaylist, nextTrack, previousTrack, hasNext, hasPrevious } = usePlaylist();
  const { goBackWithMiniPlayer } = usePlayerNavigation('audio', item);
  const { stopAllVideo, registerAudioPlayer, restoreAudioState, hasAudioState } = useMediaPlayerManager();
  
  const { resourceUrls } = useAzureAssets(item || {});
  const { streamingUrl } = resourceUrls || {};
  
  const audioPlayerContext = useAudioPlayerContext();
  const {
    play: originalPlay,
    pause,
    seekBy,
    seekTo,
    loadBuffer,
    reset,
    setOnPositionChanged,
    isPlaying,
    duration,
    currentTime,
    formatTime,
  } = audioPlayerContext;
  
  const play = () => {
    stopAllVideo();
    setHasUserStartedPlayback(true);
    originalPlay();
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(item);
  const [hasUserStartedPlayback, setHasUserStartedPlayback] = useState(false);

  const progress = duration ? currentTime / duration : 0;
  
  // Use the same URL processing pattern as the working carousel
  const audioUrl = resourceUrls?.streamingUrl || processAzureUrl(currentTrack?.streamingUrl) || processAzureUrl(currentTrack?.audioUrl) || getStreamingUrl(currentTrack || {}, 'audio');
  
  const displayImageUrl = resourceUrls?.thumbnailImage || resourceUrls?.mainImage || processAzureUrl(currentTrack?.thumbnailUrl) || processAzureUrl(currentTrack?.imageUrl) || getImageUrl(currentTrack || {});
  
  console.log('Enhanced Audio Player - Final Audio URL:', audioUrl);
  console.log('Enhanced Audio Player - Processed Image URL:', displayImageUrl);
  console.log('Enhanced Audio Player - Resource URLs:', resourceUrls);
  console.log('Enhanced Audio Player - Current Track Data:', {
    id: currentTrack?._id,
    title: currentTrack?.title,
    streamingUrl: currentTrack?.streamingUrl,
    audioUrl: currentTrack?.audioUrl,
    thumbnailUrl: currentTrack?.thumbnailUrl
  });
  
  // Debug all available URLs
  if (__DEV__ && currentTrack) {
    debugAudioUrls(currentTrack).then(results => {
      console.log('Enhanced Audio Player - URL Debug Results:', results);
    }).catch(error => {
      console.log('Enhanced Audio Player - Debug error:', error);
    });
  }

  // Separate effect for initial setup
  useEffect(() => {
    StatusBar.setBarStyle(dark ? 'light-content' : 'dark-content');
    StatusBar.setBackgroundColor(dark ? '#1a1a1a' : '#ffffff');
    
    // Stop all video when audio player mounts
    stopAllVideo();
    
    // Register this audio player
    registerAudioPlayer(audioPlayerContext);
    
    // Set current audio item for mini player and hide it since we're in full screen
    if (item) {
      switchToAudio(item);
      setAudioPlayerVisible(false);
    } else if (hasAudioState()) {
      // Restore previous audio state if no new item provided
      setTimeout(() => {
        restoreAudioState();
      }, 1000);
    }
    
    // Set playlist if provided
    if (playlist && playlist.length > 0) {
      const startIndex = playlist.findIndex((track: any) => track._id === item._id);
      setPlaylist(playlist, startIndex >= 0 ? startIndex : 0);
    }

    setOnPositionChanged(() => {});

    return () => {
      StatusBar.setBarStyle('dark-content');
      StatusBar.setBackgroundColor('#ffffff');
      // Don't reset audio when minimizing - let it continue playing
    };
  }, [item?._id, hasAudioState, restoreAudioState]); // Only depend on item ID to prevent re-runs
  
  // Separate effect for audio loading
  useEffect(() => {
    if (audioUrl && currentTrack?._id) {
      setIsLoading(true);
      console.log('Enhanced Audio Player - Loading new track:', currentTrack.title);
      console.log('Enhanced Audio Player - Audio URL:', audioUrl);
      
      // Small delay to ensure previous audio is cleared
      const loadTimer = setTimeout(() => {
        try {
          loadBuffer(audioUrl);
        } catch (error) {
          console.error('Enhanced Audio Player - Error loading audio:', error);
          setIsLoading(false);
        }
      }, 100);
      
      return () => clearTimeout(loadTimer);
    } else {
      console.error('Enhanced Audio Player - No audio URL available for:', currentTrack?.title);
      setIsLoading(false);
    }
  }, [audioUrl, currentTrack?._id]); // Reload when URL or track ID changes
  
  // Separate effect for duration changes
  useEffect(() => {
    if (duration > 0) {
      setIsLoading(false);
      // Auto-play if user has started playback (including track switching)
      if (hasUserStartedPlayback && !isPlaying) {
        console.log('Auto-playing new track');
        setTimeout(() => {
          play();
        }, 100);
      } else if (isPlaying && !hasUserStartedPlayback) {
        console.log('Pausing auto-started audio - user must click play');
        pause();
      }
    }
  }, [duration, isPlaying, hasUserStartedPlayback, play, pause]);
  
  const switchTrack = (newTrack: any) => {
    if (newTrack && newTrack._id !== currentTrack?._id) {
      console.log('Switching to track:', newTrack.title);
      
      // Stop current audio and clear buffer
      pause();
      reset();
      
      // Set user interaction flag to allow auto-play for track switching
      setHasUserStartedPlayback(true);
      
      // Update track and context
      setCurrentTrack(newTrack);
      switchToAudio(newTrack);
      setAudioPlayerVisible(false);
      
      // Auto-play will happen when duration is set
    }
  };
  
  const handleNext = () => {
    const next = nextTrack();
    if (next) {
      switchTrack(next);
    }
  };
  
  const handlePrevious = () => {
    const previous = previousTrack();
    if (previous) {
      switchTrack(previous);
    }
  };

  if (!item) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No audio data provided</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBackWithMiniPlayer} style={styles.headerButton}>
          <MaterialDesignIcons name="chevron-down" size={28} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>Now Playing</Text>
        <TouchableOpacity onPress={() => setShowPlaylist(!showPlaylist)} style={styles.headerButton}>
          <MaterialDesignIcons name="playlist-music" size={24} color={colors.onBackground} />
        </TouchableOpacity>
      </View>

      {/* Album Art */}
      <View style={styles.albumContainer}>
        <View style={styles.albumArtWrapper}>
          {displayImageUrl ? (
            <CustomFastImage style={styles.albumArt} imageUrl={displayImageUrl} />
          ) : (
            <View style={styles.placeholderArt}>
              <MaterialDesignIcons name="music-note" size={80} color={colors.onSurfaceVariant} />
            </View>
          )}
        </View>
      </View>

      {/* Song Info */}
      <View style={styles.songInfo}>
        <Text style={[styles.songTitle, { color: colors.onBackground }]} numberOfLines={2}>{currentTrack.title}</Text>
        <Text style={[styles.artistName, { color: colors.onSurfaceVariant }]} numberOfLines={1}>{currentTrack.artist || 'Unknown Artist'}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          value={progress}
          minimumValue={0}
          maximumValue={1}
          onSlidingComplete={(val) => {
            if (duration) {
              seekTo(val * duration);
            }
          }}
          minimumTrackTintColor="#F8803B"
          maximumTrackTintColor="#333"
          thumbTintColor="#F8803B"

        />
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: colors.onSurfaceVariant }]}>{formatTime(currentTime)}</Text>
          <Text style={[styles.timeText, { color: colors.onSurfaceVariant }]}>{formatTime(duration ?? 0)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={() => setIsLiked(!isLiked)} style={styles.actionButton}>
          <MaterialDesignIcons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={24} 
            color={isLiked ? "#F8803B" : "#666"} 
          />
        </TouchableOpacity>

        <View style={styles.mainControls}>
          <TouchableOpacity 
            onPress={handlePrevious} 
            style={[styles.controlButton, { opacity: hasPrevious ? 1 : 0.5 }]}
            disabled={!hasPrevious}
          >
            <MaterialDesignIcons name="skip-previous" size={32} color={colors.onBackground} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={isPlaying ? pause : play}
            style={styles.playButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <MaterialDesignIcons
                name={isPlaying ? 'pause' : 'play'}
                size={40}
                color="#fff"
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleNext} 
            style={[styles.controlButton, { opacity: hasNext ? 1 : 0.5 }]}
            disabled={!hasNext}
          >
            <MaterialDesignIcons name="skip-next" size={32} color={colors.onBackground} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <MaterialDesignIcons name="share-variant" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.bottomButton}>
          <MaterialDesignIcons name="shuffle" size={20} color={colors.onSurfaceVariant} />
          <Text style={[styles.bottomButtonText, { color: colors.onSurfaceVariant }]}>Shuffle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomButton}>
          <MaterialDesignIcons name="repeat" size={20} color={colors.onSurfaceVariant} />
          <Text style={[styles.bottomButtonText, { color: colors.onSurfaceVariant }]}>Repeat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomButton}>
          <MaterialDesignIcons name="sleep" size={20} color={colors.onSurfaceVariant} />
          <Text style={[styles.bottomButtonText, { color: colors.onSurfaceVariant }]}>Sleep</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
  },
  albumContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(10),
  },
  albumArtWrapper: {
    width: width - 80,
    height: width - 80,
    borderRadius: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  albumArt: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  placeholderArt: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songInfo: {
    paddingHorizontal: wp(8),
    paddingVertical: hp(2.5),
    alignItems: 'center',
  },
  songTitle: {
    fontSize: normalize(24),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: hp(1),
  },
  artistName: {
    fontSize: normalize(16),
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: wp(8),
    marginBottom: hp(2.5),
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    width: 20,
    height: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  timeText: {
    fontSize: normalize(12),
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  actionButton: {
    padding: 12,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  controlButton: {
    padding: 12,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8803B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#F8803B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingBottom: 30,
  },
  bottomButton: {
    alignItems: 'center',
    gap: 4,
  },
  bottomButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default EnhancedAudioPlayer;