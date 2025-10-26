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
  isGridView?: boolean;
}

const UnifiedMediaCard: React.FC<UnifiedMediaCardProps> = ({ item, onPress, type = 'audio', isGridView = true }) => {
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

  if (!isGridView) {
    // List View Layout
    return (
      <TouchableOpacity
        style={[styles.listCard, { backgroundColor: colors.surface }]}
        onPress={() => onPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.listImageContainer}>
          {getImageUrl() ? (
            <CustomFastImage
              style={styles.listImage}
              imageUrl={getImageUrl()}
            />
          ) : (
            <View style={[styles.listPlaceholderImage, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialDesignIcons
                name={getIcon()}
                size={24}
                color={colors.primary}
              />
            </View>
          )}
          

        </View>

        <View style={styles.listContent}>
          <Text
            style={[styles.listTitle, { color: colors.onSurface }]}
            numberOfLines={1}
          >
            {item.title || 'Untitled'}
          </Text>
          <Text
            style={[styles.listSubtitle, { color: colors.onSurfaceVariant }]}
            numberOfLines={1}
          >
            {item.artist || item.description || item.subtitle || 'Unknown'}
          </Text>
        </View>

        <MaterialDesignIcons
          name="chevron-right"
          size={20}
          color={colors.onSurfaceVariant}
        />
      </TouchableOpacity>
    );
  }

  // Grid View Layout (existing)
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
  // List View Styles
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginHorizontal: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  listImageContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  listImage: {
    width: 60,
    height: 60,
  },
  listPlaceholderImage: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listPlayOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flex: 1,
    justifyContent: 'center',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 14,
  },
});

export default UnifiedMediaCard;