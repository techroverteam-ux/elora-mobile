import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect } from 'react'
import useAudioPlayer from '../hooks/useAudioPlayer';
import AppBarHeader from './AppBarHeader';
import { ProgressBar } from 'react-native-paper';

const AudioPlayer = () => {
  const {
    play,
    pause,
    seekBy,
    loadBuffer,
    reset,
    setOnPositionChanged,
    isPlaying,
    duration,
    currentTime,
    formatTime,
  } = useAudioPlayer();

  const progress = duration ? currentTime / duration : 0;

  useEffect(() => {
    loadBuffer('https://software-mansion.github.io/react-native-audio-api/audio/music/example-music-01.mp3');
    setOnPositionChanged((pos) => console.log('Progress:', Math.round(pos * 100) + '%'));
  }, [loadBuffer, setOnPositionChanged]);

  return (
    <View>
      <AppBarHeader title="Audio Player" />

      <View style={styles.container}>
        <Text style={styles.status}>{isPlaying ? '🔊 Playing' : '⏸️ Paused'}</Text>

        <ProgressBar progress={progress} color="#6200ee" style={styles.progress} />

        <Text style={styles.time}>
          {formatTime(currentTime)} / {formatTime(duration ?? 0)}
        </Text>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={() => seekBy(-10)}>
            <Text style={styles.buttonText}>⏪ -10s</Text>
          </TouchableOpacity>

          {isPlaying ? (
            <TouchableOpacity style={styles.button} onPress={pause}>
              <Text style={styles.buttonText}>⏸️ Pause</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={play}>
              <Text style={styles.buttonText}>▶️ Play</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.button} onPress={() => seekBy(10)}>
            <Text style={styles.buttonText}>⏩ +10s</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={reset}>
          <Text style={styles.resetText}>🔄 Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default AudioPlayer

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
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
})