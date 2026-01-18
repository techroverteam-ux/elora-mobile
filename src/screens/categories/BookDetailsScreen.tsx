import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from '../../components/CustomFastImage';
import AppBarHeader from '../../components/AppBarHeader';
import { wp, hp, normalize } from '../../utils/responsive';
import { processAzureUrl } from '../../utils/azureUrlHelper';
import { shareContent, ShareableContent } from '../../utils/deepLinkHelper';

const BookDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { item, title } = route.params as any;

  const handleShare = async () => {
    if (!item) return;
    
    const shareableContent: ShareableContent = {
      _id: item._id,
      title: item.title || 'Book',
      type: 'pdf',
      pdfUrl: item.pdfUrl || item.streamingUrl,
      streamingUrl: item.streamingUrl,
      thumbnailUrl: item.headerImage || item.mainImage || item.imageUrl,
      author: item.author || item.subtitle,
      description: item.description1,
      categoryId: item.categoryId,
      sectionId: item.sectionId,
    };
    
    await shareContent(shareableContent);
  };

  const handleReadNow = () => {
    navigation.navigate('PdfViewer', { item, title: item.title });
  };

  const bookImage = processAzureUrl(item.headerImage || item.mainImage || item.imageUrl);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader 
        title="Book Details" 
        onBack={() => navigation.goBack()} 
        showDownload={false} 
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.bookHeader}>
          <View style={styles.bookImageContainer}>
            {bookImage ? (
              <CustomFastImage
                style={styles.bookImage}
                imageUrl={bookImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.bookPlaceholder, { backgroundColor: colors.surfaceVariant || '#f0f0f0' }]}>
                <MaterialDesignIcons name="book-open-variant" size={48} color={colors.primary} />
              </View>
            )}
          </View>
          
          <View style={styles.bookInfo}>
            <Text style={[styles.bookTitle, { color: colors.onSurface }]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={[styles.bookSubtitle, { color: colors.onSurfaceVariant || colors.onSurface }]}>
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailItem}>
            <MaterialDesignIcons name="file-document" size={20} color={colors.primary} />
            <Text style={[styles.detailLabel, { color: colors.onSurface }]}>Format:</Text>
            <Text style={[styles.detailValue, { color: colors.onSurfaceVariant || colors.onSurface }]}>PDF</Text>
          </View>
          
          <View style={styles.detailItem}>
            <MaterialDesignIcons name="translate" size={20} color={colors.primary} />
            <Text style={[styles.detailLabel, { color: colors.onSurface }]}>Language:</Text>
            <Text style={[styles.detailValue, { color: colors.onSurfaceVariant || colors.onSurface }]}>Hindi/Sanskrit</Text>
          </View>
          
          <View style={styles.detailItem}>
            <MaterialDesignIcons name="book-open-page-variant" size={20} color={colors.primary} />
            <Text style={[styles.detailLabel, { color: colors.onSurface }]}>Pages:</Text>
            <Text style={[styles.detailValue, { color: colors.onSurfaceVariant || colors.onSurface }]}>Available after loading</Text>
          </View>
        </View>

        {item.description1 && (
          <View style={styles.descriptionSection}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Description</Text>
            <Text style={[styles.description, { color: colors.onSurface }]}>
              {item.description1}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.shareButton, { backgroundColor: colors.surfaceVariant || '#f0f0f0' }]}
          onPress={handleShare}
        >
          <MaterialDesignIcons name="share-variant" size={24} color={colors.primary} />
          <Text style={[styles.shareButtonText, { color: colors.primary }]}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.readButton, { backgroundColor: colors.primary }]}
          onPress={handleReadNow}
        >
          <MaterialDesignIcons name="book-open-variant" size={24} color="#fff" />
          <Text style={styles.readButtonText}>Read Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: wp(4),
  },
  bookHeader: {
    flexDirection: 'row',
    marginBottom: hp(3),
  },
  bookImageContainer: {
    marginRight: wp(4),
  },
  bookImage: {
    width: wp(25),
    height: hp(18),
    borderRadius: normalize(8),
  },
  bookPlaceholder: {
    width: wp(25),
    height: hp(18),
    borderRadius: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: normalize(20),
    fontWeight: '700',
    marginBottom: hp(1),
  },
  bookSubtitle: {
    fontSize: normalize(16),
    fontWeight: '500',
  },
  detailsSection: {
    marginBottom: hp(3),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1),
  },
  detailLabel: {
    fontSize: normalize(16),
    fontWeight: '600',
    marginLeft: wp(2),
    minWidth: wp(20),
  },
  detailValue: {
    fontSize: normalize(16),
    marginLeft: wp(2),
    flex: 1,
  },
  descriptionSection: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: normalize(18),
    fontWeight: '700',
    marginBottom: hp(1),
  },
  description: {
    fontSize: normalize(16),
    lineHeight: normalize(24),
    textAlign: 'justify',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: wp(4),
    gap: wp(3),
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.5),
    borderRadius: normalize(8),
  },
  shareButtonText: {
    fontSize: normalize(16),
    fontWeight: '600',
    marginLeft: wp(2),
  },
  readButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.5),
    borderRadius: normalize(8),
  },
  readButtonText: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#fff',
    marginLeft: wp(2),
  },
});

export default BookDetailsScreen;