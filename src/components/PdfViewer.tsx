import { StyleSheet, Text, View, ActivityIndicator, Dimensions, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import Pdf from 'react-native-pdf';
import { useTheme } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useGetSectionsMutation } from '../data/redux/services/sectionsApi';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useBookmarks } from '../context/BookmarkContext';
import { useRecentlyPlayed } from '../context/RecentlyPlayedContext';

const { width, height } = Dimensions.get('window');

const PdfViewer = () => {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params as any;
  const item = params?.item;
  const uri = params?.uri;
  const title = params?.title || item?.title;
  
  const [loading, setLoading] = useState(true);
  const [showSections, setShowSections] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [pdfSections, setPdfSections] = useState<any[]>([]);
  
  const [getSectionsRequest, { data: sectionsData, isLoading: sectionsLoading }] = useGetSectionsMutation();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { addRecentItem } = useRecentlyPlayed();
  const pdfRef = React.useRef<any>(null);
  
  const isBookmarkedItem = item ? isBookmarked(item._id) : false;

  const pdfUrl = uri || item?.streamingUrl || item?.pdfUrl;
  const proxyUrl = pdfUrl ? `https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api/azure-blob/file?blobUrl=${encodeURIComponent(pdfUrl)}` : null;
  
  useEffect(() => {
    getSectionsRequest({});
    // Add to recently played when PDF is opened
    if (item) {
      addRecentItem(item);
    }
  }, [getSectionsRequest, item, addRecentItem]);
  
  // Generate dynamic sections based on total pages
  useEffect(() => {
    if (totalPages > 0) {
      const sections = [];
      
      if (totalPages <= 50) {
        // Small PDFs: 10 pages per section
        const pagesPerSection = 10;
        for (let i = 0; i < Math.ceil(totalPages / pagesPerSection); i++) {
          const startPage = i * pagesPerSection + 1;
          const endPage = Math.min((i + 1) * pagesPerSection, totalPages);
          sections.push({
            title: `Section ${i + 1}`,
            subtitle: `Pages ${startPage}-${endPage}`,
            page: startPage,
            endPage: endPage
          });
        }
      } else if (totalPages <= 200) {
        // Medium PDFs: 20 pages per section
        const pagesPerSection = 20;
        for (let i = 0; i < Math.ceil(totalPages / pagesPerSection); i++) {
          const startPage = i * pagesPerSection + 1;
          const endPage = Math.min((i + 1) * pagesPerSection, totalPages);
          sections.push({
            title: `Chapter ${i + 1}`,
            subtitle: `Pages ${startPage}-${endPage}`,
            page: startPage,
            endPage: endPage
          });
        }
      } else {
        // Large PDFs: 50 pages per section
        const pagesPerSection = 50;
        for (let i = 0; i < Math.ceil(totalPages / pagesPerSection); i++) {
          const startPage = i * pagesPerSection + 1;
          const endPage = Math.min((i + 1) * pagesPerSection, totalPages);
          sections.push({
            title: `Part ${i + 1}`,
            subtitle: `Pages ${startPage}-${endPage}`,
            page: startPage,
            endPage: endPage
          });
        }
      }
      
      console.log(`Generated ${sections.length} sections for ${totalPages} pages`);
      setPdfSections(sections);
    }
  }, [totalPages]);
  
  const zoomIn = () => {
    const newScale = Math.min(scale + 0.2, 3.0);
    setScale(newScale);
  };
  
  const zoomOut = () => {
    const newScale = Math.max(scale - 0.2, 0.5);
    setScale(newScale);
  };
  
  const goToPage = (page: number) => {
    if (page <= totalPages && page >= 1) {
      console.log(`Navigating to page ${page}`);
      setCurrentPage(page);
    }
    setShowSections(false);
  };
  
  const openInExternalApp = async () => {
    if (proxyUrl) {
      try {
        const supported = await Linking.canOpenURL(proxyUrl);
        if (supported) {
          await Linking.openURL(proxyUrl);
        } else {
          Alert.alert('Error', 'No PDF viewer app found. Please install a PDF reader app.');
        }
      } catch (error) {
        console.error('Error opening PDF externally:', error);
        Alert.alert('Error', 'Failed to open PDF in external app');
      }
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.outline }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialDesignIcons name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]} numberOfLines={1}>
          {title || "PDF Viewer"}
        </Text>
        <View style={styles.headerActions}>
          {item && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => {
                if (isBookmarkedItem) {
                  removeBookmark(item._id);
                  Alert.alert('Bookmark', 'Removed from bookmarks');
                } else {
                  addBookmark(item);
                  Alert.alert('Bookmark', 'Added to bookmarks!');
                }
              }}
            >
              <MaterialDesignIcons 
                name={isBookmarkedItem ? "bookmark" : "bookmark-outline"} 
                size={20} 
                color={isBookmarkedItem ? "#F8803B" : colors.primary} 
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton} onPress={zoomOut}>
            <MaterialDesignIcons name="magnify-minus" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={zoomIn}>
            <MaterialDesignIcons name="magnify-plus" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={openInExternalApp}
          >
            <MaterialDesignIcons 
              name="open-in-new" 
              size={20} 
              color={colors.primary} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sectionsButton} 
            onPress={() => setShowSections(!showSections)}
          >
            <MaterialDesignIcons 
              name={showSections ? "close" : "menu"} 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.container}>
        {showSections && (
          <View style={[styles.sectionsPanel, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionsPanelHeader}>
              <Text style={[styles.sectionsPanelTitle, { color: colors.onSurface }]}>PDF Sections</Text>
            </View>
            
            <ScrollView style={styles.sectionsList}>
              {/* Quick Navigation */}
              <View style={styles.quickNav}>
                <TouchableOpacity 
                  style={[styles.quickNavButton, { backgroundColor: colors.primary }]} 
                  onPress={() => goToPage(1)}
                >
                  <Text style={styles.quickNavText}>First Page</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.quickNavButton, { backgroundColor: colors.primary }]} 
                  onPress={() => goToPage(Math.floor(totalPages / 2))}
                >
                  <Text style={styles.quickNavText}>Middle</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.quickNavButton, { backgroundColor: colors.primary }]} 
                  onPress={() => goToPage(totalPages)}
                >
                  <Text style={styles.quickNavText}>Last Page</Text>
                </TouchableOpacity>
              </View>
              
              {/* Page Sections */}
              {pdfSections.map((section: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.sectionItem, { borderBottomColor: colors.outline }]}
                  onPress={() => goToPage(section.page)}
                >
                  <MaterialDesignIcons 
                    name="file-document-outline" 
                    size={20} 
                    color={colors.primary} 
                  />
                  <View style={styles.sectionContent}>
                    <Text style={[styles.sectionItemText, { color: colors.onSurface }]}>
                      {section.title}
                    </Text>
                    <Text style={[styles.pageNumber, { color: colors.onSurfaceVariant }]}>
                      {section.subtitle || `Page ${section.page}`}
                    </Text>
                  </View>
                  <MaterialDesignIcons 
                    name="chevron-right" 
                    size={16} 
                    color={colors.onSurfaceVariant} 
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {proxyUrl ? (
          <>
            <Pdf
              ref={pdfRef}
              trustAllCerts={false}
              source={{
                uri: proxyUrl,
                cache: true,
                expiration: 24 * 60 * 60 * 1000,
              }}
              page={currentPage}
              onLoadComplete={(numberOfPages) => {
                console.log(`PDF loaded: ${numberOfPages} pages`);
                setTotalPages(numberOfPages);
                setLoading(false);
              }}
              onPageChanged={(page, numberOfPages) => {
                setCurrentPage(page);
                setTotalPages(numberOfPages);
                console.log(`Page ${page} of ${numberOfPages}`);
              }}
              onError={(error) => {
                console.error('PDF Error:', error);
                setLoading(false);
              }}
              style={styles.pdf}
              enablePaging={true}
              horizontal={false}
              spacing={0}
              scale={scale}
              minScale={0.5}
              maxScale={3.0}
              enableAntialiasing={true}
              enableAnnotationRendering={true}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={true}
              renderActivityIndicator={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.onBackground }]}>Loading Books...</Text>
                </View>
              )}
            />
            
            <View style={[styles.pageCounter, { 
              backgroundColor: colors.surface,
              borderColor: colors.outline 
            }]}>
              <Text style={[styles.pageCounterText, { color: colors.primary }]}>
                {currentPage} / {totalPages > 0 ? totalPages : '...'}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              No PDF available
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default PdfViewer;

const styles = StyleSheet.create({
  screen: {
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
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 6,
    marginRight: 4,
  },
  sectionsButton: {
    padding: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  sectionsPanel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: width * 0.7,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 10,
  },
  sectionsPanelHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionsPanelTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionCategory: {
    fontSize: 14,
    fontWeight: '600',
    padding: 16,
    paddingBottom: 8,
  },
  sectionsLoading: {
    padding: 20,
    alignItems: 'center',
  },
  sectionsLoadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  sectionsList: {
    flex: 1,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionContent: {
    flex: 1,
    marginLeft: 12,
  },
  sectionItemText: {
    fontSize: 16,
  },
  pageNumber: {
    fontSize: 12,
    marginTop: 2,
  },
  quickNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  quickNavButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  quickNavText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  pdf: {
    flex: 1,
    width: width,
    height: height,
  },
  pageCounter: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  pageCounterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});