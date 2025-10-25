import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import React, { useRef } from 'react';
import Pdf from 'react-native-pdf';
import AppBarHeader from './AppBarHeader';
import { HEIGHT, WIDTH } from '../utils/HelperFunctions';
import { useTheme } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';

const PdfViewer = () => {
  const pdfRef = useRef(null);
  const { colors } = useTheme();
  const route = useRoute();
  const item = (route.params as any)?.item;

  // Use same proxy approach as working carousel
  const getPdfUrl = () => {
    if (!item?.pdfUrl) return null;
    
    // Use proxy URL for Azure blob access
    const proxyUrl = `https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api/azure-blob/file?blobUrl=${encodeURIComponent(item.pdfUrl)}`;
    console.log('PDF Viewer - Using proxy URL:', proxyUrl);
    return proxyUrl;
  };
  
  const pdfUrl = getPdfUrl();
  const source = pdfUrl 
    ? { uri: pdfUrl, cache: false, headers: {} }
    : null

  // const source = { uri: 'http://samples.leanpub.com/thereactnativebook-sample.pdf', cache: true };
  //const source = require('./test.pdf');  // ios only
  //const source = {uri:'bundle-assets://test.pdf' };
  //const source = {uri:'file:///sdcard/test.pdf'};
  //const source = {uri:"data:application/pdf;base64,JVBERi0xLjcKJc..."};
  //const source = {uri:"content://com.example.blobs/xxxxxxxx-...?offset=0&size=xxx"};
  //const source = {uri:"blob:xxxxxxxx-...?offset=0&size=xxx"};

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <AppBarHeader title={item?.title || "PDF Viewer"} />

      {/* <Text style={{ color: colors.onBackground }}>
        Source: {JSON.stringify(source)}
      </Text> */}

      <View style={styles.container}>
        {source ? (
          <Pdf
            ref={pdfRef}
            horizontal
            enablePaging
            page={1}
            source={source}
            onLoadComplete={(numberOfPages, filePath) => {
              console.log(`PDF Viewer - Number of pages: ${numberOfPages}`);
            }}
            onPageChanged={(page, numberOfPages) => {
              console.log(`PDF Viewer - Current page: ${page}`);
            }}
            onError={(error) => {
              console.error('PDF Viewer - Error loading PDF:', error);
            }}
            onPressLink={(uri) => {
              console.log(`PDF Viewer - Link pressed: ${uri}`);
            }}
            style={styles.pdf}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              No PDF available to display
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
    backgroundColor: '#F4F4F4',
  },
  chapterBar: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  chapterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    marginRight: 10,
  },
  chapterText: {
    fontSize: 14,
    color: '#333',
  },
  container: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pdf: {
    flex: 1,
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
