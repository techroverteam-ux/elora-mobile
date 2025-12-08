import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonItem from './SkeletonLoader';
import { wp, hp, normalize } from '../utils/responsive';

// 1. Content Only Skeleton
export const ContentOnlySkeleton: React.FC = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.contentWrapper}>
        {/* Title */}
        <SkeletonItem width="90%" height={normalize(28)} borderRadius={8} />
        <SkeletonItem width="70%" height={normalize(18)} borderRadius={6} style={styles.subtitle} />
        
        {/* Meta */}
        <View style={styles.metaSection}>
          <SkeletonItem width={wp(25)} height={normalize(14)} borderRadius={7} />
        </View>

        {/* Content Fields */}
        <View style={styles.contentFields}>
          <SkeletonItem width="80%" height={normalize(20)} borderRadius={8} />
          <SkeletonItem width="100%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
          <SkeletonItem width="95%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
          <SkeletonItem width="88%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
          
          <SkeletonItem width="75%" height={normalize(20)} borderRadius={8} style={styles.fieldSpacing} />
          <SkeletonItem width="100%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
          <SkeletonItem width="92%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
        </View>
      </View>
    </ScrollView>
  );
};

// 2. Content with Images Skeleton
export const ContentWithImagesSkeleton: React.FC = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Image */}
      <SkeletonItem width="100%" height={hp(25)} borderRadius={0} />
      
      <View style={styles.contentWrapper}>
        {/* Title */}
        <SkeletonItem width="90%" height={normalize(28)} borderRadius={8} />
        
        {/* Description 1 */}
        <View style={styles.descriptionSection}>
          <SkeletonItem width="100%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
          <SkeletonItem width="95%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
          <SkeletonItem width="88%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
        </View>
        
        {/* Inline Image */}
        <SkeletonItem width="100%" height={hp(20)} borderRadius={12} style={styles.inlineImage} />
        
        {/* Description 2 */}
        <View style={styles.descriptionSection}>
          <SkeletonItem width="100%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
          <SkeletonItem width="92%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
        </View>
      </View>
    </ScrollView>
  );
};

// 3. Rich Media Skeleton
export const RichMediaSkeleton: React.FC = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Image */}
      <SkeletonItem width="100%" height={hp(25)} borderRadius={0} />
      
      <View style={styles.contentWrapper}>
        {/* Title */}
        <SkeletonItem width="90%" height={normalize(28)} borderRadius={8} />
        
        {/* Description 1 */}
        <View style={styles.descriptionSection}>
          <SkeletonItem width="100%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
          <SkeletonItem width="95%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
        </View>
        
        {/* Video Section */}
        <View style={styles.videoSection}>
          <View style={styles.sectionHeader}>
            <SkeletonItem width={normalize(20)} height={normalize(20)} borderRadius={10} />
            <SkeletonItem width={wp(30)} height={normalize(18)} borderRadius={8} style={styles.sectionTitle} />
          </View>
          <SkeletonItem width="100%" height={hp(22)} borderRadius={12} />
        </View>
        
        {/* Description 2 */}
        <View style={styles.descriptionSection}>
          <SkeletonItem width="100%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
          <SkeletonItem width="88%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
        </View>
        
        {/* Gallery Section */}
        <View style={styles.gallerySection}>
          <View style={styles.sectionHeader}>
            <SkeletonItem width={normalize(20)} height={normalize(20)} borderRadius={10} />
            <SkeletonItem width={wp(25)} height={normalize(18)} borderRadius={8} style={styles.sectionTitle} />
          </View>
          <View style={styles.imageGrid}>
            <SkeletonItem width="48%" height={wp(25)} borderRadius={12} />
            <SkeletonItem width="48%" height={wp(25)} borderRadius={12} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// 4. Interactive Skeleton
export const InteractiveSkeleton: React.FC = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Interactive Header */}
      <SkeletonItem width="100%" height={hp(12)} borderRadius={0} />
      
      <View style={styles.contentWrapper}>
        {/* Title */}
        <SkeletonItem width="90%" height={normalize(28)} borderRadius={8} />
        
        {/* Interactive Cards */}
        <View style={styles.interactiveCards}>
          {/* Content Card */}
          <View style={styles.interactiveCard}>
            <View style={styles.cardHeader}>
              <SkeletonItem width={normalize(18)} height={normalize(18)} borderRadius={9} />
              <SkeletonItem width={wp(20)} height={normalize(16)} borderRadius={8} style={styles.cardTitle} />
            </View>
            <SkeletonItem width="100%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
            <SkeletonItem width="95%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
            <SkeletonItem width="88%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
          </View>
          
          {/* Video Card */}
          <View style={styles.interactiveCard}>
            <View style={styles.cardHeader}>
              <SkeletonItem width={normalize(18)} height={normalize(18)} borderRadius={9} />
              <SkeletonItem width={wp(30)} height={normalize(16)} borderRadius={8} style={styles.cardTitle} />
            </View>
            <SkeletonItem width="100%" height={hp(18)} borderRadius={8} />
          </View>
          
          {/* Image Card */}
          <View style={styles.interactiveCard}>
            <View style={styles.cardHeader}>
              <SkeletonItem width={normalize(18)} height={normalize(18)} borderRadius={9} />
              <SkeletonItem width={wp(35)} height={normalize(16)} borderRadius={8} style={styles.cardTitle} />
            </View>
            <SkeletonItem width="100%" height={hp(18)} borderRadius={8} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Main Blog Layout Skeleton Renderer
interface BlogLayoutSkeletonProps {
  layout?: string;
}

export const BlogLayoutSkeleton: React.FC<BlogLayoutSkeletonProps> = ({ layout = 'content-only' }) => {
  switch (layout) {
    case 'content-only':
      return <ContentOnlySkeleton />;
    case 'content-with-images':
      return <ContentWithImagesSkeleton />;
    case 'rich-media':
      return <RichMediaSkeleton />;
    case 'interactive':
      return <InteractiveSkeleton />;
    default:
      return <ContentOnlySkeleton />;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentWrapper: {
    paddingHorizontal: wp(4),
    paddingTop: hp(3),
    paddingBottom: hp(4),
  },
  subtitle: {
    marginTop: hp(1),
  },
  metaSection: {
    marginTop: hp(2),
    marginBottom: hp(3),
  },
  contentFields: {
    gap: hp(1),
  },
  fieldSpacing: {
    marginTop: hp(2.5),
  },
  lineSpacing: {
    marginTop: hp(0.8),
  },
  descriptionSection: {
    marginVertical: hp(2),
  },
  inlineImage: {
    marginVertical: hp(2),
  },
  videoSection: {
    marginVertical: hp(3),
  },
  gallerySection: {
    marginVertical: hp(3),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  sectionTitle: {
    marginLeft: wp(2),
  },
  imageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  interactiveCards: {
    gap: hp(3),
    marginTop: hp(3),
  },
  interactiveCard: {
    backgroundColor: '#f8fafc',
    borderRadius: normalize(12),
    padding: wp(4),
    borderLeftWidth: 4,
    borderLeftColor: '#E1E9EE',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  cardTitle: {
    marginLeft: wp(2),
  },
});

export default BlogLayoutSkeleton;