import { StyleSheet, Text, View, TouchableOpacity, Linking, Alert } from 'react-native';
import React from 'react';
import AppBarHeader from './AppBarHeader';
import { useTheme } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

const PdfViewer = () => {
  const { colors } = useTheme();
  const route = useRoute();
  const item = (route.params as any)?.item;

  const pdfUrl = item?.streamingUrl || item?.pdfUrl;
  const proxyUrl = pdfUrl ? `https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api/azure-blob/file?blobUrl=${encodeURIComponent(pdfUrl)}` : null;
  
  // Use Google Docs viewer for better PDF compatibility
  const googleDocsUrl = proxyUrl ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(proxyUrl)}` : null;
  
  console.log('PDF Viewer - Proxy URL:', proxyUrl);
  console.log('PDF Viewer - Google Docs URL:', googleDocsUrl);

  const openPDF = async () => {
    if (proxyUrl) {
      try {
        const supported = await Linking.canOpenURL(proxyUrl);
        if (supported) {
          await Linking.openURL(proxyUrl);
        } else {
          Alert.alert('Error', 'Cannot open PDF. Please install a PDF viewer app.');
        }
      } catch (error) {
        console.error('Error opening PDF:', error);
        Alert.alert('Error', 'Failed to open PDF');
      }
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <AppBarHeader title={item?.title || "PDF Viewer"} />

      <View style={styles.container}>
        {proxyUrl ? (
          <View style={styles.pdfContainer}>
            <MaterialDesignIcons name="file-pdf-box" size={80} color={colors.primary} />
            <Text style={[styles.pdfTitle, { color: colors.onBackground }]}>
              {item?.title || 'PDF Document'}
            </Text>
            <TouchableOpacity style={[styles.openButton, { backgroundColor: colors.primary }]} onPress={openPDF}>
              <MaterialDesignIcons name="open-in-new" size={20} color="white" />
              <Text style={styles.openButtonText}>Open PDF</Text>
            </TouchableOpacity>
          </View>
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
  container: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  pdfContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pdfTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 20,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  openButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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