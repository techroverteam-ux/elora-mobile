import React from 'react';
import { View, StyleSheet, ViewStyle, ImageStyle, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomFastImage from './CustomFastImage';
import { WIDTH } from '../utils/HelperFunctions';
import { ResourceUrls } from '../hooks/useAzureAssets';

type CollageFrameProps = {
  resourceUrls: ResourceUrls;
  type: number;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  title?: string;
};

const CollageFrame: React.FC<CollageFrameProps> = ({
  resourceUrls,
  type,
  containerStyle,
  imageStyle,
  title = 'Gallery',
}) => {
  const navigation = useNavigation();
  // Filter and sort collegeFrame URLs
  const collageImages = Object.entries(resourceUrls)
    .filter(([key]) => key.startsWith('collegeFrame'))
    .sort((a, b) => {
      const aIndex = parseInt(a[0].replace('collegeFrame', ''), 10);
      const bIndex = parseInt(b[0].replace('collegeFrame', ''), 10);
      return aIndex - bIndex;
    })
    .slice(0, type); // Take only the required number of images

  if (collageImages.length === 0) return null;

  const handleImagePress = (index: number) => {
    try {
      const imageUrls = collageImages.map(([, url]) => url);
      console.log('CollageFrame - Navigating to ImageViewer with:', {
        images: imageUrls,
        initialIndex: index,
        title: title,
      });
      (navigation as any).navigate('ImageViewer', {
        images: imageUrls,
        initialIndex: index,
        title: title,
      });
    } catch (error) {
      console.error('CollageFrame - Error navigating to ImageViewer:', error);
    }
  };

  return (
    <View style={[styles.imageRow, containerStyle]}>
      {collageImages.map(([key, url], index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleImagePress(index)}
          activeOpacity={0.8}
        >
          <CustomFastImage
            imageUrl={url}
            style={[styles.sideImage, imageStyle]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default CollageFrame;

const styles = StyleSheet.create({
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  sideImage: {
    width: (WIDTH - 48) / 2,
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
});
