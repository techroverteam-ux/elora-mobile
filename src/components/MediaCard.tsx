import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { FileText, FileSpreadsheet, CheckSquare, Square } from 'lucide-react-native';
import CustomFastImage from './CustomFastImage';
import { AppColors, AppTypography, AppSpacing, AppBorderRadius } from '../theme/colors';
import { navigateToAudioPlayer, navigateToVideoPlayer } from '../utils/PlayerNavigation';
import Toast from 'react-native-toast-message';

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
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  showDownloadButtons?: boolean;
  onDownloadPDF?: (id: string) => Promise<void>;
  onDownloadPPT?: (id: string) => Promise<void>;
}

const MediaCard: React.FC<MediaCardProps> = ({ 
  item, 
  type, 
  isSelectable = false, 
  isSelected = false, 
  onSelect, 
  showDownloadButtons = false,
  onDownloadPDF,
  onDownloadPPT 
}) => {
  const navigation = useNavigation();
  const [downloadStates, setDownloadStates] = useState({ pdf: false, ppt: false });

  const handlePress = () => {
    if (isSelectable && onSelect) {
      onSelect(item._id);
    } else {
      if (type === 'audio') {
        navigateToAudioPlayer(navigation, item);
      } else {
        navigateToVideoPlayer(navigation, item);
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (!onDownloadPDF) return;
    
    setDownloadStates(prev => ({ ...prev, pdf: true }));
    try {
      await onDownloadPDF(item._id);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'PDF Download Failed' });
    } finally {
      setDownloadStates(prev => ({ ...prev, pdf: false }));
    }
  };

  const handleDownloadPPT = async () => {
    if (!onDownloadPPT) return;
    
    setDownloadStates(prev => ({ ...prev, ppt: true }));
    try {
      await onDownloadPPT(item._id);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'PPT Download Failed' });
    } finally {
      setDownloadStates(prev => ({ ...prev, ppt: false }));
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
      style={[
        styles.card,
        isSelected && styles.selectedCard
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Selection Checkbox */}
      {isSelectable && (
        <View style={styles.selectionContainer}>
          <TouchableOpacity onPress={() => onSelect?.(item._id)} style={styles.checkbox}>
            {isSelected ? (
              <CheckSquare size={20} color={AppColors.primary} />
            ) : (
              <Square size={20} color={AppColors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      )}
      
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
        {!isSelectable && (
          <View style={styles.playOverlay}>
            <MaterialDesignIcons 
              name={getIcon()} 
              size={32} 
              color={AppColors.textLight} 
            />
          </View>
        )}
        
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
        
        {/* Download Buttons */}
        {showDownloadButtons && (
          <View style={styles.downloadContainer}>
            <TouchableOpacity
              onPress={handleDownloadPDF}
              disabled={downloadStates.pdf}
              style={[
                styles.downloadButton,
                styles.pdfButton,
                downloadStates.pdf && styles.downloadingButton
              ]}
            >
              {downloadStates.pdf ? (
                <View style={styles.downloadingContent}>
                  <ActivityIndicator size="small" color="#FFF" />
                  <Text style={styles.downloadingText}>...</Text>
                </View>
              ) : (
                <View style={styles.downloadContent}>
                  <FileText size={12} color="#FFF" />
                  <Text style={styles.downloadText}>PDF</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleDownloadPPT}
              disabled={downloadStates.ppt}
              style={[
                styles.downloadButton,
                styles.pptButton,
                downloadStates.ppt && styles.downloadingButton
              ]}
            >
              {downloadStates.ppt ? (
                <View style={styles.downloadingContent}>
                  <ActivityIndicator size="small" color="#FFF" />
                  <Text style={styles.downloadingText}>...</Text>
                </View>
              ) : (
                <View style={styles.downloadContent}>
                  <FileSpreadsheet size={12} color="#FFF" />
                  <Text style={styles.downloadText}>PPT</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
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
    position: 'relative',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary + '10',
  },
  selectionContainer: {
    position: 'absolute',
    top: AppSpacing.xs,
    right: AppSpacing.xs,
    zIndex: 10,
  },
  checkbox: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 4,
    padding: 4,
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
    marginBottom: AppSpacing.xs,
  },
  downloadContainer: {
    flexDirection: 'row',
    gap: AppSpacing.xs,
    marginTop: AppSpacing.xs,
  },
  downloadButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfButton: {
    backgroundColor: '#EF4444',
  },
  pptButton: {
    backgroundColor: '#F59E0B',
  },
  downloadingButton: {
    opacity: 0.7,
  },
  downloadContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  downloadingText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default MediaCard;