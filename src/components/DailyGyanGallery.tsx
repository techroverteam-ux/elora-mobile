import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from './CustomFastImage';
import { processAzureUrl } from '../utils/azureUrlHelper';
import { useGetTrendingQuery } from '../data/redux/services/mediaApi';
import { wp, hp, normalize, getResponsiveSize } from '../utils/responsive';

interface GalleryItem {
  _id: string;
  title: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  mainImage?: string;
  headerImage?: string;
}

interface DailyGyanGalleryProps {
  onItemPress: (item: GalleryItem, index: number) => void;
  onSeeAll: () => void;
}

const DailyGyanGallery: React.FC<DailyGyanGalleryProps> = ({ onItemPress, onSeeAll }) => {
  const { colors } = useTheme();
  
  // Fetch trending images from API
  const { data: apiResponse, isLoading, error } = useGetTrendingQuery({
    type: 'image',
    days: 7,
    limit: 20
  });
  
  const data = Array.isArray(apiResponse?.data) ? apiResponse.data : [];

  const renderGalleryItem = ({ item, index }: { item: GalleryItem; index: number }) => {
    const imageUrl = processAzureUrl(item.imageUrl) || processAzureUrl(item.thumbnailUrl) || processAzureUrl(item.mainImage) || processAzureUrl(item.headerImage);
    
    return (
      <TouchableOpacity
        style={styles.galleryItem}
        onPress={() => onItemPress(item, index)}
        activeOpacity={0.8}
      >
        <CustomFastImage
          imageUrl={imageUrl}
          style={styles.galleryImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <MaterialDesignIcons name="eye" size={20} color="#fff" />
        </View>
      </TouchableOpacity>
    );
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialDesignIcons name="image-multiple" size={24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.onBackground }]}>Daily Gyan Gallery</Text>
        </View>
        <TouchableOpacity onPress={onSeeAll} style={styles.seeAllButton}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          <MaterialDesignIcons name="chevron-right" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={data.slice(0, 6)}
        renderItem={renderGalleryItem}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.galleryList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: hp(2),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    marginBottom: hp(1.5),
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
    paddingHorizontal: wp(4),
  },
  galleryItem: {
    width: getResponsiveSize(wp(28), wp(30), wp(25)),
    height: getResponsiveSize(wp(28), wp(30), wp(25)),
    marginRight: wp(3),
    borderRadius: normalize(12),
    overflow: 'hidden',
    position: 'relative',
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
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: wp(2),
    right: wp(2),
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: normalize(15),
    width: wp(8),
    height: wp(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DailyGyanGallery;