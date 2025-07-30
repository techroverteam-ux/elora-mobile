import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Video from 'react-native-video'

const VideoPlayer = () => {
  return (
    <View style={{}}>
      <Video
        source={{ uri: 'https://www.w3schools.com/html/mov_bbb.mp4' }}
        style={{ width: '100%', aspectRatio: 16 / 9 }}
        controls
        resizeMode="contain"
      />
    </View>
  )
}

export default VideoPlayer

const styles = StyleSheet.create({})