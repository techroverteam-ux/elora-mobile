import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  BackHandler,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Video from 'react-native-video';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import Slider from '@react-native-community/slider';
import Orientation from 'react-native-orientation-locker';
import { useTheme } from 'react-native-paper';
import { useCurrentPlayer } from '../context/CurrentPlayerContext';
import { usePlaylist } from '../context/PlaylistContext';
import { getStreamingUrl, getImageUrl, processAzureUrl } from '../utils/azureUrlHelper';
import { wp, hp, normalize } from '../utils/responsive';
import { useMediaPlayerManager } from '../context/MediaPlayerManager';

const { width, height } = Dimensions.get('window');

const EnhancedVideoPlayer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const item = (route.params as any)?.item;
  const playlist = (route.params as any)?.playlist;
  const videoRef = useRef<React.ComponentRef<typeof Video>>(null);
  const { colors, dark } = useTheme();
  const { setCurrentVideoItem, clearAudioPlayer } = useCurrentPlayer();
  const { setPlaylist, nextTrack, previousTrack, hasNext, hasPrevious } = usePlaylist();
  const { stopAllAudio, registerVideoPlayer, saveAudioState } = useMediaPlayerManager();

  const [paused, setPaused] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentVideo, setCurrentVideo] = useState(item);
  const [muted, setMuted] = useState(true);
  const [hasUserPlayed, setHasUserPlayed] = useState(false);

  // Get video URL - use direct URL if flagged, otherwise process through Azure
  const getValidVideoUrl = () => {
    // If this is a direct URL (like from BlogVideo), use it as-is
    if (currentVideo?.isDirectUrl) {
      const directUrl = currentVideo?.streamingUrl || currentVideo?.videoUrl || currentVideo?.videoUri;
      console.log('EnhancedVideoPlayer - Using direct URL:', directUrl);
      return directUrl;
    }
    
    // Otherwise, process through Azure helpers
    const urls = [
      currentVideo?.streamingUrl,
      currentVideo?.videoUrl,
      currentVideo?.videoUri,
      currentVideo?.url
    ].filter(url => url && typeof url === 'string' && url.trim().length > 0);
    
    console.log('EnhancedVideoPlayer - Available URLs:', urls);
    
    for (const url of urls) {
      const processed = processAzureUrl(url.trim());
      console.log('EnhancedVideoPlayer - Processing:', url, '-> Result:', processed);
      if (processed && (processed.startsWith('http://') || processed.startsWith('https://'))) {
        return processed;
      }
    }
    
    return getStreamingUrl(currentVideo, 'video');
  };
  
  const videoUrl = getValidVideoUrl();
  const videoTitle = currentVideo?.title || 'Video Player';
  const thumbnailUrl = processAzureUrl(currentVideo?.thumbnailUrl) || processAzureUrl(currentVideo?.imageUrl) || getImageUrl(currentVideo);
  
  console.log('EnhancedVideoPlayer - Final Video URL:', videoUrl);
  console.log('EnhancedVideoPlayer - Title:', videoTitle);

  useEffect(() => {
    // Save audio state and stop all audio when video player mounts
    saveAudioState();
    stopAllAudio();
    // Clear audio player and hide mini player
    clearAudioPlayer();
    
    // Register this video player
    registerVideoPlayer({ setPaused });
    
    // Set current video item
    if (currentVideo) {
      setCurrentVideoItem(currentVideo);
    }
    
    // Set playlist if provided
    if (playlist && playlist.length > 0) {
      const startIndex = playlist.findIndex((video: any) => video._id === item._id);
      setPlaylist(playlist, startIndex >= 0 ? startIndex : 0);
    }
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (fullScreen) {
        exitFullScreen();
        return true;
      }
      return false;
    });

    return () => {
      backHandler.remove();
      Orientation.lockToPortrait();
    };
  }, [fullScreen, currentVideo, setCurrentVideoItem, playlist, item, setPlaylist, saveAudioState, stopAllAudio, registerVideoPlayer]);
  
  const handleNext = () => {
    const next = nextTrack();
    if (next) {
      setCurrentVideo(next);
      setCurrentVideoItem(next);
    } else {
      console.log('No next video available');
    }
  };
  
  const handlePrevious = () => {
    const previous = previousTrack();
    if (previous) {
      setCurrentVideo(previous);
      setCurrentVideoItem(previous);
    } else {
      console.log('No previous video available');
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls && !paused) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls, paused]);

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number) => {
    const seekTime = value * duration;
    videoRef.current?.seek(seekTime);
    setCurrentTime(seekTime);
  };

  const toggleFullScreen = () => {
    const nextFullScreen = !fullScreen;
    setFullScreen(nextFullScreen);
    
    if (nextFullScreen) {
      Orientation.lockToLandscape();
      StatusBar.setHidden(true);
    } else {
      exitFullScreen();
    }
  };

  const exitFullScreen = () => {
    setFullScreen(false);
    Orientation.lockToPortrait();
    StatusBar.setHidden(false);
  };

  const togglePlayPause = () => {
    if (!paused) {
      setPaused(true);
    } else {
      // Save audio state and stop all audio before playing video
      saveAudioState();
      stopAllAudio();
      // Clear audio player and hide mini player when video starts
      clearAudioPlayer();
      if (!hasUserPlayed) {
        setHasUserPlayed(true);
        setMuted(false);
      }
      setPaused(false);
    }
    setShowControls(true);
  };

  const seekBy = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    videoRef.current?.seek(newTime);
    setCurrentTime(newTime);
    setShowControls(true);
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    setShowControls(true);
  };

  if (!videoUrl) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No video URL provided</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, fullScreen && styles.fullScreenContainer]}>
      {/* Header - only show in portrait mode */}
      {!fullScreen && (
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <MaterialDesignIcons name="arrow-left" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]} numberOfLines={1}>{videoTitle}</Text>
          <TouchableOpacity onPress={() => setIsLiked(!isLiked)} style={styles.headerButton}>
            <MaterialDesignIcons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={isLiked ? "#F8803B" : colors.onSurface} 
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Video Player */}
      <TouchableOpacity 
        style={[styles.videoContainer, fullScreen && styles.fullScreenVideo]}
        onPress={() => setShowControls(!showControls)}
        activeOpacity={1}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          paused={paused}
          muted={muted}
          resizeMode="contain"
          rate={playbackRate}
          onLoad={({ duration }) => {
            console.log('Video loaded, duration:', duration);
            setDuration(duration);
          }}
          onProgress={({ currentTime }) => setCurrentTime(currentTime)}
          onEnd={() => {
            console.log('Video ended, playing next');
            if (hasNext) {
              handleNext();
            }
          }}
          onError={(error) => {
            console.error('EnhancedVideoPlayer - Video Error:', error);
            console.error('EnhancedVideoPlayer - Failed URL:', videoUrl);
            console.error('EnhancedVideoPlayer - Video data:', currentVideo);
            
            const errorCode = error.error?.code;
            const errorString = error.error?.errorString || '';
            
            if (errorCode === 22004 || errorString.includes('22004')) {
              Alert.alert(
                'Video Format Error', 
                'This video format is not supported. The file may be corrupted or in an unsupported format.',
                [
                  { text: 'Try Next', onPress: () => hasNext && handleNext() },
                  { text: 'OK' }
                ]
              );
            } else if (errorCode === -11800) {
              Alert.alert(
                'Network Error', 
                'Cannot load video. Please check your internet connection.',
                [{ text: 'OK' }]
              );
            } else {
              Alert.alert(
                'Video Error', 
                `Unable to play this video. Error code: ${errorCode || 'Unknown'}`,
                [
                  { text: 'Try Next', onPress: () => hasNext && handleNext() },
                  { text: 'OK' }
                ]
              );
            }
          }}
          onBuffer={({ isBuffering }) => console.log('Video buffering:', isBuffering)}
          onReadyForDisplay={() => console.log('Video ready for display')}
        />

        {/* Video Controls Overlay */}
        {showControls && (
          <View style={styles.controlsOverlay}>
            {/* Top Controls */}
            <View style={styles.topControls}>
              {fullScreen && (
                <TouchableOpacity onPress={exitFullScreen} style={styles.overlayButton}>
                  <MaterialDesignIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
              )}
              <View style={styles.spacer} />
              <TouchableOpacity onPress={changePlaybackRate} style={styles.overlayButton}>
                <Text style={styles.speedText}>{playbackRate}x</Text>
              </TouchableOpacity>
            </View>

            {/* Center Controls */}
            <View style={styles.centerControls}>
              <TouchableOpacity 
                onPress={handlePrevious} 
                style={[styles.seekButton, { opacity: playlist && playlist.length > 1 ? 1 : 0.3 }]}
              >
                <MaterialDesignIcons name="skip-previous" size={36} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                <MaterialDesignIcons
                  name={paused ? 'play' : 'pause'}
                  size={48}
                  color="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleNext} 
                style={[styles.seekButton, { opacity: playlist && playlist.length > 1 ? 1 : 0.3 }]}
              >
                <MaterialDesignIcons name="skip-next" size={36} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                <Slider
                  style={styles.progressSlider}
                  value={duration ? currentTime / duration : 0}
                  minimumValue={0}
                  maximumValue={1}
                  onSlidingComplete={handleSeek}
                  minimumTrackTintColor="#F8803B"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="#F8803B"
                />
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
                <TouchableOpacity onPress={toggleFullScreen} style={styles.fullscreenButton}>
                  <MaterialDesignIcons
                    name={fullScreen ? 'fullscreen-exit' : 'fullscreen'}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Video Info - only show in portrait mode */}
      {!fullScreen && (
        <View style={[styles.videoInfo, { backgroundColor: colors.surface }]}>
          {/* Enhanced Action Row */}
          <View style={styles.enhancedActionRow}>
            <TouchableOpacity style={styles.enhancedActionButton}>
              <MaterialDesignIcons name="subtitles" size={20} color={colors.onSurfaceVariant} />
              <Text style={[styles.enhancedActionText, { color: colors.onSurfaceVariant }]}>Subtitle</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.enhancedActionButton} onPress={changePlaybackRate}>
              <MaterialDesignIcons name="speedometer" size={20} color={colors.onSurfaceVariant} />
              <Text style={[styles.enhancedActionText, { color: colors.onSurfaceVariant }]}>Speed ({playbackRate}x)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.enhancedActionButton}>
              <MaterialDesignIcons name="skip-next" size={20} color={colors.onSurfaceVariant} />
              <Text style={[styles.enhancedActionText, { color: colors.onSurfaceVariant }]}>Next Up</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.videoTitle, { color: colors.onSurface }]} numberOfLines={2}>{videoTitle}</Text>
          <Text style={[styles.videoSubtitle, { color: colors.onSurfaceVariant }]}>{currentVideo?.subtitle || currentVideo?.artist || 'Video Content'}</Text>
          
          {/* Enhanced Control Buttons */}
          <View style={styles.enhancedControls}>
            <TouchableOpacity style={styles.controlIcon}>
              <MaterialDesignIcons name="shuffle" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.seekButton}
              onPress={() => seekBy(-10)}
            >
              <MaterialDesignIcons name="rewind-10" size={32} color={colors.onSurface} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={togglePlayPause} style={[styles.enhancedPlayButton, { backgroundColor: colors.primary }]}>
              <MaterialDesignIcons
                name={paused ? 'play' : 'pause'}
                size={40}
                color="#fff"
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.seekButton}
              onPress={() => seekBy(10)}
            >
              <MaterialDesignIcons name="fast-forward-10" size={32} color={colors.onSurface} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlIcon}>
              <MaterialDesignIcons name="repeat" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialDesignIcons name="thumb-up-outline" size={24} color={colors.onSurfaceVariant} />
              <Text style={[styles.actionText, { color: colors.onSurfaceVariant }]}>Like</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <MaterialDesignIcons name="share-variant" size={24} color={colors.onSurfaceVariant} />
              <Text style={[styles.actionText, { color: colors.onSurfaceVariant }]}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <MaterialDesignIcons name="playlist-plus" size={24} color={colors.onSurfaceVariant} />
              <Text style={[styles.actionText, { color: colors.onSurfaceVariant }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
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
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: normalize(16),
    fontWeight: '600',
    marginHorizontal: wp(4),
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  spacer: {
    flex: 1,
  },
  overlayButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  speedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  seekButton: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
  },
  playButton: {
    padding: 16,
    backgroundColor: 'rgba(248,128,59,0.9)',
    borderRadius: 40,
  },
  bottomControls: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    minWidth: 40,
  },
  progressSlider: {
    flex: 1,
    height: 40,
  },
  fullscreenButton: {
    padding: 8,
  },
  videoInfo: {
    padding: 20,
  },
  videoTitle: {
    fontSize: normalize(18),
    fontWeight: '700',
    marginBottom: hp(0.5),
  },
  videoSubtitle: {
    fontSize: normalize(14),
    marginBottom: hp(2.5),
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  enhancedActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  enhancedActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  enhancedActionText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  enhancedControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  controlIcon: {
    padding: 8,
  },
  seekButton: {
    padding: 8,
  },
  enhancedPlayButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default EnhancedVideoPlayer;