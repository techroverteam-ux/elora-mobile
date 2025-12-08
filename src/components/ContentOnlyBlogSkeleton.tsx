import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonItem from './SkeletonLoader';
import { wp, hp, normalize } from '../utils/responsive';

export const ContentOnlyBlogSkeleton: React.FC = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Image Skeleton */}
      <View style={styles.headerSection}>
        <SkeletonItem width="100%" height={hp(25)} borderRadius={0} />
      </View>

      {/* Content Section */}
      <View style={styles.contentWrapper}>
        {/* Title and Meta */}
        <View style={styles.titleSection}>
          <SkeletonItem width="90%" height={normalize(28)} borderRadius={8} />
          <SkeletonItem width="70%" height={normalize(18)} borderRadius={6} style={styles.subtitle} />
          
          {/* Meta info */}
          <View style={styles.metaSection}>
            <SkeletonItem width={wp(20)} height={normalize(14)} borderRadius={7} />
            <SkeletonItem width={wp(15)} height={normalize(14)} borderRadius={7} />
          </View>
        </View>

        {/* Dynamic Content Fields */}
        <View style={styles.contentFields}>
          {/* Header 1 */}
          <SkeletonItem width="80%" height={normalize(20)} borderRadius={8} style={styles.fieldSpacing} />
          
          {/* Description 1 */}
          <SkeletonItem width="100%" height={normalize(16)} borderRadius={6} style={styles.fieldSpacing} />
          <SkeletonItem width="95%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
          <SkeletonItem width="88%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
          
          {/* Header 2 */}
          <SkeletonItem width="75%" height={normalize(20)} borderRadius={8} style={styles.fieldSpacing} />
          
          {/* Description 2 */}
          <SkeletonItem width="100%" height={normalize(16)} borderRadius={6} style={styles.fieldSpacing} />
          <SkeletonItem width="92%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
          <SkeletonItem width="97%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
          <SkeletonItem width="85%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
          
          {/* Header 3 */}
          <SkeletonItem width="70%" height={normalize(20)} borderRadius={8} style={styles.fieldSpacing} />
          
          {/* Description 3 */}
          <SkeletonItem width="100%" height={normalize(16)} borderRadius={6} style={styles.fieldSpacing} />
          <SkeletonItem width="89%" height={normalize(16)} borderRadius={6} style={styles.lineSpacing} />
        </View>

        {/* Images Section */}
        <View style={styles.imagesSection}>
          <SkeletonItem width="60%" height={normalize(18)} borderRadius={8} style={styles.sectionTitle} />
          
          <View style={styles.imageGrid}>
            <SkeletonItem width="48%" height={wp(25)} borderRadius={12} />
            <SkeletonItem width="48%" height={wp(25)} borderRadius={12} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerSection: {
    width: '100%',
  },
  contentWrapper: {
    paddingHorizontal: wp(4),
    paddingTop: hp(3),
  },
  titleSection: {
    marginBottom: hp(3),
  },
  subtitle: {
    marginTop: hp(1),
  },
  metaSection: {
    flexDirection: 'row',
    gap: wp(4),
    marginTop: hp(2),
  },
  contentFields: {
    marginBottom: hp(4),
  },
  fieldSpacing: {
    marginBottom: hp(2.5),
  },
  lineSpacing: {
    marginBottom: hp(0.8),
  },
  imagesSection: {
    marginBottom: hp(4),
  },
  sectionTitle: {
    marginBottom: hp(2),
  },
  imageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
});

export default ContentOnlyBlogSkeleton;