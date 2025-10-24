import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from './CustomFastImage';
import { useAudioPlayerContext } from '../context/AudioPlayerContext';

const { width } = Dimensions.get('window');

interface MiniPlayerProps {
  currentItem?: any;
  onClose?: () => void;
  type?: 'audio' | 'video';
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ currentItem, onClose, type = 'audio' }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { isPlaying, play, pause } = useAudioPlayerContext();

  if (!currentItem) return null;

  const handlePress = () => {
    if (type === 'audio') {
      (navigation as any).navigate('EnhancedAudioPlayer', { item: currentItem });
    } else {
      (navigation as any).navigate('EnhancedVideoPlayer', { item: currentItem });
    }
  };

  const getIcon = () => {
    return type === 'audio' ? 'music-note' : 'video';
  };

  const getPlayIcon = () => {
    if (type === 'video') return 'play'; // Videos don't use the audio player context
    return isPlaying ? 'pause' : 'play';
  };

  const handlePlayPause = () => {
    if (type === 'audio') {
      isPlaying ? pause() : play();
    } else {
      handlePress();
    }
  };

  const handleClose = () => {
    if (type === 'audio' && isPlaying) {
      pause(); // Stop audio streaming
    }
    onClose?.();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <TouchableOpacity style={styles.content} onPress={handlePress}>
        <View style={styles.imageContainer}>
          {currentItem.imageUrl ? (
            <CustomFastImage style={styles.image} imageUrl={currentItem.imageUrl} />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialDesignIcons name={getIcon()} size={20} color={colors.primary} />
            </View>
          )}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={1}>
            {currentItem.title}
          </Text>
          <Text style={[styles.artist, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
            {currentItem.artist || 'Unknown Artist'}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.controls}>
        <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
          <MaterialDesignIcons
            name={getPlayIcon()}
            size={24}
            color={colors.onSurface}
          />
        </TouchableOpacity>
        
        {onClose && (
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialDesignIcons name="close" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60, // Above tab bar
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 12,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  placeholderImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  artist: {
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    padding: 8,
    marginRight: 8,
  },
  closeButton: {
    padding: 8,
  },
});

export default MiniPlayer;