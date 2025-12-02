import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from './CustomFastImage';
import { processAzureUrl } from '../utils/azureUrlHelper';
import { wp, hp, normalize } from '../utils/responsive';
import { useBookmarks } from '../context/BookmarkContext';

const { width, height } = Dimensions.get('window');

interface GalleryItem {
  _id: string;
  title: string;
  type?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  mainImage?: string;
  headerImage?: string;
  streamingUrl?: string;
  downloadUrl?: string;
}

interface ImageGalleryViewerProps {
  visible: boolean;
  images: GalleryItem[];
  initialIndex: number;
  onClose: () => void;
}

const ImageGalleryViewer: React.FC<ImageGalleryViewerProps> = ({
  visible,
  images,
  initialIndex,
  onClose,
}) => {
  const { colors } = useTheme();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showControls, setShowControls] = useState(true);
  const [rotation, setRotation] = useState(0);
  
  const scrollViewRef = useRef<ScrollView>(null);

  const currentImage = images[currentIndex];
  const imageUrl = currentImage ? (
    processAzureUrl(currentImage.streamingUrl) ||
    processAzureUrl(currentImage.imageUrl) ||
    processAzureUrl(currentImage.thumbnailUrl) ||
    processAzureUrl(currentImage.mainImage) ||
    processAzureUrl(currentImage.headerImage)
  ) : '';

  const resetZoom = () => {
    scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setRotation(0);
      resetZoom();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setRotation(0);
      resetZoom();
    }
  };

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleBookmarkToggle = () => {
    if (!currentImage) return;
    
    if (isBookmarked(currentImage._id)) {
      removeBookmark(currentImage._id);
    } else {
      // Ensure the image has the correct type when bookmarking
      const bookmarkItem = {
        ...currentImage,
        type: 'image'
      };
      addBookmark(bookmarkItem);
    }
  };



  if (!visible || !currentImage || !images || images.length === 0) {
    return null;
  }

  console.log('ImageGalleryViewer - currentIndex:', currentIndex, 'currentImage:', currentImage?.title, 'imageUrl:', imageUrl);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        
        {/* Header Controls */}
        {showControls && (
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <MaterialDesignIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {currentImage.title || 'Daily Gyan'}
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
            ref={scrollViewRef}
            style={styles.imageWrapper}
            contentContainerStyle={styles.imageContent}
            maximumZoomScale={5}
            minimumZoomScale={0.5}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            pinchGestureEnabled={true}
            scrollEnabled={true}
            bounces={true}
            bouncesZoom={true}
          >
            <CustomFastImage
              imageUrl={imageUrl}
              style={[styles.image, { transform: [{ rotate: `${rotation}deg` }] }]}
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
            <TouchableOpacity onPress={resetZoom} style={styles.controlButton}>
              <MaterialDesignIcons name="fit-to-screen" size={24} color="#fff" />
              <Text style={styles.controlText}>Fit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={rotateImage} style={styles.controlButton}>
              <MaterialDesignIcons name="rotate-right" size={24} color="#fff" />
              <Text style={styles.controlText}>Rotate</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton}>
              <MaterialDesignIcons name="share-variant" size={24} color="#fff" />
              <Text style={styles.controlText}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleBookmarkToggle} style={styles.controlButton}>
              <MaterialDesignIcons 
                name={isBookmarked(currentImage._id) ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={isBookmarked(currentImage._id) ? "#F8803B" : "#fff"} 
              />
              <Text style={styles.controlText}>Bookmark</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
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
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default ImageGalleryViewer;