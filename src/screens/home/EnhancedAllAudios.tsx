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
import { useNavigation } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import UnifiedMediaCard from '../../components/UnifiedMediaCard';
import CustomFastImage from '../../components/CustomFastImage';
import { AppColors, AppTypography, AppSpacing, AppBorderRadius } from '../../theme/colors';
import { navigateToAudioPlayer } from '../../utils/PlayerNavigation';

const { width } = Dimensions.get('window');

interface AudioItem {
  _id: string;
  title: string;
  artist?: string;
  duration?: string;
  imageUrl?: string;
  audioUrl?: string;
  category?: string;
  isLiked?: boolean;
}

const EnhancedAllAudios = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'duration' | 'recent'>('title');

  // Sample audio data - replace with your API data
  const [audioData, setAudioData] = useState<AudioItem[]>([
    {
      _id: '1',
      title: 'Bhagavad Gita Chapter 1',
      artist: 'Swami Mukundananda',
      duration: '45:30',
      category: 'Bhajans',
      imageUrl: '',
      audioUrl: 'https://example.com/audio1.mp3',
    },
    {
      _id: '2',
      title: 'Krishna Bhajan Collection',
      artist: 'Anup Jalota',
      duration: '32:15',
      category: 'Bhajans',
      imageUrl: '',
      audioUrl: 'https://example.com/audio2.mp3',
    },
    {
      _id: '3',
      title: 'Hanuman Chalisa',
      artist: 'Hariharan',
      duration: '8:45',
      category: 'Nitya Stuti',
      imageUrl: '',
      audioUrl: 'https://example.com/audio3.mp3',
    },
    {
      _id: '4',
      title: 'Evening Satsang',
      artist: 'Spiritual Discourse',
      duration: '1:15:20',
      category: 'Satsang',
      imageUrl: '',
      audioUrl: 'https://example.com/audio4.mp3',
    },
    {
      _id: '5',
      title: 'Sandhya Aarti',
      artist: 'Temple Singers',
      duration: '12:30',
      category: 'Sandhya',
      imageUrl: '',
      audioUrl: 'https://example.com/audio5.mp3',
    },
  ]);

  const categories = ['All', 'Bhajans', 'Nitya Stuti', 'Satsang', 'Sandhya'];

  const filteredData = audioData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.artist?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAudioPress = (item: AudioItem) => {
    navigateToAudioPlayer(navigation, item);
  };

  const renderGridItem = ({ item }: { item: AudioItem }) => (
    <UnifiedMediaCard
      item={item}
      type="audio"
      onPress={handleAudioPress}
    />
  );

  const renderListItem = ({ item }: { item: AudioItem }) => (
    <TouchableOpacity
      style={styles.listCard}
      onPress={() => handleAudioPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.listImageContainer}>
        {item.imageUrl ? (
          <CustomFastImage style={styles.listImage} imageUrl={item.imageUrl} />
        ) : (
          <View style={styles.listPlaceholder}>
            <MaterialDesignIcons name="music-note" size={24} color={AppColors.primary} />
          </View>
        )}
      </View>
      <View style={styles.listContent}>
        <Text style={styles.listTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.listArtist} numberOfLines={1}>{item.artist}</Text>
        <Text style={styles.listCategory}>{item.category}</Text>
      </View>
      <View style={styles.listActions}>
        <Text style={styles.listDuration}>{item.duration}</Text>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialDesignIcons name="dots-vertical" size={20} color={AppColors.textSecondary} />
        </TouchableOpacity>
      </View>
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
        <Text style={styles.headerTitle}>All Audios</Text>
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
          placeholder="Search audios..."
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
          {filteredData.length} audio{filteredData.length !== 1 ? 's' : ''} found
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <MaterialDesignIcons name="sort" size={16} color={AppColors.textSecondary} />
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Audio List */}
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
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
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
    height: GRID_ITEM_WIDTH,
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
  gridContent: {
    padding: AppSpacing.sm,
  },
  gridTitle: {
    fontSize: AppTypography.fontSize.sm,
    fontWeight: AppTypography.fontWeight.semibold as any,
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  gridArtist: {
    fontSize: AppTypography.fontSize.xs,
    color: AppColors.textSecondary,
  },
  // List Styles
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background,
    borderRadius: AppBorderRadius.md,
    padding: AppSpacing.sm,
    ...AppColors.shadows.small,
  },
  listImageContainer: {
    width: 60,
    height: 60,
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
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: AppTypography.fontSize.base,
    fontWeight: AppTypography.fontWeight.semibold as any,
    color: AppColors.textPrimary,
    marginBottom: 2,
  },
  listArtist: {
    fontSize: AppTypography.fontSize.sm,
    color: AppColors.textSecondary,
    marginBottom: 2,
  },
  listCategory: {
    fontSize: AppTypography.fontSize.xs,
    color: AppColors.primary,
    fontWeight: AppTypography.fontWeight.medium as any,
  },
  listActions: {
    alignItems: 'flex-end',
  },
  listDuration: {
    fontSize: AppTypography.fontSize.xs,
    color: AppColors.textSecondary,
    marginBottom: AppSpacing.xs,
  },
  actionButton: {
    padding: AppSpacing.xs,
  },
});

export default EnhancedAllAudios;