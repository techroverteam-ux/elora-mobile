import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
  SafeAreaView,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { wp, hp, normalize, getResponsiveSize, isTablet } from '../utils/responsive';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from '../components/CustomFastImage';
import ImageGalleryViewer from '../components/ImageGalleryViewer';
import { GridViewSkeleton, ListViewSkeleton } from '../components/SkeletonLoader';
import { processAzureUrl } from '../utils/azureUrlHelper';
import { useGetTrendingQuery } from '../data/redux/services/mediaApi';
import { useBookmarks } from '../context/BookmarkContext';



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
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { initialIndex: routeInitialIndex = 0 } = (route.params as any) || {};
  const [width, setWidth] = useState(Dimensions.get('window').width)
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWidth(window.width)
    })
    return () => subscription?.remove()
  }, [])
  
  const is7Inch = width >= 600 && width < 800
  const is10Inch = width >= 800
  const numColumns = is10Inch ? 4 : is7Inch ? 3 : 3
  const itemSize = is10Inch ? (width - 80) / 4 : is7Inch ? (width - 64) / 3 : (width - wp(12)) / 3
  
  // Fetch trending images from API - same as DailyGyanGallery
  const { data: apiResponse, isLoading, error, refetch } = useGetTrendingQuery({
    type: 'image',
    days: 18,
    limit: 100
  });
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('GalleryList - Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
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
        <View style={styles.gridImageContainer}>
          {imageUrl ? (
            <CustomFastImage
              imageUrl={imageUrl}
              style={styles.gridImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.gridPlaceholder, { backgroundColor: colors.surfaceVariant || '#f0f0f0' }]}>
              <MaterialDesignIcons 
                name="image-outline" 
                size={32} 
                color={colors.primary} 
              />
            </View>
          )}
        </View>
        
        <View style={styles.gridContent}>
          <Text style={[styles.gridTitle, { color: colors.onSurface }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.gridSubtitle, { color: colors.onSurfaceVariant || colors.onSurface }]} numberOfLines={1}>
            Image
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.gridBookmarkButton}
          onPress={(event) => handleBookmarkToggle(item, event)}
        >
          <MaterialDesignIcons 
            name={isBookmarked(item._id) ? "bookmark" : "bookmark-outline"} 
            size={16} 
            color={isBookmarked(item._id) ? "#F8803B" : colors.primary} 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderListItem = ({ item, index }: { item: GalleryItem; index: number }) => {
    const imageUrl = processAzureUrl(item.streamingUrl) || processAzureUrl(item.imageUrl) || processAzureUrl(item.thumbnailUrl) || processAzureUrl(item.mainImage) || processAzureUrl(item.headerImage);
    
    return (
      <View>
        <TouchableOpacity
          style={styles.listRow}
          onPress={() => handleImagePress(index)}
          activeOpacity={0.8}
        >
          {imageUrl ? (
            <CustomFastImage
              imageUrl={imageUrl}
              style={styles.listImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.listImagePlaceholder, { backgroundColor: colors.surfaceVariant || '#f0f0f0' }]}>
              <MaterialDesignIcons 
                name="image-outline" 
                size={24} 
                color={colors.primary} 
              />
            </View>
          )}
          
          <View style={styles.listTextContainer}>
            <Text style={[styles.listTitle, { color: colors.onSurface }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.listSubtitle, { color: colors.onSurfaceVariant || colors.onSurface }]} numberOfLines={2}>
              Image content
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.listBookmarkButton}
            onPress={(event) => handleBookmarkToggle(item, event)}
          >
            <MaterialDesignIcons 
              name={isBookmarked(item._id) ? "bookmark" : "bookmark-outline"} 
              size={20} 
              color={isBookmarked(item._id) ? "#F8803B" : colors.primary} 
            />
          </TouchableOpacity>
          
          <MaterialDesignIcons
            name="chevron-right"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        
        <View style={[styles.listSeparator, { backgroundColor: colors.outline }]} />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <MaterialDesignIcons name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
          {t('screens.home.dailyGyan')} {t('screens.gallery.title')}
        </Text>
        <TouchableOpacity
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          style={styles.headerButton}
        >
          <MaterialDesignIcons
            name={viewMode === 'grid' ? 'view-list' : 'view-grid'}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Gallery List */}
      {isLoading ? (
        viewMode === 'grid' ? <GridViewSkeleton /> : <ListViewSkeleton />
      ) : images.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyContentContainer}>
          <MaterialDesignIcons name="cloud-upload-outline" size={normalize(48)} color={colors.onSurfaceVariant} style={{ marginBottom: hp(2) }} />
          <Text style={[styles.loadingText, { color: colors.onSurfaceVariant, fontWeight: '500' }]}>Not uploaded yet</Text>
        </ScrollView>
      ) : (
        <FlatList
          data={images}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          keyExtractor={(item) => item._id}
          numColumns={viewMode === 'grid' ? numColumns : 1}
          key={viewMode === 'grid' ? `grid-${numColumns}` : 'list'}
          contentContainerStyle={viewMode === 'grid' ? styles.gridContainer : styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#F8803B']}
              tintColor="#F8803B"
            />
          }
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
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
  },
  listContainer: {
    padding: 16,
    width: '90%',
    alignSelf: 'center',
  },
  gridContainer: {
    paddingHorizontal: 8,
  },
  // Grid styles
  gridItem: {
    flex: 1,
    margin: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    position: 'relative',
  },
  gridImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContent: {
    padding: 8,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  gridSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  gridBookmarkButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  // List styles
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  listImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
  },
  listImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 14,
    color: '#6e6e6e',
    width: '75%',
  },
  listSeparator: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  listBookmarkButton: {
    padding: 8,
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    padding: 40,
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
  },
});

export default GalleryListScreen;