import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from './CustomFastImage';
import { AppColors, AppTypography, AppSpacing, AppBorderRadius } from '../theme/colors';
import { navigateToAudioPlayer, navigateToVideoPlayer } from '../utils/PlayerNavigation';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - AppSpacing.lg * 3) / 2;

interface MediaCardProps {
  item: {
    _id: string;
    title: string;
    artist?: string;
    imageUrl?: string;
    audioUrl?: string;
    videoUrl?: string;
    contentType?: string;
    duration?: string;
  };
  type: 'audio' | 'video';
}

const MediaCard: React.FC<MediaCardProps> = ({ item, type }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (type === 'audio') {
      navigateToAudioPlayer(navigation, item);
    } else {
      navigateToVideoPlayer(navigation, item);
    }
  };

  const getIcon = () => {
    return type === 'audio' ? 'play-circle' : 'play-circle-outline';
  };

  const getTypeColor = () => {
    return type === 'audio' ? AppColors.primary : AppColors.info;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <CustomFastImage style={styles.image} imageUrl={item.imageUrl} />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: getTypeColor() + '20' }]}>
            <MaterialDesignIcons 
              name={type === 'audio' ? 'music-note' : 'video'} 
              size={40} 
              color={getTypeColor()} 
            />
          </View>
        )}
        
        {/* Play Button Overlay */}
        <View style={styles.playOverlay}>
          <MaterialDesignIcons 
            name={getIcon()} 
            size={32} 
            color={AppColors.textLight} 
          />
        </View>
        
        {/* Duration Badge */}
        {item.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
        )}
        
        {/* Type Badge */}
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor() }]}>
          <MaterialDesignIcons 
            name={type === 'audio' ? 'headphones' : 'video'} 
            size={12} 
            color={AppColors.textLight} 
          />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        {item.artist && (
          <Text style={styles.artist} numberOfLines={1}>
            {item.artist}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: AppColors.background,
    borderRadius: AppBorderRadius.md,
    marginBottom: AppSpacing.md,
    ...AppColors.shadows.medium,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: CARD_WIDTH * 0.75,
    borderTopLeftRadius: AppBorderRadius.md,
    borderTopRightRadius: AppBorderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: AppSpacing.xs,
    right: AppSpacing.xs,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: AppSpacing.xs,
    paddingVertical: 2,
    borderRadius: AppBorderRadius.sm,
  },
  durationText: {
    color: AppColors.textLight,
    fontSize: AppTypography.fontSize.xs,
    fontWeight: AppTypography.fontWeight.medium as any,
  },
  typeBadge: {
    position: 'absolute',
    top: AppSpacing.xs,
    left: AppSpacing.xs,
    paddingHorizontal: AppSpacing.xs,
    paddingVertical: 2,
    borderRadius: AppBorderRadius.sm,
  },
  content: {
    padding: AppSpacing.sm,
  },
  title: {
    fontSize: AppTypography.fontSize.sm,
    fontWeight: AppTypography.fontWeight.semibold as any,
    color: AppColors.textPrimary,
    marginBottom: 4,
    lineHeight: AppTypography.lineHeight.tight * AppTypography.fontSize.sm,
  },
  artist: {
    fontSize: AppTypography.fontSize.xs,
    color: AppColors.textSecondary,
    fontWeight: AppTypography.fontWeight.normal as any,
  },
});

export default MediaCard;