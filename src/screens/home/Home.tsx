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

type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

const Home: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation<HomeNavigationProp>();
  const { requireAuth } = useRequireAuth();

  const { data, isLoading, isError, refetch } = useGetDashboardQuery();

  if (isLoading) return <LoadingState colors={colors} t={t} />;
  if (isError) return <ErrorState colors={colors} onRetry={refetch} t={t} />;

  const dashboardData = data?.data || {};
  const { recentUploads = [], topVideos = [], topAudios = [], topBooks = [] } = dashboardData;

  // Use only real API data from Azure
  const displayTopAudios = topAudios;
  const displayTopVideos = topVideos;
  const displayTopBooks = topBooks;
  const displayRecentUploads = recentUploads;

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
        navigation.navigate('EnhancedVideoPlayer', {
          item: {
            ...item,
            _id: item._id || 'video-' + Date.now(),
            videoUri: item.videoUrl || item.videoUri || item.streamingUrl || '',
            videoUrl: item.videoUrl || item.streamingUrl || '',
            streamingUrl: item.streamingUrl || '',
            title: item.title || 'Video',
            thumbnailUrl: item.thumbnailUrl || item.imageUrl || '',
          },
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
        navigation.navigate('EnhancedAudioPlayer', {
          item: {
            _id: item._id || 'audio-' + Date.now(),
            title: item.title || 'Audio',
            artist: item.artist || item.description || 'Unknown Artist',
            imageUrl: item.thumbnailUrl || item.imageUrl || item.coverImage || item.headerImage || item.mainImage || '',
            thumbnailUrl: item.thumbnailUrl || item.imageUrl || item.coverImage || '',
            audioUrl: item.streamingUrl || item.audioUrl || '',
            streamingUrl: item.streamingUrl || item.audioUrl || '',
            ...item
          },
          playlist: playlist || [],
        });
      } catch (error) {
        console.error('Home - Error navigating to audio player:', error);
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MainAppHeader username={isAuthenticated && user?.name ? user.name : ''} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <CardCarousel />

        {/* Daily Gyan Gallery */}
        <DailyGyanGallery
          onItemPress={(item, index, allImages) => {
            requireAuth(() => {
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

        {displayTopAudios && Array.isArray(displayTopAudios) && displayTopAudios.length > 0 && (
          <MediaHorizontalList
            title={t('mediaTypes.audio')}
            data={displayTopAudios.filter(item => item && item._id)}
            type="audio"
            onItemPress={(item) => handleAudioPress(item, displayTopAudios)}
            onSeeAll={() => navigation.navigate('AllAudios')}
          />
        )}

        {displayTopVideos && Array.isArray(displayTopVideos) && displayTopVideos.length > 0 && (
          <MediaHorizontalList
            title={t('mediaTypes.video')}
            data={displayTopVideos.filter(item => item && item._id)}
            type="video"
            onItemPress={(item) => handleVideoPress(item, displayTopVideos)}
            onSeeAll={() => navigation.navigate('AllVideos', { item: displayTopVideos })}
          />
        )}

        {displayTopBooks && displayTopBooks.length > 0 && (
          <MediaHorizontalList
            title={t('mediaTypes.book')}
            data={displayTopBooks}
            type="pdf"
            onItemPress={(item) => {
              requireAuth(() => {
                console.log('Home - PDF item pressed:', item);
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
        )}

        {displayRecentUploads && displayRecentUploads.length > 0 && (
          <MediaHorizontalList
            title={t('screens.home.recentUploads')}
            data={displayRecentUploads}
            type="audio"
            onItemPress={(item) => {
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
        )}
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
    paddingBottom: 20,
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
