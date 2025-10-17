import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { RouteProp, useRoute } from '@react-navigation/native'
import AppBarHeader from '../../components/AppBarHeader'
import { useTheme } from 'react-native-paper'
import { useGetSubcategoriesMutation } from '../../data/redux/services/sectionsApi'
import { ScrollView } from 'react-native-gesture-handler'
import CustomFastImage from '../../components/CustomFastImage'
import { WIDTH } from '../../utils/HelperFunctions'
import BlogVideo from '../../components/BlogVideo'
import { useAzureAssets } from '../../hooks/useAzureAssets'
import CollageFrame from '../../components/CollageFrame'

type SubCategorieRouteParams = {
  SubCategorie: { categoryId: any }
}

const SubCategorie = () => {
  const route = useRoute<RouteProp<SubCategorieRouteParams, 'SubCategorie'>>()
  const { categoryId } = route.params

  const { colors } = useTheme()

  const [getSubCategoriesRequest, { data, error, isLoading }] = useGetSubcategoriesMutation()
  const subCategoryData = data?.data?.[0]

  useEffect(() => {
    getSubCategoriesRequest(categoryId)
  }, [getSubCategoriesRequest, categoryId])

  const { resourceUrls } = useAzureAssets(subCategoryData)
  const { mainImage: mainImageUrl, video: videoUrl } = resourceUrls

  // Show loading
  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
        <Text style={{ color: colors.onSurface }}>Loading...</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title={subCategoryData?.title || 'SubCategorie'} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {subCategoryData ? (
          <>
            {mainImageUrl && (
              <CustomFastImage style={styles.mainImage} imageUrl={mainImageUrl} />
            )}

            {/* Blog Content */}
            <View style={styles.contentWrapper}>
              <Text style={[styles.title, { color: colors.primary }]}>
                {subCategoryData?.title}
              </Text>
              <Text style={[styles.description, { color: colors.onSurface }]}>
                {subCategoryData?.subtitle}
              </Text>

              <Text style={[styles.paragraph, { color: colors.onSurface }]}>
                {subCategoryData?.description1}
              </Text>

              {videoUrl ? (
                <BlogVideo uri={videoUrl} />
              ) : (
                <Text style={{ color: colors.onSurfaceVariant }}>Loading video...</Text>
              )}

              <Text style={[styles.paragraph, { color: colors.onSurface }]}>
                {subCategoryData?.description2}
              </Text>

              {subCategoryData?.collegeFrame?.type && (
                <CollageFrame
                  resourceUrls={resourceUrls}
                  type={subCategoryData.collegeFrame.type}
                />
              )}
            </View>
          </>
        ) : (
          <View style={styles.noDataWrapper}>
            <Text style={[styles.noDataText, { color: colors.onSurfaceVariant }]}>
              No Data Available
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default SubCategorie

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  mainImage: {
    width: '100%',
    height: 200,
  },
  contentWrapper: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8803B',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    fontWeight: '400',
    color: '#202020',
    lineHeight: 20,
    marginVertical: 10,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  sideImage: {
    width: (WIDTH - 48) / 2,
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  noDataWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
})
