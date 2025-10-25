import { ScrollView, StyleSheet, Text, View, Dimensions, Linking, FlatList, TouchableOpacity, StatusBar, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import AppBarHeader from '../../components/AppBarHeader';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import BlogVideo from '../../components/BlogVideo';
import CustomFastImage from '../../components/CustomFastImage';
import { useTheme } from 'react-native-paper';
import { CategoriesStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WIDTH } from '../../utils/HelperFunctions';
import { useAzureAssets } from '../../hooks/useAzureAssets';
import CollageFrame from '../../components/CollageFrame';
import UnifiedMediaCard from '../../components/UnifiedMediaCard';
import ViewToggle from '../../components/ViewToggle';
import { useGetSubcategoriesMutation } from '../../data/redux/services/sectionsApi';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { wp, hp, normalize, isTablet } from '../../utils/responsive';
import LinearGradient from 'react-native-linear-gradient';

type BlogItem = {
  _id: string;
  title: string;
  subtitle: string;
  description1: string;
  description2: string;
  mainImage: string;
  video: string;
  collegeFrame: {
    type: number;
    files: string[];
  };
};

type BlogPageRouteParams = {
  BlogPage: { categoryData: BlogItem };
};

const BlogPage = () => {
  const route = useRoute<RouteProp<BlogPageRouteParams, 'BlogPage'>>();
  type CategoriesNavigationProp = NativeStackNavigationProp<
    CategoriesStackParamList,
    'CategoriesMain'
  >;
  const { navigate } = useNavigation<CategoriesNavigationProp>();
  const { categoryData } = route.params;
  const { colors } = useTheme();
  const [isGridView, setIsGridView] = useState(true);
  const [readingTime, setReadingTime] = useState(0);

  const { azureData, resourceUrls } = useAzureAssets(categoryData);
  const {
    mainImage: mainImageUrl,
    video: videoUrl
  } = resourceUrls;

  const [getSubcategoriesRequest, { data: subcategoriesData, error: subcategoriesError, isLoading: subcategoriesLoading }] = useGetSubcategoriesMutation();

  useEffect(() => {
    if (categoryData?._id) {
      console.log('BlogPage - Fetching subcategories for category:', categoryData._id);
      getSubcategoriesRequest(categoryData._id);
    }
    
    // Calculate reading time
    const wordCount = (categoryData?.description1?.split(' ').length || 0) + 
                     (categoryData?.description2?.split(' ').length || 0);
    setReadingTime(Math.ceil(wordCount / 200)); // Average reading speed
  }, [categoryData?._id, getSubcategoriesRequest]);

  const handleVideoClick = () => {
    if (!videoUrl) return;
    Linking.openURL(videoUrl).catch((err) => console.error('Failed to open URL', err));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <AppBarHeader title={categoryData?.title || 'Blog'} />

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {mainImageUrl && (
            <TouchableOpacity 
              style={styles.imageContainer}
              onPress={() => {
                try {
                  // Get all images from the blog post
                  const allImages = [mainImageUrl];
                  // Add collage images if they exist
                  const collageImages = Object.entries(resourceUrls)
                    .filter(([key]) => key.startsWith('collegeFrame'))
                    .sort((a, b) => {
                      const aIndex = parseInt(a[0].replace('collegeFrame', ''), 10);
                      const bIndex = parseInt(b[0].replace('collegeFrame', ''), 10);
                      return aIndex - bIndex;
                    })
                    .map(([, url]) => url);
                  allImages.push(...collageImages);
                  
                  console.log('BlogPage - Navigating to ImageViewer with:', {
                    images: allImages,
                    initialIndex: 0,
                    title: categoryData?.title || 'Blog Images',
                  });
                  
                  navigate('ImageViewer', {
                    images: allImages,
                    initialIndex: 0,
                    title: categoryData?.title || 'Blog Images',
                  });
                } catch (error) {
                  console.error('BlogPage - Error navigating to ImageViewer:', error);
                }
              }}
              activeOpacity={0.9}
            >
              <CustomFastImage style={styles.mainImage} imageUrl={mainImageUrl} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.imageOverlay}
              />
              <View style={styles.heroContent}>
                <View style={styles.categoryBadge}>
                  <MaterialDesignIcons name="book-open-variant" size={normalize(16)} color="#fff" />
                  <Text style={styles.categoryText}>Article</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.contentWrapper}>
          {/* Article Header */}
          <View style={styles.articleHeader}>
            <Text style={[styles.title, { color: colors.onSurface }]}>
              {categoryData?.title}
            </Text>
            
            {categoryData?.subtitle && (
              <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                {categoryData.subtitle}
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

          {/* Article Content */}
          <View style={styles.articleContent}>
            {categoryData?.description1 && (
              <View style={styles.paragraphContainer}>
                <Text style={[styles.paragraph, { color: colors.onSurface }]}>
                  {categoryData.description1}
                </Text>
              </View>
            )}

            {/* Video Section */}
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

            {categoryData?.description2 && (
              <View style={styles.paragraphContainer}>
                <Text style={[styles.paragraph, { color: colors.onSurface }]}>
                  {categoryData.description2}
                </Text>
              </View>
            )}

            {/* Collage Frame */}
            {categoryData?.collegeFrame?.type && (
              <View style={styles.collageSection}>
                <View style={styles.sectionHeader}>
                  <MaterialDesignIcons name="image-multiple" size={normalize(20)} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                    Gallery
                  </Text>
                </View>
                <CollageFrame
                  resourceUrls={resourceUrls}
                  type={categoryData.collegeFrame.type}
                  title={categoryData?.title || 'Gallery'}
                />
              </View>
            )}
          </View>

          {/* Related Content Section */}
          {subcategoriesData?.data && subcategoriesData.data.length > 0 && (
            <View style={styles.relatedSection}>
              <View style={styles.relatedHeader}>
                <View style={styles.titleSection}>
                  <MaterialDesignIcons name="bookmark-multiple" size={normalize(20)} color={colors.primary} />
                  <Text style={[styles.relatedTitle, { color: colors.onSurface }]}>
                    Related Content
                  </Text>
                  <View style={styles.countBadge}>
                    <Text style={[styles.countText, { color: colors.primary }]}>
                      {subcategoriesData.data.length}
                    </Text>
                  </View>
                </View>
                <ViewToggle isGridView={isGridView} onToggle={setIsGridView} />
              </View>
              
              <FlatList
                data={subcategoriesData.data}
                numColumns={isGridView ? (isTablet() ? 3 : 2) : 1}
                key={isGridView ? 'grid' : 'list'}
                keyExtractor={(item, index) => item._id || index.toString()}
                renderItem={({ item }) => (
                  <UnifiedMediaCard
                    item={item}
                    type="pdf"
                    isGridView={isGridView}
                    onPress={(subItem) => navigate('SubCategorie', { 
                      categoryData: subItem
                    })}
                  />
                )}
                contentContainerStyle={isGridView ? styles.gridContent : styles.listContent}
                columnWrapperStyle={isGridView ? styles.row : undefined}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default BlogPage;

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
});