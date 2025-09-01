import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Video from 'react-native-video';

const { width } = Dimensions.get('window');

const BlogVideo = ({ uri }: { uri: string }) => {
  const videoRef = useRef<React.ComponentRef<typeof Video>>(null);
  const [paused, setPaused] = useState(true);

  return (
    <View style={styles.videoWrapper}>
      <Video
        ref={videoRef}
        source={{ uri }}
        style={styles.video}
        resizeMode="contain"
        paused={paused}
        controls
      />

      {/* <TouchableOpacity
        style={styles.playPauseOverlay}
        onPress={() => setPaused(!paused)}
      >
        <MaterialDesignIcons
          name={paused ? 'play-circle-outline' : 'pause-circle-outline'}
          size={48}
          color="white"
        />
      </TouchableOpacity> */}
    </View>
  );
};

export default BlogVideo;

const styles = StyleSheet.create({
  videoWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
    marginVertical: 20,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playPauseOverlay: {
    position: 'absolute',
    top: '40%',
    left: '45%',
  },
});
