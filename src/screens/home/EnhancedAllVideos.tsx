import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  TextInput,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import UnifiedMediaCard from '../../components/UnifiedMediaCard';
import CustomFastImage from '../../components/CustomFastImage';
import { AppColors, AppTypography, AppSpacing, AppBorderRadius } from '../../theme/colors';
import { navigateToVideoPlayer } from '../../utils/PlayerNavigation';

const { width } = Dimensions.get('window');

interface VideoItem {
  _id: string;
  title: string;
  description?: string;
  duration?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  category?: string;
  views?: string;
  uploadDate?: string;
}

const EnhancedAllVideos = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const routeData = (route.params as any)?.item || [];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'duration' | 'recent'>('title');

  // Sample video data - replace with your API data or route params
  const [videoData, setVideoData] = useState<VideoItem[]>([
    {
      _id: '1',
      title: 'Bhagavad Gita Discourse - Chapter 1',
      description: 'Complete explanation of Arjuna Vishada Yoga',
      duration: '1:25:30',
      category: 'Spiritual Teaching',
      views: '12.5K',
      uploadDate: '2 days ago',
      thumbnailUrl: '',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    },
    {
      _id: '2',
      title: 'Morning Yoga Practice',
      description: 'Daily yoga routine for spiritual growth',
      duration: '45:15',
      category: 'Yoga',
      views: '8.2K',
      uploadDate: '1 week ago',
      thumbnailUrl: '',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    },
    {
      _id: '3',
      title: 'Meditation Techniques',
      description: 'Learn various meditation practices',
      duration: '32:45',
      category: 'Meditation',
      views: '15.7K',
      uploadDate: '3 days ago',
      thumbnailUrl: '',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    },
    {
      _id: '4',
      title: 'Krishna Leela Stories',
      description: 'Beautiful stories from Krishna\'s life',
      duration: '58:20',
      category: 'Stories',
      views: '25.1K',
      uploadDate: '5 days ago',
      thumbnailUrl: '',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    },
    {
      _id: '5',
      title: 'Spiritual Discourse',
      description: 'Weekly spiritual guidance session',
      duration: '1:15:45',
      category: 'Satsang',
      views: '18.9K',
      uploadDate: '1 day ago',
      thumbnailUrl: '',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    },
  ]);

  const categories = ['All', 'Spiritual Teaching', 'Yoga', 'Meditation', 'Stories', 'Satsang'];

  // Use route data if available, otherwise use sample data
  useEffect(() => {
    if (routeData && routeData.length > 0) {
      setVideoData(routeData);
    }
  }, [routeData]);

  const filteredData = videoData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleVideoPress = (item: VideoItem) => {
    navigateToVideoPlayer(navigation, {
      ...item,
      videoUri: item.videoUrl,
    });
  };

  const renderGridItem = ({ item }: { item: VideoItem }) => (
    <UnifiedMediaCard
      item={item}
      type="video"
      onPress={handleVideoPress}
    />
  );

  const renderListItem = ({ item }: { item: VideoItem }) => (
    <TouchableOpacity
      style={styles.listCard}
      onPress={() => handleVideoPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.listImageContainer}>
        {item.thumbnailUrl ? (
          <CustomFastImage style={styles.listImage} imageUrl={item.thumbnailUrl} />
        ) : (
          <View style={styles.listPlaceholder}>
            <MaterialDesignIcons name="video" size={24} color={AppColors.info} />
          </View>
        )}
        <View style={styles.listPlayOverlay}>
          <MaterialDesignIcons name="play" size={16} color={AppColors.textLight} />
        </View>
        {item.duration && (
          <View style={styles.listDurationBadge}>
            <Text style={styles.listDurationText}>{item.duration}</Text>
          </View>
        )}
      </View>
      <View style={styles.listContent}>
        <Text style={styles.listTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.listDescription} numberOfLines={1}>{item.description}</Text>
        <View style={styles.listMeta}>
          <Text style={styles.listMetaText}>{item.views} views • {item.uploadDate}</Text>
          <Text style={styles.listCategory}>{item.category}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.actionButton}>
        <MaterialDesignIcons name="dots-vertical" size={20} color={AppColors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={AppColors.background} barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialDesignIcons name="arrow-left" size={24} color={AppColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Videos</Text>
        <TouchableOpacity 
          style={styles.viewToggle}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          <MaterialDesignIcons 
            name={viewMode === 'grid' ? 'view-list' : 'view-grid'} 
            size={24} 
            color={AppColors.textPrimary} 
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialDesignIcons name="magnify" size={20} color={AppColors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search videos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={AppColors.textSecondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialDesignIcons name="close-circle" size={20} color={AppColors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === item && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === item && styles.categoryTextActive
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filteredData.length} video{filteredData.length !== 1 ? 's' : ''} found
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <MaterialDesignIcons name="sort" size={16} color={AppColors.textSecondary} />
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Video List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item._id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
        ItemSeparatorComponent={() => <View style={{ height: AppSpacing.sm }} />}
      />
    </View>
  );
};

const GRID_ITEM_WIDTH = (width - AppSpacing.lg * 3) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: AppSpacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: AppTypography.fontSize.xl,
    fontWeight: AppTypography.fontWeight.bold as any,
    color: AppColors.textPrimary,
    marginLeft: AppSpacing.sm,
  },
  viewToggle: {
    padding: AppSpacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    marginHorizontal: AppSpacing.md,
    marginVertical: AppSpacing.sm,
    paddingHorizontal: AppSpacing.md,
    borderRadius: AppBorderRadius.md,
    gap: AppSpacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: AppTypography.fontSize.base,
    color: AppColors.textPrimary,
    paddingVertical: AppSpacing.sm,
  },
  categoriesContainer: {
    marginBottom: AppSpacing.sm,
  },
  categoriesContent: {
    paddingHorizontal: AppSpacing.md,
    gap: AppSpacing.sm,
  },
  categoryChip: {
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.xs,
    borderRadius: AppBorderRadius.xl,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryChipActive: {
    backgroundColor: AppColors.info,
    borderColor: AppColors.info,
  },
  categoryText: {
    fontSize: AppTypography.fontSize.sm,
    color: AppColors.textSecondary,
    fontWeight: AppTypography.fontWeight.medium as any,
  },
  categoryTextActive: {
    color: AppColors.textLight,
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: AppSpacing.md,
    marginBottom: AppSpacing.sm,
  },
  resultsText: {
    fontSize: AppTypography.fontSize.sm,
    color: AppColors.textSecondary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: AppTypography.fontSize.sm,
    color: AppColors.textSecondary,
  },
  listContainer: {
    paddingHorizontal: AppSpacing.md,
    paddingBottom: AppSpacing.xl,
  },
  // Grid Styles
  gridCard: {
    width: GRID_ITEM_WIDTH,
    backgroundColor: AppColors.background,
    borderRadius: AppBorderRadius.md,
    marginBottom: AppSpacing.md,
    marginHorizontal: AppSpacing.xs,
    ...AppColors.shadows.small,
  },
  gridImageContainer: {
    position: 'relative',
    width: '100%',
    height: (GRID_ITEM_WIDTH * 9) / 16, // 16:9 aspect ratio
    borderTopLeftRadius: AppBorderRadius.md,
    borderTopRightRadius: AppBorderRadius.md,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: AppColors.surface,
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
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: AppSpacing.xs,
    paddingVertical: 2,
    borderRadius: AppBorderRadius.sm,
  },
  durationText: {
    color: AppColors.textLight,
    fontSize: AppTypography.fontSize.xs,
    fontWeight: AppTypography.fontWeight.medium as any,
  },
  videoBadge: {
    position: 'absolute',
    top: AppSpacing.xs,
    left: AppSpacing.xs,
    backgroundColor: AppColors.info,
    paddingHorizontal: AppSpacing.xs,
    paddingVertical: 2,
    borderRadius: AppBorderRadius.sm,
  },
  gridContent: {
    padding: AppSpacing.sm,
  },
  gridTitle: {
    fontSize: AppTypography.fontSize.sm,
    fontWeight: AppTypography.fontWeight.semibold as any,
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  gridDescription: {
    fontSize: AppTypography.fontSize.xs,
    color: AppColors.textSecondary,
    marginBottom: AppSpacing.xs,
  },
  gridMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridViews: {
    fontSize: AppTypography.fontSize.xs,
    color: AppColors.textTertiary,
  },
  gridDate: {
    fontSize: AppTypography.fontSize.xs,
    color: AppColors.textTertiary,
  },
  // List Styles
  listCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: AppColors.background,
    borderRadius: AppBorderRadius.md,
    padding: AppSpacing.sm,
    ...AppColors.shadows.small,
  },
  listImageContainer: {
    position: 'relative',
    width: 120,
    height: 68, // 16:9 aspect ratio
    borderRadius: AppBorderRadius.sm,
    overflow: 'hidden',
    marginRight: AppSpacing.sm,
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: AppColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listDurationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  listDurationText: {
    color: AppColors.textLight,
    fontSize: 10,
    fontWeight: AppTypography.fontWeight.medium as any,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: AppTypography.fontSize.base,
    fontWeight: AppTypography.fontWeight.semibold as any,
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  listDescription: {
    fontSize: AppTypography.fontSize.sm,
    color: AppColors.textSecondary,
    marginBottom: AppSpacing.xs,
  },
  listMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listMetaText: {
    fontSize: AppTypography.fontSize.xs,
    color: AppColors.textTertiary,
  },
  listCategory: {
    fontSize: AppTypography.fontSize.xs,
    color: AppColors.info,
    fontWeight: AppTypography.fontWeight.medium as any,
  },
  actionButton: {
    padding: AppSpacing.xs,
  },
});

export default EnhancedAllVideos;