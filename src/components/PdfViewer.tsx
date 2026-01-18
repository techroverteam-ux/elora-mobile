// import { StyleSheet, Text, View, ActivityIndicator, Dimensions, ScrollView, TouchableOpacity, Linking, Alert, TextInput } from 'react-native';
// import React, { useState, useEffect } from 'react';
// import Pdf from 'react-native-pdf';
// import { useTheme } from 'react-native-paper';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { useTranslation } from 'react-i18next';
// import { useGetSectionsMutation } from '../data/redux/services/sectionsApi';
// import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
// import SkeletonItem from './SkeletonLoader';
// import { useBookmarks } from '../context/BookmarkContext';
// import { useRecentlyPlayed } from '../context/RecentlyPlayedContext';

// const { width, height } = Dimensions.get('window');

// const PdfViewer = () => {
//   const { colors } = useTheme();
//   const { t } = useTranslation();
//   const route = useRoute();
//   const navigation = useNavigation();
//   const params = route.params as any;
//   const item = params?.item;
//   const uri = params?.uri;
//   const title = params?.title || item?.title;
  
//   const [loading, setLoading] = useState(true);
//   const [pdfError, setPdfError] = useState(false);
//   const [showSections, setShowSections] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(0);
//   const [scale, setScale] = useState(1.0);
//   const [pdfSections, setPdfSections] = useState<any[]>([]);
//   const [searchText, setSearchText] = useState('');
//   const [showSearch, setShowSearch] = useState(false);
  
//   const [getSectionsRequest, { data: sectionsData, isLoading: sectionsLoading }] = useGetSectionsMutation();
//   const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
//   const { addRecentItem } = useRecentlyPlayed();
//   const pdfRef = React.useRef<any>(null);
  
//   const isBookmarkedItem = item ? isBookmarked(item._id) : false;

//   const pdfUrl = uri || item?.streamingUrl || item?.pdfUrl;
//   console.log('🔍 PDF URL Debug:', {
//     uri,
//     itemStreamingUrl: item?.streamingUrl,
//     itemPdfUrl: item?.pdfUrl,
//     finalPdfUrl: pdfUrl
//   });
  
//   // Extract direct blob URL from API proxy for better compatibility
//   const getValidPdfUrl = () => {
//     if (!pdfUrl) return null;
    
//     // If URL contains API proxy, extract direct blob URL
//     if (pdfUrl.includes('/api/azure-blob/file?blobUrl=')) {
//       try {
//         const urlParts = pdfUrl.split('blobUrl=');
//         if (urlParts.length > 1) {
//           const encodedBlobUrl = urlParts[1].split('&')[0];
//           const directUrl = decodeURIComponent(encodedBlobUrl);
//           console.log('📄 Extracted direct PDF URL:', directUrl);
//           return directUrl;
//         }
//       } catch (error) {
//         console.log('Error extracting PDF blob URL:', error);
//       }
//     }
    
//     return pdfUrl;
//   };
  
//   const directUrl = getValidPdfUrl();
//   const proxyUrl = pdfUrl ? `https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api/azure-blob/file?blobUrl=${encodeURIComponent(pdfUrl)}` : null;
//   const [useProxy, setUseProxy] = useState(false);
//   const finalUrl = useProxy ? proxyUrl : directUrl;
  
//   console.log('📄 Direct URL:', directUrl);
//   console.log('📄 Proxy URL:', proxyUrl);
//   console.log('📄 Using URL:', finalUrl);
  
//   useEffect(() => {
//     getSectionsRequest({});
//     if (item) {
//       addRecentItem(item);
//     }
//     // Set a timeout to stop loading if PDF doesn't load
//     const timeout = setTimeout(() => {
//       setLoading(false);
//     }, 10000);
    
//     return () => clearTimeout(timeout);
//   }, [getSectionsRequest, item, addRecentItem]);
  
//   // Generate dynamic sections based on total pages
//   useEffect(() => {
//     if (totalPages > 0) {
//       const sections = [];
      
//       if (totalPages <= 50) {
//         const pagesPerSection = 10;
//         for (let i = 0; i < Math.ceil(totalPages / pagesPerSection); i++) {
//           const startPage = i * pagesPerSection + 1;
//           const endPage = Math.min((i + 1) * pagesPerSection, totalPages);
//           sections.push({
//             title: `Section ${i + 1}`,
//             subtitle: `Pages ${startPage}-${endPage}`,
//             page: startPage,
//             endPage: endPage
//           });
//         }
//       } else if (totalPages <= 200) {
//         const pagesPerSection = 20;
//         for (let i = 0; i < Math.ceil(totalPages / pagesPerSection); i++) {
//           const startPage = i * pagesPerSection + 1;
//           const endPage = Math.min((i + 1) * pagesPerSection, totalPages);
//           sections.push({
//             title: `Chapter ${i + 1}`,
//             subtitle: `Pages ${startPage}-${endPage}`,
//             page: startPage,
//             endPage: endPage
//           });
//         }
//       } else {
//         const pagesPerSection = 50;
//         for (let i = 0; i < Math.ceil(totalPages / pagesPerSection); i++) {
//           const startPage = i * pagesPerSection + 1;
//           const endPage = Math.min((i + 1) * pagesPerSection, totalPages);
//           sections.push({
//             title: `Part ${i + 1}`,
//             subtitle: `Pages ${startPage}-${endPage}`,
//             page: startPage,
//             endPage: endPage
//           });
//         }
//       }
      
//       console.log(`Generated ${sections.length} sections for ${totalPages} pages`);
//       setPdfSections(sections);
//     }
//   }, [totalPages]);
  
//   const zoomIn = () => {
//     const newScale = Math.min(scale + 0.2, 3.0);
//     setScale(newScale);
//   };
  
//   const zoomOut = () => {
//     const newScale = Math.max(scale - 0.2, 0.5);
//     setScale(newScale);
//   };
  
//   const goToPage = (page: number) => {
//     if (page <= totalPages && page >= 1) {
//       console.log(`Navigating to page ${page}`);
//       setCurrentPage(page);
//     }
//     setShowSections(false);
//   };
  
//   const shareToWhatsApp = async () => {
//     try {
//       const message = `Check out this PDF: ${title || 'Document'}\n\n${proxyUrl || finalUrl}`;
//       const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
      
//       const canOpen = await Linking.canOpenURL(whatsappUrl);
//       if (canOpen) {
//         await Linking.openURL(whatsappUrl);
//       } else {
//         Alert.alert('WhatsApp not installed', 'Please install WhatsApp to share');
//       }
//     } catch (error) {
//       console.error('WhatsApp sharing error:', error);
//       Alert.alert('Error', 'Failed to share to WhatsApp');
//     }
//   };

//   const openInExternalApp = async () => {
//     if (proxyUrl) {
//       try {
//         const supported = await Linking.canOpenURL(proxyUrl);
//         if (supported) {
//           await Linking.openURL(proxyUrl);
//         } else {
//           Alert.alert(t('common.error'), t('screens.pdfViewer.noPdfApp'));
//         }
//       } catch (error) {
//         console.error('Error opening PDF externally:', error);
//         Alert.alert(t('common.error'), t('screens.pdfViewer.failedToOpen'));
//       }
//     }
//   };

//   return (
//     <View style={[styles.screen, { backgroundColor: colors.background }]}>
//       <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.outline }]}>
//         <TouchableOpacity onPress={() => {
//           if (navigation.canGoBack()) {
//             navigation.goBack();
//           }
//         }} style={styles.backButton}>
//           <MaterialDesignIcons name="arrow-left" size={24} color={colors.primary} />
//         </TouchableOpacity>
//         <Text style={[styles.headerTitle, { color: colors.onSurface }]} numberOfLines={1}>
//           {title || t('screens.pdfViewer.title')}
//         </Text>
//         <View style={styles.headerActions}>
//           {item && (
//             <TouchableOpacity 
//               style={styles.actionButton} 
//               onPress={() => {
//                 if (isBookmarkedItem) {
//                   removeBookmark(item._id);
//                   Alert.alert(t('common.bookmark'), t('screens.bookmarks.removedFromBookmarks'));
//                 } else {
//                   addBookmark(item);
//                   Alert.alert(t('common.bookmark'), t('screens.bookmarks.addedToBookmarks'));
//                 }
//               }}
//             >
//               <MaterialDesignIcons 
//                 name={isBookmarkedItem ? "bookmark" : "bookmark-outline"} 
//                 size={20} 
//                 color={isBookmarkedItem ? "#F8803B" : colors.primary} 
//               />
//             </TouchableOpacity>
//           )}
//           <TouchableOpacity style={styles.actionButton} onPress={zoomOut}>
//             <MaterialDesignIcons name="magnify-minus" size={20} color={colors.primary} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.actionButton} onPress={zoomIn}>
//             <MaterialDesignIcons name="magnify-plus" size={20} color={colors.primary} />
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={styles.actionButton} 
//             onPress={openInExternalApp}
//           >
//             <MaterialDesignIcons 
//               name="open-in-new" 
//               size={20} 
//               color={colors.primary} 
//             />
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={styles.actionButton} 
//             onPress={shareToWhatsApp}
//           >
//             <MaterialDesignIcons 
//               name="whatsapp" 
//               size={20} 
//               color="#25D366" 
//             />
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={styles.actionButton} 
//             onPress={() => setShowSearch(!showSearch)}
//           >
//             <MaterialDesignIcons 
//               name="magnify" 
//               size={20} 
//               color={colors.primary} 
//             />
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={styles.sectionsButton} 
//             onPress={() => setShowSections(!showSections)}
//           >
//             <MaterialDesignIcons 
//               name={showSections ? "close" : "menu"} 
//               size={24} 
//               color={colors.primary} 
//             />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {showSearch && (
//         <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderBottomColor: colors.outline }]}>
//           <MaterialDesignIcons name="magnify" size={20} color={colors.onSurfaceVariant} />
//           <TextInput
//             style={[styles.searchInput, { color: colors.onSurface }]}
//             placeholder={t('screens.pdfViewer.searchInPdf')}
//             placeholderTextColor={colors.onSurfaceVariant}
//             value={searchText}
//             onChangeText={setSearchText}
//             autoFocus
//           />
//           <TouchableOpacity onPress={() => setShowSearch(false)}>
//             <MaterialDesignIcons name="close" size={20} color={colors.onSurfaceVariant} />
//           </TouchableOpacity>
//         </View>
//       )}

//       <View style={styles.container}>
//         {showSections && (
//           <View style={[styles.sectionsPanel, { backgroundColor: colors.surface }]}>
//             <View style={styles.sectionsPanelHeader}>
//               <Text style={[styles.sectionsPanelTitle, { color: colors.onSurface }]}>{t('screens.pdfViewer.pdfSections')}</Text>
//             </View>
            
//             <ScrollView style={styles.sectionsList}>
//               <View style={styles.quickNav}>
//                 <TouchableOpacity 
//                   style={[styles.quickNavButton, { backgroundColor: colors.primary }]} 
//                   onPress={() => goToPage(1)}
//                 >
//                   <Text style={styles.quickNavText}>{t('screens.pdfViewer.firstPage')}</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity 
//                   style={[styles.quickNavButton, { backgroundColor: colors.primary }]} 
//                   onPress={() => goToPage(Math.floor(totalPages / 2))}
//                 >
//                   <Text style={styles.quickNavText}>{t('screens.pdfViewer.middle')}</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity 
//                   style={[styles.quickNavButton, { backgroundColor: colors.primary }]} 
//                   onPress={() => goToPage(totalPages)}
//                 >
//                   <Text style={styles.quickNavText}>{t('screens.pdfViewer.lastPage')}</Text>
//                 </TouchableOpacity>
//               </View>
              
//               {pdfSections.map((section: any, index: number) => (
//                 <TouchableOpacity
//                   key={index}
//                   style={[styles.sectionItem, { borderBottomColor: colors.outline }]}
//                   onPress={() => goToPage(section.page)}
//                 >
//                   <MaterialDesignIcons 
//                     name="file-document-outline" 
//                     size={20} 
//                     color={colors.primary} 
//                   />
//                   <View style={styles.sectionContent}>
//                     <Text style={[styles.sectionItemText, { color: colors.onSurface }]}>
//                       {section.title}
//                     </Text>
//                     <Text style={[styles.pageNumber, { color: colors.onSurfaceVariant }]}>
//                       {section.subtitle || `Page ${section.page}`}
//                     </Text>
//                   </View>
//                   <MaterialDesignIcons 
//                     name="chevron-right" 
//                     size={16} 
//                     color={colors.onSurfaceVariant} 
//                   />
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         )}
        
//         {loading ? (
//           <View style={styles.loadingContainer}>
//             <View style={styles.skeletonContainer}>
//               <SkeletonItem width="100%" height={60} borderRadius={8} style={{ marginBottom: 16 }} />
//               <SkeletonItem width="100%" height={200} borderRadius={12} style={{ marginBottom: 16 }} />
//               <SkeletonItem width="80%" height={20} borderRadius={4} style={{ marginBottom: 8 }} />
//               <SkeletonItem width="60%" height={20} borderRadius={4} style={{ marginBottom: 8 }} />
//               <SkeletonItem width="90%" height={20} borderRadius={4} style={{ marginBottom: 16 }} />
//               <SkeletonItem width="100%" height={150} borderRadius={12} style={{ marginBottom: 16 }} />
//               <SkeletonItem width="70%" height={20} borderRadius={4} style={{ marginBottom: 8 }} />
//               <SkeletonItem width="85%" height={20} borderRadius={4} />
//             </View>
//           </View>
//         ) : pdfError ? (
//           <View style={styles.errorContainer}>
//             <Text style={[styles.errorText, { color: colors.error }]}>
//               {t('screens.pdfViewer.failedToLoad')}
//             </Text>
//             <TouchableOpacity 
//               style={[styles.retryButton, { backgroundColor: colors.primary }]}
//               onPress={() => {
//                 setPdfError(false);
//                 setLoading(true);
//               }}
//             >
//               <Text style={styles.retryButtonText}>Retry</Text>
//             </TouchableOpacity>
//           </View>
//                 ) : finalUrl ? (
//           <>
//             <Pdf
//               ref={pdfRef}
//               trustAllCerts={true}
//               source={{
//                 uri: finalUrl,
//                 cache: false,
//               }}
//               page={currentPage}
//               onLoadComplete={(numberOfPages) => {
//                 console.log('✅ PDF loaded successfully:', numberOfPages, 'pages');
//                 setTotalPages(numberOfPages);
//                 setLoading(false);
//                 setPdfError(false);
//               }}
//               onPageChanged={(page) => {
//                 setCurrentPage(page);
//               }}
//               onError={(error) => {
//                 console.error('❌ PDF Error:', error);
//                 console.error('❌ Failed PDF URL:', finalUrl);
//                 console.error('❌ PDF source data:', { directUrl, proxyUrl, useProxy });
//                 if (!useProxy && proxyUrl) {
//                   console.log('🔄 Trying proxy URL...');
//                   setUseProxy(true);
//                   setLoading(true);
//                 } else {
//                   setLoading(false);
//                   setPdfError(true);
//                 }
//               }}
//               onLoadProgress={(percent) => {
//                 console.log('📊 PDF loading progress:', percent);
//                 if (percent >= 0.1) {
//                   setLoading(false);
//                 }
//               }}
//               style={styles.pdf}
//               enablePaging={false}
//               horizontal={false}
//               spacing={10}
//               scale={scale}
//               minScale={0.5}
//               maxScale={3.0}
//               enableAntialiasing={true}
//               enableAnnotationRendering={false}
//               showsHorizontalScrollIndicator={false}
//               showsVerticalScrollIndicator={true}
//               singlePage={false}
//               fitPolicy={0}
//               renderActivityIndicator={() => null}
//             />
            
//             <View style={[styles.pageCounter, { 
//               backgroundColor: colors.surface,
//               borderColor: colors.outline 
//             }]}>
//               <Text style={[styles.pageCounterText, { color: colors.primary }]}>
//                 {currentPage} / {totalPages > 0 ? totalPages : '...'}
//               </Text>
//             </View>
//           </>
//         ) : (
//           <View style={styles.errorContainer}>
//             <Text style={[styles.errorText, { color: colors.error }]}>
//               {t('screens.pdfViewer.noPdfAvailable')}
//             </Text>
//           </View>
//         )}
//       </View>
//     </View>
//   );
// };

// export default PdfViewer;

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     height: 60,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     flex: 1,
//     fontSize: 18,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   headerActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//   },
//   searchInput: {
//     flex: 1,
//     marginHorizontal: 12,
//     fontSize: 16,
//     paddingVertical: 8,
//   },
//   actionButton: {
//     padding: 6,
//     marginRight: 4,
//   },
//   sectionsButton: {
//     padding: 8,
//   },
//   container: {
//     flex: 1,
//     position: 'relative',
//   },
//   sectionsPanel: {
//     position: 'absolute',
//     right: 0,
//     top: 0,
//     bottom: 0,
//     width: width * 0.7,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: -2, height: 0 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     zIndex: 10,
//   },
//   sectionsPanelHeader: {
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   sectionsPanelTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   sectionsList: {
//     flex: 1,
//   },
//   sectionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//   },
//   sectionContent: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   sectionItemText: {
//     fontSize: 16,
//   },
//   pageNumber: {
//     fontSize: 12,
//     marginTop: 2,
//   },
//   quickNav: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   quickNavButton: {
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 16,
//   },
//   quickNavText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   pdf: {
//     flex: 1,
//     width: width,
//     backgroundColor: '#f5f5f5',
//   },
//   pageCounter: {
//     position: 'absolute',
//     bottom: 20,
//     right: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     borderWidth: 1,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//   },
//   pageCounterText: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   loadingContainer: {
//     flex: 1,
//     padding: 16,
//   },
//   skeletonContainer: {
//     flex: 1,
//     paddingTop: 20,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   errorText: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginBottom: 16,
//   },
//   retryButton: {
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });
import { StyleSheet, Text, View, ActivityIndicator, Dimensions, ScrollView, TouchableOpacity, Linking, Alert, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import Pdf from 'react-native-pdf';
import { useTheme } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useGetSectionsMutation } from '../data/redux/services/sectionsApi';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useBookmarks } from '../context/BookmarkContext';
import { useRecentlyPlayed } from '../context/RecentlyPlayedContext';
import { shareContent, ShareableContent } from '../utils/deepLinkHelper';

const { width, height } = Dimensions.get('window');

const PdfViewer = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params as any;
  const item = params?.item;
  const uri = params?.uri;
  const title = params?.title || item?.title;
  
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showSections, setShowSections] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [pdfSections, setPdfSections] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [contentStats, setContentStats] = useState({ estimatedWords: 0, readingTime: 0 });
  
  const [getSectionsRequest, { data: sectionsData, isLoading: sectionsLoading }] = useGetSectionsMutation();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { addRecentItem } = useRecentlyPlayed();
  const pdfRef = React.useRef<any>(null);
  
  const isBookmarkedItem = item ? isBookmarked(item._id) : false;

  const pdfUrl = uri || item?.streamingUrl || item?.pdfUrl;
  const proxyUrl = pdfUrl ? `https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api/azure-blob/file?blobUrl=${encodeURIComponent(pdfUrl)}` : null;
  
  useEffect(() => {
    // Only add to recently played when PDF is opened
    if (item) {
      addRecentItem(item);
    }
  }, [item, addRecentItem]);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setPdfError(true);
      }
    }, 15000);
    return () => clearTimeout(timeout);
  }, []);
  
  // Generate sections and calculate content stats
  useEffect(() => {
    if (totalPages > 0) {
      const sections = [];
      const estimatedWords = totalPages * 250; // ~250 words per page
      const readingTime = Math.ceil(estimatedWords / 200); // 200 words/min
      
      setContentStats({ estimatedWords, readingTime });
      
      if (totalPages <= 50) {
        const pagesPerSection = 10;
        for (let i = 0; i < Math.ceil(totalPages / pagesPerSection); i++) {
          const startPage = i * pagesPerSection + 1;
          const endPage = Math.min((i + 1) * pagesPerSection, totalPages);
          sections.push({
            title: `Section ${i + 1}`,
            subtitle: `Pages ${startPage}-${endPage} (${endPage - startPage + 1} pages)`,
            page: startPage,
            endPage: endPage
          });
        }
      } else if (totalPages <= 200) {
        const pagesPerSection = 20;
        for (let i = 0; i < Math.ceil(totalPages / pagesPerSection); i++) {
          const startPage = i * pagesPerSection + 1;
          const endPage = Math.min((i + 1) * pagesPerSection, totalPages);
          sections.push({
            title: `Chapter ${i + 1}`,
            subtitle: `Pages ${startPage}-${endPage} (${endPage - startPage + 1} pages)`,
            page: startPage,
            endPage: endPage
          });
        }
      } else {
        const pagesPerSection = 50;
        for (let i = 0; i < Math.ceil(totalPages / pagesPerSection); i++) {
          const startPage = i * pagesPerSection + 1;
          const endPage = Math.min((i + 1) * pagesPerSection, totalPages);
          sections.push({
            title: `Part ${i + 1}`,
            subtitle: `Pages ${startPage}-${endPage} (${endPage - startPage + 1} pages)`,
            page: startPage,
            endPage: endPage
          });
        }
      }
      
      setPdfSections(sections);
      console.log(`Generated ${sections.length} sections for ${totalPages} pages`);
    }
  }, [totalPages]);
  
  const zoomIn = () => {
    const newScale = Math.min(scale + 0.3, 3.0);
    setScale(newScale);
    console.log(`Zoom in: ${newScale}`);
  };
  
  const zoomOut = () => {
    const newScale = Math.max(scale - 0.3, 0.5);
    setScale(newScale);
    console.log(`Zoom out: ${newScale}`);
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
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.outline }]}>
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
            onPress={async () => {
              if (!item) return;
              
              const shareableContent: ShareableContent = {
                _id: item._id,
                title: item.title || title || 'PDF Document',
                type: 'pdf',
                pdfUrl: item.pdfUrl || item.streamingUrl || pdfUrl,
                streamingUrl: item.streamingUrl,
                thumbnailUrl: item.thumbnailUrl || item.imageUrl,
                author: item.author,
                description: item.description,
                categoryId: item.categoryId,
                sectionId: item.sectionId,
              };
              
              await shareContent(shareableContent);
            }}
          >
            <MaterialDesignIcons 
              name="share-variant" 
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
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderBottomColor: colors.outline }]}>
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
          <View style={[styles.sectionsPanel, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionsPanelHeader}>
              <Text style={[styles.sectionsPanelTitle, { color: colors.onSurface }]}>{t('screens.pdfViewer.pdfSections')}</Text>
              {totalPages > 0 && (
                <View style={styles.contentInfo}>
                  <Text style={[styles.contentInfoText, { color: colors.onSurfaceVariant }]}>
                    {totalPages} pages • ~{contentStats.estimatedWords.toLocaleString()} words
                  </Text>
                  <Text style={[styles.contentInfoText, { color: colors.onSurfaceVariant }]}>
                    Est. reading time: {contentStats.readingTime} min
                  </Text>
                </View>
              )}
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
              onPageChanged={(page) => {
                console.log(`Page changed to: ${page}`);
                setCurrentPage(page);
              }}
              onError={(error) => {
                console.error('PDF Error:', error);
                setLoading(false);
              }}
              style={[styles.pdf, { transform: [{ scale }] }]}
              enablePaging={false}
              horizontal={false}
              spacing={10}
              enableAntialiasing={true}
              enableAnnotationRendering={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={true}
              singlePage={false}
              fitPolicy={0}
              renderActivityIndicator={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.onBackground }]}>Loading PDF...</Text>
                </View>
              )}
            />
            
            <View style={[styles.pageCounter, { 
              backgroundColor: colors.surface,
              borderColor: colors.outline 
            }]}>
              <Text style={[styles.pageCounterText, { color: colors.primary }]}>
                {totalPages > 0 ? `${currentPage} / ${totalPages}` : 'Loading...'}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              {t('screens.pdfViewer.noPdfAvailable')}
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
  contentInfo: {
    marginTop: 8,
  },
  contentInfoText: {
    fontSize: 12,
    lineHeight: 16,
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
    backgroundColor: '#f5f5f5',
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
    backgroundColor: '#f5f5f5',
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