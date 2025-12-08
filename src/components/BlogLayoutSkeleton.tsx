import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

const { width } = Dimensions.get('window');

interface BlogLayoutSkeletonProps {
  type?: 'interactive' | 'rich-media' | 'with-images' | 'content-only';
}

const BlogLayoutSkeleton: React.FC<BlogLayoutSkeletonProps> = ({ type = 'content-only' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'interactive': // ⚡ Interactive - Dynamic content
        return (
          <>
            <SkeletonLoader width={width} height={220} style={styles.headerImage} />
            <View style={styles.contentContainer}>
              <SkeletonLoader width={width * 0.8} height={26} style={styles.title} />
              <SkeletonLoader width={width * 0.6} height={18} style={styles.subtitle} />
              <SkeletonLoader width={width * 0.9} height={16} style={styles.description} />
              <SkeletonLoader width={width - 32} height={200} style={styles.mainImage} />
              <SkeletonLoader width={width * 0.7} height={24} style={styles.contentHeader} />
              <SkeletonLoader width={width * 0.95} height={16} style={styles.description} />
            </View>
          </>
        );
      case 'rich-media': // 🎨 Rich Media - Full multimedia
        return (
          <>
            <SkeletonLoader width={width} height={220} style={styles.headerImage} />
            <View style={styles.contentContainer}>
              <SkeletonLoader width={width * 0.8} height={26} style={styles.title} />
              <SkeletonLoader width={width * 0.6} height={18} style={styles.subtitle} />
              <SkeletonLoader width={width - 32} height={200} style={styles.mainImage} />
              <SkeletonLoader width={width * 0.9} height={16} style={styles.description} />
              <SkeletonLoader width={width * 0.85} height={16} style={styles.description} />
            </View>
          </>
        );
      case 'with-images': // 🖼️ With Images - Text + Images
        return (
          <View style={styles.contentContainer}>
            <SkeletonLoader width={width * 0.8} height={26} style={styles.title} />
            <SkeletonLoader width={width * 0.6} height={18} style={styles.subtitle} />
            <SkeletonLoader width={width - 32} height={200} style={styles.mainImage} />
            <SkeletonLoader width={width * 0.9} height={16} style={styles.description} />
            <SkeletonLoader width={width * 0.85} height={16} style={styles.description} />
          </View>
        );
      case 'content-only': // 📝 Content Only - Text only
      default:
        return (
          <View style={styles.contentContainer}>
            <SkeletonLoader width={width * 0.8} height={28} style={styles.title} />
            <SkeletonLoader width={width * 0.6} height={20} style={styles.subtitle} />
            <SkeletonLoader width={width * 0.9} height={16} style={styles.description} />
            <SkeletonLoader width={width * 0.85} height={16} style={styles.description} />
            <SkeletonLoader width={width * 0.7} height={22} style={styles.contentHeader} />
            <SkeletonLoader width={width * 0.95} height={16} style={styles.description} />
            <SkeletonLoader width={width * 0.88} height={16} style={styles.description} />
            <SkeletonLoader width={width * 0.6} height={20} style={styles.contentHeader} />
            <SkeletonLoader width={width * 0.92} height={16} style={styles.description} />
            <SkeletonLoader width={width * 0.8} height={16} style={styles.description} />
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderSkeleton()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerImage: {
    marginBottom: 0,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
  },
  mainImage: {
    marginVertical: 16,
    borderRadius: 8,
  },
  description: {
    marginBottom: 12,
  },
  contentHeader: {
    marginTop: 20,
    marginBottom: 12,
  },
});

export default BlogLayoutSkeleton;