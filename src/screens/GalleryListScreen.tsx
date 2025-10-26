import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import { wp, hp, normalize, getResponsiveSize, isTablet } from '../utils/responsive';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from '../components/CustomFastImage';
import ImageGalleryViewer from '../components/ImageGalleryViewer';
import { processAzureUrl } from '../utils/azureUrlHelper';
import { useGetTrendingQuery } from '../data/redux/services/mediaApi';
import { useBookmarks } from '../context/BookmarkContext';

const { width } = Dimensions.get('window');
const itemSize = isTablet() ? (width - wp(12)) / 3 : (width - wp(12)) / 2;

interface GalleryItem {
  _id: string;
  title: string;
  type: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  mainImage?: string;
  headerImage?: string;
  streamingUrl?: string;
  downloadUrl?: string;
}

const GalleryListScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { initialIndex: routeInitialIndex = 0 } = (route.params as any) || {};
  
  // Fetch trending images from API - same as DailyGyanGallery
  const { data: apiResponse, isLoading, error } = useGetTrendingQuery({
    type: 'image',
    days: 18,
    limit: 100
  });
  
  // Extract image items from the response
  const images = Array.isArray(apiResponse?.data?.all) ? apiResponse.data.all.filter((item: GalleryItem) => item.type === 'image') : [];

  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(routeInitialIndex);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleImagePress = (index: number) => {
    console.log('Image pressed, index:', index, 'total images:', images.length);
    if (images && images.length > 0 && index >= 0 && index < images.length) {
      setSelectedIndex(index);
      setViewerVisible(true);
    } else {
      console.error('Invalid image index or empty images array');
    }
  };

  const handleBookmarkToggle = (item: GalleryItem, event: any) => {
    event.stopPropagation();
    
    if (isBookmarked(item._id)) {
      removeBookmark(item._id);
    } else {
      const bookmarkItem = {
        ...item,
        type: 'image'
      };
      addBookmark(bookmarkItem);
    }
  };

  const renderGridItem = ({ item, index }: { item: GalleryItem; index: number }) => {
    const imageUrl = processAzureUrl(item.streamingUrl) || processAzureUrl(item.imageUrl) || processAzureUrl(item.thumbnailUrl) || processAzureUrl(item.mainImage) || processAzureUrl(item.headerImage);
    
    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => handleImagePress(index)}
        activeOpacity={0.8}
      >
        <CustomFastImage
          imageUrl={imageUrl}
          style={styles.gridImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.gridBookmarkButton}
          onPress={(event) => handleBookmarkToggle(item, event)}
        >
          <MaterialDesignIcons 
            name={isBookmarked(item._id) ? "bookmark" : "bookmark-outline"} 
            size={16} 
            color={isBookmarked(item._id) ? "#F8803B" : "#fff"} 
          />
        </TouchableOpacity>
        <View style={styles.gridOverlay}>
          <Text style={styles.gridTitle} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderListItem = ({ item, index }: { item: GalleryItem; index: number }) => {
    const imageUrl = processAzureUrl(item.streamingUrl) || processAzureUrl(item.imageUrl) || processAzureUrl(item.thumbnailUrl) || processAzureUrl(item.mainImage) || processAzureUrl(item.headerImage);
    
    return (
      <TouchableOpacity
        style={[styles.listItem, { backgroundColor: colors.surface }]}
        onPress={() => handleImagePress(index)}
        activeOpacity={0.8}
      >
        <CustomFastImage
          imageUrl={imageUrl}
          style={styles.listImage}
          resizeMode="cover"
        />
        <View style={styles.listContent}>
          <Text style={[styles.listTitle, { color: colors.onSurface }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.listMeta}>
            <MaterialDesignIcons name="eye" size={16} color={colors.onSurfaceVariant} />
            <Text style={[styles.listMetaText, { color: colors.onSurfaceVariant }]}>
              Tap to view
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.listBookmarkButton}
          onPress={(event) => handleBookmarkToggle(item, event)}
        >
          <MaterialDesignIcons 
            name={isBookmarked(item._id) ? "bookmark" : "bookmark-outline"} 
            size={20} 
            color={isBookmarked(item._id) ? "#F8803B" : colors.onSurfaceVariant} 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <MaterialDesignIcons name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
          Daily Gyan Gallery
        </Text>
        <TouchableOpacity
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          style={styles.headerButton}
        >
          <MaterialDesignIcons
            name={viewMode === 'grid' ? 'view-list' : 'view-grid'}
            size={24}
            color={colors.onSurface}
          />
        </TouchableOpacity>
      </View>

      {/* Gallery List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>Loading images...</Text>
        </View>
      ) : images.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>No images found</Text>
        </View>
      ) : (
        <FlatList
          data={images}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          keyExtractor={(item) => item._id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Image Viewer */}
      {images.length > 0 && (
        <ImageGalleryViewer
          visible={viewerVisible}
          images={images}
          initialIndex={selectedIndex}
          onClose={() => setViewerVisible(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: normalize(18),
    fontWeight: 'bold',
    marginHorizontal: wp(4),
  },
  listContainer: {
    padding: wp(4),
  },
  // Grid styles
  gridItem: {
    width: itemSize,
    height: itemSize,
    marginRight: wp(4),
    marginBottom: hp(2),
    borderRadius: normalize(12),
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: wp(2),
  },
  gridTitle: {
    color: '#fff',
    fontSize: normalize(12),
    fontWeight: '600',
  },
  gridBookmarkButton: {
    position: 'absolute',
    top: wp(2),
    right: wp(2),
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: normalize(12),
    width: wp(7),
    height: wp(7),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  listBookmarkButton: {
    padding: wp(2),
  },
  // List styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(3),
    marginBottom: hp(1.5),
    borderRadius: normalize(12),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  listImage: {
    width: wp(15),
    height: wp(15),
    borderRadius: normalize(8),
  },
  listContent: {
    flex: 1,
    marginLeft: wp(3),
  },
  listTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
    marginBottom: hp(0.5),
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listMetaText: {
    fontSize: normalize(12),
    marginLeft: wp(1),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(10),
  },
  loadingText: {
    fontSize: normalize(16),
  },
});

export default GalleryListScreen;