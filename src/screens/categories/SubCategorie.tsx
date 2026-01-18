import { StyleSheet, Text, View, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import AppBarHeader from '../../components/AppBarHeader'
import { useTheme } from 'react-native-paper'
import { useGetSubcategoriesByActionButtonMutation, useGetSubcategoriesMutation } from '../../data/redux/services/sectionsApi'
import { ScrollView } from 'react-native-gesture-handler'
import CustomFastImage from '../../components/CustomFastImage'
import BlogVideo from '../../components/BlogVideo'
import { useAzureAssets } from '../../hooks/useAzureAssets'
import CollageFrame from '../../components/CollageFrame'
import SkeletonItem from '../../components/SkeletonLoader'

import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import { wp, hp, normalize, isTablet } from '../../utils/responsive'
import LinearGradient from 'react-native-linear-gradient'
import { CategoriesStackParamList } from '../../navigation/types'
import { processAzureUrl } from '../../utils/azureUrlHelper'

type SubCategorieRouteProp = RouteProp<CategoriesStackParamList, 'SubCategorie'>;

type CategoriesNavigationProp = NativeStackNavigationProp<
  CategoriesStackParamList,
  'SubCategorie'
>;

interface Subcategory {
  _id: string;
  title: string;
  subtitle?: string;
  description1?: string;
  description2?: string;
  headerImage?: string;
  mainImage?: string;
  video?: string;
  mediaType?: string;
  mediaCount?: number;
  videos?: Array<{
    _id: string;
    title: string;
    duration: string;
    description: string;
    mediaFile: string;
    order: number;
  }>;
  audios?: Array<{
    _id: string;
    title: string;
    duration: string;
    description: string;
    mediaFile: string;
    order: number;
  }>;
  chapters?: Array<{
    _id: string;
    title: string;
    duration: string;
    url?: string;
    mediaFile?: string;
    order: number;
  }>;
  actionButton?: {
    id: string;
    title: string;
    icon: string;
    color: string;
    navigationType: string;
  };
}

const SubCategorie = () => {
  const route = useRoute<SubCategorieRouteProp>()
  const navigation = useNavigation<CategoriesNavigationProp>()
  const { categoryData, sectionId, categoryId, buttonType, title, actionButton, isChaptersList } = route.params
  const { colors } = useTheme()
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)
  const [showMediaList, setShowMediaList] = useState(false)
  const [mediaListLoading, setMediaListLoading] = useState(false)
  const [audioList, setAudioList] = useState<any[]>([])
  const [isGridView, setIsGridView] = useState(false)
  
  const [getSubcategoriesByActionButton, { isLoading, error }] = useGetSubcategoriesByActionButtonMutation()
  const [getSubcategoriesLegacy] = useGetSubcategoriesMutation()

  const isActionButtonMode = sectionId && categoryId && buttonType
  
  console.log('📱 Mode check - isActionButtonMode:', isActionButtonMode, 'isChaptersList:', isChaptersList, 'categoryData exists:', !!categoryData)

  useEffect(() => {
    fetchSubcategories()
  }, [sectionId, categoryId, buttonType])

  const fetchSubcategories = async () => {
    try {
      if (isActionButtonMode) {
        console.log('📱 Fetching subcategories by action button:', { sectionId, categoryId, buttonType })
        const response = await getSubcategoriesByActionButton({ sectionId, categoryId, buttonType })
        if (response.data?.success) {
          const subcategoriesData = response.data.data || []
          console.log('📱 All subcategories data:', JSON.stringify(subcategoriesData, null, 2))
          console.log('📱 Looking for button ID:', actionButton?.id)
          
          // Filter subcategories based on the specific button ID
          const filteredSubcategories = subcategoriesData.filter((subcategory: Subcategory) => {
            console.log('📱 Checking subcategory:', subcategory.title, 'actionButton.id:', subcategory.actionButton?.id)
            return subcategory.actionButton?.id === actionButton?.id
          })
          
          // If it's audio-list, the audios are in data[0].audios
          if (buttonType === 'audio-list' && subcategoriesData.length > 0 && subcategoriesData[0].audios) {
            console.log('🎧 Audio list found in data[0].audios:', subcategoriesData[0].audios.length)
            setAudioList(subcategoriesData[0].audios)
          }
          
          setSubcategories(filteredSubcategories)
          console.log('📱 Filtered subcategories for button ID:', actionButton?.id, 'Count:', filteredSubcategories?.length || 0)
        } else {
          console.error('📱 Failed to fetch subcategories:', response.data)
          setSubcategories([])
        }
      } else if (sectionId && categoryId && !isChaptersList) {
        // Regular subcategories mode - fetch subcategories for the category
        console.log('📱 Fetching regular subcategories for category:', categoryId)
        const response = await getSubcategoriesLegacy(categoryId)
        if (response.data?.success) {
          const subcategoriesData = response.data.data || []
          console.log('📱 Regular subcategories data:', subcategoriesData.length)
          console.log('📱 Subcategories details:', JSON.stringify(subcategoriesData, null, 2))
          setSubcategories(subcategoriesData)
        } else {
          console.error('📱 Failed to fetch regular subcategories:', response.data)
          setSubcategories([])
        }
      } else if (categoryData) {
        // Legacy mode - show single category content
        setSubcategories([])
      }
    } catch (error) {
      console.error('📱 Error fetching subcategories:', error)
      setSubcategories([])
    }
  }

  const fetchAudioList = async (subcategory: Subcategory) => {
    setMediaListLoading(true)
    setSelectedSubcategory(subcategory)
    try {
      const response = await getSubcategoriesByActionButton({ 
        sectionId, 
        categoryId: subcategory._id, 
        buttonType: 'audio-list' 
      })
      if (response.data?.success && response.data.data) {
        setAudioList(response.data.data)
        console.log('🎧 Audio list fetched:', response.data.data.length)
      }
    } catch (error) {
      console.error('🎧 Error fetching audio list:', error)
    }
    setTimeout(() => {
      setShowMediaList(true)
      setMediaListLoading(false)
    }, 500)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchSubcategories()
    setRefreshing(false)
  }

  const handleSubcategoryPress = (subcategory: Subcategory) => {
    console.log('📱 Subcategory pressed:', subcategory.title, 'MediaType:', subcategory.mediaType)
    console.log('📱 Full subcategory object:', JSON.stringify(subcategory, null, 2))
    console.log('📱 Videos available:', subcategory.videos?.length || 0)
    console.log('📱 Audios available:', subcategory.audios?.length || 0)
    console.log('📱 Chapters available:', subcategory.chapters?.length || 0)
    
    // Check if subcategory has chapters - navigate to chapters list
    if (subcategory.chapters && subcategory.chapters.length > 0) {
      console.log('📱 Chapters found, navigating to chapters list')
      navigation.navigate('SubCategorie', {
        sectionId,
        categoryId: subcategory._id,
        title: `${subcategory.title} - Chapters`,
        categoryData: subcategory,
        isChaptersList: true
      })
      return
    }
    
    // Check if this is an audio-list type and use available audio data
    if (subcategory.mediaType === 'audio-list' && (audioList.length > 0 || (subcategory.audios && subcategory.audios.length > 0))) {
      console.log('📱 Audio-list detected, audioList:', audioList.length, 'subcategory.audios:', subcategory.audios?.length || 0)
      console.log('📱 Setting states: mediaListLoading=true, selectedSubcategory=', subcategory.title)
      setMediaListLoading(true)
      setSelectedSubcategory(subcategory)
      setTimeout(() => {
        console.log('📱 Timeout completed, setting showMediaList=true, mediaListLoading=false')
        setShowMediaList(true)
        setMediaListLoading(false)
      }, 500)
      return
    }
    
    // Show media list in same screen
    if ((subcategory.videos && subcategory.videos.length > 0) || (subcategory.audios && subcategory.audios.length > 0)) {
      setMediaListLoading(true)
      setSelectedSubcategory(subcategory)
      setTimeout(() => {
        setShowMediaList(true)
        setMediaListLoading(false)
      }, 500)
    } else {
      navigation.navigate('BlogPage', { categoryData: subcategory })
    }
  }

  const renderSubcategoryItem = ({ item }: { item: Subcategory }) => {
    // Process image URL same as CategorieDataList
    let rawImageUrl = item.headerImage || item.mainImage || item.imageUrl;
    const finalImageUrl = processAzureUrl(rawImageUrl);
    
    console.log('🖼️ Subcategory image processing:', {
      title: item.title,
      headerImage: item.headerImage,
      mainImage: item.mainImage,
      finalUrl: finalImageUrl
    });
    
    if (isGridView) {
      return (
        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => handleSubcategoryPress(item)}
          activeOpacity={0.8}
        >
          <View style={styles.gridImageContainer}>
            {finalImageUrl ? (
              <CustomFastImage
                style={styles.gridImage}
                imageUrl={finalImageUrl}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.gridPlaceholder, { backgroundColor: colors.surfaceVariant || '#f0f0f0' }]}>
                <MaterialDesignIcons 
                  name="folder-outline" 
                  size={32} 
                  color={colors.primary} 
                />
              </View>
            )}
          </View>
          
          <View style={styles.gridContent}>
            <Text style={[styles.gridTitle, { color: colors.onSurface }]} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={[styles.gridSubtitle, { color: colors.onSurfaceVariant || colors.onSurface }]} numberOfLines={1}>
              {item.subtitle || 'Subcategory'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    
    return (
      <View>
        <TouchableOpacity
          style={styles.listRow}
          onPress={() => handleSubcategoryPress(item)}
          activeOpacity={0.8}
        >
          {finalImageUrl && (
            <CustomFastImage
              style={styles.listImage}
              imageUrl={finalImageUrl}
              resizeMode="cover"
            />
          )}

          <View style={styles.listTextContainer}>
            <Text
              style={[styles.listTitle, { color: colors.onSurface }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text
              style={[styles.listSubtitle, { color: colors.onSurfaceVariant || colors.onSurface }]}
              numberOfLines={2}
            >
              {item.subtitle || 'Subcategory content'}
            </Text>
          </View>

          <MaterialDesignIcons
            name="chevron-right"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>

        <View style={[styles.listSeparator, { backgroundColor: colors.outline }]} />
      </View>
    )
  }

  // Regular subcategories mode - show subcategories list
  if (sectionId && categoryId && !buttonType && !isChaptersList && subcategories.length > 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <AppBarHeader title={title || 'Subcategories'} onBack={() => navigation.goBack()} showDownload={false} showViewToggle={true} isGridView={isGridView} onToggleView={() => setIsGridView(!isGridView)} />
        
        <ScrollView
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
          nestedScrollEnabled={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.listContainer}>
            <FlatList
              data={subcategories}
              renderItem={renderSubcategoryItem}
              keyExtractor={(item) => item._id}
              numColumns={isGridView ? 3 : 1}
              key={isGridView ? 'grid-3' : 'list'}
              columnWrapperStyle={isGridView ? { justifyContent: 'space-between' } : undefined}
              scrollEnabled={false}
              nestedScrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
            />
          </View>
        </ScrollView>
      </View>
    )
  }

  // Legacy mode - show single category content
  if (!isActionButtonMode && categoryData && !sectionId) {
    const { resourceUrls } = useAzureAssets(categoryData)
    const { mainImage: mainImageUrl, video: videoUrl } = resourceUrls
    const [readingTime, setReadingTime] = useState(0)

    useEffect(() => {
      if (categoryData) {
        const wordCount = (categoryData?.description1?.split(' ').length || 0) + 
                         (categoryData?.description2?.split(' ').length || 0);
        setReadingTime(Math.ceil(wordCount / 200));
      }
    }, [categoryData]);

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <AppBarHeader title={categoryData?.title || 'Category'} onBack={() => navigation.goBack()} showDownload={false} />

        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Legacy category content rendering */}
          {categoryData && mainImageUrl && (
            <View style={styles.heroSection}>
              <TouchableOpacity style={styles.imageContainer} activeOpacity={0.9}>
                <CustomFastImage style={styles.mainImage} imageUrl={mainImageUrl} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.imageOverlay}
                />
                <View style={styles.heroContent}>
                  <View style={styles.categoryBadge}>
                    <MaterialDesignIcons name="folder-multiple" size={normalize(16)} color="#fff" />
                    <Text style={styles.categoryText}>Category</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {categoryData && (
            <View style={styles.contentWrapper}>
              <View style={styles.articleHeader}>
                <Text style={[styles.title, { color: colors.onSurface }]}>
                  {categoryData.title}
                </Text>
                
                {categoryData.subtitle && (
                  <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                    {categoryData.subtitle}
                  </Text>
                )}

                <View style={styles.articleMeta}>
                  <View style={styles.metaItem}>
                    <MaterialDesignIcons name="clock-outline" size={normalize(16)} color={colors.onSurfaceVariant} />
                    <Text style={[styles.metaText, { color: colors.onSurfaceVariant }]}>
                      {readingTime} min read
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MaterialDesignIcons name="eye-outline" size={normalize(16)} color={colors.onSurfaceVariant} />
                    <Text style={[styles.metaText, { color: colors.onSurfaceVariant }]}>
                      Article
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.articleContent}>
                {categoryData.description1 && (
                  <View style={styles.paragraphContainer}>
                    <Text style={[styles.paragraph, { color: colors.onSurface }]}>
                      {categoryData.description1}
                    </Text>
                  </View>
                )}

                {videoUrl && (
                  <View style={styles.videoSection}>
                    <View style={styles.sectionHeader}>
                      <MaterialDesignIcons name="play-circle" size={normalize(20)} color={colors.primary} />
                      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                        Watch Video
                      </Text>
                    </View>
                    <View style={styles.videoContainer}>
                      <BlogVideo uri={videoUrl} />
                    </View>
                  </View>
                )}

                {categoryData.description2 && (
                  <View style={styles.paragraphContainer}>
                    <Text style={[styles.paragraph, { color: colors.onSurface }]}>
                      {categoryData.description2}
                    </Text>
                  </View>
                )}

                {categoryData.collegeFrame?.type && (
                  <View style={styles.collageSection}>
                    <View style={styles.sectionHeader}>
                      <MaterialDesignIcons name="image-multiple" size={normalize(20)} color={colors.primary} />
                      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                        Gallery
                      </Text>
                    </View>
                    <CollageFrame
                      resourceUrls={resourceUrls}
                      type={categoryData.collegeFrame.type}
                      title={categoryData.title || 'Gallery'}
                    />
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    )
  }

  // Chapters list mode - show chapters from categoryData
  if (isChaptersList && categoryData?.chapters) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <AppBarHeader title={title || 'Chapters'} onBack={() => navigation.goBack()} showDownload={false} />
        
        <ScrollView>
          <View style={styles.listContainer}>
            <FlatList
              data={categoryData.chapters}
              renderItem={({ item }) => (
                <View>
                  <TouchableOpacity
                    style={styles.listRow}
                    onPress={() => {
                      console.log('📖 Chapter pressed:', item.title)
                      // Navigate to appropriate player based on chapter content
                      if (item.mediaFile) {
                        const processedMediaFile = processAzureUrl(item.mediaFile)
                        const finalMediaFile = processedMediaFile || item.mediaFile
                        
                        const processedItem = {
                          ...item,
                          mediaFile: finalMediaFile,
                          audioUrl: finalMediaFile,
                          videoUrl: finalMediaFile,
                          streamingUrl: finalMediaFile
                        }
                        
                        // Check if it's audio or video based on file extension or mediaType
                        const isAudio = item.mediaFile?.includes('.mp3') || item.mediaFile?.includes('.m4a') || item.mediaFile?.includes('audio')
                        
                        if (isAudio) {
                          navigation.navigate('EnhancedAudioPlayer', { 
                            item: processedItem, 
                            playlist: categoryData.chapters.map(chapter => ({
                              ...chapter,
                              mediaFile: processAzureUrl(chapter.mediaFile) || chapter.mediaFile,
                              audioUrl: processAzureUrl(chapter.mediaFile) || chapter.mediaFile
                            }))
                          })
                        } else if (item.mediaFile?.includes('.pdf') || item.url?.includes('.pdf')) {
                          navigation.navigate('BookDetailsScreen', { 
                            item: {
                              ...processedItem,
                              pdfUrl: finalMediaFile,
                              streamingUrl: finalMediaFile
                            },
                            title: item.title 
                          })
                        } else {
                          navigation.navigate('EnhancedVideoPlayer', { 
                            item: processedItem, 
                            playlist: categoryData.chapters.map(chapter => ({
                              ...chapter,
                              mediaFile: processAzureUrl(chapter.mediaFile) || chapter.mediaFile,
                              videoUrl: processAzureUrl(chapter.mediaFile) || chapter.mediaFile
                            }))
                          })
                        }
                      } else if (item.url) {
                        // Handle URL-based chapters (e.g., PDFs)
                        navigation.navigate('BookDetailsScreen', { 
                          item: {
                            ...item,
                            pdfUrl: item.url,
                            streamingUrl: item.url
                          },
                          title: item.title 
                        })
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.mediaIcon, { backgroundColor: '#4ECDC420' }]}>
                      <MaterialDesignIcons 
                        name={item.mediaFile?.includes('.pdf') || item.url?.includes('.pdf') ? 'file-pdf-box' : 
                              item.mediaFile?.includes('.mp3') || item.mediaFile?.includes('.m4a') ? 'music-note' : 'play-circle'} 
                        size={24} 
                        color="#4ECDC4" 
                      />
                    </View>
                    
                    <View style={styles.listTextContainer}>
                      <Text style={[styles.listTitle, { color: colors.onSurface }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={[styles.listSubtitle, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
                        {item.duration || 'Chapter content'}
                      </Text>
                    </View>
                    
                    <MaterialDesignIcons name="chevron-right" size={24} color={colors.primary} />
                  </TouchableOpacity>
                  <View style={[styles.listSeparator, { backgroundColor: colors.outline }]} />
                </View>
              )}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </ScrollView>
      </View>
    )
  }

  // Action button mode - show subcategories list
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <AppBarHeader title={title || 'Subcategories'} onBack={() => navigation.goBack()} showDownload={false} />
        <ScrollView style={styles.skeletonContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.listContainer}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View key={i} style={styles.skeletonListItem}>
                <SkeletonItem width={wp(18)} height={wp(18)} borderRadius={normalize(10)} />
                <View style={styles.skeletonTextContainer}>
                  <SkeletonItem width="80%" height={normalize(16)} borderRadius={8} style={{ marginBottom: hp(0.5) }} />
                  <SkeletonItem width="60%" height={normalize(14)} borderRadius={7} />
                </View>
                <SkeletonItem width={24} height={24} borderRadius={12} />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    )
  }

  if (error) {
    const isAzureError = error?.data?.azureError || error?.data?.message?.includes('Azure');
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <AppBarHeader title={title || 'Subcategories'} onBack={() => navigation.goBack()} showDownload={false} />
        <View style={styles.errorContainer}>
          <MaterialDesignIcons 
            name={isAzureError ? 'cloud-off' : 'alert-circle'} 
            size={64} 
            color={colors.error} 
          />
          <Text style={[styles.errorText, { color: colors.error }]}>
            {isAzureError ? 'Content not available' : 'Failed to load subcategories'}
          </Text>
          <Text style={[styles.errorSubtext, { color: colors.onSurfaceVariant }]}>
            {isAzureError 
              ? 'This content is being prepared. Please try again later.' 
              : 'Please check your connection and try again.'}
          </Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={fetchSubcategories}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      {!showMediaList && (
        <AppBarHeader title={title || 'Subcategories'} onBack={() => navigation.goBack()} showDownload={false} showViewToggle={true} isGridView={isGridView} onToggleView={() => setIsGridView(!isGridView)} />
      )}
      
    

      {console.log('📱 Render check - subcategories.length:', subcategories.length, 'isChaptersList:', isChaptersList, 'showMediaList:', showMediaList, 'mediaListLoading:', mediaListLoading)}
      {subcategories.length === 0 && !isChaptersList ? (
        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
          <MaterialDesignIcons name="folder-open" size={64} color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.onSurface }]}>No {actionButton?.title || title} found</Text>
          <Text style={[styles.emptySubtext, { color: colors.onSurfaceVariant }]}>
            No content available for {actionButton?.title || title}
          </Text>
        </View>
      ) : mediaListLoading ? (
        <ScrollView style={styles.skeletonContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.listContainer}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={styles.skeletonListItem}>
                <SkeletonItem width={wp(18)} height={wp(18)} borderRadius={normalize(10)} />
                <View style={styles.skeletonTextContainer}>
                  <SkeletonItem width="75%" height={normalize(16)} borderRadius={8} style={{ marginBottom: hp(0.5) }} />
                  <SkeletonItem width="50%" height={normalize(14)} borderRadius={7} />
                </View>
                <SkeletonItem width={24} height={24} borderRadius={12} />
              </View>
            ))}
          </View>
        </ScrollView>
      ) : showMediaList && selectedSubcategory ? (
        <View style={{ flex: 1 }}>
          <AppBarHeader 
            title={selectedSubcategory.title} 
            onBack={() => setShowMediaList(false)} 
            showDownload={false} 
            showViewToggle={true} 
            isGridView={isGridView} 
            onToggleView={() => setIsGridView(!isGridView)} 
          />
          <ScrollView
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
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.listContainer}>
              <FlatList
                data={selectedSubcategory.mediaType === 'audio-list' ? (selectedSubcategory.audios || audioList || []) : (selectedSubcategory.videos || selectedSubcategory.audios || [])}
                renderItem={({ item, index }) => {
                  const isAudio = selectedSubcategory.mediaType === 'audio-list' || (selectedSubcategory.audios && !selectedSubcategory.videos);
                  const numColumns = isGridView ? 3 : 1;
                  
                  if (isGridView) {
                    const screenWidth = require('react-native').Dimensions.get('window').width;
                    const containerPadding = 32; // 16 * 2
                    const itemSpacing = 6;
                    const totalSpacing = containerPadding + itemSpacing * (numColumns - 1);
                    const itemWidth = Math.floor((screenWidth - totalSpacing) / numColumns);
                    const isLastInRow = (index + 1) % numColumns === 0;
                    
                    return (
                      <View style={{ 
                        width: itemWidth, 
                        marginRight: isLastInRow ? 0 : itemSpacing,
                        marginBottom: 8
                      }}>
                        <TouchableOpacity
                          style={[styles.gridItem, { 
                            backgroundColor: colors.surface || '#fff',
                            shadowColor: colors.shadow || '#000',
                            flex: 1,
                            margin: 0,
                          }]}
                          onPress={() => {
                            console.log('🎬 Grid item pressed:', item.title);
                            const processedMediaFile = processAzureUrl(item.mediaFile)
                            const finalMediaFile = processedMediaFile || item.mediaFile
                            
                            if (!finalMediaFile || finalMediaFile.trim() === '') {
                              console.error('❌ No valid media URL found for:', item.title)
                              return
                            }
                            
                            const processedItem = {
                              ...item,
                              mediaFile: finalMediaFile,
                              videoUrl: finalMediaFile,
                              audioUrl: finalMediaFile,
                              streamingUrl: finalMediaFile
                            }
                            
                            if (selectedSubcategory.videos && selectedSubcategory.videos.find(v => v._id === item._id)) {
                              console.log('🎬 Navigating to video player');
                              navigation.navigate('EnhancedVideoPlayer', { item: processedItem, playlist: [] })
                            } else {
                              console.log('🎵 Navigating to audio player');
                              navigation.navigate('EnhancedAudioPlayer', { item: processedItem, playlist: [] })
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <View style={styles.gridImageContainer}>
                            {item.headerImage || item.mainImage || item.imageUrl ? (
                              <CustomFastImage
                                style={styles.gridImage}
                                imageUrl={processAzureUrl(item.headerImage || item.mainImage || item.imageUrl)}
                                resizeMode="cover"
                              />
                            ) : (
                              <View style={[styles.gridPlaceholder, { backgroundColor: isAudio ? '#4ECDC420' : '#FF6B6B20' }]}>
                                <MaterialDesignIcons 
                                  name={isAudio ? 'music-note' : 'play-circle'} 
                                  size={32} 
                                  color={isAudio ? '#4ECDC4' : '#FF6B6B'} 
                                />
                              </View>
                            )}
                          </View>
                          
                          <View style={styles.gridContent}>
                            <Text style={[styles.gridTitle, { color: colors.onSurface }]} numberOfLines={2}>
                              {item.title}
                            </Text>
                            <Text style={[styles.gridSubtitle, { color: colors.onSurfaceVariant || colors.onSurface }]} numberOfLines={1}>
                              {item.description || item.duration || (isAudio ? 'Audio' : 'Video')}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  }
                  
                  return (
                  <View>
                    <TouchableOpacity
                      style={styles.listRow}
                      onPress={() => {
                        console.log('🎬 List item pressed:', item.title);
                        const processedMediaFile = processAzureUrl(item.mediaFile)
                        console.log('🎬 Raw mediaFile:', item.mediaFile)
                        console.log('🎬 Processed mediaFile:', processedMediaFile)
                        
                        const finalMediaFile = processedMediaFile || item.mediaFile
                        
                        if (!finalMediaFile || finalMediaFile.trim() === '') {
                          console.error('❌ No valid media URL found for:', item.title)
                          return
                        }
                        
                        console.log('🎬 Final media URL to use:', finalMediaFile)
                        
                        const processedItem = {
                          ...item,
                          mediaFile: finalMediaFile,
                          videoUrl: finalMediaFile,
                          audioUrl: finalMediaFile,
                          streamingUrl: finalMediaFile,
                          headerImage: item.headerImage ? processAzureUrl(item.headerImage) : undefined,
                          mainImage: item.mainImage ? processAzureUrl(item.mainImage) : undefined,
                          imageUrl: item.imageUrl ? processAzureUrl(item.imageUrl) : undefined
                        }
                        console.log('🎬 Playing media:', processedItem.title, 'Final URL:', processedItem.mediaFile)
                        
                        if (selectedSubcategory.videos && selectedSubcategory.videos.find(v => v._id === item._id)) {
                          console.log('🎬 Navigating to video player');
                          navigation.navigate('EnhancedVideoPlayer', { 
                            item: processedItem, 
                            playlist: selectedSubcategory.videos.map(media => {
                              const processedUrl = processAzureUrl(media.mediaFile) || media.mediaFile
                              return {
                                ...media,
                                mediaFile: processedUrl,
                                videoUrl: processedUrl,
                                streamingUrl: processedUrl,
                                headerImage: media.headerImage ? processAzureUrl(media.headerImage) : undefined,
                                mainImage: media.mainImage ? processAzureUrl(media.mainImage) : undefined,
                                imageUrl: media.imageUrl ? processAzureUrl(media.imageUrl) : undefined
                              }
                            })
                          })
                        } else {
                          console.log('🎵 Navigating to audio player');
                          const currentAudioList = selectedSubcategory.audios || audioList || []
                          navigation.navigate('EnhancedAudioPlayer', { 
                            item: processedItem, 
                            playlist: currentAudioList.map(media => {
                              const processedUrl = processAzureUrl(media.mediaFile) || media.mediaFile
                              return {
                                ...media,
                                mediaFile: processedUrl,
                                audioUrl: processedUrl,
                                streamingUrl: processedUrl,
                                headerImage: media.headerImage ? processAzureUrl(media.headerImage) : undefined,
                                mainImage: media.mainImage ? processAzureUrl(media.mainImage) : undefined,
                                imageUrl: media.imageUrl ? processAzureUrl(media.imageUrl) : undefined
                              }
                            })
                          })
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      {item.headerImage || item.mainImage || item.imageUrl ? (
                        <CustomFastImage
                          style={styles.listImage}
                          imageUrl={processAzureUrl(item.headerImage || item.mainImage || item.imageUrl)}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.mediaIcon, { 
                          backgroundColor: (selectedSubcategory.mediaType === 'audio-list' || (selectedSubcategory.audios && !selectedSubcategory.videos)) ? '#4ECDC420' : '#FF6B6B20' 
                        }]}>
                          <MaterialDesignIcons 
                            name={(selectedSubcategory.mediaType === 'audio-list' || (selectedSubcategory.audios && !selectedSubcategory.videos)) ? 'music-note' : 'play-circle'} 
                            size={24} 
                            color={(selectedSubcategory.mediaType === 'audio-list' || (selectedSubcategory.audios && !selectedSubcategory.videos)) ? '#4ECDC4' : '#FF6B6B'} 
                          />
                        </View>
                      )}
                      <View style={styles.listTextContainer}>
                        <Text style={[styles.listTitle, { color: colors.onSurface }]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={[styles.listSubtitle, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
                          {item.description || item.duration}
                        </Text>
                      </View>
                      <MaterialDesignIcons name="chevron-right" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <View style={[styles.listSeparator, { backgroundColor: colors.outline }]} />
                  </View>
                  );
                  }
                }
                keyExtractor={(item) => item._id}
                numColumns={isGridView ? 3 : 1}
                key={isGridView ? 'grid-3' : 'list'}
                contentContainerStyle={[
                  isGridView ? { paddingTop: 12 } : {},
                  { flexGrow: 1 }
                ]}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
        </ScrollView>
        </View>
      ) : subcategories.length > 0 ? (
        <ScrollView
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
          nestedScrollEnabled={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.listContainer}>
            <FlatList
              data={subcategories}
              renderItem={renderSubcategoryItem}
              keyExtractor={(item) => item._id}
              numColumns={isGridView ? 3 : 1}
              key={isGridView ? 'grid-3' : 'list'}
              columnWrapperStyle={isGridView ? { justifyContent: 'space-between' } : undefined}
              scrollEnabled={false}
              nestedScrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
            />
          </View>
        </ScrollView>
      ) : null}
    </View>
  )
}

export default SubCategorie

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: hp(12),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: normalize(16),
    textAlign: 'center',
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
    textAlign: 'center',
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
  actionButtonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  actionButtonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: normalize(20),
  },
  actionButtonIcon: {
    fontSize: normalize(16),
    marginRight: wp(1),
  },
  actionButtonText: {
    fontSize: normalize(14),
    fontWeight: '600',
  },
  subcategoryCount: {
    fontSize: normalize(14),
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
  },
  listImage: {
    width: wp(18),
    height: wp(18),
    borderRadius: normalize(10),
    overflow: 'hidden',
  },
  listTextContainer: {
    flex: 1,
    marginLeft: wp(4),
  },
  listTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
    marginBottom: hp(0.5),
  },
  listSubtitle: {
    fontSize: normalize(14),
    marginBottom: hp(0.5),
    width: '75%',
  },
  listBadgeContainer: {
    marginTop: hp(0.5),
  },
  listActionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: normalize(12),
    alignSelf: 'flex-start',
  },
  listActionIcon: {
    fontSize: normalize(12),
    marginRight: wp(1),
  },
  listActionText: {
    fontSize: normalize(12),
    fontWeight: '500',
  },
  listSeparator: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1),
  },
  backText: {
    fontSize: normalize(16),
    fontWeight: '500',
    marginLeft: wp(1),
  },
  mediaListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  mediaListTitle: {
    fontSize: normalize(18),
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginRight: wp(12),
  },
  mediaIcon: {
    width: wp(18),
    height: wp(18),
    borderRadius: normalize(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(8),
  },
  emptyText: {
    fontSize: normalize(18),
    fontWeight: '600',
    textAlign: 'center',
    marginTop: hp(2),
  },
  emptySubtext: {
    fontSize: normalize(14),
    textAlign: 'center',
    marginTop: hp(1),
  },
  errorSubtext: {
    fontSize: normalize(14),
    textAlign: 'center',
    marginTop: hp(1),
    marginBottom: hp(2),
    paddingHorizontal: wp(4),
  },
  gridItem: {
    flex: 1,
    margin: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  gridImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContent: {
    padding: 8,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  gridSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  skeletonContainer: {
    flex: 1,
    padding: wp(4),
  },
  skeletonListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    marginBottom: hp(1),
  },
  skeletonTextContainer: {
    flex: 1,
    marginLeft: wp(4),
  },
  // Legacy styles for category content
  heroSection: {
    position: 'relative',
  },
  imageContainer: {
    position: 'relative',
    height: hp(30),
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: hp(15),
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
    flex: 1,
  },
  articleHeader: {
    paddingHorizontal: wp(4),
    paddingTop: hp(3),
    paddingBottom: hp(2),
  },
  title: {
    fontSize: normalize(28),
    fontWeight: '800',
    lineHeight: normalize(36),
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: normalize(18),
    fontWeight: '500',
    lineHeight: normalize(24),
    marginBottom: hp(2),
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
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
  articleContent: {
    paddingHorizontal: wp(4),
  },
  paragraphContainer: {
    marginBottom: hp(3),
  },
  paragraph: {
    fontSize: normalize(16),
    fontWeight: '400',
    lineHeight: normalize(26),
    textAlign: 'justify',
  },
  videoSection: {
    marginVertical: hp(3),
  },
  collageSection: {
    marginVertical: hp(3),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: normalize(18),
    fontWeight: '700',
    marginLeft: wp(2),
    flex: 1,
  },
  videoContainer: {
    borderRadius: normalize(12),
    overflow: 'hidden',
  },
})
