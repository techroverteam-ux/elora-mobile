import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from '../components/CustomFastImage';
import { useBookmarks } from '../context/BookmarkContext';
import { processAzureUrl } from '../utils/azureUrlHelper';

const { width } = Dimensions.get('window');

const BookmarksScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { bookmarks, removeBookmark } = useBookmarks();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const handleItemPress = (item: any) => {
    console.log('BookmarksScreen - Item pressed:', item);
    
    if (item.type === 'video' || item.videoUrl || item.videoUri) {
      (navigation as any).navigate('EnhancedVideoPlayer', { item });
    } else if (item.type === 'image') {
      const urls = [item.streamingUrl, item.imageUrl, item.thumbnailUrl, item.mainImage, item.headerImage, item.coverImage];
      let imageUrl = null;
      for (const url of urls) {
        if (url && typeof url === 'string' && url.trim()) {
          const processed = processAzureUrl(url.trim());
          if (processed && processed.startsWith('http')) {
            imageUrl = processed;
            break;
          }
        }
      }
      (navigation as any).navigate('ImageViewer', {
        images: [imageUrl],
        initialIndex: 0,
        title: item.title || 'Image'
      });
    } else if (item.type === 'pdf' || item.pdfUrl) {
      (navigation as any).navigate('PdfViewer', { item });
    } else {
      // Default to audio player for music and unknown types
      const audioItem = {
        ...item,
        type: 'audio',
        audioUrl: item.audioUrl || item.streamingUrl || item.url,
        streamingUrl: item.streamingUrl || item.audioUrl || item.url
      };
      console.log('BookmarksScreen - Navigating to audio player with:', audioItem);
      (navigation as any).navigate('EnhancedAudioPlayer', { item: audioItem });
    }
  };

  const getItemType = (item: any) => {
    if (item.type === 'video' || item.videoUrl || item.videoUri) return 'video';
    if (item.type === 'image') return 'image';
    if (item.type === 'pdf' || item.pdfUrl) return 'pdf';
    // Default to audio for music and other content
    return 'audio';
  };

  const getItemIcon = (item: any) => {
    const type = getItemType(item);
    switch (type) {
      case 'video': return 'video';
      case 'image': return 'image';
      case 'audio': return 'music-note';
      case 'pdf': return 'file-document';
      default: return 'music-note';
    }
  };

  const getItemTypeLabel = (item: any) => {
    const type = getItemType(item);
    switch (type) {
      case 'video': return 'Video';
      case 'image': return 'Image';
      case 'audio': return 'Audio';
      case 'pdf': return 'Book';
      default: return 'Audio';
    }
  };

  const renderListItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.listItem, { backgroundColor: colors.surface }]}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.itemImage}>
        {(() => {
          const urls = [item.streamingUrl, item.thumbnailUrl, item.imageUrl, item.coverImage, item.headerImage, item.mainImage];
          console.log('BookmarksScreen - Available URLs for', item.title, ':', urls);
          
          let imageUrl = null;
          for (const url of urls) {
            if (url && typeof url === 'string' && url.trim()) {
              const processed = processAzureUrl(url.trim());
              console.log('BookmarksScreen - Processing URL:', url, '-> Result:', processed);
              if (processed && processed.startsWith('http')) {
                imageUrl = processed;
                break;
              }
            }
          }
          
          console.log('BookmarksScreen - Final image URL:', imageUrl);
          
          return imageUrl ? (
            <CustomFastImage style={styles.thumbnail} imageUrl={imageUrl} />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialDesignIcons 
                name={getItemIcon(item)} 
                size={24} 
                color={colors.onSurfaceVariant} 
              />
            </View>
          );
        })()}
      </View>
      
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: colors.onBackground }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.itemSubtitle, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
          {item.artist || item.author || t('common.unknown')}
        </Text>
        <Text style={[styles.itemType, { color: colors.primary }]}>
          {getItemTypeLabel(item)}
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeBookmark(item._id)}
      >
        <MaterialDesignIcons name="bookmark" size={24} color="#F8803B" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderGridItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.gridItem, { backgroundColor: colors.surface }]}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.gridImageContainer}>
        {(() => {
          const urls = [item.streamingUrl, item.thumbnailUrl, item.imageUrl, item.coverImage, item.headerImage, item.mainImage];
          
          let imageUrl = null;
          for (const url of urls) {
            if (url && typeof url === 'string' && url.trim()) {
              const processed = processAzureUrl(url.trim());
              if (processed && processed.startsWith('http')) {
                imageUrl = processed;
                break;
              }
            }
          }
          
          return imageUrl ? (
            <CustomFastImage style={styles.gridImage} imageUrl={imageUrl} />
          ) : (
            <View style={[styles.gridPlaceholder, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialDesignIcons 
                name={getItemIcon(item)} 
                size={32} 
                color={colors.onSurfaceVariant} 
              />
            </View>
          );
        })()}
        <TouchableOpacity
          style={styles.gridRemoveButton}
          onPress={() => removeBookmark(item._id)}
        >
          <MaterialDesignIcons name="bookmark" size={16} color="#F8803B" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.gridContent}>
        <Text style={[styles.gridTitle, { color: colors.onBackground }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.gridSubtitle, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
          {item.artist || item.author || t('common.unknown')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (bookmarks.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.outline }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialDesignIcons name="arrow-left" size={24} color={colors.onBackground} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.headerTitle, { color: colors.onBackground }]}>{t('screens.bookmarks.title')}</Text>
            <Text style={[styles.devTag, { color: colors.onSurfaceVariant }]}>{t('screens.bookmarks.underDevelopment')}</Text>
          </View>
          <TouchableOpacity 
            style={styles.viewToggle}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <MaterialDesignIcons 
              name={viewMode === 'grid' ? 'view-list' : 'view-grid'} 
              size={24} 
              color={colors.onBackground} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.emptyContent}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
            <MaterialDesignIcons name="bookmark-outline" size={64} color="#F8803B" />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.onBackground }]}>{t('screens.bookmarks.noBookmarks')}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>
            {t('screens.bookmarks.noBookmarksDesc')}
          </Text>
          <View style={styles.emptyActions}>
            <TouchableOpacity 
              style={[styles.exploreButton, { backgroundColor: '#F8803B' }]}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            >
              <MaterialDesignIcons name="compass-outline" size={20} color="#fff" />
              <Text style={styles.exploreButtonText}>{t('screens.bookmarks.exploreContent')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.outline }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialDesignIcons name="arrow-left" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={[styles.headerTitle, { color: colors.onBackground }]}>{t('screens.bookmarks.title')}</Text>
          <Text style={[styles.devTag, { color: colors.onSurfaceVariant }]}>{t('screens.bookmarks.underDevelopment')}</Text>
        </View>
        <TouchableOpacity 
          style={styles.viewToggle}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          <MaterialDesignIcons 
            name={viewMode === 'grid' ? 'view-list' : 'view-grid'} 
            size={24} 
            color={colors.onBackground} 
          />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item._id}
        renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyActions: {
    alignItems: 'center',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  devTag: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  viewToggle: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
  },
  gridItem: {
    width: (width - 48) / 2,
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gridImageContainer: {
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  gridPlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridRemoveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 4,
  },
  gridContent: {
    padding: 8,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  gridSubtitle: {
    fontSize: 12,
  },
  itemImage: {
    marginRight: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  itemType: {
    fontSize: 12,
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
  },
});

export default BookmarksScreen;