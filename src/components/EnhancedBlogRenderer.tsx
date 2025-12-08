import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from './CustomFastImage';
import EnhancedVideoPlayer from './EnhancedVideoPlayer';
import PdfViewer from './PdfViewer';
import { useNavigation } from '@react-navigation/native';
import { wp, hp, normalize, isTablet } from '../utils/responsive';
import { AppColors, AppTypography, AppSpacing } from '../theme/colors';
import { useThemeContext } from '../context/ThemeContext';
import { processAzureUrl } from '../utils/azureUrlHelper';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ContentField {
  id: string;
  type: 'header' | 'description' | 'image' | 'video' | 'pdf';
  content: string;
  order: number;
  azureFiles?: string[];
  _id: string;
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
  layoutType?: string;
}

interface EnhancedBlogRendererProps {
  category: BlogCategory;
  onBack?: () => void;
}

const EnhancedBlogRenderer: React.FC<EnhancedBlogRendererProps> = ({
  category,
  onBack,
}) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  
  const [readingProgress, setReadingProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  
  // Sort content fields by order
  const sortedContentFields = category.contentFields
    ?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

  // Calculate reading time estimate
  const estimateReadingTime = () => {
    const wordsPerMinute = 200;
    const totalWords = [
      category.title,
      category.subtitle,
      category.description1,
      category.description2,
      ...sortedContentFields.map(field => field.content)
    ].join(' ').split(' ').length;
    
    return Math.max(1, Math.ceil(totalWords / wordsPerMinute));
  };

  const readingTime = estimateReadingTime();

  // Handle scroll events for progress tracking
  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollPercent = contentOffset.y / (contentSize.height - layoutMeasurement.height);
    const clampedPercent = Math.max(0, Math.min(1, scrollPercent));
    
    setReadingProgress(clampedPercent);
    
    // Animate progress bar
    Animated.timing(progressWidth, {
      toValue: clampedPercent * SCREEN_WIDTH,
      duration: 100,
      useNativeDriver: false,
    }).start();

    // Header visibility based on scroll
    const shouldShowHeader = contentOffset.y < 100;
    if (shouldShowHeader !== isHeaderVisible) {
      setIsHeaderVisible(shouldShowHeader);
      Animated.timing(headerOpacity, {
        toValue: shouldShowHeader ? 1 : 0.9,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  // Render content field based on type
  const renderContentField = (field: ContentField, index: number) => {
    const fieldStyles = getFieldStyles(isDark);
    
    switch (field.type) {
      case 'header':
        return (
          <Animated.View
            key={field.id}
            style={[
              fieldStyles.headerContainer,
              { opacity: headerOpacity }
            ]}
          >
            <View style={fieldStyles.headerDecoration} />
            <Text style={[fieldStyles.headerText, { color: isDark ? '#fff' : colors.onSurface }]}>
              {field.content}
            </Text>
          </Animated.View>
        );

      case 'description':
        return (
          <View key={field.id} style={fieldStyles.descriptionContainer}>
            <Text style={[fieldStyles.descriptionText, { color: isDark ? '#e0e0e0' : colors.onSurface }]}>
              {field.content}
            </Text>
          </View>
        );

      case 'image':
        return renderImageField(field, index);

      case 'video':
        return renderVideoField(field, index);

      case 'pdf':
        return renderPdfField(field, index);

      default:
        return null;
    }
  };

  // Process Azure files using the same method as Daily Gyan Gallery
  const processAzureFiles = (field: ContentField) => {
    if (!field.azureFiles || field.azureFiles.length === 0) return [];
    return field.azureFiles.map(url => processAzureUrl(url)).filter(Boolean);
  };

  // Render image field with enhanced UI
  const renderImageField = (field: ContentField, index: number) => {
    const processedUrls = processAzureFiles(field);
    if (processedUrls.length === 0) return null;

    const fieldStyles = getFieldStyles(isDark);

    if (processedUrls.length === 1) {
      return (
        <View key={field.id} style={fieldStyles.mediaContainer}>
          <TouchableOpacity
            style={fieldStyles.singleImageContainer}
            onPress={() => {
              (navigation as any).navigate('ImageViewer', {
                images: processedUrls,
                initialIndex: 0,
                title: field.content || 'Image'
              });
            }}
            activeOpacity={0.9}
          >
            <CustomFastImage
              imageUrl={processedUrls[0]}
              style={fieldStyles.singleImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={fieldStyles.imageOverlay}
            />
            <View style={fieldStyles.imageInfo}>
              <MaterialDesignIcons name="image" size={normalize(20)} color="#fff" />
              <Text style={fieldStyles.imageLabel}>Tap to view</Text>
            </View>
          </TouchableOpacity>
          {field.content && (
            <Text style={[fieldStyles.mediaCaption, { color: isDark ? '#b0b0b0' : colors.onSurfaceVariant }]}>
              {field.content}
            </Text>
          )}
        </View>
      );
    }

    // Multiple images - Gallery view
    return (
      <View key={field.id} style={fieldStyles.mediaContainer}>
        <View style={fieldStyles.galleryHeader}>
          <MaterialDesignIcons name="image-multiple" size={normalize(24)} color={AppColors.primary} />
          <Text style={[fieldStyles.galleryTitle, { color: isDark ? '#fff' : colors.onSurface }]}>
            {field.content || 'Image Gallery'}
          </Text>
          <View style={fieldStyles.galleryBadge}>
            <Text style={fieldStyles.galleryBadgeText}>{processedUrls.length}</Text>
          </View>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={fieldStyles.galleryScroll}
          contentContainerStyle={fieldStyles.galleryContent}
        >
          {processedUrls.map((imageUrl, imgIndex) => (
            <TouchableOpacity
              key={imgIndex}
              style={fieldStyles.galleryItem}
              onPress={() => {
                (navigation as any).navigate('ImageViewer', {
                  images: processedUrls,
                  initialIndex: imgIndex,
                  title: field.content || 'Gallery'
                });
              }}
            >
              <CustomFastImage
                imageUrl={imageUrl}
                style={fieldStyles.galleryImage}
                resizeMode="cover"
              />
              <View style={fieldStyles.galleryOverlay}>
                <Text style={fieldStyles.galleryIndex}>{imgIndex + 1}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render video field
  const renderVideoField = (field: ContentField, index: number) => {
    const processedUrls = processAzureFiles(field);
    if (processedUrls.length === 0) return null;

    const fieldStyles = getFieldStyles(isDark);

    return (
      <View key={field.id} style={fieldStyles.mediaContainer}>
        <View style={fieldStyles.mediaHeader}>
          <MaterialDesignIcons name="play-circle" size={normalize(24)} color={AppColors.primary} />
          <Text style={[fieldStyles.mediaTitle, { color: isDark ? '#fff' : colors.onSurface }]}>
            {field.content || 'Video Content'}
          </Text>
        </View>
        
        {processedUrls.map((videoUrl, vidIndex) => (
          <View key={vidIndex} style={fieldStyles.videoWrapper}>
            <EnhancedVideoPlayer
              item={{
                _id: `video-${field.id}-${vidIndex}`,
                title: field.content || `Video ${vidIndex + 1}`,
                videoUrl: videoUrl,
                streamingUrl: videoUrl,
                type: 'video'
              }}
              playlist={[]}
              style={fieldStyles.videoPlayer}
            />
          </View>
        ))}
      </View>
    );
  };

  // Render PDF field
  const renderPdfField = (field: ContentField, index: number) => {
    const processedUrls = processAzureFiles(field);
    if (processedUrls.length === 0) return null;

    const fieldStyles = getFieldStyles(isDark);

    return (
      <View key={field.id} style={fieldStyles.mediaContainer}>
        <View style={fieldStyles.mediaHeader}>
          <MaterialDesignIcons name="file-pdf-box" size={normalize(24)} color={AppColors.error} />
          <Text style={[fieldStyles.mediaTitle, { color: isDark ? '#fff' : colors.onSurface }]}>
            {field.content || 'PDF Documents'}
          </Text>
        </View>
        
        {processedUrls.map((pdfUrl, pdfIndex) => (
          <TouchableOpacity
            key={pdfIndex}
            style={[fieldStyles.pdfItem, { backgroundColor: isDark ? '#2a2a2a' : '#f8f9fa' }]}
            onPress={() => {
              (navigation as any).navigate('PdfViewer', {
                uri: pdfUrl,
                title: field.content || `Document ${pdfIndex + 1}`,
                item: {
                  _id: `pdf-${field.id}-${pdfIndex}`,
                  title: field.content || `Document ${pdfIndex + 1}`,
                  pdfUrl: pdfUrl,
                  streamingUrl: pdfUrl,
                  type: 'pdf'
                }
              });
            }}
          >
            <View style={fieldStyles.pdfIcon}>
              <MaterialDesignIcons name="file-pdf-box" size={normalize(32)} color={AppColors.error} />
            </View>
            <View style={fieldStyles.pdfContent}>
              <Text style={[fieldStyles.pdfTitle, { color: isDark ? '#fff' : colors.onSurface }]}>
                {field.content || `Document ${pdfIndex + 1}`}
              </Text>
              <Text style={[fieldStyles.pdfAction, { color: AppColors.primary }]}>
                Tap to open PDF
              </Text>
            </View>
            <MaterialDesignIcons name="chevron-right" size={normalize(24)} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const styles = getStyles(isDark, colors);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#121212' : '#fff'}
        translucent={false}
      />
      
      {/* Fixed Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialDesignIcons name="arrow-left" size={normalize(24)} color={isDark ? '#fff' : colors.onSurface} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: isDark ? '#fff' : colors.onSurface }]} numberOfLines={1}>
            {category.title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: isDark ? '#b0b0b0' : colors.onSurfaceVariant }]}>
            {Math.round(readingProgress * 100)}% • {readingTime} min read
          </Text>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <MaterialDesignIcons name="dots-vertical" size={normalize(24)} color={isDark ? '#fff' : colors.onSurface} />
        </TouchableOpacity>
      </Animated.View>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' }]}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressWidth,
              backgroundColor: AppColors.primary,
            }
          ]}
        />
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.categoryBadge}>
            <MaterialDesignIcons name="book-open-variant" size={normalize(16)} color="#fff" />
            <Text style={styles.categoryText}>Article</Text>
          </View>
          
          <Text style={[styles.title, { color: isDark ? '#fff' : colors.onSurface }]}>
            {category.title}
          </Text>
          
          {category.subtitle && (
            <Text style={[styles.subtitle, { color: isDark ? '#e0e0e0' : colors.onSurfaceVariant }]}>
              {category.subtitle}
            </Text>
          )}
          
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <MaterialDesignIcons name="clock-outline" size={normalize(16)} color={colors.onSurfaceVariant} />
              <Text style={[styles.metaText, { color: isDark ? '#b0b0b0' : colors.onSurfaceVariant }]}>
                {readingTime} min read
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialDesignIcons name="eye-outline" size={normalize(16)} color={colors.onSurfaceVariant} />
              <Text style={[styles.metaText, { color: isDark ? '#b0b0b0' : colors.onSurfaceVariant }]}>
                {sortedContentFields.length} sections
              </Text>
            </View>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.contentBody}>
          {category.description1 && (
            <View style={[styles.introSection, { backgroundColor: isDark ? '#1e1e1e' : '#f8f9fa' }]}>
              <Text style={[styles.introText, { color: isDark ? '#e0e0e0' : colors.onSurface }]}>
                {category.description1}
              </Text>
            </View>
          )}

          {/* Dynamic Content Fields */}
          <View style={styles.contentFields}>
            {sortedContentFields.map((field, index) => (
              <View key={field.id} style={styles.fieldWrapper}>
                {renderContentField(field, index)}
              </View>
            ))}
          </View>

          {category.description2 && (
            <View style={[styles.conclusionSection, { backgroundColor: isDark ? '#1e1e1e' : '#f8f9fa' }]}>
              <Text style={[styles.conclusionText, { color: isDark ? '#e0e0e0' : colors.onSurface }]}>
                {category.description2}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: isDark ? '#1e1e1e' : '#f8f9fa' }]}>
          <Text style={[styles.footerText, { color: isDark ? '#b0b0b0' : colors.onSurfaceVariant }]}>
            Thank you for reading • {new Date().getFullYear()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

// Styles
const getStyles = (isDark: boolean, colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#2a2a2a' : '#e0e0e0',
  },
  backButton: {
    padding: wp(2),
  },
  headerContent: {
    flex: 1,
    marginHorizontal: wp(3),
  },
  headerTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: normalize(12),
    marginTop: 2,
  },
  moreButton: {
    padding: wp(2),
  },
  progressContainer: {
    height: 3,
  },
  progressBar: {
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: wp(4),
    paddingTop: hp(3),
    paddingBottom: hp(2),
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: normalize(20),
    alignSelf: 'flex-start',
    marginBottom: hp(2),
  },
  categoryText: {
    color: '#fff',
    fontSize: normalize(12),
    fontWeight: '600',
    marginLeft: wp(1),
  },
  title: {
    fontSize: normalize(28),
    fontWeight: '800',
    lineHeight: normalize(36),
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    lineHeight: normalize(24),
    marginBottom: hp(2),
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: normalize(14),
    marginLeft: wp(1),
  },
  contentBody: {
    paddingHorizontal: wp(4),
  },
  introSection: {
    padding: wp(4),
    borderRadius: normalize(12),
    marginBottom: hp(3),
    borderLeftWidth: 4,
    borderLeftColor: AppColors.primary,
  },
  introText: {
    fontSize: normalize(16),
    lineHeight: normalize(26),
  },
  contentFields: {
    gap: hp(3),
  },
  fieldWrapper: {
    marginVertical: hp(0.5),
  },
  conclusionSection: {
    padding: wp(4),
    borderRadius: normalize(12),
    marginTop: hp(3),
    borderLeftWidth: 4,
    borderLeftColor: AppColors.success,
  },
  conclusionText: {
    fontSize: normalize(16),
    lineHeight: normalize(26),
  },
  footer: {
    padding: wp(4),
    marginTop: hp(4),
    alignItems: 'center',
  },
  footerText: {
    fontSize: normalize(14),
    fontStyle: 'italic',
  },
});

// Field-specific styles
const getFieldStyles = (isDark: boolean) => StyleSheet.create({
  headerContainer: {
    marginTop: hp(2),
    marginBottom: hp(0.5),
  },
  headerDecoration: {
    width: wp(12),
    height: 4,
    backgroundColor: AppColors.primary,
    borderRadius: 2,
    marginBottom: hp(0.8),
  },
  headerText: {
    fontSize: normalize(24),
    fontWeight: '700',
    lineHeight: normalize(30),
  },
  descriptionContainer: {
    marginTop: hp(0.3),
    marginBottom: hp(1),
  },
  descriptionText: {
    fontSize: normalize(16),
    lineHeight: normalize(26),
    textAlign: 'justify',
  },
  mediaContainer: {
    marginVertical: hp(1.5),
  },
  mediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  mediaTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    marginLeft: wp(2),
  },
  singleImageContainer: {
    position: 'relative',
    borderRadius: normalize(12),
    overflow: 'hidden',
  },
  singleImage: {
    width: '100%',
    height: hp(25),
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: hp(8),
  },
  imageInfo: {
    position: 'absolute',
    bottom: wp(3),
    right: wp(3),
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageLabel: {
    color: '#fff',
    fontSize: normalize(12),
    fontWeight: '500',
    marginLeft: wp(1),
  },
  mediaCaption: {
    fontSize: normalize(14),
    marginTop: hp(1),
    textAlign: 'center',
    fontStyle: 'italic',
  },
  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  galleryTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    marginLeft: wp(2),
    flex: 1,
  },
  galleryBadge: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: normalize(12),
  },
  galleryBadgeText: {
    color: '#fff',
    fontSize: normalize(12),
    fontWeight: '600',
  },
  galleryScroll: {
    marginHorizontal: -wp(4),
  },
  galleryContent: {
    paddingHorizontal: wp(4),
    gap: wp(3),
  },
  galleryItem: {
    position: 'relative',
    borderRadius: normalize(8),
    overflow: 'hidden',
  },
  galleryImage: {
    width: wp(40),
    height: hp(20),
  },
  galleryOverlay: {
    position: 'absolute',
    top: wp(2),
    right: wp(2),
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: normalize(12),
  },
  galleryIndex: {
    color: '#fff',
    fontSize: normalize(12),
    fontWeight: '600',
  },
  videoWrapper: {
    borderRadius: normalize(12),
    overflow: 'hidden',
    marginVertical: hp(1),
  },
  videoPlayer: {
    width: '100%',
    height: hp(25),
  },
  pdfItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    borderRadius: normalize(12),
    marginVertical: hp(0.5),
    borderWidth: 1,
    borderColor: isDark ? '#3a3a3a' : '#e0e0e0',
  },
  pdfIcon: {
    marginRight: wp(3),
  },
  pdfContent: {
    flex: 1,
  },
  pdfTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
  },
  pdfAction: {
    fontSize: normalize(14),
    marginTop: hp(0.5),
  },
});

export default EnhancedBlogRenderer;