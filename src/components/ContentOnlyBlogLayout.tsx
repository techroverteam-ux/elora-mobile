import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import CustomFastImage from './CustomFastImage';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { wp, hp, normalize } from '../utils/responsive';
import LinearGradient from 'react-native-linear-gradient';

interface ContentField {
  id: string;
  type: 'header' | 'description';
  content: string;
}

interface ContentOnlyBlogLayoutProps {
  title: string;
  headerImage?: string;
  contentFields: ContentField[];
  onImagePress?: () => void;
}

export const ContentOnlyBlogLayout: React.FC<ContentOnlyBlogLayoutProps> = ({
  title,
  headerImage,
  contentFields,
  onImagePress,
}) => {
  const { colors } = useTheme();

  const renderContentField = (field: ContentField, index: number) => {
    if (field.type === 'header') {
      return (
        <Text 
          key={field.id} 
          style={[styles.headerText, { color: colors.onSurface }]}
        >
          {field.content}
        </Text>
      );
    } else {
      return (
        <Text 
          key={field.id} 
          style={[styles.descriptionText, { color: colors.onSurface }]}
        >
          {field.content}
        </Text>
      );
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Image */}
      {headerImage && (
        <TouchableOpacity 
          style={styles.headerImageContainer}
          onPress={onImagePress}
          activeOpacity={0.9}
        >
          <CustomFastImage 
            style={styles.headerImage} 
            imageUrl={headerImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          />
          <View style={styles.heroContent}>
            <View style={styles.categoryBadge}>
              <MaterialDesignIcons name="book-open-variant" size={normalize(16)} color="#fff" />
              <Text style={styles.categoryText}>Content</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Content Section */}
      <View style={styles.contentWrapper}>
        {/* Title */}
        <Text style={[styles.title, { color: colors.onSurface }]}>
          {title}
        </Text>

        {/* Article Meta */}
        <View style={styles.articleMeta}>
          <View style={styles.metaItem}>
            <MaterialDesignIcons name="clock-outline" size={normalize(16)} color={colors.onSurfaceVariant} />
            <Text style={[styles.metaText, { color: colors.onSurfaceVariant }]}>
              Article
            </Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialDesignIcons name="eye-outline" size={normalize(16)} color={colors.onSurfaceVariant} />
            <Text style={[styles.metaText, { color: colors.onSurfaceVariant }]}>
              Content Only
            </Text>
          </View>
        </View>

        {/* Dynamic Content Fields */}
        <View style={styles.contentFields}>
          {contentFields.map((field, index) => renderContentField(field, index))}
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
  headerImageContainer: {
    position: 'relative',
    height: hp(25),
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: hp(12),
  },
  heroContent: {
    position: 'absolute',
    bottom: wp(4),
    left: wp(4),
    right: wp(4),
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 128, 59, 0.9)',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: normalize(20),
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#fff',
    fontSize: normalize(12),
    fontWeight: '600',
    marginLeft: wp(1),
  },
  contentWrapper: {
    paddingHorizontal: wp(4),
    paddingTop: hp(3),
    paddingBottom: hp(4),
  },
  title: {
    fontSize: normalize(28),
    fontWeight: '800',
    lineHeight: normalize(36),
    marginBottom: hp(2),
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    marginBottom: hp(3),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: normalize(14),
    fontWeight: '500',
    marginLeft: wp(1),
  },
  contentFields: {
    gap: hp(2),
  },
  headerText: {
    fontSize: normalize(22),
    fontWeight: '700',
    lineHeight: normalize(28),
    marginBottom: hp(1),
  },
  descriptionText: {
    fontSize: normalize(16),
    fontWeight: '400',
    lineHeight: normalize(26),
    textAlign: 'justify',
    marginBottom: hp(1.5),
  },
});

export default ContentOnlyBlogLayout;