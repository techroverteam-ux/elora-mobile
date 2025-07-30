import { ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import React from 'react';
import AppBarHeader from '../../components/AppBarHeader';
import { RouteProp, useRoute } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';

// Type Definitions
type BlogItem = {
  name: string;
  description: string;
  image: string;
};

type BlogPageRouteParams = {
  BlogPage: { item: BlogItem };
};

const { width } = Dimensions.get('window');

const BlogPage = () => {
  const route = useRoute<RouteProp<BlogPageRouteParams, 'BlogPage'>>();
  const { item } = route.params;

  return (
    <View style={styles.container}>
      <AppBarHeader title={item?.name || 'Blog'} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <FastImage
          style={styles.mainImage}
          source={{
            uri: item?.image,
            headers: { Authorization: 'someAuthToken' },
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.stretch}
        />

        <View style={styles.contentWrapper}>
          <Text style={styles.title}>{item?.name}</Text>
          <Text style={styles.description}>{item?.description}</Text>

          <Text style={styles.paragraph}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla
            perferendis quidem, laborum in ducimus optio, deleniti numquam a
            porro nam hic architecto ipsam vitae nemo esse cupiditate error
            nihil ipsum?
          </Text>

          <View style={styles.videoContainer}>
            <Video
              source={{ uri: 'https://www.w3schools.com/html/mov_bbb.mp4' }}
              style={styles.video}
              controls
              resizeMode="contain"
            />
          </View>

          <Text style={styles.paragraph}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla
            perferendis quidem, laborum in ducimus optio, deleniti numquam a
            porro nam hic architecto ipsam vitae nemo esse cupiditate error
            nihil ipsum?
          </Text>

          <View style={styles.imageRow}>
            {[...Array(2)].map((_, index) => (
              <FastImage
                key={index}
                style={styles.sideImage}
                source={{
                  uri: item?.image,
                  headers: { Authorization: 'someAuthToken' },
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.cover}
              />
            ))}
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
  },
  sideImage: {
    width: (width - 48) / 2, // Considering 16px padding on both sides + 16px between
    height: 200,
    borderRadius: 8,
  },
});
