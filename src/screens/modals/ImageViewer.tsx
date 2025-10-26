import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, StatusBar, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomFastImage from '../../components/CustomFastImage';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useBookmarks } from '../../context/BookmarkContext';
import { useRecentlyPlayed } from '../../context/RecentlyPlayedContext';

const { width: screenWidth } = Dimensions.get('window');

const ImageViewer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as any;
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { addRecentItem } = useRecentlyPlayed();
  
  // Handle both old format (uri) and new format (images array)
  const images = params?.images || (params?.uri ? [params.uri] : []);
  const initialIndex = params?.initialIndex || 0;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showControls, setShowControls] = useState(true);
  
  // Create image item for bookmarking
  const currentImageItem = {
    _id: `image-${currentIndex}-${Date.now()}`,
    title: params?.title || `Image ${currentIndex + 1}`,
    type: 'image',
    imageUrl: images[currentIndex],
    thumbnailUrl: images[currentIndex],
    streamingUrl: images[currentIndex]
  };
  
  const isCurrentImageBookmarked = isBookmarked(currentImageItem._id);
  
  // Auto-hide controls and add to recently played
  useEffect(() => {
    StatusBar.setHidden(true);
    const timer = setTimeout(() => setShowControls(false), 3000);
    
    // Add current image to recently played
    if (currentImageItem) {
      addRecentItem(currentImageItem);
    }
    
    return () => {
      clearTimeout(timer);
      StatusBar.setHidden(false);
    };
  }, [currentIndex]);
  
  if (!images.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No image to display</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <MaterialDesignIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
  };
  
  const toggleControls = () => {
    setShowControls(!showControls);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.imageContainer} 
        onPress={toggleControls}
        activeOpacity={1}
      >
        <CustomFastImage 
          imageUrl={images[currentIndex]} 
          style={styles.image} 
          resizeMode="contain" 
        />
      </TouchableOpacity>
      
      {showControls && (
        <>
          <View style={styles.topControls}>
            <TouchableOpacity 
              style={styles.bookmarkButton} 
              onPress={() => {
                if (isCurrentImageBookmarked) {
                  removeBookmark(currentImageItem._id);
                  Alert.alert('Bookmark', 'Removed from bookmarks');
                } else {
                  addBookmark(currentImageItem);
                  Alert.alert('Bookmark', 'Added to bookmarks!');
                }
              }}
            >
              <MaterialDesignIcons 
                name={isCurrentImageBookmarked ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={isCurrentImageBookmarked ? "#F8803B" : "#fff"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
              <MaterialDesignIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {images.length > 1 && (
            <>
              <TouchableOpacity style={styles.prevButton} onPress={goToPrevious}>
                <MaterialDesignIcons name="chevron-left" size={32} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.nextButton} onPress={goToNext}>
                <MaterialDesignIcons name="chevron-right" size={32} color="#fff" />
              </TouchableOpacity>
            </>
          )}
          
          {images.length > 1 && (
            <View style={styles.counter}>
              <Text style={styles.counterText}>{currentIndex + 1} / {images.length}</Text>
            </View>
          )}
          
          {images.length > 1 && (
            <ScrollView 
              horizontal 
              style={styles.thumbnailStrip}
              contentContainerStyle={styles.thumbnailContent}
              showsHorizontalScrollIndicator={false}
            >
              {images.map((imageUrl, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.thumbnail, index === currentIndex && styles.activeThumbnail]}
                  onPress={() => setCurrentIndex(index)}
                >
                  <CustomFastImage 
                    imageUrl={imageUrl} 
                    style={styles.thumbnailImage} 
                    resizeMode="cover" 
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
};

export default ImageViewer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  bookmarkButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 8,
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 8,
  },
  prevButton: {
    position: 'absolute',
    left: 20,
    top: '50%',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 8,
  },
  nextButton: {
    position: 'absolute',
    right: 20,
    top: '50%',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 8,
  },
  counter: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 10,
  },
  counterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  thumbnailStrip: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 10,
  },
  thumbnailContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  thumbnail: {
    width: 50,
    height: 50,
    marginHorizontal: 5,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: '#F8803B',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
  },
});