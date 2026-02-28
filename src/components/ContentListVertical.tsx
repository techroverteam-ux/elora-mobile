import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import CustomFastImage from './CustomFastImage';
import { processAzureUrl } from '../utils/azureUrlHelper';


interface ContentListItem {
  title: string;
  subtitle?: string;
  url?: string;
  order: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'file';
  duration?: string;
  _id?: string;
}

interface ContentListVerticalProps {
  contentList: ContentListItem[];
  style?: any;
  showHeader?: boolean;
  headerTitle?: string;
}

const ContentListVertical: React.FC<ContentListVerticalProps> = ({
  contentList,
  style,
  showHeader = true,
  headerTitle = 'Content List',
}) => {
  console.log('📋 ContentListVertical - Received data:', {
    contentListLength: contentList?.length || 0,
    headerTitle,
    contentList: JSON.stringify(contentList, null, 2)
  });
  
  const { colors } = useTheme();


  const navigation = useNavigation();
  
  const handleItemPress = (item: ContentListItem) => {
    let finalMediaUrl = item.mediaUrl;
    
    // For video files, use direct Azure blob URL instead of proxy
    if (item.mediaType === 'video' && item.mediaUrl) {
      if (item.mediaUrl.includes('/azure-blob/file?blobUrl=')) {
        // Extract the original blob URL from the proxy URL
        const urlParams = new URLSearchParams(item.mediaUrl.split('?')[1]);
        const originalBlobUrl = urlParams.get('blobUrl');
        finalMediaUrl = originalBlobUrl ? decodeURIComponent(originalBlobUrl) : item.mediaUrl;
      } else if (item.mediaUrl.includes('blob.core.windows.net')) {
        // Use direct blob URL for videos
        finalMediaUrl = item.mediaUrl;
      }
    } else {
      // For non-video files, use processed URL
      const processedMediaUrl = processAzureUrl(item.mediaUrl);
      finalMediaUrl = processedMediaUrl || item.mediaUrl;
    }
    
    if (!finalMediaUrl) {
      console.log('No media URL available for:', item.title);
      return;
    }
    
    const processedItem = {
      ...item,
      mediaFile: finalMediaUrl,
      audioUrl: finalMediaUrl,
      videoUrl: finalMediaUrl,
      streamingUrl: finalMediaUrl,
      _id: item._id || `content-${item.title}`,
      duration: item.duration || '',
      order: item.order
    };
    
    switch (item.mediaType) {
      case 'video':
        (navigation as any).navigate('EnhancedVideoPlayer', { 
          item: processedItem, 
          playlist: [processedItem]
        });
        break;
      case 'audio':
        (navigation as any).navigate('EnhancedAudioPlayer', { 
          item: processedItem, 
          playlist: [processedItem]
        });
        break;
      case 'image':
        (navigation as any).navigate('ImageViewer', { 
          images: [finalMediaUrl], 
          initialIndex: 0, 
          title: item.title 
        });
        break;
      case 'file':
        if (finalMediaUrl.includes('.pdf')) {
          (navigation as any).navigate('PdfViewer', { 
            uri: finalMediaUrl, 
            title: item.title 
          });
        }
        break;
      default:
        console.log('Item pressed:', item.title);
    }
  };



  const renderContentItem = ({ item }: { item: ContentListItem }) => {
    // Process Azure URL for mediaUrl using same method as categories
    const finalImageUrl = processAzureUrl(item.mediaUrl);
    
    const getMediaIcon = () => {
      switch (item.mediaType) {
        case 'video': return 'play-circle';
        case 'audio': return 'music-note';
        case 'image': return 'image';
        case 'file': return 'book-open-variant';
        default: return 'book-open-variant';
      }
    };

    const getMediaColor = () => {
      switch (item.mediaType) {
        case 'video': return '#FF6B6B';
        case 'audio': return '#4ECDC4';
        case 'image': return '#45B7D1';
        case 'file': return '#96CEB4';
        default: return '#FFA07A';
      }
    };

    return (
      <View>
        <TouchableOpacity
          style={styles.row}
          onPress={() => handleItemPress(item)}
          activeOpacity={0.8}
        >
          {finalImageUrl ? (
            <CustomFastImage
              style={styles.image}
              imageUrl={finalImageUrl}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.image, styles.iconContainer, { backgroundColor: getMediaColor() }]}>
              <MaterialDesignIcons
                name={getMediaIcon()}
                size={30}
                color="white"
              />
            </View>
          )}

          <View style={styles.textContainer}>
            <Text
              style={[styles.name, { color: colors.onSurface }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text
              style={[styles.description, { color: colors.onSurfaceVariant }]}
              numberOfLines={2}
            >
              {item.subtitle}
            </Text>
          </View>

          <MaterialDesignIcons
            name="chevron-right"
            size={24}
            color={colors.outline}
          />
        </TouchableOpacity>

        <View style={[styles.separator, { backgroundColor: colors.outline }]} />
      </View>
    );
  };

  if (!contentList || contentList.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <MaterialDesignIcons name="format-list-bulleted" size={48} color="#ccc" />
        <Text style={styles.emptyText}>No content available</Text>
      </View>
    );
  }

  // Sort content list by order
  const sortedContentList = [...contentList].sort((a, b) => a.order - b.order);

  return (
    <View style={[styles.itemContainer, style]}>
      {showHeader && (
        <Text style={[styles.title, { color: colors.onSurface }]}>{headerTitle}</Text>
      )}
      
      <FlatList
        data={sortedContentList}
        renderItem={renderContentItem}
        keyExtractor={(item, index) => `content-${index}-${item.title}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />


    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {},
  itemContainer: {
    width: '90%',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6e6e6e',
    width: '75%',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default ContentListVertical;