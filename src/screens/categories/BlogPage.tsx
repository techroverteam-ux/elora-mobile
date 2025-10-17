import { ScrollView, StyleSheet, Text, View, Dimensions, Linking } from 'react-native';
import React from 'react';
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
  const { navigate } = useNavigation<CategoriesNavigationProp>()
  const { categoryData } = route.params;
  const { colors } = useTheme();

  const { azureData, resourceUrls } = useAzureAssets(categoryData);
  const {
    mainImage: mainImageUrl,
    video: videoUrl
  } = resourceUrls;

  const handleVideoClick = () => {
    if (!videoUrl) return;
    Linking.openURL(videoUrl).catch((err) => console.error('Failed to open URL', err));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title={categoryData?.title || 'Blog'} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Display raw collegeFrame for debugging */}
        {/* <Text style={{ color: colors.onSurface }}>{JSON.stringify(categoryData.collegeFrame, null, 2)}</Text> */}

        {/* Main Image */}
        {mainImageUrl && (
          <CustomFastImage style={styles.mainImage} imageUrl={mainImageUrl} />
        )}

        {/* Blog Content */}
        <View style={styles.contentWrapper}>
          <Text style={[styles.title, { color: colors.primary }]}>{categoryData?.title}</Text>
          <Text style={[styles.description, { color: colors.onSurface }]}>{categoryData?.subtitle}</Text>

          <Text style={[styles.paragraph, { color: colors.onSurface }]}>
            {categoryData?.description1}
          </Text>

          {/* Video Handling */}
          {/* <Text onPress={handleVideoClick} style={{ color: colors.primary }}>
            {videoUrl ? 'Watch Video' : 'Loading video...'}
          </Text> */}

          {videoUrl ? (
            <BlogVideo uri={videoUrl} />
          ) : (
            <Text style={{ color: colors.onSurfaceVariant }}>Loading video...</Text>
          )}

          <Text style={[styles.paragraph, { color: colors.onSurface }]}>
            {categoryData?.description2}
          </Text>

          {categoryData?.collegeFrame?.type && (
            <CollageFrame
              resourceUrls={resourceUrls}
              type={categoryData.collegeFrame.type}
            />
          )}

          <Text
            onPress={() => { navigate("SubCategorie", { categoryId: categoryData?._id }) }}
            style={{ color: colors.primary }}
          >
            Learn More
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default BlogPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  mainImage: {
    width: '100%',
    height: 200,
  },
  contentWrapper: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8803B',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    fontWeight: '400',
    color: '#202020',
    lineHeight: 20,
    marginVertical: 10,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  sideImage: {
    width: (WIDTH - 48) / 2,
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
});
