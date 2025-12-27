import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Share,
  Alert,
  FlatList,
  Modal,
  Platform,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import Slider from '@react-native-community/slider';
import { useTheme } from 'react-native-paper';
import { useAudioPlayerContext } from '../context/AudioPlayerContext';
import { useCurrentPlayer } from '../context/CurrentPlayerContext';
import { usePlaylist } from '../context/PlaylistContext';
import { usePlayerNavigation } from '../hooks/usePlayerNavigation';
import CustomFastImage from './CustomFastImage';
import SafeBottomArea from './SafeBottomArea';
import { useAzureAssets } from '../hooks/useAzureAssets';
import { getStreamingUrl, getImageUrl, processAzureUrl, createAzureProxyUrl, needsAzureProxy } from '../utils/azureUrlHelper';
import { debugAudioUrls, testAudioUrl } from '../utils/audioDebugHelper';
import { wp, hp, normalize, isSmallScreen, getResponsiveSize } from '../utils/responsive';
import { useMediaPlayerManager } from '../context/MediaPlayerManager';
import { useGetFeaturedQuery } from '../data/redux/services/mediaApi';
import { useBookmarks } from '../context/BookmarkContext';
import SkeletonItem from './SkeletonLoader';
import { useRecentlyPlayed } from '../context/RecentlyPlayedContext';

const PlaylistContent = ({ colors, currentIndex, currentPlaylist, isPlaying, onTrackSelect }: any) => {
  const { t } = useTranslation();
  const { data: apiResponse, isLoading } = useGetFeaturedQuery({ type: 'audio', limit: 50 });
  const { recentItems } = useRecentlyPlayed();
  
  // Filter recent items to only show audio items
  const recentAudios = recentItems.filter((item: any) => item.type === 'audio');
  const apiAudios = Array.isArray(apiResponse?.data?.audios) ? apiResponse.data.audios.filter((item: any) => item.type === 'audio') : [];
  
  // Use recent audios first, then fallback to current playlist or API audios
  const displayData = recentAudios.length > 0 ? recentAudios : 
                     (currentPlaylist && currentPlaylist.length > 0 ? currentPlaylist.filter((item: any) => item.type === 'audio') : apiAudios);

  if (isLoading) {
    return (
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        {[...Array(5)].map((_, i) => (
          <View key={i} style={{ paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}>
            <SkeletonItem width={50} height={50} borderRadius={8} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <SkeletonItem width="80%" height={16} borderRadius={4} style={{ marginBottom: 6 }} />
              <SkeletonItem width="60%" height={14} borderRadius={4} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (displayData.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <MaterialDesignIcons name="playlist-music-outline" size={48} color={colors.onSurfaceVariant} />
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 16, marginTop: 10 }}>{t('screens.audioPlayer.noAudios')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={displayData}
      keyExtractor={(item, index) => `${item._id}-${index}`}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          style={[
            { paddingHorizontal: 20, paddingVertical: 12 },
            { backgroundColor: index === currentIndex ? colors.primary + '20' : 'transparent' }
          ]}
          onPress={() => onTrackSelect(item)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {item.thumbnailUrl || item.imageUrl ? (
              <CustomFastImage 
                style={{ width: 50, height: 50, borderRadius: 8, marginRight: 12 }} 
                imageUrl={processAzureUrl(item.thumbnailUrl) || processAzureUrl(item.imageUrl)} 
              />
            ) : (
              <View style={[{ width: 50, height: 50, borderRadius: 8, marginRight: 12, justifyContent: 'center', alignItems: 'center' }, { backgroundColor: colors.surfaceVariant }]}>
                {index === currentIndex && isPlaying ? (
                  <Animated.View
                    style={{
                      transform: [{
                        rotate: musicNoteRotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        })
                      }]
                    }}
                  >
                    <MaterialDesignIcons name="music-note" size={20} color={colors.primary} />
                  </Animated.View>
                ) : (
                  <MaterialDesignIcons name="music-note" size={20} color={colors.onSurfaceVariant} />
                )}
              </View>
            )}
            
            <View style={{ flex: 1 }}>
              <Text 
                style={[
                  { fontSize: 16, fontWeight: '600', marginBottom: 2 },
                  { color: index === currentIndex ? colors.primary : colors.onBackground }
                ]} 
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text 
                style={[{ fontSize: 14, fontWeight: '400' }, { color: colors.onSurfaceVariant }]} 
                numberOfLines={1}
              >
                {item.artist || t('screens.audioPlayer.unknownArtist')}
              </Text>
            </View>
            
            {index === currentIndex && (
              <MaterialDesignIcons 
                name={isPlaying ? "volume-high" : "pause"} 
                size={20} 
                color={colors.primary} 
              />
            )}
          </View>
        </TouchableOpacity>
      )}
      showsVerticalScrollIndicator={false}
    />
  );
};

const { width, height } = Dimensions.get('window');

const EnhancedAudioPlayer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const item = (route.params as any)?.item;
  const playlist = (route.params as any)?.playlist;
  const { colors, dark } = useTheme();
  const { switchToAudio, setAudioPlayerVisible } = useCurrentPlayer();
  const { setPlaylist, nextTrack, previousTrack, hasNext, hasPrevious, currentPlaylist, currentIndex } = usePlaylist();
  const { goBackWithMiniPlayer } = usePlayerNavigation('audio', item);
  const { stopAllVideo, registerAudioPlayer, restoreAudioState, hasAudioState } = useMediaPlayerManager();

  // Handle share functionality
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this audio: ${currentTrack?.title || 'Audio'} - ${currentTrack?.artist || 'Unknown Artist'}`,
        url: audioUrl,
        title: currentTrack?.title || 'Audio',
      });
    } catch (error) {
      Alert.alert(t('common.error'), t('screens.audioPlayer.shareError'));
    }
  };



  // Handle bookmark toggle
  const handleLike = () => {
    if (currentTrack) {
      if (isLiked) {
        removeBookmark(currentTrack._id);
        Alert.alert(t('common.bookmark'), t('screens.bookmarks.removedFromBookmarks'));
      } else {
        const audioItem = {
          ...currentTrack,
          type: 'audio',
          audioUrl: currentTrack.audioUrl || currentTrack.streamingUrl || audioUrl,
          streamingUrl: currentTrack.streamingUrl || currentTrack.audioUrl || audioUrl,
          thumbnailUrl: currentTrack.thumbnailUrl || currentTrack.imageUrl,
          imageUrl: currentTrack.imageUrl || currentTrack.thumbnailUrl
        };
        console.log('EnhancedAudioPlayer - Bookmarking audio item:', audioItem);
        addBookmark(audioItem);
        Alert.alert(t('common.bookmark'), t('screens.bookmarks.addedToBookmarks'));
      }
    }
  };
  
  const [isLoading, setIsLoading] = useState(true);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { addRecentItem } = useRecentlyPlayed();
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(item);
  const [hasUserStartedPlayback, setHasUserStartedPlayback] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [showSpeedControl, setShowSpeedControl] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(0);
  const [repeatMode, setRepeatMode] = useState('off');
  const [shuffleMode, setShuffleMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Animation values for music icons
  const musicNoteScale = new Animated.Value(1);
  const musicNoteRotation = new Animated.Value(0);
  const playButtonScale = new Animated.Value(1);

  const { resourceUrls } = useAzureAssets(currentTrack || {});
  const isLiked = isBookmarked(currentTrack?._id || '');
  
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
    console.log('🎵 Play button pressed');
    console.log('🎵 Audio URL:', audioUrl);
    console.log('🎵 Duration:', duration);
    console.log('🎵 Current track:', currentTrack?.title);
    
    if (!proxyAudioUrl) {
      console.error('❌ No proxy audio URL available');
      setErrorMessage('No audio URL available');
      return;
    }
    
    stopAllVideo();
    setHasUserStartedPlayback(true);
    
    if (currentTrack) {
      addRecentItem(currentTrack);
    }
    
    originalPlay();
  };

  const progress = duration ? currentTime / duration : 0;
  
  const audioUrl = getStreamingUrl(currentTrack, 'audio');
  const proxyAudioUrl = audioUrl;
  const displayImageUrl = processAzureUrl(currentTrack?.thumbnailUrl) || processAzureUrl(currentTrack?.imageUrl) || processAzureUrl(currentTrack?.headerImage) || processAzureUrl(currentTrack?.mainImage);
  
  console.log('🎵 Enhanced Audio Player Debug:', {
    audioUrl,
    displayImageUrl,
    isLoading,
    isBuffering,
    duration,
    currentTime,
    isPlaying,
    trackTitle: currentTrack?.title
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
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(dark ? '#1a1a1a' : '#ffffff');
    }
    
    // Stop all video when audio player mounts
    stopAllVideo();
    
    // Register this audio player
    registerAudioPlayer(audioPlayerContext);
    
    // Set current audio item for mini player and hide it since we're in full screen
    if (item) {
      switchToAudio(item);
      setAudioPlayerVisible(false);
    }
    
    // Set playlist if provided
    if (playlist && playlist.length > 0) {
      const startIndex = playlist.findIndex((track: any) => track._id === item._id);
      setPlaylist(playlist, startIndex >= 0 ? startIndex : 0);
    }

    return () => {
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#ffffff');
      }
      // Keep audio playing when minimizing, don't stop it
      setAudioPlayerVisible(true);
    };
  }, []); // Empty dependency array
  
  // Animation effect for playing state
  useEffect(() => {
    if (isPlaying) {
      // Music note pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(musicNoteScale, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(musicNoteScale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Music note rotation animation
      Animated.loop(
        Animated.timing(musicNoteRotation, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      ).start();
      
      // Play button pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(playButtonScale, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(playButtonScale, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop all animations
      musicNoteScale.stopAnimation();
      musicNoteRotation.stopAnimation();
      playButtonScale.stopAnimation();
      
      // Reset to default values
      musicNoteScale.setValue(1);
      musicNoteRotation.setValue(0);
      playButtonScale.setValue(1);
    }
  }, [isPlaying]);
  
  // Simplified loading logic - just check if we have audio URL
  useEffect(() => {
    if (audioUrl && currentTrack?._id) {
      console.log('🎵 Audio URL available, stopping loading');
      setIsLoading(false);
      setIsBuffering(false);
    } else {
      console.log('❌ No audio URL, keeping loading state');
    }
  }, [audioUrl, currentTrack?._id]);
  
  // Load audio when proxy URL is available
  useEffect(() => {
    if (proxyAudioUrl && !isLoading) {
      console.log('🎵 Loading audio buffer via proxy:', proxyAudioUrl);
      loadBuffer(proxyAudioUrl).then(() => {
        console.log('✅ Audio buffer loaded successfully');
      }).catch(error => {
        console.error('❌ Audio load error:', error);
        setErrorMessage('Failed to load audio');
      });
    }
  }, [proxyAudioUrl, isLoading]);

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
  };
  
  const handleShuffle = () => {
    setShuffleMode(!shuffleMode);
  };

  const handleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };
  
  const switchTrack = (newTrack: any) => {
    if (newTrack && newTrack._id !== currentTrack?._id) {
      console.log('Switching to track:', newTrack.title);
      
      // Stop current audio
      pause();
      
      // Update track first - this will trigger useEffect to load new audio
      setCurrentTrack(newTrack);
      switchToAudio(newTrack);
      setAudioPlayerVisible(false);
      
      console.log('Track switched to:', newTrack.title, 'ID:', newTrack._id);
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
        <Text style={styles.errorText}>{t('screens.audioPlayer.noAudioData')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Spotify-style Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={goBackWithMiniPlayer} style={styles.backBtn}>
          <MaterialDesignIcons name="chevron-down" size={28} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.playingFrom, { color: colors.onSurfaceVariant }]}>PLAYING FROM PLAYLIST</Text>
          <Text style={[styles.playlistName, { color: colors.onBackground }]}>{currentTrack?.categoryName || currentTrack?.sectionName || 'Audio Playlist'}</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <MaterialDesignIcons name="dots-vertical" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Album Art Section */}
      <View style={styles.artSection}>
        {isLoading ? (
          <View style={styles.artSkeleton}>
            <SkeletonItem width={width - 60} height={width - 60} borderRadius={12} />
          </View>
        ) : (
          <View style={[styles.artContainer, { shadowColor: colors.primary }]}>
            {displayImageUrl ? (
              <View style={styles.albumImageContainer}>
                <CustomFastImage style={styles.albumImage} imageUrl={displayImageUrl} />
                {isPlaying && (
                  <View style={styles.albumImageOverlay}>
                    <Animated.View
                      style={{
                        transform: [
                          { scale: musicNoteScale },
                          { 
                            rotate: musicNoteRotation.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg'],
                            })
                          }
                        ]
                      }}
                    >
                      <MaterialDesignIcons 
                        name="music-note" 
                        size={60} 
                        color={colors.primary + '80'} 
                      />
                    </Animated.View>
                  </View>
                )}
              </View>
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: colors.surfaceVariant }]}>
                <Animated.View
                  style={{
                    transform: [
                      { scale: musicNoteScale },
                      { 
                        rotate: musicNoteRotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        })
                      }
                    ]
                  }}
                >
                  <MaterialDesignIcons 
                    name="music-note" 
                    size={80} 
                    color={isPlaying ? colors.primary : colors.onSurfaceVariant} 
                  />
                </Animated.View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Track Info */}
      <View style={styles.trackSection}>
        <View style={styles.trackInfo}>
          {isLoading ? (
            <>
              <SkeletonItem width="90%" height={28} borderRadius={4} style={{ marginBottom: 8 }} />
              <SkeletonItem width="70%" height={20} borderRadius={4} />
            </>
          ) : (
            <>
              <Text style={[styles.trackTitle, { color: colors.onBackground }]} numberOfLines={2}>
                {currentTrack.title}
              </Text>
              <Text style={[styles.trackArtist, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                {currentTrack.artist || 'Unknown Artist'}
              </Text>
            </>
          )}
        </View>
        <View style={styles.trackActions}>
          <TouchableOpacity onPress={handleLike} style={styles.heartBtn}>
            <MaterialDesignIcons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={28} 
              color={isLiked ? colors.primary : colors.onSurfaceVariant} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        {isLoading ? (
          <SkeletonItem width="100%" height={4} borderRadius={2} style={{ marginBottom: 16 }} />
        ) : (
          <Slider
            style={styles.progressSlider}
            value={progress}
            minimumValue={0}
            maximumValue={1}
            onSlidingComplete={(val) => {
              if (duration) seekTo(val * duration);
            }}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.outline}
            thumbTintColor={colors.primary}
          />
        )}
        <View style={styles.timeRow}>
          {isLoading ? (
            <>
              <SkeletonItem width={35} height={12} borderRadius={6} />
              <SkeletonItem width={35} height={12} borderRadius={6} />
            </>
          ) : (
            <>
              <Text style={[styles.timeText, { color: colors.onSurfaceVariant }]}>
                {formatTime(currentTime)}
              </Text>
              <Text style={[styles.timeText, { color: colors.onSurfaceVariant }]}>
                {formatTime(duration ?? 0)}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Controls Section */}
      <View style={styles.controlsSection}>
        <View style={styles.topControls}>
          <TouchableOpacity onPress={handleShuffle} style={styles.smallBtn}>
            <MaterialDesignIcons 
              name="shuffle" 
              size={20} 
              color={shuffleMode ? colors.primary : colors.onSurfaceVariant} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.smallBtn}>
            <MaterialDesignIcons name="share-variant" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowPlaylist(!showPlaylist)} style={styles.smallBtn}>
            <MaterialDesignIcons name="playlist-music" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRepeat} style={styles.smallBtn}>
            <MaterialDesignIcons 
              name={repeatMode === 'one' ? 'repeat-once' : 'repeat'} 
              size={20} 
              color={repeatMode !== 'off' ? colors.primary : colors.onSurfaceVariant} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.mainPlayControls}>
          <TouchableOpacity 
            onPress={handlePrevious} 
            style={[styles.skipBtn, { opacity: hasPrevious ? 1 : 0.3 }]}
            disabled={!hasPrevious}
          >
            <MaterialDesignIcons name="skip-previous" size={36} color={colors.onBackground} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={isPlaying ? pause : play}
            style={[styles.playBtn, { backgroundColor: colors.primary }]}
            disabled={isLoading}
          >
            <Animated.View style={{ transform: [{ scale: playButtonScale }] }}>
              {isLoading ? (
                <ActivityIndicator size="large" color={colors.background} />
              ) : (
                <MaterialDesignIcons
                  name={isPlaying ? 'pause' : 'play'}
                  size={28}
                  color={colors.onPrimary}
                />
              )}
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleNext} 
            style={[styles.skipBtn, { opacity: hasNext ? 1 : 0.3 }]}
            disabled={!hasNext}
          >
            <MaterialDesignIcons name="skip-next" size={36} color={colors.onBackground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
      </View>



      {/* Playlist Drawer */}
      {showPlaylist && (
        <View style={styles.playlistOverlay}>
          <TouchableOpacity 
            style={styles.playlistBackdrop} 
            onPress={() => setShowPlaylist(false)}
            activeOpacity={1}
          />
          <View style={[styles.playlistDrawer, { backgroundColor: colors.surface }]}>
            <View style={styles.playlistHandle} />
            <View style={styles.playlistHeader}>
              <Text style={[styles.playlistTitle, { color: colors.onBackground }]}>{t('screens.audioPlayer.upNext')}</Text>
              <TouchableOpacity onPress={() => setShowPlaylist(false)}>
                <MaterialDesignIcons name="close" size={20} color={colors.onBackground} />
              </TouchableOpacity>
            </View>
            
            <PlaylistContent 
              colors={colors}
              currentIndex={currentIndex}
              currentPlaylist={currentPlaylist}
              isPlaying={isPlaying}
              onTrackSelect={(item) => {
                switchTrack(item);
                setShowPlaylist(false);
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  playingFrom: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  playlistName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  moreBtn: {
    padding: 8,
  },
  artSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  artContainer: {
    elevation: 24,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
  },
  albumImage: {
    width: width - 60,
    height: width - 60,
    borderRadius: 12,
  },
  albumImageContainer: {
    position: 'relative',
    width: width - 60,
    height: width - 60,
  },
  albumImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
  },
  placeholderImage: {
    width: width - 60,
    height: width - 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 16,
    fontWeight: '500',
  },
  trackActions: {
    paddingLeft: 16,
  },
  heartBtn: {
    padding: 8,
  },
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressContainer: {
    position: 'relative',
  },
  bufferTrack: {
    position: 'absolute',
    top: 18,
    left: 16,
    right: 16,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  bufferFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressSlider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  controlsSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  smallBtn: {
    padding: 8,
  },
  mainPlayControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtn: {
    padding: 12,
    marginHorizontal: 24,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 40,
  },
  bottomBtn: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    minHeight: 60,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: normalize(16),
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: wp(2),
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 12,
    borderRadius: 20,
  },
  albumContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(6),
    paddingVertical: hp(3),
  },
  albumArtWrapper: {
    width: getResponsiveSize(width - 100, width - 80, width - 60),
    height: getResponsiveSize(width - 100, width - 80, width - 60),
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
    paddingVertical: hp(1.5),
    alignItems: 'center',
    minHeight: hp(8),
  },
  songTitle: {
    fontSize: normalize(isSmallScreen() ? 20 : 24),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: hp(0.5),
    paddingHorizontal: wp(2),
  },
  artistName: {
    fontSize: normalize(isSmallScreen() ? 14 : 16),
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: wp(2),
  },
  progressContainer: {
    paddingHorizontal: wp(8),
    marginTop: hp(2),
    marginBottom: hp(2),
    minHeight: 60,
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
    paddingHorizontal: wp(8),
    marginBottom: hp(4),
    minHeight: 80,
  },
  actionButton: {
    padding: wp(2),
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: wp(4),
  },
  controlButton: {
    padding: wp(3),
    marginHorizontal: wp(4),
  },
  playButton: {
    width: getResponsiveSize(70, 80, 90),
    height: getResponsiveSize(70, 80, 90),
    borderRadius: getResponsiveSize(35, 40, 45),
    backgroundColor: '#F8803B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#F8803B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginHorizontal: wp(6),
  },

  playlistOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  playlistBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  playlistDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playlistHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  playlistTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  playlistItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  playlistItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playlistThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistItemText: {
    flex: 1,
  },
  playlistItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  playlistItemArtist: {
    fontSize: 14,
    fontWeight: '400',
  },
  emptyPlaylist: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPlaylistText: {
    fontSize: 16,
    marginTop: 10,
  },
  bufferingContainer: {
    alignItems: 'center',
    marginVertical: hp(1),
  },
  spotifySpinner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotifyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F8803B',
    marginHorizontal: 1,
  },
  spotifyDot1: {
    animationDelay: '0s',
  },
  spotifyDot2: {
    animationDelay: '0.2s',
  },
  spotifyDot3: {
    animationDelay: '0.4s',
  },
  bufferingText: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  enhancedControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: wp(8),
    marginBottom: hp(1),
  },
  speedButton: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: 12,
    backgroundColor: 'rgba(248, 128, 59, 0.1)',
  },
  speedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  volumeButton: {
    padding: wp(2),
  },
  repeatButton: {
    padding: wp(2),
  },
  shuffleButton: {
    padding: wp(2),
  },
  sleepTimerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(4),
    backgroundColor: 'rgba(248, 128, 59, 0.1)',
    marginHorizontal: wp(6),
    borderRadius: 20,
    marginBottom: hp(1),
  },
  sleepTimerText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    marginHorizontal: wp(6),
    borderRadius: 8,
    marginBottom: hp(1),
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
});

export default EnhancedAudioPlayer;