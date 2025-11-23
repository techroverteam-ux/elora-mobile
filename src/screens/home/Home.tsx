import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import MainAppHeader from '../../components/MainAppHeader';
import CardCarousel from '../../components/CardCarousel';
import MediaHorizontalList from '../../components/MediaHorizontalList';
import DailyGyanGallery from '../../components/DailyGyanGallery';
import DebugCategoriesApi from '../../components/DebugCategoriesApi';

import { useAuth } from '../../context/AuthContext';
import { HomeStackParamList } from '../../navigation/types';
import { useGetDashboardQuery } from '../../data/redux/services/mediaApi';
import { testAudioData, testVideoData, testPDFData } from '../../data/testMediaData';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { processAzureUrl } from '../../utils/azureUrlHelper';
import { useRecentlyPlayed } from '../../context/RecentlyPlayedContext';
import { translateContent } from '../../utils/contentTranslator';

type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

const Home: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation<HomeNavigationProp>();
  const { requireAuth } = useRequireAuth();
  const { recentItems, addRecentItem } = useRecentlyPlayed();

  // Debug recent items
  console.log('Home - Recent items:', recentItems?.length || 0, recentItems);

  const { data, isLoading, isError, refetch } = useGetDashboardQuery();

  if (isError) return <ErrorState colors={colors} onRetry={refetch} t={t} />;

  const dashboardData = data?.data || {};
  const { recentUploads = [], topVideos = [], topAudios = [], topBooks = [] } = dashboardData;

  // Use skeleton data while loading, real data when loaded
  const displayTopAudios = isLoading ? [] : topAudios;
  const displayTopVideos = isLoading ? [] : topVideos;
  const displayTopBooks = isLoading ? [] : topBooks;
  const displayRecentUploads = isLoading ? [] : recentUploads;
  
  // Skeleton data for loading state
  const skeletonData = Array(6).fill(null).map((_, index) => ({
    _id: `skeleton-${index}`,
    title: '',
    isLoading: true
  }));

  // console.log('Home - Dashboard data:', {
  //   topAudios: topAudios.length,
  //   topVideos: topVideos.length,
  //   topBooks: topBooks.length,
  //   recentUploads: recentUploads.length
  // });

  // Debug Azure URLs for audio items
  // if (topAudios.length > 0) {
  //   console.log('Home - Sample audio item:', topAudios[0]);
  //   console.log('Home - Audio URLs check:', {
  //     streamingUrl: topAudios[0]?.streamingUrl,
  //     audioUrl: topAudios[0]?.audioUrl,
  //     thumbnailUrl: topAudios[0]?.thumbnailUrl,
  //     imageUrl: topAudios[0]?.imageUrl
  //   });
  // }

  const handleVideoPress = (item: any, playlist?: any[]) => {
    requireAuth(() => {
      if (!item) {
        console.error('Home - Video item is null/undefined');
        return;
      }

      try {
        const videoItem = {
          ...item,
          _id: item._id || 'video-' + Date.now(),
          videoUri: item.videoUrl || item.videoUri || item.streamingUrl || '',
          videoUrl: item.videoUrl || item.streamingUrl || '',
          streamingUrl: item.streamingUrl || '',
          title: item.title || 'Video',
          thumbnailUrl: item.thumbnailUrl || item.imageUrl || '',
          type: 'video'
        };
        addRecentItem(videoItem);
        navigation.navigate('EnhancedVideoPlayer', {
          item: videoItem,
          playlist: playlist || [],
        });
      } catch (error) {
        console.error('Home - Error navigating to video player:', error);
      }
    });
  };

  const handleAudioPress = (item: any, playlist?: any[]) => {
    requireAuth(() => {
      if (!item) {
        console.error('Home - Audio item is null/undefined');
        return;
      }

      console.log('Home - Audio item pressed:', item);
      console.log('Home - Audio URLs being passed:', {
        streamingUrl: item.streamingUrl,
        audioUrl: item.audioUrl,
        thumbnailUrl: item.thumbnailUrl,
        imageUrl: item.imageUrl
      });

      try {
        const audioItem = {
          _id: item._id || 'audio-' + Date.now(),
          title: item.title || 'Audio',
          artist: item.artist || item.description || 'Unknown Artist',
          imageUrl: item.thumbnailUrl || item.imageUrl || item.coverImage || item.headerImage || item.mainImage || '',
          thumbnailUrl: item.thumbnailUrl || item.imageUrl || item.coverImage || '',
          audioUrl: item.streamingUrl || item.audioUrl || '',
          streamingUrl: item.streamingUrl || item.audioUrl || '',
          type: 'audio',
          ...item
        };
        addRecentItem(audioItem);
        navigation.navigate('EnhancedAudioPlayer', {
          item: audioItem,
          playlist: playlist || [],
        });
      } catch (error) {
        console.error('Home - Error navigating to audio player:', error);
      }
    });
  };

  const handleRecentItemPress = (item: any) => {
    if (item.type === 'image') {
      const imageUrl = processAzureUrl(item.streamingUrl) || processAzureUrl(item.imageUrl) || processAzureUrl(item.thumbnailUrl) || processAzureUrl(item.mainImage) || processAzureUrl(item.headerImage);
      (navigation as any).navigate('ImageViewer', {
        images: [imageUrl].filter(url => url),
        initialIndex: 0,
        title: item.title || 'Image'
      });
    } else if (item.type === 'video' || item.videoUrl || item.videoUri) {
      handleVideoPress(item, []);
    } else if (item.type === 'pdf' || item.pdfUrl || item.downloadUrl) {
      requireAuth(() => {
        (navigation as any).navigate('PdfViewer', {
          uri: item.streamingUrl || item.pdfUrl || item.downloadUrl,
          title: item.title,
          description: item.description,
          item: item
        });
      });
    } else {
      handleAudioPress(item, []);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MainAppHeader username={isAuthenticated && user?.name ? user.name : ''} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        overScrollMode="never"
      >
        <CardCarousel />

        {/* Daily Gyan Gallery */}
        <DailyGyanGallery
          onItemPress={(item, index, allImages) => {
            requireAuth(() => {
              const imageItem = { 
                ...item, 
                type: 'image',
                imageUrl: item.streamingUrl || item.imageUrl || item.thumbnailUrl || item.mainImage || item.headerImage,
                thumbnailUrl: item.streamingUrl || item.imageUrl || item.thumbnailUrl || item.mainImage || item.headerImage
              };
              console.log('Home - Adding image to recent items:', imageItem);
              addRecentItem(imageItem);
              const imageItems = allImages.filter(img => img.type === 'image');
              const imageUrls = imageItems.map(img => 
                processAzureUrl(img.streamingUrl) || 
                processAzureUrl(img.imageUrl) || 
                processAzureUrl(img.thumbnailUrl) || 
                processAzureUrl(img.mainImage) || 
                processAzureUrl(img.headerImage) || ''
              ).filter(url => url);
              
              // Find the correct index in the filtered image array
              const correctIndex = imageItems.findIndex(img => img._id === item._id);
              
              (navigation as any).navigate('ImageViewer', {
                images: imageUrls,
                initialIndex: correctIndex >= 0 ? correctIndex : 0,
                title: 'Daily Gyan Gallery'
              });
            });
          }}
          onSeeAll={() => {
            navigation.navigate('GalleryList', {});
          }}
        />

        {/* Recently Played */}
        {isAuthenticated && recentItems && recentItems.length > 0 && (
          <MediaHorizontalList
            title={translateContent('Recently Played')}
            data={recentItems.slice(0, 10)}
            type="audio"
            onItemPress={handleRecentItemPress}
            onSeeAll={() => navigation.navigate('RecentlyPlayed')}
          />
        )}

        <MediaHorizontalList
          title={t('mediaTypes.audio')}
          data={isLoading ? skeletonData : displayTopAudios.filter(item => item && item._id)}
          type="audio"
          onItemPress={(item) => !item.isLoading && handleAudioPress(item, displayTopAudios)}
          onSeeAll={() => !isLoading && navigation.navigate('AllAudios')}
        />

        <MediaHorizontalList
          title={t('mediaTypes.video')}
          data={isLoading ? skeletonData : displayTopVideos.filter(item => item && item._id)}
          type="video"
          onItemPress={(item) => !item.isLoading && handleVideoPress(item, displayTopVideos)}
          onSeeAll={() => !isLoading && navigation.navigate('AllVideos', { item: displayTopVideos })}
        />

        {/* Books Section - Always show with fallback data */}
        <MediaHorizontalList
          title={t('mediaTypes.book') + 's'}
          data={displayTopBooks && displayTopBooks.length > 0 ? displayTopBooks : [
            {
              _id: 'book-1',
              title: 'Bhagavad Gita – As It Is',
              subtitle: 'Geeta Press, Gorakhpur',
              thumbnailUrl: '',
              streamingUrl: '',
              type: 'pdf'
            },
            {
              _id: 'book-2', 
              title: 'Ramcharitmanas',
              subtitle: 'Geeta Press, Gorakhpur',
              thumbnailUrl: '',
              streamingUrl: '',
              type: 'pdf'
            },
            {
              _id: 'book-3',
              title: 'Shri Krishna Leela', 
              subtitle: 'Chaukhamba Sanskrit Sansthan',
              thumbnailUrl: '',
              streamingUrl: '',
              type: 'pdf'
            }
          ]}
          type="pdf"
          onItemPress={(item) => {
            requireAuth(() => {
              console.log('Home - PDF item pressed:', item);
              const pdfItem = { ...item, type: 'pdf' };
              addRecentItem(pdfItem);
              (navigation as any).navigate('PdfViewer', {
                uri: item.streamingUrl || item.pdfUrl,
                title: item.title,
                description: item.description,
                item: item
              });
            });
          }}
          onSeeAll={() => navigation.navigate('AllPDFs')}
        />

        <MediaHorizontalList
          title={t('screens.home.recentUploads')}
          data={isLoading ? skeletonData : displayRecentUploads}
          type="audio"
          onItemPress={(item) => {
            if (item.isLoading) return;
            if (item.type === 'video') {
              handleVideoPress(item, displayRecentUploads.filter(i => i.type === 'video'));
            } else if (item.type === 'pdf') {
              requireAuth(() => {
                (navigation as any).navigate('PdfViewer', {
                  item: {
                    ...item,
                    pdfUrl: item.streamingUrl || item.pdfUrl,
                  }
                });
              });
            } else {
              handleAudioPress(item, displayRecentUploads.filter(i => i.type !== 'video' && i.type !== 'pdf'));
            }
          }}
        />
      </ScrollView>
    </View>
  );
};

export default Home;

//
// 🔹 Themed UI Helpers
//
const LoadingState = ({ colors, t }: { colors: any; t: any }) => (
  <View style={styles.centered}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={[styles.statusText, { color: colors.text }]}>{t('screens.home.loadingDashboard')}</Text>
  </View>
);

const ErrorState = ({
  colors,
  onRetry,
  t,
}: {
  colors: any;
  onRetry: () => void;
  t: any;
}) => (
  <View style={styles.centered}>
    <Text style={[styles.statusText, { color: colors.error }]}>{t('screens.home.failedToLoad')}</Text>
    <Text
      style={[styles.retryText, { color: colors.primary }]}
      onPress={onRetry}
    >
      {t('screens.home.tapToRetry')}
    </Text>
  </View>
);

//
// 🔹 Styles (mostly static)
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
  },
  retryText: {
    marginTop: 8,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
