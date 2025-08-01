import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import React, { useRef } from 'react';
import Pdf from 'react-native-pdf';
import AppBarHeader from './AppBarHeader';
import { HEIGHT, WIDTH } from '../utils/HelperFunctions';

const PdfViewer = () => {
  const pdfRef = useRef(null);

  const source = { uri: 'bundle-assets://thereactnativebook-sample.pdf' };

  // Example chapters with corresponding page numbers
  const chapters = [
    { title: 'Introduction', page: 1 },
    { title: 'Chapter 1: Getting Started', page: 5 },
    { title: 'Chapter 2: Components', page: 10 },
    { title: 'Chapter 3: Navigation', page: 15 },
  ];

  const goToPage = (pageNum: number) => {
    if (pdfRef.current) {
      pdfRef.current.setPage(pageNum);
    }
  };

  return (
    <View style={styles.screen}>
      <AppBarHeader title="PDF Viewer" />

      <ScrollView horizontal style={styles.chapterBar}>
        {chapters.map((chapter, index) => (
          <TouchableOpacity key={index} onPress={() => goToPage(chapter.page)} style={styles.chapterButton}>
            <Text style={styles.chapterText}>{chapter.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.container}>
        <Pdf
          ref={pdfRef}
          source={source}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`Number of pages: ${numberOfPages}`);
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`Current page: ${page}`);
          }}
          onError={(error) => {
            console.log(error);
          }}
          onPressLink={(uri) => {
            console.log(`Link pressed: ${uri}`);
          }}
          style={styles.pdf}
        />
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
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
});
