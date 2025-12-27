import React from 'react';
import { View, Text, Alert } from 'react-native';
import Video from 'react-native-video';

const VideoTest = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Video Test</Text>
      <Video
        source={{ uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }}
        style={{ width: 300, height: 200, backgroundColor: 'black' }}
        controls={true}
        resizeMode="contain"
        onError={(error) => {
          console.log('Video Error:', error);
          Alert.alert('Video Error', JSON.stringify(error));
        }}
        onLoad={(data) => {
          console.log('Video Loaded:', data);
          Alert.alert('Video Loaded', 'Video loaded successfully');
        }}
      />
    </View>
  );
};

export default VideoTest;