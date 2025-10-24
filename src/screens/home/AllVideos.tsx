import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import AppBarHeader from '../../components/AppBarHeader'
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native'
import UnifiedMediaCard from '../../components/UnifiedMediaCard'
import MediaListItem from '../../components/MediaListItem'
import ViewToggle from '../../components/ViewToggle'
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
  const [isGridView, setIsGridView] = useState(true)
  
  const { data: featuredData, isLoading } = useGetFeaturedQuery({ type: 'video' })
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
      <AppBarHeader title="Videos" />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.onBackground }]}>Loading videos...</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.onBackground }]}>Featured Videos</Text>
            <ViewToggle isGridView={isGridView} onToggle={setIsGridView} />
          </View>
          
          <FlatList
            data={videoData}
            numColumns={isGridView ? 2 : 1}
            key={isGridView ? 'grid' : 'list'}
            keyExtractor={(item, index) => item._id || index.toString()}
            renderItem={({ item }) => 
              isGridView ? (
                <UnifiedMediaCard
                  item={item}
                  type="video"
                  onPress={handleVideoPress}
                />
              ) : (
                <MediaListItem
                  item={item}
                  type="video"
                  onPress={handleVideoPress}
                />
              )
            }
            contentContainerStyle={isGridView ? styles.gridContent : styles.listContent}
            columnWrapperStyle={isGridView ? styles.row : undefined}
            showsVerticalScrollIndicator={false}
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
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  row: {
    justifyContent: 'space-around',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: 8,
  },
})