import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  Alert,
} from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import Video from 'react-native-video';
import { useRoute } from '@react-navigation/native';
import AppBarHeader from './AppBarHeader';
import { useSelector } from 'react-redux';
import { RootState } from '../data/redux/store';
import Slider from '@react-native-community/slider';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import Orientation from 'react-native-orientation-locker';
import { useTheme } from 'react-native-paper';
import { useBookmarks } from '../context/BookmarkContext';
import { useRecentlyPlayed } from '../context/RecentlyPlayedContext';

interface VideoPlayerProps {
  videoUri?: string;
  title?: string;
  containerStyle?: ViewStyle;
  showDebugInfo?: boolean;
  params?: any;
  showHeaderFromRoutes?: string[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUri,
  title,
  containerStyle,
  showDebugInfo,
  params,
  showHeaderFromRoutes = [],
}) => {
  const route = useRoute<any>();
  const { colors } = useTheme();
  const routeParams = route?.params?.item;
  const data = params ?? routeParams ?? {};
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { addRecentItem } = useRecentlyPlayed();
  const isLiked = isBookmarked(data?._id || '');

  const resolvedVideoUri = videoUri ?? data.videoUri ?? '';
  const resolvedTitle = title ?? data.title ?? 'Video Player';
  const resolvedShowDebug = showDebugInfo ?? data.showDebugInfo ?? false;
  const resolvedShowHeaderRoutes = showHeaderFromRoutes.length
    ? showHeaderFromRoutes
    : data.showHeaderFromRoutes ?? [];

  const previousRoute = useSelector(
    (state: RootState) => state.navigation.previousRoute
  );
  const shouldShowHeader = resolvedShowHeaderRoutes.includes(previousRoute ?? '');

  const [paused, setPaused] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);

  useEffect(() => {
    // Add to recently played when video player opens
    if (data && data._id) {
      addRecentItem(data);
    }
  }, [data, addRecentItem]);

  const handleBookmarkToggle = () => {
    if (data && data._id) {
      if (isLiked) {
        removeBookmark(data._id);
        Alert.alert('Bookmark', 'Removed from bookmarks');
      } else {
        const videoItem = {
          ...data,
          type: 'video',
          videoUrl: data.videoUri || data.videoUrl,
          videoUri: data.videoUri || data.videoUrl
        };
        addBookmark(videoItem);
        Alert.alert('Bookmark', 'Added to bookmarks!');
      }
    }
  };

  const videoRef = useRef<React.ComponentRef<typeof Video>>(null);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSeek = (value: number) => {
    const seekTime = value * duration;
    videoRef.current?.seek(seekTime);
    setCurrentTime(seekTime);
  };

  const ActionButton = ({
    icon,
    label,
    onPress,
  }: {
    icon: string;
    label: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <MaterialDesignIcons name={icon} size={24} color={colors.onSurfaceVariant} />
      <Text style={[styles.actionLabel, { color: colors.onSurfaceVariant }]}>{label}</Text>
    </TouchableOpacity>
  );

  const toggleFullScreen = () => {
    const next = !fullScreen;
    setFullScreen(next);
    if (next) {
      Orientation.lockToLandscape();  // lock to landscape (horizontal)
    } else {
      Orientation.lockToPortrait();   // back to portrait
    }
  };

  return (
    <View style={[styles.container, containerStyle, { backgroundColor: colors.background }]}>
      {shouldShowHeader && (
        <AppBarHeader 
          title={resolvedTitle} 
          rightComponent={
            data && data._id ? (
              <TouchableOpacity onPress={handleBookmarkToggle} style={{ padding: 8 }}>
                <MaterialDesignIcons 
                  name={isLiked ? "bookmark" : "bookmark-outline"} 
                  size={24} 
                  color={isLiked ? "#F8803B" : colors.onSurface} 
                />
              </TouchableOpacity>
            ) : null
          }
        />
      )}
      {resolvedShowDebug && (
        <Text style={[styles.debugText, { color: colors.onSurfaceVariant }]}>
          {JSON.stringify(data, null, 2)}
        </Text>
      )}

      <View style={fullScreen ? styles.fullScreenWrapper : styles.videoWrapper}>
        <Video
          ref={videoRef}
          source={{ uri: resolvedVideoUri }}
          style={styles.video}
          controls={fullScreen}
          paused={paused}
          resizeMode="contain"
          onLoad={({ duration }) => setDuration(duration)}
          onProgress={({ currentTime }) => setCurrentTime(currentTime)}
        />

        <TouchableOpacity onPress={toggleFullScreen} style={styles.fullscreenButton}>
          <MaterialDesignIcons
            name={fullScreen ? 'fullscreen-exit' : 'fullscreen'}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.actionRow}>
          <ActionButton icon="subtitles" label="Subtitle" />
          <ActionButton icon="speedometer" label="Speed (1x)" />
          <ActionButton icon="skip-next" label="Next Up" />
        </View>

        <Text style={[styles.title, { color: colors.onSurface }]}>{resolvedTitle}</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          {data?.subtitle ?? ''}
        </Text>

        <Slider
          style={styles.slider}
          value={duration ? currentTime / duration : 0}
          minimumValue={0}
          maximumValue={1}
          onSlidingComplete={handleSeek}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.onSurfaceVariant}
          thumbTintColor={colors.primary}
        />

        <View style={styles.timeRow}>
          <Text style={[styles.time, { color: colors.onSurfaceVariant }]}>
            {formatTime(currentTime)}
          </Text>
          <Text style={[styles.time, { color: colors.onSurfaceVariant }]}>
            {formatTime(duration)}
          </Text>
        </View>

        <View style={styles.controls}>
          <MaterialDesignIcons name="shuffle" size={24} color={colors.onSurfaceVariant} />
          <MaterialDesignIcons
            name="rewind-10"
            size={40}
            color={colors.onSurface}
            onPress={() => videoRef.current?.seek(Math.max(currentTime - 10, 0))}
          />
          <TouchableOpacity
            onPress={() => setPaused(!paused)}
            style={[styles.playPauseButton, { backgroundColor: colors.primary }]}
          >
            <MaterialDesignIcons
              name={paused ? 'play' : 'pause'}
              size={60}
              color={colors.onSurfaceVariant}
            />
          </TouchableOpacity>
          <MaterialDesignIcons
            name="fast-forward-10"
            size={40}
            color={colors.onSurface}
            onPress={() => videoRef.current?.seek(currentTime + 10)}
          />
          <MaterialDesignIcons name="repeat" size={24} color={colors.onSurfaceVariant} />
        </View>
      </View>
    </View>
  );
};

export default VideoPlayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  videoWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
  },
  fullScreenWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    zIndex: 10000,
  },
  fullScreenVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    zIndex: 9999,
  },
  debugText: {
    color: '#000',
    margin: 10,
    fontSize: 12,
  },
  controlsContainer: {
    width: '90%',
    alignItems: 'center',
    marginTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLabel: {
    marginLeft: 5,
    color: '#000',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  slider: {
    width: '100%',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  time: {
    fontSize: 14,
    color: '#333',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  playPauseButton: {
    backgroundColor: '#F8803B',
    borderRadius: 100,
    padding: 10,
  },
});
