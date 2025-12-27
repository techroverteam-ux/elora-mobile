import {
  Button,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator, // Add ActivityIndicator
  Alert,
  Animated,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAudioPlayerContext } from '../context/AudioPlayerContext';
import AppBarHeader from './AppBarHeader';
import { ProgressBar, useTheme } from 'react-native-paper';
import { HEIGHT, WIDTH } from '../utils/HelperFunctions';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import Slider from '@react-native-community/slider';
import { RouteProp, useRoute } from '@react-navigation/native';
import { AccountStackParamList } from '../navigation/types';
import CustomFastImage from './CustomFastImage';
import { useAzureAssets } from '../hooks/useAzureAssets';
import { getStreamingUrl } from '../utils/azureUrlHelper';
import { useBookmarks } from '../context/BookmarkContext';
import { useRecentlyPlayed } from '../context/RecentlyPlayedContext';

type AudioPlayerRouteProp = RouteProp<AccountStackParamList, 'AudioPlayer'>;

const AudioPlayer: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute<AudioPlayerRouteProp>();
  const item = route.params?.item;
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { addRecentItem } = useRecentlyPlayed();
  const isLiked = isBookmarked(item?._id || '');

  const { resourceUrls } = useAzureAssets(item);
  const { downloadUrl, streamingUrl } = resourceUrls;

  // console.log("AUDIO Item: ", item);
  console.log("resourceUrls: ", resourceUrls);

  if (!item) {
    return <Text style={{ color: colors.onSurface }}>No audio data provided.</Text>;
  }

  const { title, artist, imageUrl, audioUrl } = item;

  const {
    play,
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
  } = useAudioPlayerContext();

  const progress = duration ? currentTime / duration : 0;

  // Loading state for the play button
  const [isLoading, setIsLoading] = useState(true);
  
  // Animation for music note icon
  const musicNoteScale = new Animated.Value(1);
  const musicNoteRotation = new Animated.Value(0);
  
  // Start animation when playing
  useEffect(() => {
    if (isPlaying) {
      // Pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(musicNoteScale, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(musicNoteScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Rotation animation
      Animated.loop(
        Animated.timing(musicNoteRotation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      musicNoteScale.stopAnimation();
      musicNoteRotation.stopAnimation();
      musicNoteScale.setValue(1);
      musicNoteRotation.setValue(0);
    }
  }, [isPlaying]);

  const audioDataURL = getStreamingUrl(item, 'audio');
  console.log("audioDataURL: ", audioDataURL);


  useEffect(() => {
    if (audioDataURL && !duration) {
      setIsLoading(true); // Set loading true when the audio starts loading
      loadBuffer(audioDataURL);
    }

    setOnPositionChanged(pos => {
      console.log('Audio Progress:', Math.round(pos * 100) + '%');
    });

    // Once the audio is loaded, set isLoading to false
    if (duration) {
      setIsLoading(false);
    }
    
    // Add to recently played when audio player opens
    if (item) {
      addRecentItem(item);
    }
  }, [audioUrl, duration, loadBuffer, setOnPositionChanged, item, addRecentItem]);

  const handleBookmarkToggle = () => {
    if (item) {
      if (isLiked) {
        removeBookmark(item._id);
        Alert.alert('Bookmark', 'Removed from bookmarks');
      } else {
        const audioItem = {
          ...item,
          type: 'audio',
          audioUrl: item.audioUrl || streamingUrl,
          streamingUrl: streamingUrl || item.audioUrl
        };
        addBookmark(audioItem);
        Alert.alert('Bookmark', 'Added to bookmarks!');
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppBarHeader 
        title="Audio Player" 
        rightComponent={
          <TouchableOpacity onPress={handleBookmarkToggle} style={{ padding: 8 }}>
            <MaterialDesignIcons 
              name={isLiked ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={isLiked ? "#F8803B" : colors.onSurface} 
            />
          </TouchableOpacity>
        }
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.innerContainer}>
          {/* Album Art */}
          {imageUrl ? (
            <CustomFastImage style={styles.albumArt} imageUrl={imageUrl} />
          ) : (
            <View style={[styles.albumArt, { backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' }]}>
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

          {/* Song Info */}
          <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{artist}</Text>

          {/* Slider */}
          <Slider
            style={styles.slider}
            value={progress}
            minimumValue={0}
            maximumValue={1}
            onSlidingComplete={(val) => {
              if (duration != null) {
                seekTo(val * duration);
              }
            }}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.onSurfaceVariant}
            thumbTintColor={colors.primary}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: "90%" }}>
            <Text style={[styles.time, { color: colors.onSurfaceVariant }]}>
              {formatTime(currentTime)}
            </Text>
            <Text style={[styles.time, { color: colors.onSurfaceVariant }]}>
              {formatTime(duration ?? 0)}
            </Text>
          </View>

          <View style={styles.controls}>
            <MaterialDesignIcons
              name="shuffle"
              size={24}
              color={colors.onSurfaceVariant}
              onPress={() => console.log('Shuffle')}
            />

            <MaterialDesignIcons
              name="rewind-10"
              size={40}
              color={colors.onSurface}
              onPress={() => seekBy(-10)}
            />

            <TouchableOpacity
              onPress={isPlaying ? pause : play}
              style={[
                styles.playPauseButton,
                { backgroundColor: colors.primary, width: 90, height: 90 }, // fixed dimensions
              ]}
              disabled={isLoading} // disable while loading
              activeOpacity={0.8}
            >
              <View style={styles.playPauseContent}>
                {isLoading ? (
                  <ActivityIndicator size="large" color={colors.onSurfaceVariant} />
                ) : (
                  <MaterialDesignIcons
                    name={isPlaying ? 'pause' : 'play'}
                    size={60}
                    color={colors.onSurfaceVariant}
                  />
                )}
              </View>
            </TouchableOpacity>

            <MaterialDesignIcons
              name="fast-forward-10"
              size={40}
              color={colors.onSurface}
              onPress={() => seekBy(10)}
            />

            <MaterialDesignIcons
              name="repeat"
              size={24}
              color={colors.onSurfaceVariant}
              onPress={() => console.log('Repeat')}
            />
          </View>

          {/* Uncomment if you want Reset button */}
          {/* <TouchableOpacity style={styles.resetButton} onPress={reset}>
          <Text style={[styles.resetText, { color: colors.onSurfaceVariant }]}>🔄 Reset</Text>
        </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );
};

export default AudioPlayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  albumArt: {
    width: WIDTH - 48,
    height: WIDTH - 48,
    borderRadius: 16,
    marginTop: 12,
    // Add subtle shadow for depth on iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    // Shadow for Android
    elevation: 8,
    backgroundColor: '#fff', // Helps shadow show up on Android
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 28,
    color: '#666',
    textAlign: 'center',
  },
  time: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 0,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 12,
  },
  controls: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 24,
  },
  playPauseButton: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  playPauseContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  controlIcon: {
    padding: 10,
  },
  resetButton: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  resetText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressTimesContainer: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
});
