import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Dimensions, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import AppBarHeader from '../../components/AppBarHeader';
import UnifiedMediaCard from '../../components/UnifiedMediaCard';
import MediaListItem from '../../components/MediaListItem';
import ViewToggle from '../../components/ViewToggle';
import { GridViewSkeleton, ListViewSkeleton } from '../../components/SkeletonLoader';
import { HomeStackParamList } from '../../navigation/types';
import { useGetFeaturedQuery } from '../../data/redux/services/mediaApi';

type PDFNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const AllPDFs = () => {
  const navigation = useNavigation<PDFNavigationProp>();
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
  const numColumns = is10Inch ? 4 : is7Inch ? 3 : 2

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
      <AppBarHeader title={t('mediaTypes.book')} />

      {isLoading ? (
        isGridView ? <GridViewSkeleton /> : <ListViewSkeleton />
      ) : pdfData.length > 0 ? (
        <>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.onBackground }]}>{t('mediaTypes.book')}</Text>
            <ViewToggle isGridView={isGridView} onToggle={setIsGridView} />
          </View>
          
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
                <MediaListItem
                  item={item}
                  type="pdf"
                  onPress={handlePDFPress}
                />
              )
            }
            contentContainerStyle={isGridView ? styles.gridContent : styles.listContent}
            columnWrapperStyle={isGridView ? styles.row : undefined}
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