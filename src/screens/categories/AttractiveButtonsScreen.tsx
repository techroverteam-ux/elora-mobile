import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import AppBarHeader from '../../components/AppBarHeader';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import SkeletonItem from '../../components/SkeletonLoader';
import EnhancedBlogRenderer from '../../components/EnhancedBlogRenderer';
import { CategoriesStackParamList } from '../../navigation/types';
import { useGetCategoriesMutation } from '../../data/redux/services/sectionsApi';
import { wp, hp, normalize } from '../../utils/responsive';

type AttractiveButtonsScreenRouteProp = RouteProp<CategoriesStackParamList, 'AttractiveButtonsScreen'>;

interface ActionButton {
  id: string;
  title: string;
  icon: string;
  color: string;
  navigationType: 'video-list' | 'audio-list' | 'chapter-list' | 'single-video' | 'gallery' | 'books-list';
}

interface Category {
  _id: string;
  title: string;
  subtitle?: string;
  description1?: string;
  description2?: string;
  actionButtons: ActionButton[];
  contentFields?: Array<{
    type: 'header' | 'description';
    content: string;
  }>;
}

const AttractiveButtonsScreen: React.FC = () => {
  const route = useRoute<AttractiveButtonsScreenRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<CategoriesStackParamList>>();
  const { colors } = useTheme();
  const { sectionId, title } = route.params;

  const [getCategoriesRequest, { data, isLoading, error }] = useGetCategoriesMutation();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (sectionId) {
      getCategoriesRequest(sectionId);
    }
  }, [sectionId]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getCategoriesRequest(sectionId);
    } finally {
      setRefreshing(false);
    }
  };

  const getIconForButton = (navigationType: string): string => {
    switch (navigationType) {
      case 'video-list': return 'play-circle';
      case 'audio-list': return 'music-note';
      case 'gallery': return 'image-multiple';
      case 'books-list': return 'book-open-variant';
      case 'chapter-list': return 'book-open-variant';
      case 'single-video': return 'video';
      default: return 'star-circle';
    }
  };

  const getColorForButton = (navigationType: string): string => {
    switch (navigationType) {
      case 'video-list': return '#FF6B6B';
      case 'single-video': return '#FF6B6B';
      case 'audio-list': return '#4ECDC4';
      case 'gallery': return '#95E1D3';
      case 'books-list': return '#8E44AD';
      case 'chapter-list': return '#F8803B';
      default: return colors.primary;
    }
  };

  const handleButtonPress = (button: ActionButton, category: Category) => {
    console.log('🎯 Action button pressed:', {
      buttonTitle: button.title,
      navigationType: button.navigationType,
      categoryId: category._id,
      sectionId: sectionId
    });
    
    // Handle blog-post navigation type
    if (button.navigationType === 'blog-post') {
      navigation.navigate('BlogPage', {
        categoryData: category
      });
      return;
    }
    
    // Handle gallery navigation type
    if (button.navigationType === 'gallery') {
      navigation.navigate('SubCategorie', {
        sectionId: sectionId,
        categoryId: category._id,
        buttonType: button.navigationType,
        title: button.title,
        actionButton: button
      });
      return;
    }
    
    // Handle books-list navigation type
    if (button.navigationType === 'books-list') {
      navigation.navigate('SubCategorie', {
        sectionId: sectionId,
        categoryId: category._id,
        buttonType: button.navigationType,
        title: button.title,
        actionButton: button
      });
      return;
    }
    
    // Navigate to subcategories filtered by this action button
    navigation.navigate('SubCategorie', {
      sectionId: sectionId,
      categoryId: category._id,
      buttonType: button.navigationType,
      title: button.title,
      actionButton: button
    });
  };

  const renderButton = (button: ActionButton, category: Category, width: string) => {
    const buttonColor = getColorForButton(button.navigationType);
    return (
      <TouchableOpacity
        key={button.id}
        style={[styles.gridButton, { backgroundColor: buttonColor + '15', width }]}
        onPress={() => handleButtonPress(button, category)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconCircle, { backgroundColor: buttonColor + '25' }]}>
          <MaterialDesignIcons name={getIconForButton(button.navigationType) as any} size={normalize(28)} color={buttonColor} />
        </View>
        <Text style={[styles.buttonText, { color: colors.onSurface }]} numberOfLines={2}>{button.title}</Text>
        <MaterialDesignIcons name="chevron-right" size={normalize(18)} color={buttonColor} style={styles.arrowIcon} />
      </TouchableOpacity>
    );
  };



  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <AppBarHeader title={title} onBack={() => navigation.goBack()} showDownload={false} />
        <ScrollView style={styles.fullScreenSkeleton} showsVerticalScrollIndicator={false}>
          <View style={styles.buttonsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.skeletonButton}>
                <SkeletonItem width={normalize(56)} height={normalize(56)} borderRadius={normalize(28)} />
                <SkeletonItem width="70%" height={normalize(14)} borderRadius={7} style={{ marginTop: hp(1) }} />
              </View>
            ))}
          </View>
          <View style={styles.skeletonContent}>
            <SkeletonItem width="70%" height={normalize(24)} borderRadius={12} style={{ marginBottom: hp(2) }} />
            <SkeletonItem width="100%" height={normalize(16)} borderRadius={8} style={{ marginBottom: hp(1) }} />
            <SkeletonItem width="95%" height={normalize(16)} borderRadius={8} style={{ marginBottom: hp(1) }} />
            <SkeletonItem width="90%" height={normalize(16)} borderRadius={8} style={{ marginBottom: hp(3) }} />
            <SkeletonItem width="60%" height={normalize(24)} borderRadius={12} style={{ marginBottom: hp(2) }} />
            <SkeletonItem width="100%" height={normalize(16)} borderRadius={8} style={{ marginBottom: hp(1) }} />
            <SkeletonItem width="98%" height={normalize(16)} borderRadius={8} style={{ marginBottom: hp(1) }} />
            <SkeletonItem width="85%" height={normalize(16)} borderRadius={8} style={{ marginBottom: hp(1) }} />
            <SkeletonItem width="92%" height={normalize(16)} borderRadius={8} style={{ marginBottom: hp(1) }} />
            <SkeletonItem width="88%" height={normalize(16)} borderRadius={8} style={{ marginBottom: hp(3) }} />
            <SkeletonItem width="75%" height={normalize(20)} borderRadius={10} style={{ marginBottom: hp(2) }} />
            <SkeletonItem width="100%" height={normalize(14)} borderRadius={7} style={{ marginBottom: hp(1) }} />
            <SkeletonItem width="96%" height={normalize(14)} borderRadius={7} style={{ marginBottom: hp(1) }} />
            <SkeletonItem width="89%" height={normalize(14)} borderRadius={7} style={{ marginBottom: hp(8) }} />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (error || !data?.data) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppBarHeader title={title} onBack={() => navigation.goBack()} showDownload={false} />
        <View style={styles.errorContainer}>
          <MaterialDesignIcons name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>Failed to load content</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const categories = data.data as Category[];
  const firstCategory = categories[0];

  if (!firstCategory) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppBarHeader title={title} onBack={() => navigation.goBack()} showDownload={false} />
        <View style={styles.emptyContainer}>
          <MaterialDesignIcons name="inbox" size={64} color={colors.onSurfaceVariant} />
          <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>No content available</Text>
        </View>
      </View>
    );
  }

  const hasButtons = firstCategory.actionButtons && firstCategory.actionButtons.length > 0;
  const hasContent = firstCategory.contentFields && firstCategory.contentFields.length > 0;
  const buttonCount = firstCategory.actionButtons?.length || 0;
  const buttonsPerRow = buttonCount === 3 ? 3 : buttonCount > 4 ? 3 : 2;
  const buttonWidth = buttonsPerRow === 3 ? '31%' : '48%';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <AppBarHeader title={title} onBack={() => navigation.goBack()} showDownload={false} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#F8803B', '#FF6B35', '#F7931E']}
            tintColor="#F8803B"
            progressBackgroundColor="#FFFFFF"
            title="Pull to refresh"
            titleColor="#666666"
          />
        }
      >
        {hasButtons && (
          <View style={styles.buttonsSection}>
            <View style={styles.buttonsGrid}>
              {firstCategory.actionButtons.map(button => renderButton(button, firstCategory, buttonWidth))}
            </View>
          </View>
        )}
        {hasContent && (
          <EnhancedBlogRenderer
            category={JSON.parse(JSON.stringify({
              ...firstCategory,
              layoutType: 'enhanced-blog',
            }))}
            onBack={() => navigation.goBack()}
            hideHeader={true}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullScreenSkeleton: {
    flex: 1,
    padding: wp(4),
  },
  skeletonContainer: {
    padding: wp(4),
  },
  skeletonButton: {
    width: '48%',
    paddingVertical: hp(2),
    alignItems: 'center',
    marginBottom: hp(2),
  },
  skeletonContent: {
    marginTop: hp(2),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(4),
  },
  errorText: {
    fontSize: normalize(18),
    fontWeight: '600',
    marginTop: hp(2),
    marginBottom: hp(3),
  },
  retryButton: {
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: normalize(8),
  },
  retryButtonText: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: '600',
  },
  buttonsSection: {
    padding: wp(4),
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  gridButton: {
    paddingVertical: hp(2),
    paddingHorizontal: wp(2),
    marginBottom: hp(2),
    borderRadius: normalize(12),
    alignItems: 'center',
    position: 'relative',
  },
  iconCircle: {
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(28),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  buttonText: {
    fontSize: normalize(13),
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: wp(1),
  },
  arrowIcon: {
    position: 'absolute',
    top: wp(2),
    right: wp(2),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  emptyText: {
    fontSize: normalize(16),
    marginTop: hp(2),
  },
});

export default AttractiveButtonsScreen;
