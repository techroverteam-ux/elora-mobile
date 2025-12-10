import { ScrollView, StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator, Dimensions, RefreshControl } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AppBarHeader from '../../components/AppBarHeader'
import UnifiedMediaCard from '../../components/UnifiedMediaCard';
import MediaListItem from '../../components/MediaListItem';
import ViewToggle from '../../components/ViewToggle';
import { GridViewSkeleton, ListViewSkeleton } from '../../components/SkeletonLoader';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { useGetFeaturedQuery } from '../../data/redux/services/mediaApi';
import { translateContent } from '../../utils/contentTranslator';

const buttons = [
  { label: 'Bhajans', color: '#f97316' },    // Orange
  { label: 'Nitya Stuti', color: '#8b5cf6' }, // Purple
  { label: 'Satsang', color: '#ef4444' },     // Red
  { label: 'Sandhya', color: '#3b82f6' },     // Blue
];

const AllAudios = () => {
  type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;
  const { navigate } = useNavigation<HomeNavigationProp>();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [isGridView, setIsGridView] = useState(true);
  const [width, setWidth] = useState(Dimensions.get('window').width)
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWidth(window.width)
    })
    return () => subscription?.remove()
  }, [])
  
  const is7Inch = width >= 600 && width < 800
  const is10Inch = width >= 800
  const numColumns = is10Inch ? 4 : 3

  const { data: featuredData, isLoading, refetch } = useGetFeaturedQuery({ type: 'audio' });
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('AllAudios - Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };
  const audioData = featuredData?.data?.audios || [];

  const handleAudioPress = (item: any) => {
    navigate('EnhancedAudioPlayer', {
      item: {
        _id: item._id,
        title: item.title,
        artist: item.artist || item.description,
        imageUrl: item.thumbnailUrl || item.imageUrl,
        audioUrl: item.streamingUrl || item.audioUrl,
      }
    });
  };

  // Split buttons into rows of 2
  const rows = [];
  for (let i = 0; i < buttons.length; i += 2) {
    rows.push(buttons.slice(i, i + 2));
  }

  return (
    <View>
      <AppBarHeader title={t('mediaTypes.audio')} />

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#F8803B']}
            tintColor="#F8803B"
          />
        }
      >
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.buttonRow}>
            {row.map((btn, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.button, { backgroundColor: btn.color }]}
                onPress={() => {
                  navigate("AudioCategoryScreen", { title: btn.label })
                  console.log('Pressed:', btn.label)
                }}
              >
                <Text style={styles.text}>{translateContent(btn.label)}</Text>
                <Text style={[styles.arrow, { color: '#fff' }]}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {isLoading ? (
          isGridView ? <GridViewSkeleton /> : <ListViewSkeleton />
        ) : (
          <>
            <View style={styles.header}>
              <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>{t('screens.home.featuredContent')} {t('mediaTypes.audio')}</Text>
              <ViewToggle isGridView={isGridView} onToggle={setIsGridView} />
            </View>
            
            <FlatList
              data={audioData}
              numColumns={isGridView ? numColumns : 1}
              key={isGridView ? `grid-${numColumns}` : 'list'}
              keyExtractor={(item, index) => item._id || index.toString()}
              renderItem={({ item }) => 
                isGridView ? (
                  <UnifiedMediaCard
                    item={item}
                    type="audio"
                    onPress={handleAudioPress}
                  />
                ) : (
                  <MediaListItem
                    item={item}
                    type="audio"
                    onPress={handleAudioPress}
                  />
                )
              }
              contentContainerStyle={isGridView ? styles.gridContent : styles.listContent}
              columnWrapperStyle={isGridView ? styles.row : undefined}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </ScrollView>
    </View>
  )
}

export default AllAudios

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 15,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  arrow: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: 8,
  },
  gridContent: {
    paddingHorizontal: 16,
  },
  row: {
    justifyContent: 'space-around',
  },
})