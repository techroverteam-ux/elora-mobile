import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import Pdf from 'react-native-pdf';

const { width, height } = Dimensions.get('window');

const SimplePdfViewer = () => {
  const [loading, setLoading] = useState(true);
  
  // Test with a simple public PDF URL
  const testPdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PDF Test</Text>
      
      {loading && (
        <Text style={styles.loadingText}>Loading PDF...</Text>
      )}
      
      <Pdf
        source={{ uri: testPdfUrl }}
        onLoadComplete={(numberOfPages) => {
          console.log('PDF loaded:', numberOfPages, 'pages');
          setLoading(false);
        }}
        onError={(error) => {
          console.error('PDF Error:', error);
          setLoading(false);
          Alert.alert('PDF Error', 'Failed to load PDF');
        }}
        style={styles.pdf}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    padding: 16,
  },
  pdf: {
    flex: 1,
    width: width,
  },
});

export default SimplePdfViewer;