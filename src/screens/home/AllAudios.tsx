import { ScrollView, StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator, Dimensions, RefreshControl } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import CustomFastImage from '../../components/CustomFastImage'
import { processAzureUrl } from '../../utils/azureUrlHelper'
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

const AllAudios = () => {
  type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;
  const { navigate } = useNavigation<HomeNavigationProp>();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [isGridView, setIsGridView] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [width, setWidth] = useState(Dimensions.get('window').width)
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWidth(window.width)
    })
    return () => subscription?.remove()
  }, [])
  
  const is7Inch = width >= 600 && width < 800
  const is10Inch = width >= 800
  const numColumns = 3

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.outline }]}>
        <TouchableOpacity onPress={() => navigate('HomeMain')} style={styles.backButton}>
          <MaterialDesignIcons name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={[styles.headerTitle, { color: colors.onBackground }]}>{t('mediaTypes.audio')}</Text>
        </View>
        <TouchableOpacity 
          style={styles.viewToggle}
          onPress={() => {
            setIsTransitioning(true)
            setTimeout(() => {
              setIsGridView(!isGridView)
              setIsTransitioning(false)
            }, 100)
          }}
        >
          <MaterialDesignIcons 
            name={isGridView ? 'view-list' : 'view-grid'} 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
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
            <View>
              <TouchableOpacity
                style={styles.listItemRow}
                onPress={() => handleAudioPress(item)}
                activeOpacity={0.8}
              >
                <View style={styles.itemImage}>
                  <View style={[styles.listPlaceholder, { backgroundColor: colors.surfaceVariant }]}>
                    <MaterialDesignIcons 
                      name="headphones" 
                      size={24} 
                      color="#F8803B" 
                    />
                  </View>
                </View>
                
                <View style={styles.listTextContainer}>
                  <Text style={[styles.listItemTitle, { color: colors.onSurface }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.listItemSubtitle, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
                    {item.artist || item.description || 'Unknown'}
                  </Text>
                </View>
                
                <MaterialDesignIcons 
                  name="chevron-right" 
                  size={24} 
                  color="#F8803B" 
                />
              </TouchableOpacity>
              
              <View style={[styles.listSeparator, { backgroundColor: colors.outline }]} />
            </View>
          )
        }
        contentContainerStyle={isGridView ? styles.gridContent : styles.listContentContainer}
        columnWrapperStyle={isGridView ? { justifyContent: 'space-between' } : undefined}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#F8803B']}
            tintColor="#F8803B"
          />
        }
        ListHeaderComponent={() => (
          isLoading || isTransitioning ? (
            isGridView ? <ListViewSkeleton /> : <GridViewSkeleton />
          ) : null
        )}
      />
    </View>
  )
}

export default AllAudios

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewToggle: {
    padding: 8,
  },
  listContentContainer: {
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 0,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemImage: {
    marginRight: 15,
  },
  listImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  listPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listTextContainer: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 14,
    width: '75%',
  },
  listSeparator: {
    height: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  text: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  arrow: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: 8,
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
})