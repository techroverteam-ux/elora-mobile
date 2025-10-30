import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from './CustomFastImage';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
            {item.title || t('common.untitled')}
          </Text>
          <Text
            style={[styles.listSubtitle, { color: colors.onSurfaceVariant }]}
            numberOfLines={1}
          >
            {item.artist || item.description || item.subtitle || t('common.unknown')}
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

  // Grid View Layout (Netflix-style)
  return (
    <TouchableOpacity
      style={styles.netflixCard}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.netflixImageContainer}>
        {getImageUrl() ? (
          <CustomFastImage
            style={styles.netflixImage}
            imageUrl={getImageUrl()}
          />
        ) : (
          <View style={[styles.netflixPlaceholderImage, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialDesignIcons
              name={getIcon()}
              size={40}
              color={colors.primary}
            />
          </View>
        )}
        
        {/* Netflix-style gradient overlay */}
        <View style={styles.gradientOverlay} />
        
        {/* Text overlay on image */}
        <View style={styles.textOverlay}>
          <Text
            style={styles.overlayTitle}
            numberOfLines={2}
          >
            {item.title || t('common.untitled')}
          </Text>
          <Text
            style={styles.overlaySubtitle}
            numberOfLines={1}
          >
            {item.artist || item.description || item.subtitle || t('common.unknown')}
          </Text>
          {item.duration && (
            <Text style={styles.overlayDuration}>
              {formatDuration(item.duration)}
            </Text>
          )}
        </View>
        
        {/* Play button overlay */}
        <View style={styles.playOverlay}>
          <MaterialDesignIcons
            name="play"
            size={16}
            color="#fff"
          />
        </View>
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
  // Netflix-style card
  netflixCard: {
    width: CARD_WIDTH,
    marginBottom: 16,
    marginHorizontal: 8,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  netflixImageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    height: CARD_WIDTH * 1.2, // Taller for better text space
  },
  netflixImage: {
    width: '100%',
    height: '100%',
  },
  netflixPlaceholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    zIndex: 2,
  },
  overlayTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  overlaySubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  overlayDuration: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  playOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  // Legacy styles for backward compatibility
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