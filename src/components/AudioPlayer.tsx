import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useRoute } from '@react-navigation/native'
import AppBarHeader from './AppBarHeader';
import { AudioContext } from 'react-native-audio-api';

const AudioPlayer = () => {
  const { params } = useRoute();

  const handlePlay = async () => {
    console.log('handlePlay');

    const audioContext = new AudioContext();

    const audioBuffer = await fetch('https://software-mansion.github.io/react-native-audio-api/audio/music/example-music-01.mp3')
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer));

    const playerNode = audioContext.createBufferSource();
    playerNode.buffer = audioBuffer;

    playerNode.connect(audioContext.destination);
    playerNode.start(audioContext.currentTime);
    playerNode.stop(audioContext.currentTime + 10);
  };

  return (
    <View>
      <AppBarHeader title="Audio Player" />

      <Text>{JSON.stringify(params)}</Text>
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Button onPress={handlePlay} title="Play sound!" />
      </View>
    </View>
  )
}

export default AudioPlayer

const styles = StyleSheet.create({})