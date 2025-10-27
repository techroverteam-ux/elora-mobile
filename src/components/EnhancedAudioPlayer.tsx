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
import { wp, hp, normalize } from '../utils/responsive';
import { useMediaPlayerManager } from '../context/MediaPlayerManager';
import { useGetFeaturedQuery } from '../data/redux/services/mediaApi';
import { useBookmarks } from '../context/BookmarkContext';
import { useRecentlyPlayed } from '../context/RecentlyPlayedContext';

const PlaylistContent = ({ colors, currentIndex, currentPlaylist, isPlaying, onTrackSelect }: any) => {
  const { t } = useTranslation();
  const { data: apiResponse, isLoading } = useGetFeaturedQuery({ type: 'audio', limit: 50 });
  const apiAudios = Array.isArray(apiResponse?.data?.audios) ? apiResponse.data.audios.filter((item: any) => item.type === 'audio') : [];
  const displayData = currentPlaylist && currentPlaylist.length > 0 ? currentPlaylist.filter((item: any) => item.type === 'audio') : apiAudios;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.onBackground, marginTop: 10 }}>{t('common.loading')}</Text>
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
                <MaterialDesignIcons name="music-note" size={20} color={colors.onSurfaceVariant} />
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
    stopAllVideo();
    setHasUserStartedPlayback(true);
    if (currentTrack) {
      addRecentItem(currentTrack);
    }
    originalPlay();
  };

  const progress = duration ? currentTime / duration : 0;
  
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

    setOnPositionChanged(() => {});

    return () => {
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#ffffff');
      }
    };
  }, []); // Empty dependency array for one-time setup
  
  // Separate effect for audio loading
  useEffect(() => {
    if (audioUrl && currentTrack?._id) {
      setIsLoading(true);
      console.log('Enhanced Audio Player - Loading new track:', currentTrack.title);
      console.log('Enhanced Audio Player - Audio URL:', audioUrl);
      
      // Reset audio state before loading new track
      reset();
      
      loadBuffer(audioUrl).catch(error => {
        console.error('Enhanced Audio Player - Error loading audio:', error);
        setIsLoading(false);
      });
    }
  }, [currentTrack?._id, audioUrl]); // Depend on both track ID and audio URL
  
  // Separate effect for duration changes
  useEffect(() => {
    if (duration > 0) {
      setIsLoading(false);
      // Don't auto-play - let user control playback completely
    }
  }, [duration]);
  
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBackWithMiniPlayer} style={styles.headerButton}>
          <MaterialDesignIcons name="chevron-down" size={28} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>{t('screens.audioPlayer.nowPlaying')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleLike} style={styles.headerButton}>
            <MaterialDesignIcons 
              name={isLiked ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={isLiked ? "#F8803B" : colors.onBackground} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <MaterialDesignIcons name="share-variant" size={24} color={colors.onBackground} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowPlaylist(!showPlaylist)} style={styles.headerButton}>
            <MaterialDesignIcons name="playlist-music" size={24} color={colors.onBackground} />
          </TouchableOpacity>
        </View>
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
        <Text style={[styles.artistName, { color: colors.onSurfaceVariant }]} numberOfLines={1}>{currentTrack.artist || t('screens.audioPlayer.unknownArtist')}</Text>
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
        <TouchableOpacity 
          onPress={() => seekBy(-10)} 
          style={styles.actionButton}
        >
          <MaterialDesignIcons name="rewind-10" size={28} color={colors.onBackground} />
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

        <TouchableOpacity 
          onPress={() => seekBy(10)} 
          style={styles.actionButton}
        >
          <MaterialDesignIcons name="fast-forward-10" size={28} color={colors.onBackground} />
        </TouchableOpacity>
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
    flex: 1,
    fontSize: normalize(16),
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
});

export default EnhancedAudioPlayer;