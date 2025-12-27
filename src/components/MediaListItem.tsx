import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from './CustomFastImage';
import { useTheme } from 'react-native-paper';

interface MediaListItemProps {
  item: any;
  onPress: (item: any) => void;
  type?: 'audio' | 'video' | 'pdf';
}

const MediaListItem: React.FC<MediaListItemProps> = ({ item, onPress, type = 'audio' }) => {
  const { colors } = useTheme();
  
  const getIcon = () => {
    switch (type) {
      case 'video': return 'play-circle';
      case 'pdf': return 'file-pdf-box';
      default: return 'music-circle';
    }
  };

  const getImageUrl = () => {
    return item.thumbnailUrl || item.imageUrl || item.coverImage || '';
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.surface }]} 
      onPress={() => onPress(item)}
      activeOpacity={0.7}
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
              size={24} 
              color={colors.primary} 
            />
          </View>
        )}
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

      <TouchableOpacity 
        style={styles.playButton}
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <MaterialDesignIcons 
          name="chevron-right" 
          size={24} 
          color="#F8803B" 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageContainer: {
    marginRight: 12,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  duration: {
    fontSize: 12,
    fontWeight: '500',
  },
  playButton: {
    padding: 8,
  },
});

export default MediaListItem;