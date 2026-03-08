import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Camera, Upload, CheckCircle2, Loader2, ArrowLeft, Ruler, FileText, ImageIcon } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeService } from '../../services/storeService';
import Toast from 'react-native-toast-message';
import MeasurementCamera from '../../components/MeasurementCamera';
import CustomModal from '../../components/CustomModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import imageService from '../../services/imageService';

interface InstallationFormProps {
  route: {
    params: {
      storeId: string;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

export default function InstallationFormScreen({ route, navigation }: InstallationFormProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { storeId } = route.params;
  const [loading, setLoading] = useState(false);
  const [storeData, setStoreData] = useState<any>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const [installationPhotos, setInstallationPhotos] = useState<{[key: number]: string | null}>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'warning' | 'info',
    buttons: [] as Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  });

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      const response = await storeService.getById(storeId);
      const store = response.store;
      setStoreData(store);
      
      // Initialize installation photos object based on recce photos count
      if (store.recce?.reccePhotos) {
        const initialPhotos: {[key: number]: string | null} = {};
        store.recce.reccePhotos.forEach((_: any, index: number) => {
          initialPhotos[index] = null;
        });
        setInstallationPhotos(initialPhotos);
      }
    } catch (error) {
      console.error('Failed to load store data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load store details'
      });
      navigation.goBack();
    }
  };

  const showModal = (title: string, message: string, type: 'error' | 'success' | 'warning' | 'info' = 'info', buttons?: Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>) => {
    setModalConfig({
      title,
      message,
      type,
      buttons: buttons || [{ text: 'OK', onPress: () => setModalVisible(false) }]
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    const reccePhotosCount = storeData?.recce?.reccePhotos?.length || 0;
    const uploadedCount = Object.values(installationPhotos).filter(photo => photo !== null).length;
    
    if (uploadedCount < reccePhotosCount) {
      showModal('Photos Required', `Please upload installation photos for all ${reccePhotosCount} boards.`, 'error');
      return;
    }

    showModal(
      'Complete Installation',
      'Are you sure you want to submit the installation as complete?',
      'warning',
      [
        { text: 'Cancel', onPress: () => setModalVisible(false), style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setModalVisible(false);
            try {
              setLoading(true);
              
              // Create FormData exactly like web portal
              const formData = new FormData();
              const photosData: Array<{ reccePhotoIndex: number }> = [];
              let fileIndex = 0;

              for (let i = 0; i < reccePhotosCount; i++) {
                if (installationPhotos[i]) {
                  formData.append(`installationPhoto${fileIndex}`, {
                    uri: installationPhotos[i],
                    type: 'image/jpeg',
                    name: `installation_${i}.jpg`,
                  } as any);
                  photosData.push({ reccePhotoIndex: i });
                  fileIndex++;
                }
              }

              formData.append('installationPhotosData', JSON.stringify(photosData));

              await storeService.submitInstallation(storeId, formData);
              
              Toast.show({
                type: 'success',
                text1: 'Installation Complete',
                text2: 'Installation has been submitted successfully'
              });
              
              navigation.goBack();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Submission Failed',
                text2: error.response?.data?.message || 'Failed to complete installation'
              });
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const captureInstallationPhoto = (index: number) => {
    setCurrentPhotoIndex(index);
    setCameraVisible(true);
  };

  const handlePhotoCapture = (photoUri: string) => {
    setInstallationPhotos(prev => ({
      ...prev,
      [currentPhotoIndex]: photoUri
    }));
    setCameraVisible(false);
  };

  const handleCameraClose = () => {
    setCameraVisible(false);
  };

  const getPhotoUrl = (path: string | undefined) => {
    if (!path) return null;
    const API_BASE_URL = 'https://elora-api-smoky.vercel.app';
    const cleanPath = path.startsWith('/') || path.startsWith('\\\\') ? path.slice(1) : path;
    return `${API_BASE_URL}/${cleanPath.replace(/\\\\/g, '/')}`;
  };

  if (!storeData) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  const reccePhotos = storeData.recce?.reccePhotos || [];
  const initialPhotos = storeData.recce?.initialPhotos || [];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: theme.colors.primary, 
        paddingTop: insets.top, 
        paddingBottom: 16, 
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginRight: 12 }}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' }}>
              Complete Installation
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
              {storeData.storeName} - {storeData.storeId || storeData.dealerCode}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Initial Photos Reference */}
        {initialPhotos.length > 0 && (
          <View style={{ 
            backgroundColor: '#3B82F620', 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#3B82F650'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <ImageIcon size={20} color="#3B82F6" />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3B82F6', marginLeft: 8 }}>
                Initial Photos (Reference)
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {initialPhotos.slice(0, 4).map((photo: string, idx: number) => (
                <View key={idx} style={{ width: 70, height: 70, borderRadius: 8, overflow: 'hidden', backgroundColor: '#3B82F610' }}>
                  <Image
                    source={{ uri: imageService.getFullImageUrl(photo) }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recce Photos & Installation Upload */}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 }}>
            Installation Photos for Each Board
          </Text>
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 16 }}>
            Upload installation photo for each recce board ({reccePhotos.length} boards)
          </Text>
          
          <View style={{ gap: 16 }}>
            {reccePhotos.map((reccePhoto: any, index: number) => (
              <View key={index} style={{ 
                backgroundColor: theme.colors.background, 
                borderRadius: 12, 
                padding: 16,
                borderWidth: 1,
                borderColor: theme.colors.border
              }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 12 }}>
                  Board {index + 1}
                </Text>
                
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                  {/* Recce Photo Reference */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#3B82F6', marginBottom: 8 }}>
                      Recce Photo (Reference)
                    </Text>
                    <View style={{ aspectRatio: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: '#3B82F610', borderWidth: 2, borderColor: '#3B82F6' }}>
                      <Image
                        source={{ uri: imageService.getFullImageUrl(reccePhoto.photo) }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={{ marginTop: 8, padding: 8, backgroundColor: '#3B82F610', borderRadius: 6 }}>
                      <Text style={{ fontSize: 11, color: '#3B82F6', fontWeight: '600' }}>
                        {reccePhoto.measurements.width} × {reccePhoto.measurements.height} {reccePhoto.measurements.unit}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Installation Photo */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#10B981', marginBottom: 8 }}>
                      Installation Photo *
                    </Text>
                    <TouchableOpacity
                      onPress={() => captureInstallationPhoto(index)}
                      style={{
                        aspectRatio: 1,
                        backgroundColor: installationPhotos[index] ? theme.colors.primary + '15' : theme.colors.background,
                        borderWidth: 2,
                        borderColor: installationPhotos[index] ? '#10B981' : theme.colors.border,
                        borderStyle: installationPhotos[index] ? 'solid' : 'dashed',
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {installationPhotos[index] ? (
                        <View style={{ alignItems: 'center' }}>
                          <Camera size={24} color="#10B981" />
                          <Text style={{ color: '#10B981', fontSize: 12, marginTop: 4, fontWeight: '600' }}>
                            Captured
                          </Text>
                        </View>
                      ) : (
                        <View style={{ alignItems: 'center' }}>
                          <Camera size={24} color={theme.colors.textSecondary} />
                          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                            Capture
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    <View style={{ marginTop: 8, padding: 8, backgroundColor: '#10B98110', borderRadius: 6 }}>
                      <Text style={{ fontSize: 11, color: '#10B981', fontWeight: '600' }}>
                        With {reccePhoto.measurements.width} × {reccePhoto.measurements.height} overlay
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 12,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || Object.values(installationPhotos).some(photo => photo === null)}
            style={{
              flex: 2,
              padding: 16,
              borderRadius: 12,
              backgroundColor: Object.values(installationPhotos).some(photo => photo === null) ? theme.colors.border : '#10B981',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center'
            }}
          >
            {loading ? (
              <Loader2 size={20} color="#FFFFFF" />
            ) : (
              <CheckCircle2 size={20} color="#FFFFFF" />
            )}
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
              {loading ? 'Submitting...' : 'Complete Installation'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Measurement Camera Modal */}
      <MeasurementCamera
        visible={cameraVisible}
        onClose={handleCameraClose}
        onCapture={handlePhotoCapture}
        width={reccePhotos[currentPhotoIndex]?.measurements?.width?.toString() || '0'}
        height={reccePhotos[currentPhotoIndex]?.measurements?.height?.toString() || '0'}
        photoType="front"
      />
      
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        buttons={modalConfig.buttons}
      />
    </View>
  );
}