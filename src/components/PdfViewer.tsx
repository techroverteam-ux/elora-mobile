import { StyleSheet, Text, View, ActivityIndicator, Dimensions, ScrollView, TouchableOpacity, Linking, Alert, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import Pdf from 'react-native-pdf';
import { useTheme } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useGetSectionsMutation } from '../data/redux/services/sectionsApi';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import SkeletonItem from './SkeletonLoader';
import { useBookmarks } from '../context/BookmarkContext';
import { useRecentlyPlayed } from '../context/RecentlyPlayedContext';
import { useThemeContext } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const PdfViewer = () => {
  const { colors } = useTheme();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params as any;
  const item = params?.item;
  const uri = params?.uri;
  const title = params?.title || item?.title;
  
  const [loading, setLoading] = useState(true);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [showSections, setShowSections] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [pdfSections, setPdfSections] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const [getSectionsRequest, { data: sectionsData, isLoading: sectionsLoading }] = useGetSectionsMutation();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { addRecentItem } = useRecentlyPlayed();
  const pdfRef = React.useRef<any>(null);
  
  const isBookmarkedItem = item ? isBookmarked(item._id) : false;

  const pdfUrl = uri || item?.streamingUrl || item?.pdfUrl;
  const directUrl = pdfUrl;
  const proxyUrl = pdfUrl ? `https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api/azure-blob/file?blobUrl=${encodeURIComponent(pdfUrl)}` : null;
  const finalUrl = useProxy ? proxyUrl : directUrl;
  
  useEffect(() => {
    getSectionsRequest({});
    // Add to recently played when PDF is opened
    if (item) {
      addRecentItem(item);
    }
  }, [getSectionsRequest, item, addRecentItem]);
  
  // Generate intelligent sections based on total pages and content type
  useEffect(() => {
    if (totalPages > 0) {
      const sections = [];
      const pdfTitle = title || 'Document';
      
      // Determine section type and size based on PDF characteristics
      let sectionType = 'Section';
      let pagesPerSection = 10;
      
      if (pdfTitle.toLowerCase().includes('gita') || pdfTitle.toLowerCase().includes('geeta')) {
        sectionType = 'Chapter';
        pagesPerSection = totalPages <= 100 ? 5 : 8;
      } else if (pdfTitle.toLowerCase().includes('ramayan') || pdfTitle.toLowerCase().includes('mahabharat')) {
        sectionType = 'Kand';
        pagesPerSection = totalPages <= 200 ? 15 : 25;
      } else if (pdfTitle.toLowerCase().includes('puran') || pdfTitle.toLowerCase().includes('upanishad')) {
        sectionType = 'Adhyay';
        pagesPerSection = totalPages <= 150 ? 12 : 20;
      } else {
        // General documents
        if (totalPages <= 50) pagesPerSection = 8;
        else if (totalPages <= 200) pagesPerSection = 15;
        else pagesPerSection = 25;
      }
      
      const totalSections = Math.ceil(totalPages / pagesPerSection);
      
      for (let i = 0; i < totalSections; i++) {
        const startPage = i * pagesPerSection + 1;
        const endPage = Math.min((i + 1) * pagesPerSection, totalPages);
        const sectionNumber = i + 1;
        
        // Generate meaningful section titles
        let sectionTitle = `${sectionType} ${sectionNumber}`;
        if (sectionType === 'Chapter' && totalSections <= 18) {
          const chapterNames = [
            'Arjuna Vishada Yoga', 'Sankhya Yoga', 'Karma Yoga', 'Gyan Karma Sanyasa Yoga',
            'Karma Sanyasa Yoga', 'Dhyana Yoga', 'Gyan Vigyan Yoga', 'Akshar Brahma Yoga',
            'Raja Vidya Raja Guhya Yoga', 'Vibhuti Yoga', 'Vishvarupa Darshan Yoga', 'Bhakti Yoga',
            'Kshetra Kshetrajna Vibhaga Yoga', 'Gunatraya Vibhaga Yoga', 'Purushottama Yoga',
            'Daivasura Sampad Vibhaga Yoga', 'Shraddhatraya Vibhaga Yoga', 'Moksha Sanyasa Yoga'
          ];
          if (i < chapterNames.length) {
            sectionTitle = `Chapter ${sectionNumber}: ${chapterNames[i]}`;
          }
        }
        
        sections.push({
          title: sectionTitle,
          subtitle: `${endPage - startPage + 1} pages`,
          page: startPage,
          endPage: endPage,
          progress: 0
        });
      }
      
      console.log(`Generated ${sections.length} ${sectionType.toLowerCase()}s for ${totalPages} pages`);
      setPdfSections(sections);
    }
  }, [totalPages, title]);
  
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
          Alert.alert(t('common.error'), t('screens.pdfViewer.noPdfApp'));
        }
      } catch (error) {
        console.error('Error opening PDF externally:', error);
        Alert.alert(t('common.error'), t('screens.pdfViewer.failedToOpen'));
      }
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1e1e1e' : colors.surface, borderBottomColor: isDark ? '#2a2a2a' : colors.outline }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialDesignIcons name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]} numberOfLines={1}>
          {title || t('screens.pdfViewer.title')}
        </Text>
        <View style={styles.headerActions}>
          {item && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => {
                if (isBookmarkedItem) {
                  removeBookmark(item._id);
                  Alert.alert(t('common.bookmark'), t('screens.bookmarks.removedFromBookmarks'));
                } else {
                  addBookmark(item);
                  Alert.alert(t('common.bookmark'), t('screens.bookmarks.addedToBookmarks'));
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
            style={styles.actionButton} 
            onPress={() => setShowSearch(!showSearch)}
          >
            <MaterialDesignIcons 
              name="magnify" 
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

      {showSearch && (
        <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1e1e1e' : colors.surface, borderBottomColor: isDark ? '#2a2a2a' : colors.outline }]}>
          <MaterialDesignIcons name="magnify" size={20} color={colors.onSurfaceVariant} />
          <TextInput
            style={[styles.searchInput, { color: colors.onSurface }]}
            placeholder={t('screens.pdfViewer.searchInPdf')}
            placeholderTextColor={colors.onSurfaceVariant}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          <TouchableOpacity onPress={() => setShowSearch(false)}>
            <MaterialDesignIcons name="close" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.container}>
        {showSections && (
          <View style={[styles.sectionsPanel, { backgroundColor: isDark ? '#1e1e1e' : colors.surface }]}>
            <View style={styles.sectionsPanelHeader}>
              <Text style={[styles.sectionsPanelTitle, { color: colors.onSurface }]}>{t('screens.pdfViewer.pdfSections')}</Text>
            </View>
            
            <ScrollView style={styles.sectionsList}>
              {/* Quick Navigation */}
              <View style={styles.quickNav}>
                <TouchableOpacity 
                  style={[styles.quickNavButton, { backgroundColor: colors.primary }]} 
                  onPress={() => goToPage(1)}
                >
                  <Text style={styles.quickNavText}>{t('screens.pdfViewer.firstPage')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.quickNavButton, { backgroundColor: colors.primary }]} 
                  onPress={() => goToPage(Math.floor(totalPages / 2))}
                >
                  <Text style={styles.quickNavText}>{t('screens.pdfViewer.middle')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.quickNavButton, { backgroundColor: colors.primary }]} 
                  onPress={() => goToPage(totalPages)}
                >
                  <Text style={styles.quickNavText}>{t('screens.pdfViewer.lastPage')}</Text>
                </TouchableOpacity>
              </View>
              
              {/* Page Sections */}
              {pdfSections.map((section: any, index: number) => {
                const isCurrentSection = currentPage >= section.page && currentPage <= section.endPage;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.sectionItem, 
                      { 
                        borderBottomColor: colors.outline,
                        backgroundColor: isCurrentSection ? colors.primary + '15' : 'transparent'
                      }
                    ]}
                    onPress={() => goToPage(section.page)}
                  >
                    <View style={[
                      styles.sectionIndex,
                      { backgroundColor: isCurrentSection ? colors.primary : colors.surfaceVariant }
                    ]}>
                      <Text style={[
                        styles.sectionIndexText,
                        { color: isCurrentSection ? '#fff' : colors.onSurfaceVariant }
                      ]}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.sectionContent}>
                      <Text style={[
                        styles.sectionItemText, 
                        { 
                          color: isCurrentSection ? colors.primary : colors.onSurface,
                          fontWeight: isCurrentSection ? '600' : '400'
                        }
                      ]}>
                        {section.title}
                      </Text>
                      <Text style={[styles.pageNumber, { color: colors.onSurfaceVariant }]}>
                        {section.subtitle || `Pages ${section.page}-${section.endPage}`}
                      </Text>
                      {isCurrentSection && (
                        <Text style={[styles.currentPageIndicator, { color: colors.primary }]}>
                          Currently reading • Page {currentPage}
                        </Text>
                      )}
                    </View>
                    <MaterialDesignIcons 
                      name={isCurrentSection ? "bookmark" : "chevron-right"} 
                      size={16} 
                      color={isCurrentSection ? colors.primary : colors.onSurfaceVariant} 
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
        
        {loading && !pdfLoaded ? (
          <View style={styles.loadingContainer}>
            <View style={styles.skeletonContainer}>
              <SkeletonItem width="100%" height={60} borderRadius={8} style={{ marginBottom: 16 }} />
              <SkeletonItem width="100%" height={200} borderRadius={12} style={{ marginBottom: 16 }} />
              <SkeletonItem width="80%" height={20} borderRadius={4} style={{ marginBottom: 8 }} />
              <SkeletonItem width="60%" height={20} borderRadius={4} style={{ marginBottom: 8 }} />
              <SkeletonItem width="90%" height={20} borderRadius={4} style={{ marginBottom: 16 }} />
              <SkeletonItem width="100%" height={150} borderRadius={12} style={{ marginBottom: 16 }} />
              <SkeletonItem width="70%" height={20} borderRadius={4} style={{ marginBottom: 8 }} />
              <SkeletonItem width="85%" height={20} borderRadius={4} />
            </View>
            <View style={styles.loadingTextContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.onBackground }]}>Loading PDF...</Text>
            </View>
          </View>
        ) : finalUrl ? (
          <>
            <Pdf
              ref={pdfRef}
              trustAllCerts={true}
              source={{
                uri: finalUrl,
                cache: true,
                expiration: 24 * 60 * 60 * 1000,
                headers: useProxy ? {} : {
                  'Accept': 'application/pdf',
                  'Cache-Control': 'max-age=3600'
                }
              }}
              page={currentPage}
              onLoadComplete={(numberOfPages) => {
                console.log('PDF loaded successfully:', numberOfPages, 'pages');
                setTotalPages(numberOfPages);
                setLoading(false);
                setPdfLoaded(true);
              }}
              onPageChanged={(page) => {
                setCurrentPage(page);
              }}
              onError={(error) => {
                console.error('PDF Error:', error);
                if (!useProxy && proxyUrl) {
                  console.log('Trying proxy URL as fallback');
                  setUseProxy(true);
                  setLoading(true);
                } else {
                  setLoading(false);
                }
              }}
              style={styles.pdf}
              enablePaging={true}
              horizontal={false}
              spacing={5}
              scale={scale}
              minScale={0.5}
              maxScale={3.0}
              enableAntialiasing={false}
              enableAnnotationRendering={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={true}
              singlePage={true}
              fitPolicy={1}
              activityIndicatorProps={{
                color: colors.primary,
                progressTintColor: colors.primary
              }}
              renderActivityIndicator={() => (
                <View style={styles.pdfLoadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.pdfLoadingText, { color: colors.onBackground }]}>Rendering PDF...</Text>
                </View>
              )}
            />
            
            <View style={[styles.pageCounter, { 
              backgroundColor: isDark ? 'rgba(248,128,59,0.9)' : colors.surface,
              borderColor: isDark ? 'transparent' : colors.outline 
            }]}>
              <Text style={[styles.pageCounterText, { color: isDark ? '#fff' : colors.primary }]}>
                {currentPage} / {totalPages > 0 ? totalPages : '...'}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.errorContainer}>
            <MaterialDesignIcons name="file-pdf-box" size={64} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>
              {t('screens.pdfViewer.noPdfAvailable')}
            </Text>
            <Text style={[styles.errorSubtext, { color: colors.onSurfaceVariant }]}>
              Please check your internet connection
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 16,
    paddingVertical: 8,
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
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 2,
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
    padding: 16,
  },
  skeletonContainer: {
    flex: 1,
    paddingTop: 20,
  },
  loadingTextContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [{ translateY: -50 }],
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  pdfLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfLoadingText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  sectionIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionIndexText: {
    fontSize: 12,
    fontWeight: '600',
  },
  currentPageIndicator: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});