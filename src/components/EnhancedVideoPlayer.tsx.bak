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
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
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
import { useBookmarks } from '../context/BookmarkContext';
import { useRecentlyPlayed } from '../context/RecentlyPlayedContext';
import SafeBottomArea from './SafeBottomArea';

const { width, height } = Dimensions.get('window');

const EnhancedVideoPlayer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
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
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { addRecentItem } = useRecentlyPlayed();
  const isLiked = isBookmarked(currentVideo?._id || '');
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
      // Add to recently played when user starts playing
      if (currentVideo) {
        addRecentItem(currentVideo);
      }
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

  const toggleMute = () => {
    setMuted(!muted);
    setShowControls(true);
  };

  const toggleRepeat = () => {
    // Add repeat functionality here if needed
    setShowControls(true);
  };

  const toggleShuffle = () => {
    // Add shuffle functionality here if needed
    setShowControls(true);
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    setShowControls(true);
  };

  // Handle share functionality
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this video: ${videoTitle}`,
        url: videoUrl,
        title: videoTitle,
      });
    } catch (error) {
      Alert.alert(t('common.error'), t('screens.videoPlayer.shareError'));
    }
  };



  if (!videoUrl) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('screens.videoPlayer.noVideoUrl')}</Text>
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
          <TouchableOpacity onPress={() => {
            if (currentVideo) {
              const videoItem = {
                ...currentVideo,
                type: 'video',
                videoUrl: currentVideo.videoUrl || currentVideo.streamingUrl || currentVideo.videoUri,
                thumbnailUrl: currentVideo.thumbnailUrl || currentVideo.imageUrl || currentVideo.coverImage,
                imageUrl: currentVideo.imageUrl || currentVideo.thumbnailUrl || currentVideo.coverImage
              };
              if (isLiked) {
                removeBookmark(currentVideo._id);
                Alert.alert(t('common.bookmark'), t('screens.bookmarks.removedFromBookmarks'));
              } else {
                addBookmark(videoItem);
                Alert.alert(t('common.bookmark'), t('screens.bookmarks.addedToBookmarks'));
              }
            }
          }} style={styles.headerButton}>
            <MaterialDesignIcons 
              name={isLiked ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={isLiked ? "#F8803B" : colors.onSurface} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <MaterialDesignIcons name="share-variant" size={24} color={colors.onSurface} />
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
              {fullScreen && (
                <View style={styles.fullscreenTimeDisplay}>
                  <Text style={styles.overlayTimeText}>{formatTime(currentTime)} / {formatTime(duration)}</Text>
                </View>
              )}
            </View>

            {/* Center Controls */}
            <View style={styles.centerControls}>
              {fullScreen && (
                <>
                  <TouchableOpacity onPress={() => seekBy(-10)} style={styles.seekButton}>
                    <MaterialDesignIcons name="rewind-10" size={32} color="#fff" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={toggleMute} style={styles.seekButton}>
                    <MaterialDesignIcons
                      name={muted ? 'volume-off' : 'volume-high'}
                      size={28}
                      color="#fff"
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                    <MaterialDesignIcons
                      name={paused ? 'play' : 'pause'}
                      size={48}
                      color="#fff"
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={changePlaybackRate} style={styles.seekButton}>
                    <Text style={styles.speedText}>{playbackRate}x</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => seekBy(10)} style={styles.seekButton}>
                    <MaterialDesignIcons name="fast-forward-10" size={32} color="#fff" />
                  </TouchableOpacity>
                </>
              )}
            </View>


          </View>
        )}
      </TouchableOpacity>

      {/* Video Info - only show in portrait mode */}
      {!fullScreen && (
        <View style={[styles.videoInfo, { backgroundColor: colors.surface }]}>
          {/* Enhanced Action Row */}
          <View style={styles.enhancedActionRow}>
            <TouchableOpacity style={styles.enhancedActionButton} onPress={changePlaybackRate}>
              <MaterialDesignIcons name="speedometer" size={20} color={colors.onSurfaceVariant} />
              <Text style={[styles.enhancedActionText, { color: colors.onSurfaceVariant }]}>{t('screens.videoPlayer.speed')} ({playbackRate}x)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.enhancedActionButton}>
              <MaterialDesignIcons name="skip-next" size={20} color={colors.onSurfaceVariant} />
              <Text style={[styles.enhancedActionText, { color: colors.onSurfaceVariant }]}>{t('screens.videoPlayer.nextUp')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.videoTitle, { color: colors.onSurface }]} numberOfLines={2}>{videoTitle}</Text>
          <Text style={[styles.videoSubtitle, { color: colors.onSurfaceVariant }]}>{currentVideo?.subtitle || currentVideo?.artist || 'Video Content'}</Text>
          
          {/* Progress Bar and Controls */}
          <View style={styles.bottomProgressContainer}>
            <Slider
              style={styles.bottomProgressSlider}
              value={duration ? currentTime / duration : 0}
              minimumValue={0}
              maximumValue={1}
              onSlidingComplete={handleSeek}
              minimumTrackTintColor="#F8803B"
              maximumTrackTintColor={colors.outline}
              thumbTintColor="#F8803B"
            />
            <View style={styles.timeRow}>
              <Text style={[styles.bottomTimeText, { color: colors.onSurfaceVariant }]}>{formatTime(currentTime)}</Text>
              <Text style={[styles.bottomTimeText, { color: colors.onSurfaceVariant }]}>{formatTime(duration)}</Text>
            </View>
          </View>
          
          {/* Enhanced Control Buttons */}
          <View style={styles.enhancedControls}>
            <TouchableOpacity 
              style={styles.controlIcon}
              onPress={() => seekBy(-10)}
            >
              <MaterialDesignIcons name="rewind-10" size={32} color={"#F8803B"} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={toggleMute} style={styles.controlIcon}>
              <MaterialDesignIcons
                name={muted ? 'volume-off' : 'volume-high'}
                size={28}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={togglePlayPause} style={[styles.enhancedPlayButton, { backgroundColor: "#F8803B" }]}>
              <MaterialDesignIcons
                name={paused ? 'play' : 'pause'}
                size={44}
                color="#fff"
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={toggleFullScreen} style={styles.controlIcon}>
              <MaterialDesignIcons
                name={fullScreen ? 'fullscreen-exit' : 'fullscreen'}
                size={28}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlIcon}
              onPress={() => seekBy(10)}
            >
              <MaterialDesignIcons name="fast-forward-10" size={32} color={"#F8803B"} />
            </TouchableOpacity>
          </View>
          
          <SafeBottomArea backgroundColor={colors.surface} />
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
  fullscreenTimeDisplay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  overlayTimeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
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
  bottomProgressContainer: {
    marginVertical: hp(1),
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(0.2),
  },
  bottomTimeText: {
    fontSize: normalize(10),
    fontWeight: '500',
  },
  bottomProgressSlider: {
    width: '100%',
    height: hp(3.5),
    marginVertical: 0,
  },
  videoInfo: {
    paddingHorizontal: wp(4),
    paddingTop: hp(1.5),
  },
  videoTitle: {
    fontSize: normalize(16),
    fontWeight: '700',
    marginBottom: hp(0.3),
  },
  videoSubtitle: {
    fontSize: normalize(12),
    marginBottom: hp(1),
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 10,
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
    justifyContent: 'space-around',
    marginBottom: hp(1),
    paddingHorizontal: wp(2),
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
    marginVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  controlIcon: {
    padding: wp(2),
  },
  enhancedPlayButton: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
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