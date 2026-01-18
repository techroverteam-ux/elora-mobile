import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from './CustomFastImage';
import { wp, hp, normalize } from '../utils/responsive';
import { shareContent, ShareableContent } from '../utils/deepLinkHelper';

const { width, height } = Dimensions.get('window');

const BlogImageViewer = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { images, initialIndex = 0, title = 'Images' } = (route.params as any) || {};
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showControls, setShowControls] = useState(true);

  const currentImageUrl = images?.[currentIndex];

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  if (!images || images.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.onSurface }]}>No images to display</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header Controls */}
      {showControls && (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <MaterialDesignIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.counter}>
            {currentIndex + 1} / {images.length}
          </Text>
        </View>
      )}

      {/* Image Container */}
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={toggleControls}
        activeOpacity={1}
      >
        <ScrollView
          style={styles.imageWrapper}
          contentContainerStyle={styles.imageContent}
          maximumZoomScale={3}
          minimumZoomScale={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <CustomFastImage
            imageUrl={currentImageUrl}
            style={styles.image}
            resizeMode="contain"
          />
        </ScrollView>
      </TouchableOpacity>

      {/* Navigation Controls */}
      {showControls && (
        <>
          {/* Previous Button */}
          {currentIndex > 0 && (
            <TouchableOpacity
              style={[styles.navButton, styles.prevButton]}
              onPress={goToPrevious}
            >
              <MaterialDesignIcons name="chevron-left" size={32} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Next Button */}
          {currentIndex < images.length - 1 && (
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton]}
              onPress={goToNext}
            >
              <MaterialDesignIcons name="chevron-right" size={32} color="#fff" />
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Bottom Controls */}
      {showControls && (
        <View style={styles.bottomControls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={async () => {
              if (!currentImageUrl) return;
              
              const shareableContent: ShareableContent = {
                _id: `blog-image-${currentIndex}`,
                title: title || 'Blog Image',
                type: 'image',
                imageUrl: currentImageUrl,
                streamingUrl: currentImageUrl,
                description: `Image ${currentIndex + 1} from ${title}`,
              };
              
              await shareContent(shareableContent);
            }}
          >
            <MaterialDesignIcons name="share-variant" size={24} color="#fff" />
            <Text style={styles.controlText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <MaterialDesignIcons name="heart-outline" size={24} color="#fff" />
            <Text style={styles.controlText}>Like</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS === 'ios' ? hp(6) : StatusBar.currentHeight || hp(3),
    paddingBottom: hp(2),
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: '600',
    marginHorizontal: wp(4),
  },
  counter: {
    color: '#fff',
    fontSize: normalize(14),
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    flex: 1,
    width: '100%',
  },
  imageContent: {
    width: width,
    minHeight: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: normalize(25),
    width: wp(12),
    height: wp(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevButton: {
    left: wp(5),
  },
  nextButton: {
    right: wp(5),
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: wp(10),
    paddingVertical: hp(2.5),
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  controlButton: {
    alignItems: 'center',
  },
  controlText: {
    color: '#fff',
    fontSize: normalize(12),
    marginTop: hp(0.5),
  },
  errorText: {
    fontSize: normalize(16),
    textAlign: 'center',
  },
});

export default BlogImageViewer;