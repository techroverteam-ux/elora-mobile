import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from './CustomFastImage';
import SkeletonLoader from './SkeletonLoader';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { processAzureUrl } from '../utils/azureUrlHelper';
import { useAzureAssets } from '../hooks/useAzureAssets';

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
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);
  
  const width = dimensions.width;
  const is7InchTablet = width >= 600 && width < 800;
  const is10InchTablet = width >= 800;
  
  const getCardWidth = () => {
    if (is10InchTablet) return (width - 80) / 3; // 3 items with padding
    if (is7InchTablet) return (width - 64) / 3; // 3 items with padding
    return (width - 48) / 3; // 3 items with padding
  };
  
  const CARD_WIDTH = getCardWidth();
  
  if (item?.isLoading) {
    return (
      <View style={{ width: CARD_WIDTH, marginBottom: 16, marginHorizontal: 8, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.surface }}>
        <SkeletonLoader width={CARD_WIDTH} height={CARD_WIDTH * 0.75} borderRadius={0} />
        <View style={{ padding: 8, minHeight: 60 }}>
          <SkeletonLoader width={CARD_WIDTH * 0.8} height={16} borderRadius={4} style={{ marginBottom: 4 }} />
          <SkeletonLoader width={CARD_WIDTH * 0.6} height={14} borderRadius={4} />
        </View>
      </View>
    );
  }

  const getIcon = () => {
    const actualType = item?.type || type;
    switch (actualType) {
      case 'image': return 'image';
      case 'video': return 'play-circle';
      case 'pdf': return 'book-open-variant';
      default: return 'music-circle';
    }
  };

  const getImageUrl = () => {
    // For audio and pdf types, always show icons instead of thumbnails
    const actualType = item?.type || type;
    if (actualType === 'audio' || actualType === 'pdf') {
      return '';
    }

    const urls = item?.type === 'image' ? [
      item?.streamingUrl,
      item?.imageUrl,
      item?.thumbnailUrl,
      item?.mainImage,
      item?.headerImage,
      resourceUrls?.thumbnailImage,
      resourceUrls?.mainImage
    ] : [
      resourceUrls?.thumbnailImage,
      resourceUrls?.mainImage,
      item?.thumbnailUrl,
      item?.imageUrl,
      item?.coverImage,
      item?.headerImage,
      item?.mainImage,
      item?.streamingUrl
    ];

    for (const url of urls) {
      if (url) {
        const processedUrl = processAzureUrl(url);
        if (processedUrl) return processedUrl;
      }
    }

    for (const url of urls) {
      if (url) return url;
    }

    return '';
  };

  const getBackgroundStyle = () => {
    const actualType = item?.type || type;
    switch (actualType) {
      case 'audio': return {
        backgroundColor: '#FF6B6B15',
        borderColor: '#FF6B6B30'
      };
      case 'pdf': return {
        backgroundColor: '#4ECDC415', 
        borderColor: '#4ECDC430'
      };
      default: return {
        backgroundColor: colors.surface,
        borderColor: colors.outline
      };
    }
  };

  const getIconColor = () => {
    const actualType = item?.type || type;
    switch (actualType) {
      case 'audio': return '#FF6B6B';
      case 'pdf': return '#4ECDC4';
      default: return colors.primary;
    }
  };

  if (!isGridView) {
    const handleListPress = () => {
      setLoading(true);
      onPress(item);
      setTimeout(() => setLoading(false), 1500);
    };

    return (
      <TouchableOpacity
        style={[styles.listCard, { backgroundColor: colors.surface, opacity: loading ? 0.7 : 1 }]}
        onPress={handleListPress}
        activeOpacity={0.8}
        disabled={loading}
      >
        <View style={styles.listImageContainer}>
          {getImageUrl() ? (
            <CustomFastImage
              style={styles.listImage}
              imageUrl={getImageUrl()}
            />
          ) : (
            <View style={[styles.listPlaceholderImage, getBackgroundStyle()]}>
              <MaterialDesignIcons
                name={getIcon()}
                size={24}
                color={getIconColor()}
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

  const handlePress = () => {
    setLoading(true);
    onPress(item);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <TouchableOpacity
      style={{
        width: CARD_WIDTH,
        marginBottom: 12,
        marginHorizontal: 2,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        overflow: 'hidden',
        backgroundColor: colors.surface,
        opacity: loading ? 0.7 : 1,
      }}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={loading}
    >
      <View style={{ position: 'relative', borderTopLeftRadius: 12, borderTopRightRadius: 12, overflow: 'hidden', height: CARD_WIDTH * 0.75 }}>
        {getImageUrl() ? (
          <CustomFastImage
            style={{ width: '100%', height: '100%' }}
            imageUrl={getImageUrl()}
          />
        ) : (
          <View style={{ 
            width: '100%', 
            height: '100%', 
            justifyContent: 'center', 
            alignItems: 'center',
            ...getBackgroundStyle(),
            borderWidth: 1
          }}>
            {loading ? (
              <ActivityIndicator size={is10InchTablet ? 'large' : 'small'} color={getIconColor()} />
            ) : (
              <MaterialDesignIcons
                name={getIcon()}
                size={is10InchTablet ? 56 : is7InchTablet ? 48 : 40}
                color={getIconColor()}
              />
            )}
          </View>
        )}

      </View>
      
      <View style={{ padding: is10InchTablet ? 14 : is7InchTablet ? 10 : 8, minHeight: is10InchTablet ? 90 : is7InchTablet ? 75 : 60 }}>
        <Text
          style={{ fontSize: is10InchTablet ? 17 : is7InchTablet ? 15 : 14, fontWeight: '600', marginBottom: 2, lineHeight: is10InchTablet ? 22 : is7InchTablet ? 18 : 16, color: colors.onSurface }}
          numberOfLines={2}
        >
          {item.title || t('common.untitled')}
        </Text>
        <Text
          style={{ fontSize: is10InchTablet ? 15 : is7InchTablet ? 13 : 12, marginBottom: 2, lineHeight: is10InchTablet ? 18 : is7InchTablet ? 16 : 14, color: colors.onSurfaceVariant }}
          numberOfLines={2}
        >
          {item.artist || item.description || item.subtitle || t('common.unknown')}
        </Text>
        {item.duration && (
          <Text style={{ fontSize: is10InchTablet ? 14 : is7InchTablet ? 12 : 11, fontWeight: '500', color: colors.primary }}>
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
  cleanPlayOverlay: {
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
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listPlaceholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 14,
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
});

export default UnifiedMediaCard;
