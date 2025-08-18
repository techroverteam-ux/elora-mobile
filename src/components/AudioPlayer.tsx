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
import { ProgressBar } from 'react-native-paper';
import { HEIGHT, WIDTH } from '../utils/HelperFunctions';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import Slider from '@react-native-community/slider';
import { RouteProp, useRoute } from '@react-navigation/native';
import { AccountStackParamList } from '../navigation/types';

type AudioPlayerRouteProp = RouteProp<AccountStackParamList, 'AudioPlayer'>;

const AudioPlayer: React.FC = () => {
  const route = useRoute<AudioPlayerRouteProp>();
  const item = route.params?.item;

  if (!item) {
    return <Text>No audio data provided.</Text>;
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
    // Only load if not already loaded
    if (audioUrl && !duration) {
      loadBuffer(audioUrl);
    }
    setOnPositionChanged(pos => {
      console.log('Audio Progress:', Math.round(pos * 100) + '%');
    });
  }, [audioUrl, duration, loadBuffer, setOnPositionChanged]);

  return (
    <View>
      <AppBarHeader title="Audio Player" />

      <View style={styles.container}>
        {/* Album Art */}
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.albumArt}
          />
        )}

        {/* Song Info */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{artist}</Text>

        {/* <Text style={styles.status}>{isPlaying ? '🔊 Playing' : '⏸️ Paused'}</Text> */}

        {/* <ProgressBar
          progress={progress}
          color="#6200ee"
          style={styles.progress}
        /> */}

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
          minimumTrackTintColor="#ff8a65"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#ff8a65"
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: "90%" }}>
          <Text style={styles.time}>
            {formatTime(currentTime)}
          </Text>
          <Text style={styles.time}>
            {formatTime(duration ?? 0)}
          </Text>
        </View>

        <View style={styles.controls}>
          <MaterialDesignIcons
            name="shuffle"
            size={24}
            color="#000"
            onPress={() => console.log('Shuffle')}
          />

          <MaterialDesignIcons
            name="rewind-10"
            size={40}
            color="#000"
            onPress={() => seekBy(-10)}
          />

          <MaterialDesignIcons
            name={isPlaying ? 'pause' : 'play'}
            size={60}
            color="#fff"
            onPress={isPlaying ? pause : play}
            style={{ backgroundColor: "#F8803B", borderRadius: 100 }}
          />

          <MaterialDesignIcons
            name="fast-forward-10"
            size={40}
            color="#000"
            onPress={() => seekBy(10)}
          />

          <MaterialDesignIcons
            name="repeat" size={24}
            color="#000"
            onPress={() => console.log('Repeat')}
          />
        </View>

        {/* <TouchableOpacity style={styles.resetButton} onPress={reset}>
          <Text style={styles.resetText}>🔄 Reset</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

export default AudioPlayer;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    // backgroundColor: '#fff',
    // borderRadius: 12,
    // elevation: 3,
    alignItems: 'center',
  },
  albumArt: {
    width: WIDTH - 48,
    height: WIDTH - 58,
    borderRadius: 12,
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  progress: {
    height: 6,
    borderRadius: 3,
    marginBottom: 10,
  },
  time: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
    color: '#333',
  },
  slider: {
    width: '100%',
    marginTop: 10,
  },
  controls: {
    flexDirection: 'row',
    width: "90%",
    justifyContent: 'space-between',
    marginBottom: 16,
    alignItems: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#6200ee',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  resetButton: {
    alignSelf: 'center',
  },
  resetText: {
    color: '#888',
    fontSize: 14,
  },
});
