import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Dimensions, RefreshControl } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import AppBarHeader from '../../components/AppBarHeader'
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native'
import UnifiedMediaCard from '../../components/UnifiedMediaCard'
import CustomFastImage from '../../components/CustomFastImage'
import MediaListItem from '../../components/MediaListItem'
import ViewToggle from '../../components/ViewToggle'
import { GridViewSkeleton, ListViewSkeleton } from '../../components/SkeletonLoader'
import { processAzureUrl } from '../../utils/azureUrlHelper'
import { useTheme } from 'react-native-paper'
import { useGetFeaturedQuery } from '../../data/redux/services/mediaApi'

// 1️⃣ Define your navigation param list
type RootStackParamList = {
  AllVideos: { item: any }  // 👈 define params expected for this route
  // other routes...
}

// 2️⃣ Tell useRoute() which route type you’re using
type AllVideosRouteProp = RouteProp<RootStackParamList, 'AllVideos'>

const AllVideos = () => {
  const navigation = useNavigation()
  const route = useRoute<AllVideosRouteProp>()
  const { colors } = useTheme()
  const { t } = useTranslation()
  const [isGridView, setIsGridView] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
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
  
  const { data: featuredData, isLoading, refetch } = useGetFeaturedQuery({ type: 'video' })
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
    } catch (error) {
      console.error('AllVideos - Refresh error:', error)
    } finally {
      setRefreshing(false)
    }
  }
  const videoData = featuredData?.data?.videos || route.params?.item || []

  const handleVideoPress = (videoItem: any) => {
    (navigation as any).navigate('EnhancedVideoPlayer', {
      item: {
        ...videoItem,
        videoUri: videoItem.videoUrl || videoItem.videoUri || videoItem.streamingUrl,
        title: videoItem.title,
      }
    })
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.outline }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialDesignIcons name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={[styles.headerTitle, { color: colors.onBackground }]}>{t('mediaTypes.video')}</Text>
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

      {isLoading || isTransitioning ? (
        isGridView ? <ListViewSkeleton /> : <GridViewSkeleton />
      ) : (
        <>
          <FlatList
            data={videoData}
            numColumns={isGridView ? numColumns : 1}
            key={isGridView ? `grid-${numColumns}` : 'list'}
            keyExtractor={(item, index) => item._id || index.toString()}
            renderItem={({ item }) => 
              isGridView ? (
                <UnifiedMediaCard
                  item={item}
                  type="video"
                  onPress={handleVideoPress}
                />
              ) : (
                <View>
                  <TouchableOpacity
                    style={styles.listItemRow}
                    onPress={() => handleVideoPress(item)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.itemImage}>
                      {(() => {
                        const imageUrl = item.streamingUrl || item.thumbnailUrl || item.imageUrl || item.coverImage || item.headerImage || item.mainImage;
                        const processedUrl = processAzureUrl(imageUrl);
                        console.log('Video item:', item.title, 'Raw URL:', imageUrl, 'Processed URL:', processedUrl);
                        return processedUrl ? (
                          <CustomFastImage 
                            style={styles.listImage} 
                            imageUrl={processedUrl}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={[styles.listPlaceholder, { backgroundColor: colors.surfaceVariant }]}>
                            <MaterialDesignIcons 
                              name="video" 
                              size={24} 
                              color={colors.onSurfaceVariant} 
                            />
                          </View>
                        );
                      })()}
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
          />
        </>
      )}
    </View>
  )
}

export default AllVideos

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  listContentContainer: {
    width: '90%',
    alignSelf: 'center',
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
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: 8,
  },
})