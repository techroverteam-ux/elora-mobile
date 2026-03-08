import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { storeService } from '../services/storeService';
import Toast from 'react-native-toast-message';

interface BulkUploadProps {
  onUploadComplete: () => void;
}

interface UploadResult {
  successCount: number;
  errorCount: number;
  totalProcessed: number;
  errors?: Array<{ row: number; message: string }>;
}

export default function BulkUpload({ onUploadComplete }: BulkUploadProps) {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const downloadTemplate = async () => {
    try {
      Toast.show({
        type: 'info',
        text1: 'Template Download',
        text2: 'Use web portal for template download and bulk upload'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Download Failed',
        text2: 'Failed to download template'
      });
    }
  };

  const handleFileUpload = () => {
    Alert.alert(
      'Bulk Upload',
      'For bulk Excel file upload, please use the web portal. The mobile app supports individual store creation only.',
      [
        { text: 'OK', style: 'default' },
        {
          text: 'Open Web Portal',
          onPress: () => {
            // In a real app, you might open a web browser or deep link
            Toast.show({
              type: 'info',
              text1: 'Web Portal',
              text2: 'Please access the web portal for bulk upload functionality'
            });
          }
        }
      ]
    );
  };

  const closeModal = () => {
    setModalVisible(false);
    setUploadResult(null);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          backgroundColor: '#10B981',
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Upload size={20} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '80%'
          }}>
            <View style={{ padding: 20 }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20
              }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>
                  Bulk Upload Stores
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <X size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              {uploadResult ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={{ alignItems: 'center', padding: 20 }}>
                    <View style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: uploadResult.errorCount === 0 ? '#10B98120' : '#F59E0B20',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16
                    }}>
                      {uploadResult.errorCount === 0 ? (
                        <CheckCircle size={40} color="#10B981" />
                      ) : (
                        <AlertCircle size={40} color="#F59E0B" />
                      )}
                    </View>

                    <Text style={{
                      fontSize: 32,
                      fontWeight: 'bold',
                      color: uploadResult.errorCount === 0 ? '#10B981' : '#F59E0B',
                      marginBottom: 8
                    }}>
                      {uploadResult.successCount} / {uploadResult.totalProcessed}
                    </Text>

                    <Text style={{ color: theme.colors.textSecondary, marginBottom: 20, textAlign: 'center' }}>
                      {uploadResult.errorCount === 0 
                        ? 'All records processed successfully!' 
                        : `${uploadResult.successCount} successful, ${uploadResult.errorCount} failed`
                      }
                    </Text>

                    {uploadResult.errors && uploadResult.errors.length > 0 && (
                      <View style={{
                        backgroundColor: '#EF444420',
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 20,
                        width: '100%'
                      }}>
                        <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                          Errors Found:
                        </Text>
                        {uploadResult.errors.slice(0, 5).map((error, index) => (
                          <Text key={index} style={{ color: '#EF4444', fontSize: 12, marginBottom: 4 }}>
                            Row {error.row}: {error.message}
                          </Text>
                        ))}
                        {uploadResult.errors.length > 5 && (
                          <Text style={{ color: '#EF4444', fontSize: 12, fontStyle: 'italic' }}>
                            ... and {uploadResult.errors.length - 5} more errors
                          </Text>
                        )}
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() => {
                        closeModal();
                        onUploadComplete();
                      }}
                      style={{
                        backgroundColor: theme.colors.primary,
                        padding: 16,
                        borderRadius: 8,
                        width: '100%',
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={{
                    backgroundColor: '#3B82F620',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 20,
                    borderWidth: 1,
                    borderColor: '#3B82F650'
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <AlertCircle size={16} color="#3B82F6" />
                      <Text style={{ color: '#3B82F6', fontSize: 14, fontWeight: '600', marginLeft: 6 }}>
                        Mobile Limitation
                      </Text>
                    </View>
                    <Text style={{ color: '#3B82F6', fontSize: 12, lineHeight: 18 }}>
                      Bulk Excel file upload is only available on the web portal. 
                      Mobile app supports individual store creation for better user experience.
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={downloadTemplate}
                    style={{
                      backgroundColor: '#10B981',
                      padding: 16,
                      borderRadius: 8,
                      alignItems: 'center',
                      marginBottom: 16,
                      flexDirection: 'row',
                      justifyContent: 'center'
                    }}
                  >
                    <Download size={20} color="#FFF" />
                    <Text style={{ color: '#FFF', marginLeft: 8, fontWeight: 'bold' }}>
                      Download Template
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleFileUpload}
                    style={{
                      borderWidth: 2,
                      borderStyle: 'dashed',
                      borderColor: theme.colors.border,
                      padding: 32,
                      borderRadius: 8,
                      alignItems: 'center',
                      marginBottom: 16
                    }}
                  >
                    <FileSpreadsheet size={32} color={theme.colors.textSecondary} />
                    <Text style={{ color: theme.colors.text, marginTop: 8, fontWeight: '600' }}>
                      Upload Excel File
                    </Text>
                    <Text style={{
                      color: theme.colors.textSecondary,
                      fontSize: 12,
                      textAlign: 'center',
                      marginTop: 4
                    }}>
                      Tap to learn about web portal upload
                    </Text>
                  </TouchableOpacity>

                  <View style={{
                    backgroundColor: theme.colors.surface,
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.border
                  }}>
                    <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
                      Supported Format:
                    </Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>
                      • Excel files (.xlsx, .xls){'\n'}
                      • Maximum 1000 records per file{'\n'}
                      • Required columns: Dealer Code, Store Name, City, Client Code
                    </Text>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}