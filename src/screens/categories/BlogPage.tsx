import { ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import React from 'react';
import AppBarHeader from '../../components/AppBarHeader';
import { RouteProp, useRoute } from '@react-navigation/native';
import VideoPlayer from '../../components/VideoPlayer';
import CustomFastImage from '../../components/CustomFastImage';
import { useTheme } from 'react-native-paper';
import BlogVideo from '../../components/BlogVideo';
import { useAzureBlobImage } from '../../hooks/useAzureBlobImage';

// Type Definitions
type BlogItem = {
  title: string;
  subtitle: string;
  description1: string;
  description2: string;
  mainImage: string;
  video: string;
  collegeFrame: {
    files: string[];
  }
};

type BlogPageRouteParams = {
  BlogPage: { item: BlogItem };
};

const { width } = Dimensions.get('window');

const BlogPage = () => {
  const route = useRoute<RouteProp<BlogPageRouteParams, 'BlogPage'>>();
  const { item } = route.params;
  const { colors } = useTheme();

  // --- Fetch Azure Blob image and video URLs
  const { imageUrl: mainImageUrl } = useAzureBlobImage(item?.mainImage);
  const { imageUrl: videoUrl } = useAzureBlobImage(item?.video);
  const { imageUrl: collageOne } = useAzureBlobImage(item?.collegeFrame?.files[0]);
  const { imageUrl: collageTwo } = useAzureBlobImage(item?.collegeFrame?.files[0]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title={item?.title || 'Blog'} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text>{JSON.stringify(item.collegeFrame, null, 2)}</Text>

        {mainImageUrl && (
          <CustomFastImage style={styles.mainImage} imageUrl={mainImageUrl} />
        )}

        <View style={styles.contentWrapper}>
          <Text style={[styles.title, { color: colors.primary }]}>{item?.title}</Text>
          <Text style={[styles.description, { color: colors.onSurface }]}>{item?.subtitle}</Text>

          <Text style={[styles.paragraph, { color: colors.onSurface }]}>
            {item?.description1}
            {/* Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla
            perferendis quidem, laborum in ducimus optio, deleniti numquam a
            porro nam hic architecto ipsam vitae nemo esse cupiditate error
            nihil ipsum? */}
          </Text>

          {/* <VideoPlayer
            videoUri='https://www.w3schools.com/html/mov_bbb.mp4'
            containerStyle={styles.videoContainer}
          /> */}

          {videoUrl ? (
            <BlogVideo uri={videoUrl} />
          ) : (
            <Text style={{ color: colors.onSurfaceVariant }}>Loading video...</Text>
          )}

          <Text style={[styles.paragraph, { color: colors.onSurface }]}>
            {item?.description2}
            {/* Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla
            perferendis quidem, laborum in ducimus optio, deleniti numquam a
            porro nam hic architecto ipsam vitae nemo esse cupiditate error
            nihil ipsum? */}
          </Text>

          <View style={styles.imageRow}>
            {collageOne && (
              <CustomFastImage
                style={styles.sideImage}
                imageUrl={collageOne}
              />
            )}
            {collageTwo && (
              <CustomFastImage
                style={styles.sideImage}
                imageUrl={collageTwo}
              />
            )}
            {collageTwo && (
              <CustomFastImage
                style={[styles.sideImage, { width: "100%" }]}
                imageUrl={collageTwo}
              />
            )}
            {collageTwo && (
              <CustomFastImage
                style={[styles.sideImage]}
                imageUrl={collageTwo}
              />
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
  videoContainer: {
    marginVertical: 20,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  sideImage: {
    width: (width - 48) / 2, // Considering 16px padding on both sides + 16px between
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
});
