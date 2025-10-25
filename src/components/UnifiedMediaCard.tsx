import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from './CustomFastImage';
import { useTheme } from 'react-native-paper';
import { processAzureUrl } from '../utils/azureUrlHelper';
import { useAzureAssets } from '../hooks/useAzureAssets';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface UnifiedMediaCardProps {
  item: any;
  onPress: (item: any) => void;
  type?: 'audio' | 'video' | 'pdf';
}

const UnifiedMediaCard: React.FC<UnifiedMediaCardProps> = ({ item, onPress, type = 'audio' }) => {
  const { colors } = useTheme();
  const { resourceUrls } = useAzureAssets(item || {});

  const getIcon = () => {
    switch (type) {
      case 'video': return 'play-circle';
      case 'pdf': return 'book-open-variant';
      default: return 'music-circle';
    }
  };

  const getImageUrl = () => {
    const urls = [
      resourceUrls?.thumbnailImage,
      resourceUrls?.mainImage,
      item?.thumbnailUrl,
      item?.imageUrl,
      item?.coverImage,
      item?.headerImage,
      item?.mainImage
    ];

    // Try processed Azure URLs
    for (const url of urls) {
      if (url) {
        const processedUrl = processAzureUrl(url);
        if (processedUrl) {
          // console.log('UnifiedMediaCard - Using processed URL:', processedUrl, 'for item:', item?.title);
          return processedUrl;
        }
      }
    }

    // Try direct URLs
    for (const url of urls) {
      if (url) {
        console.log('UnifiedMediaCard - Using direct URL:', url, 'for item:', item?.title);
        return url;
      }
    }

    console.log('UnifiedMediaCard - No image URL found for item:', item?.title);
    return '';
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
        
        {type === 'video' && (
          <View style={styles.playOverlay}>
            <MaterialDesignIcons
              name="play"
              size={16}
              color="#fff"
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
    marginHorizontal: 8,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
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
    width: 28,
    height: 28,
    borderRadius: 14,
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

export default UnifiedMediaCard;