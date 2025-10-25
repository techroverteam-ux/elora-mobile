import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, StatusBar, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomFastImage from '../../components/CustomFastImage';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

const { width: screenWidth } = Dimensions.get('window');

const ImageViewer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as any;
  
  // Handle both old format (uri) and new format (images array)
  const images = params?.images || (params?.uri ? [params.uri] : []);
  const initialIndex = params?.initialIndex || 0;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showControls, setShowControls] = useState(true);
  
  // Auto-hide controls
  useEffect(() => {
    StatusBar.setHidden(true);
    const timer = setTimeout(() => setShowControls(false), 3000);
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
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <MaterialDesignIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          
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
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
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