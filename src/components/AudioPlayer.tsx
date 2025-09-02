import {
  Button,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect } from 'react';
import { useAudioPlayerContext } from '../context/AudioPlayerContext';
import AppBarHeader from './AppBarHeader';
import { ProgressBar, useTheme } from 'react-native-paper';
import { HEIGHT, WIDTH } from '../utils/HelperFunctions';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import Slider from '@react-native-community/slider';
import { RouteProp, useRoute } from '@react-navigation/native';
import { AccountStackParamList } from '../navigation/types';
import CustomFastImage from './CustomFastImage';

type AudioPlayerRouteProp = RouteProp<AccountStackParamList, 'AudioPlayer'>;

const AudioPlayer: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute<AudioPlayerRouteProp>();
  const item = route.params?.item;

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

  useEffect(() => {
    if (audioUrl && !duration) {
      loadBuffer(audioUrl);
    }
    setOnPositionChanged(pos => {
      console.log('Audio Progress:', Math.round(pos * 100) + '%');
    });
  }, [audioUrl, duration, loadBuffer, setOnPositionChanged]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppBarHeader title="Audio Player" />
      <View style={[styles.container, { backgroundColor: colors.background }]}>

        <View style={styles.innerContainer}>
          {/* Album Art */}
          {imageUrl && (
            <CustomFastImage style={styles.albumArt} imageUrl={imageUrl} />
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
              style={[styles.playPauseButton, { backgroundColor: colors.primary }]}
            >
              <MaterialDesignIcons
                name={isPlaying ? 'pause' : 'play'}
                size={60}
                color={colors.onSurfaceVariant}
              />
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
    padding: 14,
    backgroundColor: '#6200ee', // fallback color if using theme
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
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