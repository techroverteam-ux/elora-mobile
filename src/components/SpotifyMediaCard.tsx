import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from './CustomFastImage';
import { useTheme } from 'react-native-paper';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

interface SpotifyMediaCardProps {
  item: any;
  onPress: (item: any) => void;
  type?: 'audio' | 'video' | 'pdf';
}

const SpotifyMediaCard: React.FC<SpotifyMediaCardProps> = ({ item, onPress, type = 'audio' }) => {
  const { colors } = useTheme();
  
  const getIcon = () => {
    switch (type) {
      case 'video': return 'play-circle';
      case 'pdf': return 'file-pdf-box';
      default: return 'music-circle';
    }
  };

  const getImageUrl = () => {
    const url = item.thumbnailUrl || item.imageUrl || item.coverImage || item.headerImage || item.mainImage || '';
    console.log('SpotifyMediaCard - Image URL:', url, 'for item:', item.title);
    return url;
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.surface }]} 
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {getImageUrl() ? (
          <CustomFastImage 
            style={styles.image} 
            imageUrl={getImageUrl()}
          />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialDesignIcons 
              name={getIcon()} 
              size={40} 
              color={colors.primary} 
            />
          </View>
        )}
        <View style={styles.playOverlay}>
          <MaterialDesignIcons 
            name="play" 
            size={24} 
            color="#fff" 
          />
        </View>
      </View>
      
      <View style={styles.content}>
        <Text 
          style={[styles.title, { color: colors.onSurface }]} 
          numberOfLines={2}
        >
          {item.title || 'Untitled'}
        </Text>
        <Text 
          style={[styles.subtitle, { color: colors.onSurfaceVariant }]} 
          numberOfLines={1}
        >
          {item.artist || item.description || item.subtitle || 'Unknown'}
        </Text>
        {item.duration && (
          <Text style={[styles.duration, { color: colors.onSurfaceVariant }]}>
            {formatDuration(item.duration)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 0.75,
  },
  placeholderImage: {
    width: '100%',
    height: CARD_WIDTH * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  duration: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default SpotifyMediaCard;