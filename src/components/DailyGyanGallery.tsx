import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from './CustomFastImage';
import { processAzureUrl } from '../utils/azureUrlHelper';
import { useGetTrendingQuery } from '../data/redux/services/mediaApi';
import { wp, hp, normalize, getResponsiveSize } from '../utils/responsive';


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

interface DailyGyanGalleryProps {
  onItemPress: (item: GalleryItem, index: number, allImages: GalleryItem[]) => void;
  onSeeAll: () => void;
}

const DailyGyanGallery: React.FC<DailyGyanGalleryProps> = ({ onItemPress, onSeeAll }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  
  // Fetch trending images from API
  const { data: apiResponse, isLoading, error } = useGetTrendingQuery({
    type: 'image',
    days: 18,
    limit: 20
  });
  
  // Extract image items from the response
  const data = Array.isArray(apiResponse?.data?.all) ? apiResponse.data.all.filter((item: GalleryItem) => item.type === 'image') : [];



  const renderGalleryItem = ({ item, index }: { item: GalleryItem; index: number }) => {
    const imageUrl = processAzureUrl(item.streamingUrl) || processAzureUrl(item.imageUrl) || processAzureUrl(item.thumbnailUrl) || processAzureUrl(item.mainImage) || processAzureUrl(item.headerImage);
    
    console.log('DailyGyanGallery - Item:', item.title, 'URLs:', {
      streamingUrl: item.streamingUrl,
      imageUrl: item.imageUrl,
      thumbnailUrl: item.thumbnailUrl,
      processedUrl: imageUrl
    });
    
    return (
      <TouchableOpacity
        style={[styles.galleryItem, { backgroundColor: colors.surface }]}
        onPress={() => {
          console.log('Gallery item pressed:', item.title, 'index:', index);
          onItemPress(item, index, data);
        }}
        activeOpacity={0.7}
        delayPressIn={0}
      >
        <CustomFastImage
          imageUrl={imageUrl}
          style={styles.galleryImage}
          resizeMode="cover"
        />

        <View style={styles.imageGradient} />
        <Text style={styles.imageTitle} numberOfLines={2}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <MaterialDesignIcons name="image-multiple" size={24} color={colors.primary} />
            <Text style={[styles.title, { color: colors.onBackground }]}>{t('screens.home.dailyGyan')} {t('screens.gallery.title')}</Text>
          </View>
        </View>
        <View style={[styles.galleryList, { justifyContent: 'center', alignItems: 'center', height: wp(28) }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[{ color: colors.onBackground, fontSize: normalize(14), marginTop: 10 }]}>{t('screens.gallery.loadingImages')}</Text>
        </View>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <MaterialDesignIcons name="image-multiple" size={24} color={colors.primary} />
            <Text style={[styles.title, { color: colors.onBackground }]}>{t('screens.home.dailyGyan')} {t('screens.gallery.title')}</Text>
          </View>
          <TouchableOpacity onPress={onSeeAll} style={styles.seeAllButton}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>{t('screens.home.seeAll')}</Text>
            <MaterialDesignIcons name="chevron-right" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={[styles.galleryList, { justifyContent: 'center', alignItems: 'center', height: wp(28) }]}>
          <Text style={[{ color: colors.onBackground, fontSize: normalize(14) }]}>{t('screens.gallery.noImages')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialDesignIcons name="image-multiple" size={24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.onBackground }]}>{t('screens.home.dailyGyan')} {t('screens.gallery.title')}</Text>
        </View>
        <TouchableOpacity onPress={onSeeAll} style={styles.seeAllButton}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>{t('screens.home.seeAll')}</Text>
          <MaterialDesignIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={data.slice(0, 6)}
        renderItem={renderGalleryItem}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.galleryList}
        scrollEnabled={true}
        nestedScrollEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    marginLeft: wp(2),
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: normalize(14),
    fontWeight: '600',
  },
  galleryList: {
    paddingHorizontal: 16,
  },
  galleryItem: {
    width: getResponsiveSize(wp(32), wp(34), wp(30)),
    height: getResponsiveSize(wp(40), wp(42), wp(38)),
    marginRight: wp(3),
    borderRadius: normalize(16),
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  galleryImage: {
    width: '100%',
    height: '70%',
    borderTopLeftRadius: normalize(16),
    borderTopRightRadius: normalize(16),
  },


  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  imageTitle: {
    position: 'absolute',
    bottom: wp(2),
    left: wp(2),
    right: wp(2),
    color: '#fff',
    fontSize: normalize(11),
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default DailyGyanGallery;