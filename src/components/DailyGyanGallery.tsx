import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform, ActivityIndicator, Dimensions } from 'react-native';
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
  const [width, setWidth] = useState(Dimensions.get('window').width);
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);
  
  const is7Inch = width >= 600 && width < 800;
  const is10Inch = width >= 800;
  
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
    const itemWidth = is10Inch ? 200 : is7Inch ? 160 : wp(30);
    const itemHeight = is10Inch ? 240 : is7Inch ? 192 : wp(36);
    
    return (
      <TouchableOpacity
        style={[styles.galleryItem, { backgroundColor: colors.surface, width: itemWidth, height: itemHeight, marginRight: is10Inch ? 20 : is7Inch ? 14 : wp(2.5) }]}
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
        <Text style={[styles.imageTitle, { fontSize: is10Inch ? 14 : is7Inch ? 12 : normalize(11) }]} numberOfLines={2}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    const itemWidth = is10Inch ? 200 : is7Inch ? 160 : wp(30);
    const itemHeight = is10Inch ? 240 : is7Inch ? 192 : wp(36);
    const spacing = is10Inch ? 20 : is7Inch ? 14 : wp(2.5);
    
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <MaterialDesignIcons name="image-multiple" size={is10Inch ? 32 : is7Inch ? 26 : 24} color={colors.primary} />
            <Text style={[styles.title, { color: colors.onBackground, fontSize: is10Inch ? 24 : is7Inch ? 20 : normalize(16) }]}>{t('screens.home.dailyGyan')} {t('screens.gallery.title')}</Text>
          </View>
        </View>
        <FlatList
          data={[1, 2, 3, 4]}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.galleryList}
          renderItem={() => (
            <View style={{ width: itemWidth, height: itemHeight, marginRight: spacing, borderRadius: normalize(14), backgroundColor: colors.surfaceVariant }} />
          )}
          keyExtractor={(item) => `skeleton-${item}`}
        />
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
          <MaterialDesignIcons name="image-multiple" size={is10Inch ? 32 : is7Inch ? 26 : 24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.onBackground, fontSize: is10Inch ? 24 : is7Inch ? 20 : normalize(16) }]}>{t('screens.home.dailyGyan')} {t('screens.gallery.title')}</Text>
        </View>
        <TouchableOpacity onPress={onSeeAll} style={styles.seeAllButton}>
          <Text style={[styles.seeAllText, { color: colors.primary, fontSize: is10Inch ? 15 : normalize(13) }]}>{t('screens.home.seeAll')}</Text>
          <MaterialDesignIcons name="chevron-right" size={is10Inch ? 24 : 20} color={colors.onSurfaceVariant} />
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
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontWeight: '600',
    marginLeft: wp(2),
    flexShrink: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: normalize(13),
    fontWeight: '500',
  },
  galleryList: {
    paddingHorizontal: 16,
  },
  galleryItem: {
    borderRadius: normalize(14),
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
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
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default DailyGyanGallery;