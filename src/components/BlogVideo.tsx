import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Video from 'react-native-video';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const BlogVideo = ({ uri }: { uri: string }) => {
  const videoRef = useRef<React.ComponentRef<typeof Video>>(null);
  const [paused, setPaused] = useState(true);
  const navigation = useNavigation();

  const handleVideoPress = () => {
    console.log('BlogVideo - Navigating with URI:', uri);
    (navigation as any).navigate('EnhancedVideoPlayer', {
      item: {
        _id: 'blog-video-' + Date.now(),
        videoUrl: uri,
        streamingUrl: uri,
        videoUri: uri,
        title: 'Blog Video',
        subtitle: 'Video Content',
        // Flag to indicate this is a working URL that shouldn't be processed
        isDirectUrl: true
      }
    });
  };

  return (
    <TouchableOpacity style={styles.videoWrapper} onPress={handleVideoPress} activeOpacity={0.8}>
      <Video
        ref={videoRef}
        source={{ uri }}
        style={styles.video}
        resizeMode="contain"
        paused={true}
        onError={(e) => console.log('Video error:', e)}
        onLoad={(e) => console.log('Video loaded successfully:', e)}
      />

      <View style={styles.playOverlay}>
        <MaterialDesignIcons
          name="play-circle"
          size={64}
          color="rgba(255,255,255,0.9)"
        />
      </View>
    </TouchableOpacity>
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
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
