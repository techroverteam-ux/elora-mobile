import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from '../components/CustomFastImage';
import { useRecentlyPlayed } from '../context/RecentlyPlayedContext';
import { processAzureUrl } from '../utils/azureUrlHelper';

const { width } = Dimensions.get('window');

const RecentlyPlayedScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { recentItems } = useRecentlyPlayed();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const handleItemPress = (item: any) => {
    if (item.type === 'image') {
      const imageUrl = processAzureUrl(item.streamingUrl) || processAzureUrl(item.imageUrl) || processAzureUrl(item.thumbnailUrl);
      (navigation as any).navigate('ImageViewer', {
        images: [imageUrl],
        initialIndex: 0,
        title: item.title || 'Image'
      });
    } else if (item.type === 'audio' || item.audioUrl || item.streamingUrl) {
      (navigation as any).navigate('EnhancedAudioPlayer', { item });
    } else if (item.type === 'video' || item.videoUrl) {
      (navigation as any).navigate('EnhancedVideoPlayer', { item });
    } else if (item.type === 'pdf' || item.pdfUrl || (!item.type && (item.title || item.author))) {
      (navigation as any).navigate('PdfViewer', { item });
    } else {
      // Default to audio player for unknown types
      (navigation as any).navigate('EnhancedAudioPlayer', { item });
    }
  };

  const formatPlayedTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getItemType = (item: any) => {
    if (item.type === 'image') return 'image';
    if (item.type === 'video' || item.videoUrl) return 'video';
    if (item.type === 'audio' || item.audioUrl || item.streamingUrl) return 'audio';
    if (item.type === 'pdf' || item.pdfUrl) return 'pdf';
    return 'audio'; // default
  };

  const getItemIcon = (item: any) => {
    const type = getItemType(item);
    switch (type) {
      case 'image': return 'eye';
      case 'video': return 'play-circle';
      case 'audio': return 'play-circle';
      case 'pdf': return 'book-open';
      default: return 'play-circle';
    }
  };

  const getPlaceholderIcon = (item: any) => {
    const type = getItemType(item);
    switch (type) {
      case 'image': return 'image';
      case 'video': return 'video';
      case 'audio': return 'music-note';
      case 'pdf': return 'file-document';
      default: return 'music-note';
    }
  };

  const renderListItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.listItem, { backgroundColor: colors.surface }]}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.itemImage}>
        {(item.thumbnailUrl || item.imageUrl || item.coverImage || item.headerImage || item.mainImage) ? (
          <CustomFastImage 
            style={styles.thumbnail} 
            imageUrl={processAzureUrl(item.thumbnailUrl) || processAzureUrl(item.imageUrl) || processAzureUrl(item.coverImage) || processAzureUrl(item.headerImage) || processAzureUrl(item.mainImage)} 
          />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialDesignIcons 
              name={getPlaceholderIcon(item)} 
              size={24} 
              color={colors.onSurfaceVariant} 
            />
          </View>
        )}
      </View>
      
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: colors.onBackground }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.itemSubtitle, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
          {item.artist || item.author || 'Unknown'}
        </Text>
        <Text style={[styles.playedTime, { color: colors.primary }]}>
          {formatPlayedTime(item.playedAt)}
        </Text>
      </View>
      
      <MaterialDesignIcons 
        name={getItemIcon(item)} 
        size={24} 
        color={colors.primary} 
      />
    </TouchableOpacity>
  );

  const renderGridItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.gridItem, { backgroundColor: colors.surface }]}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.gridImageContainer}>
        {(item.thumbnailUrl || item.imageUrl || item.coverImage || item.headerImage || item.mainImage) ? (
          <CustomFastImage 
            style={styles.gridImage} 
            imageUrl={processAzureUrl(item.thumbnailUrl) || processAzureUrl(item.imageUrl) || processAzureUrl(item.coverImage) || processAzureUrl(item.headerImage) || processAzureUrl(item.mainImage)} 
          />
        ) : (
          <View style={[styles.gridPlaceholder, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialDesignIcons 
              name={getPlaceholderIcon(item)} 
              size={32} 
              color={colors.onSurfaceVariant} 
            />
          </View>
        )}
        <View style={styles.gridTimeOverlay}>
          <Text style={styles.gridTimeText}>
            {formatPlayedTime(item.playedAt)}
          </Text>
        </View>
      </View>
      
      <View style={styles.gridContent}>
        <Text style={[styles.gridTitle, { color: colors.onBackground }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.gridSubtitle, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
          {item.artist || item.author || 'Unknown'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (recentItems.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.outline }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialDesignIcons name="arrow-left" size={24} color={colors.onBackground} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.headerTitle, { color: colors.onBackground }]}>Recently Played</Text>
            <Text style={[styles.devTag, { color: colors.onSurfaceVariant }]}>Under Development</Text>
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
            <MaterialDesignIcons name="history" size={64} color="#F8803B" />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.onBackground }]}>No Recent Activity</Text>
          <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>
            Start listening to audios or reading books to see your recent activity here
          </Text>
          <View style={styles.emptyActions}>
            <TouchableOpacity 
              style={[styles.exploreButton, { backgroundColor: '#F8803B' }]}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            >
              <MaterialDesignIcons name="play-circle-outline" size={20} color="#fff" />
              <Text style={styles.exploreButtonText}>Start Exploring</Text>
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
          <Text style={[styles.headerTitle, { color: colors.onBackground }]}>Recently Played</Text>
          <Text style={[styles.devTag, { color: colors.onSurfaceVariant }]}>Under Development</Text>
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
        data={recentItems}
        keyExtractor={(item) => `${item._id}-${item.playedAt}`}
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
  gridTimeOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  gridTimeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
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
  playedTime: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default RecentlyPlayedScreen;