import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';

import CardSection from '../../components/CardSection';
import MainAppHeader from '../../components/MainAppHeader';
import CardCarousel from '../../components/CardCarousel';
import { useAuth } from '../../context/AuthContext';
import { HomeStackParamList } from '../../navigation/types';
import { useGetDashboardMutation } from '../../data/redux/services/dashboardApi';

type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

const Home: React.FC = () => {
  const { colors } = useTheme(); // 👈 pulls dynamic theme colors
  const { user } = useAuth();
  const navigation = useNavigation<HomeNavigationProp>();

  const [getDashboardRequest, { data, isLoading, isError, error }] = useGetDashboardMutation();

  const fetchDashboard = useCallback(() => {
    getDashboardRequest([]);
  }, [getDashboardRequest]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading) return <LoadingState colors={colors} />;
  if (isError) {
    console.error('Dashboard fetch error:', error);
    return <ErrorState colors={colors} onRetry={fetchDashboard} />;
  }

  const dashboardData = data?.data || {};
  const { recentUploads = [], topVideos = [], topAudios = [] } = dashboardData;

  const handleVideoPress = (item: any) => {
    navigation.navigate('VideoPlayer', {
      item: {
        videoUri: 'https://www.w3schools.com/html/mov_bbb.mp4',
        title: item.title,
        showHeaderFromRoutes: ['HomeMain'],
      },
    });
  };

  const handleAudioPress = (item: any) => {
    navigation.navigate('AudioPlayer', { item });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MainAppHeader username={user?.name || 'User'} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <CardCarousel />

        <CardSection
          title="Recently Uploaded"
          data={recentUploads}
          imageKey="streamingUrl"
          titleKey="title"
          subtitleKey="description"
          contentTagName="tags"
          onSeeAll={() => Alert.alert('Coming soon!')}
          onItemPress={(item) => console.log('Pressed:', item)}
        />

        <CardSection
          title="Videos"
          data={topVideos}
          imageKey="thumbnailUrl"
          titleKey="title"
          subtitleKey="description"
          contentTagName="tags"
          onSeeAll={() => navigation.navigate('AllVideos', { item: topVideos })}
          onItemPress={handleVideoPress}
        />

        <CardSection
          title="Audios"
          data={topAudios}
          imageKey="thumbnailUrl"
          titleKey="title"
          subtitleKey="description"
          contentTagName="tags"
          onSeeAll={() => navigation.navigate('AllAudios')}
          onItemPress={handleAudioPress}
        />
      </ScrollView>
    </View>
  );
};

export default Home;

//
// 🔹 Themed UI Helpers
//
const LoadingState = ({ colors }: { colors: any }) => (
  <View style={styles.centered}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={[styles.statusText, { color: colors.text }]}>Loading Dashboard...</Text>
  </View>
);

const ErrorState = ({
  colors,
  onRetry,
}: {
  colors: any;
  onRetry: () => void;
}) => (
  <View style={styles.centered}>
    <Text style={[styles.statusText, { color: colors.error }]}>Failed to load dashboard.</Text>
    <Text
      style={[styles.retryText, { color: colors.primary }]}
      onPress={onRetry}
    >
      Tap to retry
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
    paddingHorizontal: 20,
    paddingBottom: 40,
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
