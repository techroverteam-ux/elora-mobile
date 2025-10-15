import { ScrollView, StyleSheet, Text, View, Dimensions, Linking } from 'react-native';
import React from 'react';
import AppBarHeader from '../../components/AppBarHeader';
import { RouteProp, useRoute } from '@react-navigation/native';
import BlogVideo from '../../components/BlogVideo';
import CustomFastImage from '../../components/CustomFastImage';
import { useTheme } from 'react-native-paper';
import { useAzureBlobImages } from '../../hooks/useAzureBlobImage';

type BlogItem = {
  title: string;
  subtitle: string;
  description1: string;
  description2: string;
  mainImage: string;
  video: string;
  collegeFrame: {
    files: string[];
  };
};

type BlogPageRouteParams = {
  BlogPage: { item: BlogItem };
};

const { width } = Dimensions.get('window');

const BlogPage = () => {
  const route = useRoute<RouteProp<BlogPageRouteParams, 'BlogPage'>>();
  const { item } = route.params;
  const { colors } = useTheme();

  // Create the blob URLs object
  const blobUrls = {
    mainImage: item?.mainImage,
    video: item?.video,
    collageOne: item?.collegeFrame?.files[0],
    collageTwo: item?.collegeFrame?.files[1],
  };

  // Fetch all the image data from the blob URLs
  const azureData = useAzureBlobImages(blobUrls);

  // Destructure imageUrl from the data
  const { mainImage, video, collageOne, collageTwo } = azureData;

  // Use safe checks to ensure data is available
  const mainImageUrl = mainImage?.imageUrl;
  const videoUrl = video?.imageUrl;
  const collageOneUrl = collageOne?.imageUrl;
  const collageTwoUrl = collageTwo?.imageUrl;

  const handleVideoClick = () => {
    if (!videoUrl) return;
    Linking.openURL(videoUrl).catch((err) => console.error('Failed to open URL', err));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title={item?.title || 'Blog'} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Display raw collegeFrame for debugging */}
        <Text style={{ color: colors.onSurface }}>{JSON.stringify(item.collegeFrame, null, 2)}</Text>

        {/* Main Image */}
        {mainImageUrl && (
          <CustomFastImage style={styles.mainImage} imageUrl={mainImageUrl} />
        )}

        {/* Blog Content */}
        <View style={styles.contentWrapper}>
          <Text style={[styles.title, { color: colors.primary }]}>{item?.title}</Text>
          <Text style={[styles.description, { color: colors.onSurface }]}>{item?.subtitle}</Text>

          <Text style={[styles.paragraph, { color: colors.onSurface }]}>
            {item?.description1}
          </Text>

          {/* Video Handling */}
          <Text onPress={handleVideoClick} style={{ color: colors.primary }}>
            {videoUrl ? 'Watch Video' : 'Loading video...'}
          </Text>

          {videoUrl ? (
            <BlogVideo uri={videoUrl} />
          ) : (
            <Text style={{ color: colors.onSurfaceVariant }}>Loading video...</Text>
          )}

          <Text style={[styles.paragraph, { color: colors.onSurface }]}>
            {item?.description2}
          </Text>

          {/* Collage Images */}
          <View style={styles.imageRow}>
            {collageOneUrl && (
              <CustomFastImage style={styles.sideImage} imageUrl={collageOneUrl} />
            )}
            {collageTwoUrl && (
              <CustomFastImage style={styles.sideImage} imageUrl={collageTwoUrl} />
            )}
          </View>
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
    width: (width - 48) / 2,
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
});
