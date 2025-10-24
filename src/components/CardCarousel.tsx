import React from 'react'
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
  const imageUrl = resourceUrls?.headerImage || resourceUrls?.mainImage || processAzureUrl(item?.headerImage) || processAzureUrl(item?.mainImage) || processAzureUrl(item?.thumbnailUrl) || processAzureUrl(item?.imageUrl) || getImageUrl(item || {})
  const truncatedTitle = item.title.length > 35 ? item.title.substring(0, 35) + '...' : item.title
  
  console.log('CardItem - Processed Image URL:', imageUrl, 'for item:', item.title)
  console.log('CardItem - Resource URLs:', resourceUrls)
  
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
          <Text style={styles.text} numberOfLines={1}>{truncatedTitle}</Text>
        </View>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            onReadMore(item);
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
  
  // Fetch top 6 recently added categories
  const { data: categories = [], isLoading, error } = useGetRecentCategoriesQuery({ limit: 6 })
  
  console.log('CardCarousel - Categories loaded:', categories?.length || 0)
  console.log('CardCarousel - Loading:', isLoading)
  if (error) {
    console.error('CardCarousel - Error:', error)
  }
  
  const handleItemPress = (item: Category) => {
    console.log('CardCarousel - Category pressed:', item.title)
    ;(navigation as any).navigate('Categories', {
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
          type: 'blog'
        }
      }
    })
  }

  const handleReadMorePress = (item: Category) => {
    console.log('CardCarousel - Read More pressed:', item.title)
    console.log('CardCarousel - Item data:', item)
    ;(navigation as any).navigate('Categories', {
      screen: 'CategorieDataList',
      params: {
        title: item.title,
        id: item.sectionId?._id || item._id,
        categoryId: item._id,
        sectionId: item.sectionId?._id
      }
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
      <PagerView style={styles.pagerView} initialPage={0}>
        {categories.map((item: Category) => (
          <CardItem key={item._id} item={item} onPress={handleItemPress} onReadMore={handleReadMorePress} />
        ))}
      </PagerView>
    </View>
  )
}

export default CardCarousel

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  pagerView: {
    height: 200,
    marginBottom: 24,
  },
  cardContainer: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 20,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 16,
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  actionText: {
    color: '#000',
    fontWeight: '600',
  },
  text: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
})
