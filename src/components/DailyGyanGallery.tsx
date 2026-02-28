import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform, ActivityIndicator, Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from './CustomFastImage';
import { processAzureUrl } from '../utils/azureUrlHelper';
import { useGetTrendingQuery } from '../data/redux/services/mediaApi';
import { wp, hp, normalize, getResponsiveSize } from '../utils/responsive';
import SkeletonItem from './SkeletonLoader';
import UnifiedMediaCard from './UnifiedMediaCard';


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
  createdAt: string;
}

interface DailyGyanGalleryProps {
  onItemPress: (item: GalleryItem, index: number, allImages: GalleryItem[]) => void;
  onSeeAll: () => void;
}

const DailyGyanGallery: React.FC<DailyGyanGalleryProps> = ({ onItemPress, onSeeAll }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [width, setWidth] = useState(Dimensions.get('window').width);
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);
  
  const is7InchTablet = width >= 600 && width < 800;
  const is10InchTablet = width >= 800;
  
  // Fetch trending images from API
  const { data: apiResponse, isLoading, error } = useGetTrendingQuery({
    type: 'image',
    days: 18,
    limit: 20
  });
  

  // Extract and sort image items by creation date (most recent first)
  const data = Array.isArray(apiResponse?.data?.all) 
    ? apiResponse.data.all
        .filter((item: GalleryItem) => item.type === 'image')
        .sort((a: GalleryItem, b: GalleryItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];
  



  const renderGalleryItem = ({ item, index }: { item: GalleryItem; index: number }) => {
    return (
      <UnifiedMediaCard
        item={{
          ...item,
          imageUrl: item.streamingUrl || item.imageUrl || item.thumbnailUrl || item.mainImage || item.headerImage,
          thumbnailUrl: item.streamingUrl || item.imageUrl || item.thumbnailUrl || item.mainImage || item.headerImage,
          type: 'image'
        }}
        type="image"
        onPress={() => onItemPress(item, index, data)}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, is10InchTablet && { paddingHorizontal: 0, marginBottom: 16 }, is7InchTablet && { paddingHorizontal: 0, marginBottom: 12 }]}>
          <View style={styles.titleContainer}>
            <MaterialDesignIcons name="image-multiple" size={is10InchTablet ? 32 : is7InchTablet ? 26 : 24} color={colors.primary} />
            <Text style={[styles.title, { color: colors.onBackground, fontSize: is10InchTablet ? 24 : is7InchTablet ? 20 : 18 }]}>{t('screens.home.dailyGyan')} {t('screens.gallery.title')}</Text>
          </View>
        </View>
        <View style={[styles.galleryList, { flexDirection: 'row' }]}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.skeletonWrapper, { marginRight: 12 }]}>
              <SkeletonItem width={120} height={140} borderRadius={8} />
              <View style={{ marginTop: 8, paddingHorizontal: 4 }}>
                <SkeletonItem width={100} height={12} borderRadius={4} style={{ marginBottom: 4 }} />
                <SkeletonItem width={80} height={10} borderRadius={4} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, is10InchTablet && { paddingHorizontal: 0, marginBottom: 16 }, is7InchTablet && { paddingHorizontal: 0, marginBottom: 12 }]}>
          <View style={styles.titleContainer}>
            <MaterialDesignIcons name="image-multiple" size={is10InchTablet ? 32 : is7InchTablet ? 26 : 24} color={colors.primary} />
            <Text style={[styles.title, { color: colors.onBackground, fontSize: is10InchTablet ? 24 : is7InchTablet ? 20 : 18 }]}>{t('screens.home.dailyGyan')} {t('screens.gallery.title')}</Text>
          </View>
          <TouchableOpacity onPress={onSeeAll} style={styles.seeAllButton}>
            <Text style={[styles.seeAllText, { color: colors.primary, fontSize: is10InchTablet ? 15 : 13 }]}>{t('screens.home.seeAll')}</Text>
            <MaterialDesignIcons name="chevron-right" size={is10InchTablet ? 24 : 20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={[styles.galleryList, { height: wp(28) }]}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <MaterialDesignIcons name="cloud-upload-outline" size={normalize(32)} color={colors.onSurfaceVariant || colors.onBackground} style={{ marginBottom: hp(1) }} />
            <Text style={[{ color: colors.onSurfaceVariant || colors.onBackground, fontSize: normalize(14), fontWeight: '500' }]}>Not uploaded yet</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, is10InchTablet && { paddingHorizontal: 0, marginBottom: 16 }, is7InchTablet && { paddingHorizontal: 0, marginBottom: 12 }]}>
        <View style={styles.titleContainer}>
          <MaterialDesignIcons name="image-multiple" size={is10InchTablet ? 32 : is7InchTablet ? 26 : 24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.onBackground, fontSize: is10InchTablet ? 24 : is7InchTablet ? 20 : 18 }]}>{t('screens.home.dailyGyan')} {t('screens.gallery.title')}</Text>
        </View>
        <TouchableOpacity onPress={onSeeAll} style={styles.seeAllButton}>
          <Text style={[styles.seeAllText, { color: colors.primary, fontSize: is10InchTablet ? 15 : 13 }]}>{t('screens.home.seeAll')}</Text>
          <MaterialDesignIcons name="chevron-right" size={is10InchTablet ? 24 : 20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={data.slice(0, 6)}
        renderItem={renderGalleryItem}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.galleryList, is10InchTablet && { paddingHorizontal: 0 }, is7InchTablet && { paddingHorizontal: 0 }]}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        ItemSeparatorComponent={() => <View style={[styles.separator, is10InchTablet && { width: 8 }, is7InchTablet && { width: 6 }]} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    flexShrink: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: 4,
  },
  galleryList: {
    paddingHorizontal: 16,
  },
  separator: {
    width: 4,
  },
  skeletonWrapper: {
    marginRight: 4,
    alignItems: 'flex-start',
  },
});

export default DailyGyanGallery;