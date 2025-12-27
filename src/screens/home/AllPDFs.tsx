import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import UnifiedMediaCard from '../../components/UnifiedMediaCard';
import { GridViewSkeleton, ListViewSkeleton } from '../../components/SkeletonLoader';
import { HomeStackParamList } from '../../navigation/types';
import { useGetFeaturedQuery } from '../../data/redux/services/mediaApi';

type PDFNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const AllPDFs = () => {
  const navigation = useNavigation<PDFNavigationProp>();
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
  const numColumns = is10Inch ? 3 : is7Inch ? 3 : 3

  const { data: featuredData, isLoading, refetch } = useGetFeaturedQuery({ type: 'pdf' });
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('AllPDFs - Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };
  const pdfData = featuredData?.data?.pdfs || [];

  const handlePDFPress = (item: any) => {
    (navigation as any).navigate('PdfViewer', {
      item: {
        ...item,
        pdfUrl: item.streamingUrl || item.pdfUrl,
        title: item.title,
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.outline }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialDesignIcons name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={[styles.headerTitle, { color: colors.onBackground }]}>{t('mediaTypes.book')}</Text>
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
      ) : pdfData.length > 0 ? (
        <FlatList
          data={pdfData}
          numColumns={isGridView ? numColumns : 1}
          key={isGridView ? `grid-${numColumns}` : 'list'}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={({ item }) => 
            isGridView ? (
              <UnifiedMediaCard
                item={item}
                type="pdf"
                onPress={handlePDFPress}
              />
            ) : (
              <View>
                <TouchableOpacity
                  style={styles.listItemRow}
                  onPress={() => handlePDFPress(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.itemImage}>
                    <View style={[styles.listPlaceholder, { backgroundColor: colors.surfaceVariant }]}>
                      <MaterialDesignIcons 
                        name="book-open-variant" 
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
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.onBackground }]}>{t('screens.pdfViewer.noPdfAvailable')}</Text>
        </View>
      )}
    </View>
  );
};

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
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  row: {
    justifyContent: 'space-around',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AllPDFs;