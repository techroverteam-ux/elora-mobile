import { StyleSheet, Text, View, ViewStyle } from 'react-native'
import React from 'react'
import Video from 'react-native-video'
import { useRoute } from '@react-navigation/native'
import AppBarHeader from './AppBarHeader'
import { useSelector } from 'react-redux'
import { RootState } from '../data/redux/store'

interface VideoPlayerProps {
  videoUri?: string;
  title?: string;
  containerStyle?: ViewStyle;
  showDebugInfo?: boolean;
  params?: any;
  showHeaderFromRoutes?: string[];
  isScreen?: boolean;
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
  const routeParams = route?.params?.item;
  const data = params ?? routeParams;
  // console.log('VideoPlayer data:', data);

  const resolvedVideoUri = videoUri ?? data?.videoUri ?? '';
  const resolvedTitle = title ?? data?.title ?? 'Video Player';
  const resolvedShowDebug = showDebugInfo !== undefined ? showDebugInfo : data?.showDebugInfo ?? false;
  const resolvedShowHeaderRoutes = showHeaderFromRoutes?.length > 0 ? showHeaderFromRoutes : data?.showHeaderFromRoutes ?? [];

  const previousRoute = useSelector((state: RootState) => state.navigation.previousRoute);
  const shouldShowHeader = resolvedShowHeaderRoutes.includes(previousRoute ?? '');

  return (
    <View style={[styles.container, containerStyle]}>
      {shouldShowHeader && <AppBarHeader title={resolvedTitle} />}

      {resolvedShowDebug && (
        <Text style={styles.debugText}>DATA: {JSON.stringify(data, null, 2)}</Text>
      )}

      <Video
        source={{ uri: resolvedVideoUri }}
        style={styles.video}
        controls
        resizeMode="contain"
      />
    </View>
  );
};

export default VideoPlayer

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  debugText: {
    color: '#000',
    margin: 10,
  },
});
