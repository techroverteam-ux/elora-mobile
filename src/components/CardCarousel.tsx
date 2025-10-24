import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import PagerView from 'react-native-pager-view'
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import CustomFastImage from './CustomFastImage'
import { useGetRecentCategoriesQuery } from '../data/redux/services/categoriesApi'
import { useTheme } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { getImageUrl, processAzureUrl } from '../utils/azureUrlHelper'
import { useAzureAssets } from '../hooks/useAzureAssets'

type Category = {
  _id: string
  title: string
  subtitle?: string
  description1?: string
  description2?: string
  headerImage?: string
  mainImage?: string
  thumbnailUrl?: string
  imageUrl?: string
  sectionId?: {
    _id: string
    title: string
  }
}

type CardItemProps = {
  item: Category
  onPress: (item: Category) => void
  onReadMore: (item: Category) => void
}

const CardItem: React.FC<CardItemProps> = ({ item, onPress, onReadMore }) => {
  const { resourceUrls } = useAzureAssets(item || {})
  const imageUrl =
    resourceUrls?.headerImage ||
    resourceUrls?.mainImage ||
    processAzureUrl(item?.headerImage) ||
    processAzureUrl(item?.mainImage) ||
    processAzureUrl(item?.thumbnailUrl) ||
    processAzureUrl(item?.imageUrl) ||
    getImageUrl(item || {})
  const truncatedTitle = item.title.length > 35 ? item.title.substring(0, 35) + '...' : item.title

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={() => onPress(item)} activeOpacity={0.9}>
      {imageUrl ? (
        <CustomFastImage style={styles.image} imageUrl={imageUrl} />
      ) : (
        <View style={[styles.image, styles.placeholderImage]}>
          <MaterialDesignIcons name="image" size={40} color="#ccc" />
        </View>
      )}
      <View style={styles.overlay}>
        <View>
          <Text style={styles.text} numberOfLines={1}>
            {truncatedTitle}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation()
            onReadMore(item)
          }}
        >
          <Text style={styles.actionText}>Read More</Text>
          <MaterialDesignIcons name="chevron-right" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const CardCarousel: React.FC = () => {
  const { colors } = useTheme()
  const navigation = useNavigation()
  const [currentPage, setCurrentPage] = useState(0)

  // Fetch top 6 recently added categories
  const { data: categories = [], isLoading, error } = useGetRecentCategoriesQuery({ limit: 6 })

  const handleItemPress = (item: Category) => {
    ; (navigation as any).navigate('Categories', {
      screen: 'BlogPage',
      params: {
        categoryData: {
          ...item,
          _id: item._id,
          categoryId: item._id,
          sectionId: item._id,
          name: item.title,
          title: item.title,
          description: item.description1 || item.subtitle,
          type: 'blog',
        },
      },
    })
  }

  const handleReadMorePress = (item: Category) => {
    ; (navigation as any).navigate('Categories', {
      screen: 'CategorieDataList',
      params: {
        title: item.title,
        id: item.sectionId?._id || item._id,
        categoryId: item._id,
        sectionId: item.sectionId?._id,
      },
    })
  }

  if (isLoading) {
    return (
      <View style={[styles.pagerView, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>Loading categories...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.pagerView, { justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialDesignIcons name="alert-circle" size={40} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>Failed to load categories</Text>
        <Text style={[styles.errorSubtext, { color: colors.onSurfaceVariant }]}>Please check your connection</Text>
      </View>
    )
  }

  if (categories.length === 0) {
    return (
      <View style={[styles.pagerView, { justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialDesignIcons name="folder-outline" size={40} color={colors.onSurfaceVariant} />
        <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>No categories available</Text>
      </View>
    )
  }

  return (
    <View>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>Featured Categories</Text>
        <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>Recently Added</Text>
      </View>

      <PagerView
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {categories.map((item: Category) => (
          <CardItem key={item._id} item={item} onPress={handleItemPress} onReadMore={handleReadMorePress} />
        ))}
      </PagerView>

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        {categories.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === currentPage ? colors.primary : colors.outlineVariant },
            ]}
          />
        ))}
      </View>
    </View>
  )
}

export default CardCarousel

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  pagerView: {
    height: 240,
    marginBottom: 12,
  },
  cardContainer: {
    marginHorizontal: 10,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  image: {
    width: '100%',
    height: 240,
  },
  placeholderImage: {
    backgroundColor: '#e6e6e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 18,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  text: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: '#f0f0f0',
    fontSize: 15,
    fontWeight: '400',
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  actionText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
    marginRight: 2,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    opacity: 0.7,
  },
  errorText: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: 5,
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.7,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.7,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
})
