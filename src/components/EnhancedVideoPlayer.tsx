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
  Animated,
  Platform,
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
import { shareContent, ShareableContent } from '../utils/deepLinkHelper';
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
  const [muted, setMuted] = useState(false);
  const [hasUserPlayed, setHasUserPlayed] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [quality, setQuality] = useState('auto');
  const [volume, setVolume] = useState(1.0);
  const animatedValues = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
  const [showNextVideo, setShowNextVideo] = useState(false);
  const [autoPlayTimer, setAutoPlayTimer] = useState<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [rotation, setRotation] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Get video URL - check iOS compatibility
  const getVideoUrl = () => {
    const url = getStreamingUrl(currentVideo, 'video');
    
    // Check if video is iOS compatible
    if (Platform.OS === 'ios' && currentVideo?.fileName) {
      const fileName = currentVideo.fileName.toLowerCase();
      const isCompatible = fileName.endsWith('.mp4') || fileName.endsWith('.mov') || fileName.endsWith('.m4v');
      
      if (!isCompatible) {
        console.warn('⚠️ Video may not be compatible with iOS:', fileName);
      }
    }
    
    return url;
  };
  
  const videoUrl = getVideoUrl();
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
  }, [fullScreen, currentVideo, setCurrentVideoItem, saveAudioState, stopAllAudio, registerVideoPlayer]);
  
  // Separate useEffect for playlist setup to avoid setState during render
  useEffect(() => {
    if (playlist && playlist.length > 0) {
      const startIndex = playlist.findIndex((video: any) => video._id === item._id);
      setPlaylist(playlist, startIndex >= 0 ? startIndex : 0);
    }
  }, [playlist, item, setPlaylist]);
  
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
    if (showControls && !paused && !isLocked) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls, paused, isLocked]);

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

  const toggleLock = () => {
    setIsLocked(!isLocked);
    setShowControls(true);
  };

  const rotateVideo = () => {
    setRotation(prev => (prev + 90) % 360);
    setShowControls(true);
  };

  const startNetflixAnimation = () => {
    const animations = animatedValues.map((value, index) => 
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 600,
            delay: index * 200,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      )
    );
    Animated.stagger(200, animations).start();
  };

  const stopNetflixAnimation = () => {
    animatedValues.forEach(value => {
      value.stopAnimation();
      value.setValue(0);
    });
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
    if (!currentVideo) return;
    
    const shareableContent: ShareableContent = {
      _id: currentVideo._id,
      title: currentVideo.title || 'Video',
      type: 'video',
      videoUrl: currentVideo.videoUrl || currentVideo.streamingUrl,
      streamingUrl: currentVideo.streamingUrl,
      thumbnailUrl: currentVideo.thumbnailUrl || currentVideo.imageUrl,
      description: currentVideo.description || currentVideo.subtitle,
      categoryId: currentVideo.categoryId,
      sectionId: currentVideo.sectionId,
    };
    
    await shareContent(shareableContent);
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
          <TouchableOpacity onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              console.log('EnhancedVideoPlayer.tsx:327 Warning: The action \'GO_BACK\' was not handled by any navigator.\n\nIs there any screen to go back to?\n\nThis is a development-only warning and won\'t be shown in production.');
            }
          }} style={styles.headerButton}>
            <MaterialDesignIcons name="arrow-left" size={24} color="#F8803B" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]} numberOfLines={1}>{videoTitle}</Text>
          <View style={styles.headerActions}>
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
                color={isLiked ? "#F8803B" : "#F8803B"} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <MaterialDesignIcons name="share-variant" size={24} color="#F8803B" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Video Player */}
      <TouchableOpacity 
        style={[styles.videoContainer, fullScreen && styles.fullScreenVideo]}
        onPress={() => {
          if (isLocked && fullScreen) {
            return;
          }
          console.log('Screen tapped, showControls:', showControls);
          setShowControls(true);
        }}
        activeOpacity={1}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={[styles.video, rotation !== 0 && { transform: [{ rotate: `${rotation}deg` }] }]}
          paused={paused}
          muted={muted}
          resizeMode={Platform.OS === 'ios' ? 'cover' : 'contain'}
          rate={playbackRate}
          poster={thumbnailUrl}
          posterResizeMode="contain"
          onLoad={({ duration }) => {
            console.log('Video loaded, duration:', duration);
            setDuration(duration);
            setIsBuffering(false);
            stopNetflixAnimation();
          }}
          onProgress={({ currentTime }) => {
            setCurrentTime(currentTime);
            // Show next video preview when 10 seconds left
            if (duration > 0 && hasNext && (duration - currentTime) <= 10 && !showNextVideo && !paused) {
              setShowNextVideo(true);
              setCountdown(5);
              
              // Clear any existing timer
              if (autoPlayTimer) {
                clearTimeout(autoPlayTimer);
              }
              
              // Start auto-play countdown
              const timer = setTimeout(() => {
                setShowNextVideo(false);
                handleNext();
              }, 5000);
              setAutoPlayTimer(timer);
              
              // Update countdown every second
              let currentCountdown = 5;
              const countdownInterval = setInterval(() => {
                currentCountdown -= 1;
                setCountdown(currentCountdown);
                if (currentCountdown <= 0) {
                  clearInterval(countdownInterval);
                }
              }, 1000);
            }
          }}
          onEnd={() => {
            console.log('Video ended');
            setPaused(true);
            setShowControls(true);
            setShowNextVideo(false);
            if (autoPlayTimer) {
              clearTimeout(autoPlayTimer);
              setAutoPlayTimer(null);
            }
            // Small delay before auto-playing next video
            setTimeout(() => {
              if (hasNext) {
                handleNext();
              }
            }, 500);
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
            } else if (errorCode === -11850 || errorCode === -11800) {
              // Check if it's a format issue
              const fileName = currentVideo?.fileName?.toLowerCase() || '';
              const isIncompatibleFormat = !fileName.endsWith('.mp4') && !fileName.endsWith('.mov') && !fileName.endsWith('.m4v');
              
              Alert.alert(
                'iOS Video Format', 
                isIncompatibleFormat 
                  ? `This ${fileName.split('.').pop()?.toUpperCase()} format is not supported on iOS. Only MP4, MOV, and M4V formats work on iOS devices.`
                  : 'This video format is not supported on iOS. Please try on Android device.',
                [
                  { text: 'Try Next', onPress: () => hasNext && handleNext() },
                  { text: 'OK' }
                ]
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
          onBuffer={({ isBuffering }) => {
            console.log('Video buffering:', isBuffering);
            setIsBuffering(isBuffering);
            if (isBuffering) {
              startNetflixAnimation();
            } else {
              stopNetflixAnimation();
            }
          }}
          onReadyForDisplay={() => {
            console.log('Video ready for display');
            setIsBuffering(false);
            stopNetflixAnimation();
          }}
          bufferConfig={{
            minBufferMs: Platform.OS === 'ios' ? 5000 : 15000,
            maxBufferMs: Platform.OS === 'ios' ? 25000 : 50000,
            bufferForPlaybackMs: Platform.OS === 'ios' ? 1000 : 2500,
            bufferForPlaybackAfterRebufferMs: Platform.OS === 'ios' ? 2000 : 5000,
          }}
          volume={volume}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch={Platform.OS === 'ios' ? 'obey' : 'ignore'}
          allowsExternalPlayback={Platform.OS === 'ios'}
          pictureInPicture={false}
          mixWithOthers={'duck'}
        />

        {/* Netflix-style Buffering Indicator */}
        {isBuffering && (
          <View style={styles.netflixBufferingContainer}>
            <View style={styles.netflixSpinner}>
              {animatedValues.map((animatedValue, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.netflixDot,
                    {
                      opacity: animatedValue,
                      transform: [{
                        scale: animatedValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1.2],
                        })
                      }]
                    }
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Next Video Preview */}
        {showNextVideo && hasNext && (
          <View style={styles.nextVideoOverlay}>
            <View style={styles.nextVideoCard}>
              <Text style={styles.nextVideoTitle}>Next Video</Text>
              <Text style={styles.nextVideoName} numberOfLines={2}>{playlist && playlist[playlist.findIndex((v: any) => v._id === currentVideo._id) + 1]?.title || 'Next Video'}</Text>
              <View style={styles.nextVideoActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowNextVideo(false);
                    if (autoPlayTimer) {
                      clearTimeout(autoPlayTimer);
                      setAutoPlayTimer(null);
                    }
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.playNextButton}
                  onPress={() => {
                    if (autoPlayTimer) {
                      clearTimeout(autoPlayTimer);
                      setAutoPlayTimer(null);
                    }
                    handleNext();
                  }}
                >
                  <MaterialDesignIcons name="play" size={16} color="#fff" />
                  <Text style={styles.playNextButtonText}>Play Now</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.countdownText}>Auto-play in {countdown}s</Text>
            </View>
          </View>
        )}

        {/* Video Controls Overlay */}
        {(showControls || paused) && !isLocked && (
          <View style={styles.controlsOverlay}>
            {/* Top Controls */}
            <View style={styles.topControls}>
              {fullScreen && (
                <TouchableOpacity onPress={() => {
                  if (navigation.canGoBack()) {
                    exitFullScreen();
                    navigation.goBack();
                  } else {
                    exitFullScreen();
                  }
                }} style={styles.overlayButton}>
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
                  <TouchableOpacity onPress={hasPrevious ? handlePrevious : undefined} style={[styles.seekButton, !hasPrevious && styles.disabledButton]}>
                    <MaterialDesignIcons
                      name="skip-previous"
                      size={28}
                      color={hasPrevious ? "#fff" : "rgba(255,255,255,0.3)"}
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={hasNext ? handleNext : undefined} style={[styles.seekButton, !hasNext && styles.disabledButton]}>
                    <MaterialDesignIcons
                      name="skip-next"
                      size={28}
                      color={hasNext ? "#fff" : "rgba(255,255,255,0.3)"}
                    />
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Bottom Controls */}
            {fullScreen && (
              <View style={styles.bottomControls}>
                <View style={styles.fullscreenBottomRow}>
                  <TouchableOpacity onPress={toggleMute} style={styles.bottomControlButton}>
                    <MaterialDesignIcons
                      name={muted ? 'volume-off' : 'volume-high'}
                      size={24}
                      color="#fff"
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={changePlaybackRate} style={styles.bottomControlButton}>
                    <Text style={styles.speedText}>{playbackRate}x</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={rotateVideo} style={styles.bottomControlButton}>
                    <MaterialDesignIcons name="rotate-right" size={24} color="#fff" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={toggleLock} style={styles.bottomControlButton}>
                    <MaterialDesignIcons name="lock" size={24} color="#fff" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={toggleFullScreen} style={styles.bottomControlButton}>
                    <MaterialDesignIcons name="fullscreen-exit" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
                
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
                </View>
                
                <View style={styles.fullscreenPlayControls}>
                  <TouchableOpacity onPress={() => seekBy(-10)} style={styles.seekButton}>
                    <MaterialDesignIcons name="rewind-10" size={32} color="#fff" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                    <MaterialDesignIcons
                      name={paused ? 'play' : 'pause'}
                      size={48}
                      color="#fff"
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => seekBy(10)} style={styles.seekButton}>
                    <MaterialDesignIcons name="fast-forward-10" size={32} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}


          </View>
        )}

        {/* Lock Screen Overlay */}
        {isLocked && fullScreen && (
          <View style={styles.lockOverlay}>
            <TouchableOpacity onPress={toggleLock} style={styles.unlockButton}>
              <MaterialDesignIcons name="lock-open" size={32} color="#fff" />
              <Text style={styles.unlockText}>Tap to unlock</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {/* Video Info - only show in portrait mode */}
      {!fullScreen && (
        <View style={[styles.videoInfo, { backgroundColor: colors.surface }]}>
          {/* Enhanced Action Row */}
          <View style={styles.enhancedActionRow}>
            <TouchableOpacity style={styles.enhancedActionButton} onPress={changePlaybackRate}>
              <MaterialDesignIcons name="speedometer" size={20} color="#F8803B" />
              <Text style={[styles.enhancedActionText, { color: colors.onSurfaceVariant }]}>Speed ({playbackRate}x)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.enhancedActionButton} onPress={() => {
              const qualities = ['auto', '720p', '480p', '360p'];
              const currentIndex = qualities.indexOf(quality);
              const nextQuality = qualities[(currentIndex + 1) % qualities.length];
              setQuality(nextQuality);
            }}>
              <MaterialDesignIcons name="high-definition" size={20} color="#F8803B" />
              <Text style={[styles.enhancedActionText, { color: colors.onSurfaceVariant }]}>Quality ({quality})</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.enhancedActionButton} onPress={rotateVideo}>
              <MaterialDesignIcons name="rotate-right" size={20} color="#F8803B" />
              <Text style={[styles.enhancedActionText, { color: colors.onSurfaceVariant }]}>Rotate</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.videoTitle, { color: colors.onSurface }]} numberOfLines={2}>{videoTitle}</Text>
          <Text style={[styles.videoSubtitle, { color: colors.onSurfaceVariant }]}>{currentVideo?.subtitle || currentVideo?.artist || 'Video Content'}</Text>
          
          {/* Top Controls Row */}
          <View style={styles.topControlsRow}>
            <TouchableOpacity onPress={toggleMute} style={[styles.topControlButton, { backgroundColor: colors.surface }]}>
              <MaterialDesignIcons
                name={muted ? 'volume-off' : 'volume-high'}
                size={24}
                color="#F8803B"
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={toggleFullScreen} style={[styles.topControlButton, { backgroundColor: colors.surface }]}>
              <MaterialDesignIcons
                name={fullScreen ? "fullscreen-exit" : "fullscreen"}
                size={24}
                color="#F8803B"
              />
            </TouchableOpacity>
          </View>
          
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
            <TouchableOpacity onPress={hasPrevious ? handlePrevious : undefined} style={[styles.controlIcon, !hasPrevious && styles.disabledIcon]}>
              <MaterialDesignIcons
                name="skip-previous"
                size={28}
                color={hasPrevious ? "#F8803B" : colors.outline}
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlIcon}
              onPress={() => seekBy(-10)}
            >
              <MaterialDesignIcons name="rewind-10" size={32} color={"#F8803B"} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={togglePlayPause} style={[styles.enhancedPlayButton, { backgroundColor: "#F8803B" }]}>
              <MaterialDesignIcons
                name={paused ? 'play' : 'pause'}
                size={44}
                color="#fff"
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlIcon}
              onPress={() => seekBy(10)}
            >
              <MaterialDesignIcons name="fast-forward-10" size={32} color={"#F8803B"} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={hasNext ? handleNext : undefined} style={[styles.controlIcon, !hasNext && styles.disabledIcon]}>
              <MaterialDesignIcons
                name="skip-next"
                size={28}
                color={hasNext ? "#F8803B" : colors.outline}
              />
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingTop: 0,
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
    flex: 1,
    paddingVertical: 0,
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
    paddingHorizontal: 0,
    paddingBottom: 0,
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
  netflixBufferingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  netflixSpinner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  netflixDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F8803B',
    marginHorizontal: 2,
  },
  netflixDot1: {
    animationDelay: '0s',
  },
  netflixDot2: {
    animationDelay: '0.2s',
  },
  netflixDot3: {
    animationDelay: '0.4s',
  },
  nextVideoOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    zIndex: 1000,
  },
  nextVideoCard: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    maxWidth: 280,
  },
  nextVideoTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.8,
  },
  nextVideoName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  nextVideoActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  playNextButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F8803B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  playNextButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.3,
  },
  disabledIcon: {
    opacity: 0.3,
  },
  fullscreenBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomControlButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  topControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1),
    gap: wp(8),
  },
  fullscreenPlayControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    marginTop: 20,
  },
  topControlButton: {
    padding: wp(2),
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockButton: {
    alignItems: 'center',
    padding: 20,
  },
  unlockText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500',
  },
});

export default EnhancedVideoPlayer;