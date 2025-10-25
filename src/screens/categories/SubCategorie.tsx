import { StyleSheet, Text, View, FlatList, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import AppBarHeader from '../../components/AppBarHeader'
import { useTheme } from 'react-native-paper'
import { useGetSubcategoriesMutation } from '../../data/redux/services/sectionsApi'
import { ScrollView } from 'react-native-gesture-handler'
import CustomFastImage from '../../components/CustomFastImage'
import BlogVideo from '../../components/BlogVideo'
import { useAzureAssets } from '../../hooks/useAzureAssets'
import CollageFrame from '../../components/CollageFrame'

import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import { wp, hp, normalize, isTablet } from '../../utils/responsive'
import LinearGradient from 'react-native-linear-gradient'
import { CategoriesStackParamList } from '../../navigation/types'

type SubCategorieRouteParams = {
  SubCategorie: { categoryData: any }
}

type CategoriesNavigationProp = NativeStackNavigationProp<
  CategoriesStackParamList,
  'SubCategorie'
>;

const SubCategorie = () => {
  const route = useRoute<RouteProp<SubCategorieRouteParams, 'SubCategorie'>>()
  const navigation = useNavigation<CategoriesNavigationProp>()
  const { categoryData } = route.params
  const { colors } = useTheme()
  const [readingTime, setReadingTime] = useState(0)

  const mainCategoryData = categoryData

  useEffect(() => {
    if (mainCategoryData) {
      // Calculate reading time
      const wordCount = (mainCategoryData?.description1?.split(' ').length || 0) + 
                       (mainCategoryData?.description2?.split(' ').length || 0);
      setReadingTime(Math.ceil(wordCount / 200));
    }
  }, [mainCategoryData]);

  const { resourceUrls } = useAzureAssets(mainCategoryData)
  const { mainImage: mainImageUrl, video: videoUrl } = resourceUrls

  if (!mainCategoryData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
        <MaterialDesignIcons name="alert-circle" size={40} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>No data available</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <AppBarHeader title={mainCategoryData?.title || 'Subcategories'} />

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Hero Section */}
        {mainCategoryData && mainImageUrl && (
          <View style={styles.heroSection}>
            <TouchableOpacity style={styles.imageContainer} activeOpacity={0.9}>
              <CustomFastImage style={styles.mainImage} imageUrl={mainImageUrl} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.imageOverlay}
              />
              <View style={styles.heroContent}>
                <View style={styles.categoryBadge}>
                  <MaterialDesignIcons name="folder-multiple" size={normalize(16)} color="#fff" />
                  <Text style={styles.categoryText}>Category</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Content Section */}
        {mainCategoryData && (
          <View style={styles.contentWrapper}>
            <View style={styles.articleHeader}>
              <Text style={[styles.title, { color: colors.onSurface }]}>
                {mainCategoryData.title}
              </Text>
              
              {mainCategoryData.subtitle && (
                <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                  {mainCategoryData.subtitle}
                </Text>
              )}

              {/* Article Meta */}
              <View style={styles.articleMeta}>
                <View style={styles.metaItem}>
                  <MaterialDesignIcons name="clock-outline" size={normalize(16)} color={colors.onSurfaceVariant} />
                  <Text style={[styles.metaText, { color: colors.onSurfaceVariant }]}>
                    {readingTime} min read
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialDesignIcons name="eye-outline" size={normalize(16)} color={colors.onSurfaceVariant} />
                  <Text style={[styles.metaText, { color: colors.onSurfaceVariant }]}>
                    Article
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.articleContent}>
              {mainCategoryData.description1 && (
                <View style={styles.paragraphContainer}>
                  <Text style={[styles.paragraph, { color: colors.onSurface }]}>
                    {mainCategoryData.description1}
                  </Text>
                </View>
              )}

              {videoUrl && (
                <View style={styles.videoSection}>
                  <View style={styles.sectionHeader}>
                    <MaterialDesignIcons name="play-circle" size={normalize(20)} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                      Watch Video
                    </Text>
                  </View>
                  <View style={styles.videoContainer}>
                    <BlogVideo uri={videoUrl} />
                  </View>
                </View>
              )}

              {mainCategoryData.description2 && (
                <View style={styles.paragraphContainer}>
                  <Text style={[styles.paragraph, { color: colors.onSurface }]}>
                    {mainCategoryData.description2}
                  </Text>
                </View>
              )}

              {mainCategoryData.collegeFrame?.type && (
                <View style={styles.collageSection}>
                  <View style={styles.sectionHeader}>
                    <MaterialDesignIcons name="image-multiple" size={normalize(20)} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                      Gallery
                    </Text>
                  </View>
                  <CollageFrame
                    resourceUrls={resourceUrls}
                    type={mainCategoryData.collegeFrame.type}
                    title={mainCategoryData.title || 'Gallery'}
                  />
                </View>
              )}
            </View>
          </View>
        )}


      </ScrollView>
    </View>
  )
}

export default SubCategorie

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: hp(12),
  },
  heroSection: {
    position: 'relative',
  },
  imageContainer: {
    position: 'relative',
    height: hp(30),
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: hp(15),
  },
  heroContent: {
    position: 'absolute',
    bottom: wp(4),
    left: wp(4),
    right: wp(4),
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 128, 59, 0.9)',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: normalize(20),
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#fff',
    fontSize: normalize(12),
    fontWeight: '600',
    marginLeft: wp(1),
  },
  contentWrapper: {
    flex: 1,
  },
  articleHeader: {
    paddingHorizontal: wp(4),
    paddingTop: hp(3),
    paddingBottom: hp(2),
  },
  title: {
    fontSize: normalize(28),
    fontWeight: '800',
    lineHeight: normalize(36),
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: normalize(18),
    fontWeight: '500',
    lineHeight: normalize(24),
    marginBottom: hp(2),
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: normalize(14),
    fontWeight: '500',
    marginLeft: wp(1),
  },
  articleContent: {
    paddingHorizontal: wp(4),
  },
  paragraphContainer: {
    marginBottom: hp(3),
  },
  paragraph: {
    fontSize: normalize(16),
    fontWeight: '400',
    lineHeight: normalize(26),
    textAlign: 'justify',
  },
  videoSection: {
    marginVertical: hp(3),
  },
  collageSection: {
    marginVertical: hp(3),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: normalize(18),
    fontWeight: '700',
    marginLeft: wp(2),
    flex: 1,
  },
  videoContainer: {
    borderRadius: normalize(12),
    overflow: 'hidden',
  },
  relatedSection: {
    marginTop: hp(5),
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  relatedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: wp(3),
  },
  relatedTitle: {
    fontSize: normalize(18),
    fontWeight: '700',
    marginLeft: wp(2),
    flex: 1,
  },
  countBadge: {
    backgroundColor: 'rgba(248, 128, 59, 0.1)',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: normalize(12),
    marginLeft: wp(2),
  },
  countText: {
    fontSize: normalize(12),
    fontWeight: '600',
  },
  gridContent: {
    paddingTop: hp(1),
  },
  listContent: {
    paddingTop: hp(1),
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noDataWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(8),
    marginTop: hp(10),
  },
  noDataText: {
    fontSize: normalize(16),
    fontWeight: '500',
    textAlign: 'center',
    marginTop: hp(2),
  },
})
