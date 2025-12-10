import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from './CustomFastImage';
import EnhancedVideoPlayer from './EnhancedVideoPlayer';
import PdfViewer from './PdfViewer';
import { useNavigation } from '@react-navigation/native';
import { processAzureUrl } from '../utils/azureUrlHelper';

const { width } = Dimensions.get('window');

interface ContentField {
  type: 'header' | 'description' | 'image' | 'video' | 'pdf';
  content: string;
  level?: number;
  azureFiles?: string[];
  order?: number;
}

interface BlogCategory {
  _id: string;
  title: string;
  subtitle?: string;
  description1?: string;
  description2?: string;
  headerImage?: string;
  mainImage?: string;
  contentFields: ContentField[];
  isBlogLayout?: boolean;
  layoutType?: string;
  sectionLayout?: string;
}

interface BlogLayoutRendererProps {
  category: BlogCategory;
}

const BlogLayoutRenderer: React.FC<BlogLayoutRendererProps> = ({ category }) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  // Helper to convert Azure URLs to proxy URLs
  const getProxyUrl = (url: string) => {
    if (!url) return '';
    // Use the centralized Azure URL helper
    return processAzureUrl(url);
  };
  
  // Determine blog layout type based on API response
  const getBlogLayoutType = () => {
    // First check if API explicitly set layout type
    if (category.layoutType === 'content-only' || category.sectionLayout === 'content-only') {
      return 'content-only';
    }
    
    // Fallback to image-based detection for backward compatibility
    const hasHeaderImage = !!category.headerImage;
    const hasMainImage = !!category.mainImage;
    const hasContentFields = category.contentFields && category.contentFields.length > 0;
    const hasMedia = hasHeaderImage || hasMainImage;
    
    if (hasMedia && hasContentFields) return 'interactive'; // ⚡ Interactive - Dynamic content
    if (hasHeaderImage && hasMainImage) return 'rich-media'; // 🎨 Rich Media - Full multimedia  
    if (hasMedia) return 'with-images'; // 🖼️ With Images - Text + Images
    return 'content-only'; // 📝 Content Only - Text only
  };

  const layoutType = getBlogLayoutType();

  const renderContentField = (field: ContentField, index: number) => {
    switch (field.type) {
      case 'header':
        const headerLevel = field.level || 1;
        return (
          <Text 
            key={index} 
            style={[
              styles.header,
              headerLevel === 1 && styles.h1,
              headerLevel === 2 && styles.h2,
              headerLevel === 3 && styles.h3,
            ]}
          >
            {field.content}
          </Text>
        );
      
      case 'description':
        return (
          <Text key={index} style={styles.description}>
            {field.content}
          </Text>
        );
      
      case 'image':
        if (field.azureFiles && field.azureFiles.length > 0) {
          if (field.azureFiles.length === 1) {
            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  (navigation as any).navigate('ImageViewer', {
                    images: field.azureFiles,
                    initialIndex: 0,
                    title: field.content || 'Image'
                  });
                }}
              >
                <CustomFastImage
                  imageUrl={getProxyUrl(field.azureFiles[0])}
                  style={styles.contentImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            );
          } else {
            return (
              <View key={index} style={styles.netflixGallery}>
                <Text style={styles.netflixTitle}>{field.content || 'Image Gallery'}</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.netflixCarousel}
                  contentContainerStyle={styles.netflixContent}
                >
                  {field.azureFiles.map((imageUrl, imgIndex) => (
                    <TouchableOpacity
                      key={imgIndex}
                      style={styles.netflixItem}
                      onPress={() => {
                        (navigation as any).navigate('ImageViewer', {
                          images: field.azureFiles,
                          initialIndex: imgIndex,
                          title: field.content || 'Gallery'
                        });
                      }}
                    >
                      <CustomFastImage
                        imageUrl={getProxyUrl(imageUrl)}
                        style={styles.netflixImage}
                        resizeMode="cover"
                      />
                      <View style={styles.netflixOverlay}>
                        <Text style={styles.netflixIndex}>{imgIndex + 1}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            );
          }
        }
        return null;
      
      case 'video':
        if (field.azureFiles && field.azureFiles.length > 0) {
          return (
            <View key={index} style={styles.videoContainer}>
              <Text style={styles.mediaTitle}>🎥 Video Content</Text>
              {field.azureFiles.map((videoUrl, vidIndex) => {
                const processedUrl = getProxyUrl(videoUrl);
                return (
                  <TouchableOpacity 
                    key={vidIndex} 
                    style={styles.videoWrapper}
                    activeOpacity={0.9}
                    onPress={() => {
                      (navigation as any).navigate('EnhancedVideoPlayer', {
                        item: {
                          _id: `video-${index}-${vidIndex}`,
                          title: field.content || `Video ${vidIndex + 1}`,
                          videoUrl: processedUrl,
                          streamingUrl: processedUrl,
                          thumbnailUrl: processedUrl,
                          type: 'video'
                        },
                        playlist: []
                      });
                    }}
                  >
                    <CustomFastImage
                      imageUrl={processedUrl}
                      style={styles.videoThumbnail}
                      resizeMode="cover"
                    />
                    <View style={styles.videoOverlay}>
                      <View style={styles.playButtonContainer}>
                        <MaterialDesignIcons name="play-circle" size={72} color="rgba(255,255,255,0.95)" />
                      </View>
                      <View style={styles.videoTextOverlay}>
                        <Text style={styles.videoOverlayText} numberOfLines={2}>
                          {field.content || `Video ${vidIndex + 1}`}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        }
        return null;
      
      case 'pdf':
        if (field.azureFiles && field.azureFiles.length > 0) {
          return (
            <View key={index} style={styles.pdfContainer}>
              <Text style={styles.mediaTitle}>📄 PDF Documents</Text>
              {field.azureFiles.map((pdfUrl, pdfIndex) => {
                const processedUrl = getProxyUrl(pdfUrl);
                return (
                  <TouchableOpacity 
                    key={pdfIndex} 
                    style={styles.pdfItem}
                    onPress={() => {
                      (navigation as any).navigate('PdfViewer', {
                        uri: processedUrl,
                        title: field.content || `Document ${pdfIndex + 1}`,
                        item: {
                          _id: `pdf-${index}-${pdfIndex}`,
                          title: field.content || `Document ${pdfIndex + 1}`,
                          pdfUrl: processedUrl,
                          streamingUrl: processedUrl,
                          type: 'pdf'
                        }
                      });
                    }}
                  >
                    <MaterialDesignIcons name="file-pdf-box" size={24} color="#ef4444" style={{ marginRight: 8 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pdfText}>{field.content || `Document ${pdfIndex + 1}`}</Text>
                      <Text style={styles.pdfAction}>Tap to open PDF</Text>
                    </View>
                    <MaterialDesignIcons name="chevron-right" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        }
        return null;
      
      default:
        return null;
    }
  };

  const styles = createStyles(colors);
  
  const renderBlogLayout = () => {
    switch (layoutType) {
      case 'interactive': // ⚡ Interactive - Dynamic content with engagement elements
        return (
          <>
            {category.headerImage && (
              <View style={styles.interactiveHeader}>
                <CustomFastImage source={{ uri: category.headerImage }} style={styles.headerImage} resizeMode="cover" />
                <View style={styles.interactiveOverlay}>
                  <View style={styles.interactiveBadge}>
                    <Text style={styles.badgeText}>⚡ Interactive</Text>
                  </View>
                </View>
              </View>
            )}
            <View style={[styles.contentContainer, styles.interactiveContainer]}>
              <Text style={[styles.title, styles.interactiveTitle]}>{category.title}</Text>
              {category.subtitle && <Text style={[styles.subtitle, styles.interactiveSubtitle]}>{category.subtitle}</Text>}
              
              {/* Progress indicator */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={styles.progressFill} />
                </View>
                <Text style={styles.progressText}>Reading Progress</Text>
              </View>
              
              {category.description1 && <Text style={styles.description}>{category.description1}</Text>}
              
              {category.mainImage && (
                <View style={styles.interactiveImageContainer}>
                  <CustomFastImage source={{ uri: category.mainImage }} style={styles.mainImage} resizeMode="cover" />
                  <View style={styles.imageInteraction}>
                    <Text style={styles.interactionHint}>Tap to explore</Text>
                  </View>
                </View>
              )}
              
              {category.contentFields
                ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                ?.map((field, index) => (
                  <View key={index} style={styles.interactiveField}>
                    {renderContentField(field, index)}
                    <View style={styles.engagementButtons}>
                      <View style={styles.engagementButton}>
                        <Text style={styles.engagementText}>💡</Text>
                      </View>
                      <View style={styles.engagementButton}>
                        <Text style={styles.engagementText}>❤️</Text>
                      </View>
                    </View>
                  </View>
                ))}
              
              {category.description2 && <Text style={styles.description}>{category.description2}</Text>}
            </View>
          </>
        );
        
      case 'rich-media': // 🎨 Rich Media - Dynamic layout based on content count
        const contentCount = category.contentFields?.length || 0;
        const gridColumns = contentCount <= 2 ? 1 : contentCount <= 4 ? 2 : contentCount <= 6 ? 2 : 3;
        
        return (
          <>
            {category.headerImage && (
              <View style={styles.richMediaHeader}>
                <CustomFastImage imageUrl={getProxyUrl(category.headerImage)} style={styles.headerImage} resizeMode="cover" />
                <View style={styles.richMediaOverlay}>
                  <View style={styles.richMediaBadge}>
                    <Text style={styles.badgeText}>🎨 Rich Media ({contentCount} items)</Text>
                  </View>
                </View>
              </View>
            )}
            <View style={[styles.contentContainer, styles.richMediaContainer]}>
              <Text style={[styles.title, styles.richMediaTitle]}>{category.title}</Text>
              {category.subtitle && <Text style={[styles.subtitle, styles.richMediaSubtitle]}>{category.subtitle}</Text>}
              
              {category.description1 && <Text style={styles.description}>{category.description1}</Text>}
              
              {/* Dynamic grid layout */}
              <View style={[styles.dynamicGrid, { flexDirection: gridColumns === 1 ? 'column' : 'row', flexWrap: 'wrap' }]}>
                {category.contentFields
                  ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                  ?.map((field, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.gridItem,
                        { width: gridColumns === 1 ? '100%' : gridColumns === 2 ? '48%' : '31%' }
                      ]}
                    >
                      {renderContentField(field, index)}
                    </View>
                  ))}
              </View>
              
              {category.description2 && <Text style={styles.description}>{category.description2}</Text>}
            </View>
          </>
        );
        
      case 'with-images': // 🖼️ With Images - Text + Images in elegant layout
        return (
          <>
            {(category.headerImage || category.mainImage) && (
              <View style={styles.imageHeader}>
                <CustomFastImage 
                  source={{ uri: category.headerImage || category.mainImage }} 
                  style={styles.headerImage} 
                  resizeMode="cover" 
                />
                <View style={styles.imageOverlay}>
                  <View style={styles.imageBadge}>
                    <Text style={styles.badgeText}>🖼️ Visual Story</Text>
                  </View>
                </View>
              </View>
            )}
            <View style={[styles.contentContainer, styles.imageContainer]}>
              <Text style={[styles.title, styles.imageTitle]}>{category.title}</Text>
              {category.subtitle && <Text style={[styles.subtitle, styles.imageSubtitle]}>{category.subtitle}</Text>}
              
              {/* Image-text alternating layout */}
              <View style={styles.imageTextLayout}>
                {category.description1 && (
                  <View style={styles.textBlock}>
                    <Text style={styles.description}>{category.description1}</Text>
                  </View>
                )}
                
                {category.mainImage && category.headerImage && (
                  <View style={styles.secondaryImageContainer}>
                    <CustomFastImage source={{ uri: category.mainImage }} style={styles.secondaryImage} resizeMode="cover" />
                    <Text style={styles.imageCaption}>Visual insight</Text>
                  </View>
                )}
                
                {category.contentFields
                  ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                  ?.map((field, index) => (
                    <View key={index} style={styles.imageContentField}>
                      {renderContentField(field, index)}
                    </View>
                  ))}
                
                {category.description2 && (
                  <View style={styles.textBlock}>
                    <Text style={styles.description}>{category.description2}</Text>
                  </View>
                )}
              </View>
            </View>
          </>
        );
        
      case 'content-only': // 📝 Content Only - Clean, focused text
      default:
        return (
          <View style={[styles.contentContainer, styles.contentOnlyContainer]}>
            <View style={styles.contentHeader}>
              <View style={styles.contentBadge}>
                <Text style={styles.badgeText}>📝 Pure Content</Text>
              </View>
            </View>
            <Text style={[styles.title, styles.contentOnlyTitle]}>{category.title}</Text>
            {category.subtitle && <Text style={[styles.subtitle, styles.contentOnlySubtitle]}>{category.subtitle}</Text>}
            
            {/* Reading time estimate */}
            <View style={styles.readingInfo}>
              <Text style={styles.readingTime}>⏱️ 3 min read</Text>
              <Text style={styles.contentType}>Article</Text>
            </View>
            
            {category.description1 && <Text style={styles.description}>{category.description1}</Text>}
            
            <View style={styles.contentFields}>
              {category.contentFields
                ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                ?.map((field, index) => (
                  <View key={index} style={styles.contentField}>
                    {renderContentField(field, index)}
                  </View>
                ))}
            </View>
            
            {category.description2 && <Text style={styles.description}>{category.description2}</Text>}
          </View>
        );
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderBlogLayout()}
    </ScrollView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerImage: {
    width: width,
    height: 220,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginBottom: 8,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    marginBottom: 16,
    lineHeight: 24,
  },
  mainImage: {
    width: width - 32,
    height: 200,
    marginVertical: 16,
    borderRadius: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.onSurface,
    marginBottom: 16,
  },
  header: {
    fontWeight: 'bold',
    color: colors.onSurface,
    marginTop: 20,
    marginBottom: 12,
  },
  h1: { fontSize: 24 },
  h2: { fontSize: 22 },
  h3: { fontSize: 20 },
  contentImage: {
    width: width - 32,
    height: 180,
    marginVertical: 12,
    borderRadius: 8,
  },
  netflixGallery: {
    marginVertical: 20,
    backgroundColor: '#141414',
    paddingVertical: 20,
    marginHorizontal: -16,
  },
  netflixTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    marginLeft: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  netflixCarousel: {
    paddingLeft: 16,
  },
  netflixContent: {
    paddingRight: 16,
  },
  netflixItem: {
    marginRight: 12,
    position: 'relative',
  },
  netflixImage: {
    width: 160,
    height: 240,
    borderRadius: 8,
  },
  netflixOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  netflixIndex: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  videoContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  mediaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  videoWrapper: {
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  videoThumbnail: {
    width: width - 32,
    height: 220,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonContainer: {
    backgroundColor: 'rgba(248,128,59,0.9)',
    borderRadius: 50,
    padding: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  videoTextOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
  },
  videoOverlayText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  pdfContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  pdfItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pdfText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  pdfAction: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  
  // Interactive Layout Styles
  interactiveHeader: {
    position: 'relative',
  },
  interactiveOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  interactiveBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  interactiveContainer: {
    paddingTop: 24,
  },
  interactiveTitle: {
    color: '#8b5cf6',
  },
  interactiveSubtitle: {
    color: '#7c3aed',
  },
  progressContainer: {
    marginVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '30%',
    backgroundColor: '#8b5cf6',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  interactiveImageContainer: {
    position: 'relative',
    marginVertical: 16,
  },
  imageInteraction: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interactionHint: {
    color: '#fff',
    fontSize: 10,
  },
  interactiveField: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary || '#8b5cf6',
  },
  engagementButtons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  engagementButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  engagementText: {
    fontSize: 14,
  },
  
  // Rich Media Layout Styles
  richMediaHeader: {
    position: 'relative',
  },
  richMediaOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  richMediaBadge: {
    backgroundColor: 'rgba(248, 128, 59, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  richMediaContainer: {
    paddingTop: 24,
  },
  richMediaTitle: {
    color: '#F8803B',
  },
  richMediaSubtitle: {
    color: '#ea580c',
  },
  dynamicGrid: {
    marginVertical: 16,
    justifyContent: 'space-between',
  },
  gridItem: {
    marginBottom: 16,
  },
  mediaGallery: {
    marginVertical: 20,
  },
  featuredMedia: {
    position: 'relative',
    marginBottom: 12,
  },
  galleryMainImage: {
    width: width - 32,
    height: 180,
    borderRadius: 12,
  },
  mediaLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(248, 128, 59, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mediaLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  mediaGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  mediaPlaceholder: {
    flex: 1,
    height: 80,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 24,
  },
  
  // With Images Layout Styles
  imageHeader: {
    position: 'relative',
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  imageBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  imageContainer: {
    paddingTop: 24,
  },
  imageTitle: {
    color: '#22c55e',
  },
  imageSubtitle: {
    color: '#16a34a',
  },
  imageTextLayout: {
    marginTop: 16,
  },
  textBlock: {
    marginVertical: 12,
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary || '#22c55e',
  },
  secondaryImageContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  secondaryImage: {
    width: width - 64,
    height: 160,
    borderRadius: 12,
  },
  imageCaption: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  imageContentField: {
    marginVertical: 8,
  },
  
  // Content Only Layout Styles
  contentOnlyContainer: {
    paddingTop: 16,
  },
  contentHeader: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  contentBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  contentOnlyTitle: {
    color: '#3b82f6',
    marginTop: 8,
  },
  contentOnlySubtitle: {
    color: '#2563eb',
  },
  readingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  readingTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  contentType: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  contentFields: {
    marginVertical: 16,
  },
  contentField: {
    marginVertical: 8,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary || '#3b82f6',
  },
});

export default BlogLayoutRenderer;