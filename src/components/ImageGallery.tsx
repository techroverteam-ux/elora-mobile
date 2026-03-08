import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Dimensions, ScrollView } from 'react-native';
import { X, Download, ZoomIn, Eye } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import imageService from '../services/imageService';
import Toast from 'react-native-toast-message';

interface ImageGalleryProps {
  images: string[];
  title?: string;
  columns?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ImageGallery({ images, title, columns = 3 }: ImageGalleryProps) {
  const { theme } = useTheme();
  const [selectedImage, setSelectedImage] = useState<{ url: string; index: number } | null>(null);
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});

  const imageSize = (screenWidth - 48 - (columns - 1) * 8) / columns;

  const handleImagePress = (imageUrl: string, index: number) => {
    const fullUrl = imageService.getFullImageUrl(imageUrl);
    setSelectedImage({ url: fullUrl, index });
  };

  const handleDownload = async (imageUrl: string, filename?: string) => {
    try {
      // In a real app, you'd implement actual download functionality
      // For now, we'll show a toast
      Toast.show({
        type: 'info',
        text1: 'Download Started',
        text2: 'Image download functionality would be implemented here'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Download Failed',
        text2: 'Failed to download image'
      });
    }
  };

  const handleImageLoad = (imageUrl: string) => {
    setImageLoading(prev => ({ ...prev, [imageUrl]: false }));
  };

  const handleImageLoadStart = (imageUrl: string) => {
    setImageLoading(prev => ({ ...prev, [imageUrl]: true }));
  };

  if (!images || images.length === 0) {
    return (
      <View style={{
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border
      }}>
        <Eye size={32} color={theme.colors.textSecondary} />
        <Text style={{ color: theme.colors.textSecondary, marginTop: 8, fontSize: 14 }}>
          No images available
        </Text>
      </View>
    );
  }

  return (
    <>
      <View style={{
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.border
      }}>
        {title && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Eye size={16} color={theme.colors.primary} />
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.colors.text,
              marginLeft: 6
            }}>
              {title} ({images.length})
            </Text>
          </View>
        )}

        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8
        }}>
          {images.map((imageUrl, index) => {
            const fullUrl = imageService.getFullImageUrl(imageUrl);
            const isLoading = imageLoading[fullUrl];
            
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleImagePress(imageUrl, index)}
                style={{
                  width: imageSize,
                  height: imageSize,
                  borderRadius: 8,
                  overflow: 'hidden',
                  backgroundColor: theme.colors.background,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  position: 'relative'
                }}
              >
                <Image
                  source={{ uri: fullUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  onLoadStart={() => handleImageLoadStart(fullUrl)}
                  onLoad={() => handleImageLoad(fullUrl)}
                  onError={() => handleImageLoad(fullUrl)}
                />
                
                {isLoading && (
                  <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: theme.colors.background,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>
                      Loading...
                    </Text>
                  </View>
                )}

                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0)',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <View style={{
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderRadius: 12,
                    padding: 4,
                    opacity: 0
                  }}>
                    <ZoomIn size={16} color="#FFF" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Image Modal */}
      {selectedImage && (
        <Modal
          visible={!!selectedImage}
          animationType="fade"
          transparent
          onRequestClose={() => setSelectedImage(null)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.9)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <View style={{
              position: 'absolute',
              top: 50,
              right: 20,
              zIndex: 1,
              flexDirection: 'row',
              gap: 12
            }}>
              <TouchableOpacity
                onPress={() => handleDownload(selectedImage.url, `image_${selectedImage.index + 1}.jpg`)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: 20,
                  padding: 10
                }}
              >
                <Download size={20} color="#FFF" />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setSelectedImage(null)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: 20,
                  padding: 10
                }}
              >
                <X size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20
              }}
              maximumZoomScale={3}
              minimumZoomScale={1}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              <Image
                source={{ uri: selectedImage.url }}
                style={{
                  width: screenWidth - 40,
                  height: screenHeight - 200,
                  borderRadius: 12
                }}
                resizeMode="contain"
              />
            </ScrollView>

            <View style={{
              position: 'absolute',
              bottom: 50,
              left: 0,
              right: 0,
              alignItems: 'center'
            }}>
              <View style={{
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 8
              }}>
                <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>
                  {selectedImage.index + 1} of {images.length}
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}