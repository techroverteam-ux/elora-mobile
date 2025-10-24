import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import AppBarHeader from '../../components/AppBarHeader';
import UnifiedMediaCard from '../../components/UnifiedMediaCard';
import MediaListItem from '../../components/MediaListItem';
import ViewToggle from '../../components/ViewToggle';
import { HomeStackParamList } from '../../navigation/types';
import { useGetFeaturedQuery } from '../../data/redux/services/mediaApi';

type PDFNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const AllPDFs = () => {
  const navigation = useNavigation<PDFNavigationProp>();
  const { colors } = useTheme();
  const [isGridView, setIsGridView] = useState(true);

  const { data: featuredData, isLoading } = useGetFeaturedQuery({ type: 'pdf' });
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
      <AppBarHeader title="Books" />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.onBackground }]}>Loading PDFs...</Text>
        </View>
      ) : pdfData.length > 0 ? (
        <>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.onBackground }]}>Books</Text>
            <ViewToggle isGridView={isGridView} onToggle={setIsGridView} />
          </View>
          
          <FlatList
            data={pdfData}
            numColumns={isGridView ? 2 : 1}
            key={isGridView ? 'grid' : 'list'}
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
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.onBackground }]}>No PDFs available</Text>
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