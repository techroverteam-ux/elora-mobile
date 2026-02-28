import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Camera, Upload, CheckCircle2, Loader2, ArrowLeft, Ruler, FileText, ImageIcon } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeAPI } from '../../lib/api';
import Toast from 'react-native-toast-message';
import MeasurementCamera from '../../components/MeasurementCamera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const [currentPhotoType, setCurrentPhotoType] = useState<'after1' | 'after2'>('after1');
  const [installationPhotos, setInstallationPhotos] = useState({
    after1: null as string | null,
    after2: null as string | null,
  });

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      const response = await storeAPI.getStoreById(storeId);
      setStoreData(response.data.store);
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

  const handleSubmit = async () => {
    if (!installationPhotos.after1 || !installationPhotos.after2) {
      Alert.alert('Photos Required', 'Please capture both installation photos before submitting.');
      return;
    }

    Alert.alert(
      'Complete Installation',
      'Are you sure you want to submit the installation as complete?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              setLoading(true);
              
              const installationData = {
                photos: installationPhotos,
                submittedDate: new Date().toISOString(),
                recceReference: {
                  width: storeData?.recce?.sizes?.width,
                  height: storeData?.recce?.sizes?.height,
                  unit: storeData?.recce?.sizes?.unit || 'ft'
                }
              };

              await storeAPI.completeInstallation(storeId);
              
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
          }
        }
      ]
    );
  };

  const capturePhoto = (type: 'after1' | 'after2') => {
    if (!storeData?.recce?.sizes?.width || !storeData?.recce?.sizes?.height) {
      Alert.alert('No Recce Data', 'Recce measurements not found. Photos will be captured without overlay.');
    }
    
    setCurrentPhotoType(type);
    setCameraVisible(true);
  };

  const handlePhotoCapture = (photoUri: string) => {
    setInstallationPhotos(prev => ({
      ...prev,
      [currentPhotoType]: photoUri
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
        {/* Recce Reference Section */}
        {storeData.recce && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 12 }}>
              Recce Reference
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              {/* Recce Measurements */}
              <View style={{ 
                flex: 1,
                backgroundColor: '#3B82F620', 
                borderRadius: 12, 
                padding: 16, 
                borderWidth: 1,
                borderColor: '#3B82F650'
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Ruler size={20} color="#3B82F6" />
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#3B82F6', marginLeft: 8 }}>
                    Target Measurements
                  </Text>
                </View>
                
                <View style={{ gap: 4 }}>
                  <Text style={{ color: '#3B82F6', fontSize: 14, fontWeight: '600' }}>
                    {storeData.recce.sizes?.width || 0} × {storeData.recce.sizes?.height || 0} ft
                  </Text>
                  <Text style={{ color: '#3B82F6', fontSize: 12 }}>
                    Use these dimensions for installation photos
                  </Text>
                </View>
              </View>

              {/* Recce Notes */}
              <View style={{ 
                flex: 1,
                backgroundColor: '#3B82F620', 
                borderRadius: 12, 
                padding: 16, 
                borderWidth: 1,
                borderColor: '#3B82F650'
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <FileText size={20} color="#3B82F6" />
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#3B82F6', marginLeft: 8 }}>
                    Notes
                  </Text>
                </View>
                
                <Text style={{ color: '#3B82F6', fontSize: 12 }}>
                  {storeData.recce.notes || 'No notes provided'}
                </Text>
              </View>
            </View>

            {/* Recce Photos Reference */}
            <View style={{ 
              backgroundColor: '#3B82F620', 
              borderRadius: 12, 
              padding: 16, 
              borderWidth: 1,
              borderColor: '#3B82F650'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <ImageIcon size={20} color="#3B82F6" />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#3B82F6', marginLeft: 8 }}>
                  Recce Photos (Reference)
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['front', 'side', 'closeUp'].map((type) => (
                  <View key={type} style={{ flex: 1, aspectRatio: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: '#3B82F610' }}>
                    {storeData.recce?.photos?.[type] ? (
                      <Image
                        source={{ uri: getPhotoUrl(storeData.recce.photos[type]) || '' }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ImageIcon size={24} color="#3B82F6" />
                        <Text style={{ color: '#3B82F6', fontSize: 10, marginTop: 4, textTransform: 'capitalize' }}>
                          {type}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Installation Photos Section */}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 }}>
            Installation Photos
          </Text>
          
          {storeData.recce?.sizes && (
            <View style={{
              backgroundColor: theme.colors.primary + '10',
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.primary,
              padding: 12,
              marginBottom: 16,
              borderRadius: 8
            }}>
              <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '600' }}>
                📏 Camera will show {storeData.recce.sizes.width} × {storeData.recce.sizes.height} ft measurement overlay
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                Align the installed board with the green guide lines
              </Text>
            </View>
          )}
          
          <View style={{ gap: 12 }}>
            {(['after1', 'after2'] as const).map((type, idx) => (
              <View key={type}>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  Installation Photo {idx + 1} *
                </Text>
                
                <TouchableOpacity
                  onPress={() => capturePhoto(type)}
                  style={{
                    backgroundColor: installationPhotos[type] ? theme.colors.primary + '15' : theme.colors.background,
                    borderWidth: 2,
                    borderColor: installationPhotos[type] ? theme.colors.primary : theme.colors.border,
                    borderStyle: installationPhotos[type] ? 'solid' : 'dashed',
                    borderRadius: 12,
                    padding: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 120
                  }}
                >
                  {installationPhotos[type] ? (
                    <View style={{ alignItems: 'center' }}>
                      <Camera size={28} color={theme.colors.primary} />
                      <Text style={{ color: theme.colors.primary, fontSize: 14, marginTop: 6, fontWeight: '700' }}>
                        Photo Captured
                      </Text>
                      {storeData.recce?.sizes && (
                        <Text style={{ color: theme.colors.primary, fontSize: 11, marginTop: 2, opacity: 0.8 }}>
                          With {storeData.recce.sizes.width} × {storeData.recce.sizes.height} ft overlay
                        </Text>
                      )}
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginTop: 4 }}>
                        Tap to retake
                      </Text>
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Camera size={28} color={theme.colors.textSecondary} />
                      <Text style={{ color: theme.colors.text, fontSize: 14, marginTop: 6, fontWeight: '600' }}>
                        Capture Installation Photo {idx + 1}
                      </Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                        {storeData.recce?.sizes 
                          ? `Will show ${storeData.recce.sizes.width} × ${storeData.recce.sizes.height} ft guide` 
                          : 'Capture after installation is complete'
                        }
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
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
            disabled={loading || !installationPhotos.after1 || !installationPhotos.after2}
            style={{
              flex: 2,
              padding: 16,
              borderRadius: 12,
              backgroundColor: (!installationPhotos.after1 || !installationPhotos.after2) ? theme.colors.border : '#10B981',
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
        width={storeData?.recce?.sizes?.width?.toString() || '0'}
        height={storeData?.recce?.sizes?.height?.toString() || '0'}
        photoType="front" // Installation photos use front view
      />
    </View>
  );
}