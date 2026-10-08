import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, Platform, AppState, AppStateStatus, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Camera, Upload, CheckCircle2, Loader2, Ruler, FileText, ImageIcon, X, Trash2, Layers } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeService } from '../../services/storeService';
import Toast from 'react-native-toast-message';
import MeasurementCamera from '../../components/MeasurementCamera';
import CustomModal from '../../components/CustomModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import imageService from '../../services/imageService';

const isBoardApproved = (p: any) => p?.approvalStatus === 'APPROVED' || p?.status === 'APPROVED';

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
  const { storeId } = route.params;
  const draftKey = `@draft_installation_${storeId}`;

  const [loading, setLoading] = useState(false);
  const [storeData, setStoreData] = useState<any>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const [currentPhotoType, setCurrentPhotoType] = useState<'before' | 'after' | 'closeup'>('before');
  const [installationPhotos, setInstallationPhotos] = useState<{[key: number]: {before?: string, after?: string, closeup?: string}}>({});
  const [installationPhotoMeta, setInstallationPhotoMeta] = useState<{[key: number]: {before?: {mimeType: string, fileExtension: string}, after?: {mimeType: string, fileExtension: string}, closeup?: {mimeType: string, fileExtension: string}}}>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'warning' | 'info',
    buttons: [] as Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  });

  const stateRef = useRef({
    installationPhotos,
    installationPhotoMeta,
  });

  useEffect(() => {
    stateRef.current = {
      installationPhotos,
      installationPhotoMeta,
    };
  }, [installationPhotos, installationPhotoMeta]);

  const saveDraftToStorage = async () => {
    if (!storeId) return;
    try {
      const current = stateRef.current;
      const hasPhotos = Object.values(current.installationPhotos).some(
        b => b && (b.before || b.after || b.closeup)
      );
      if (hasPhotos) {
        const draft = {
          installationPhotos: current.installationPhotos,
          installationPhotoMeta: current.installationPhotoMeta,
          savedAt: Date.now(),
        };
        await AsyncStorage.setItem(draftKey, JSON.stringify(draft));
      }
    } catch (err) {
      console.warn('Failed to save installation draft:', err);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, [storeId]);

  // Auto-save draft on state change with debounce
  useEffect(() => {
    if (!draftLoaded) return;
    const timer = setTimeout(() => {
      saveDraftToStorage();
    }, 1500);
    return () => clearTimeout(timer);
  }, [installationPhotos, installationPhotoMeta, draftLoaded]);

  // Flush-save draft immediately when phone call arrives, phone locks, or app backgrounded
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'inactive' || nextState === 'background') {
        saveDraftToStorage();
      }
    };
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [storeId]);

  const loadStoreData = async () => {
    try {
      const response = await storeService.getById(storeId);
      const store = response.store;
      setStoreData(store);
      
      // Check for existing saved draft first
      let restoredFromDraft = false;
      try {
        const rawDraft = await AsyncStorage.getItem(draftKey);
        if (rawDraft) {
          const draft = JSON.parse(rawDraft);
          if (draft && draft.installationPhotos && Object.keys(draft.installationPhotos).length > 0) {
            setInstallationPhotos(draft.installationPhotos);
            if (draft.installationPhotoMeta) {
              setInstallationPhotoMeta(draft.installationPhotoMeta);
            }
            restoredFromDraft = true;
            Toast.show({
              type: 'info',
              text1: 'Ongoing Installation Restored',
              text2: 'Your captured installation photos were preserved intact.',
              visibilityTime: 4000,
            });
          }
        }
      } catch (draftErr) {
        console.warn('Draft load error:', draftErr);
      }

      // Initialize installation photos object if not restored from draft
      if (!restoredFromDraft && store?.recce?.reccePhotos) {
        const approvedPhotos = store.recce.reccePhotos.filter(isBoardApproved);
        const initialPhotos: {[key: number]: {before?: string, after?: string, closeup?: string}} = {};
        approvedPhotos.forEach((_, index: number) => {
          initialPhotos[index] = { before: undefined, after: undefined, closeup: undefined };
        });
        setInstallationPhotos(initialPhotos);
      }

      setDraftLoaded(true);
    } catch (error) {
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
    const approvedReccePhotos = storeData?.recce?.reccePhotos?.filter(isBoardApproved) || [];
    const reccePhotosCount = approvedReccePhotos.length;
    
    if (reccePhotosCount === 0) {
      showModal(
        'No Approved Photos', 
        'There are no approved recce photos available for installation. Please contact admin.', 
        'error'
      );
      return;
    }
    
    // Check minimum 2 photos per approved board (before + after)
    let missingPhotos = [];
    for (let i = 0; i < reccePhotosCount; i++) {
      const boardPhotos = installationPhotos[i] || {};
      const photoCount = Object.values(boardPhotos).filter(photo => photo).length;
      if (photoCount < 2) {
        missingPhotos.push(`Board ${i + 1} (needs ${2 - photoCount} more photos)`);
      }
    }
    
    if (missingPhotos.length > 0) {
      showModal(
        'Minimum Photos Required', 
        `Each board requires minimum 2 photos (Before & After installation).\n\nMissing photos for:\n${missingPhotos.join('\n')}`, 
        'error'
      );
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
              
              // Create FormData matching the expected server format
              const formData = new FormData();
              const installationPhotosData: Array<{ 
                reccePhotoIndex: number, 
                photoType: string,
                measurements?: any 
              }> = [];
              let fileIndex = 0;

              // Helper to ensure photo URI is a local file before submission
              const ensureLocalFileUri = async (uri: string): Promise<string> => {
                if (!uri) return uri;
                if (Platform.OS === 'android' && uri.startsWith('content://')) {
                  try {
                    const destPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/upload_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
                    await ReactNativeBlobUtil.fs.cp(uri, destPath);
                    return `file://${destPath}`;
                  } catch (err) {
                    console.warn('Failed to convert content URI before upload:', err);
                    return uri;
                  }
                }
                return uri;
              };

              for (let i = 0; i < reccePhotosCount; i++) {
                const boardPhotos = installationPhotos[i] || {};
                const boardPhotoMeta = installationPhotoMeta[i] || {};
                const approvedReccePhoto = approvedReccePhotos[i];

                // Add each photo type for this approved board
                for (const [photoType, rawPhotoUri] of Object.entries(boardPhotos)) {
                  if (rawPhotoUri) {
                    const photoUri = await ensureLocalFileUri(rawPhotoUri as string);
                    const meta = (boardPhotoMeta as any)[photoType];
                    const mimeType = meta?.mimeType || 'image/jpeg';
                    const fileExtension = meta?.fileExtension || 'jpg';
                    formData.append(`installationPhoto${fileIndex}`, {
                      uri: photoUri,
                      type: mimeType,
                      name: `installation_board${i + 1}_${photoType}.${fileExtension}`,
                    } as any);
                    
                    // Find original index safely
                    const originalIndex = storeData?.recce?.reccePhotos?.findIndex(p => p === approvedReccePhoto) ?? i;
                    
                    installationPhotosData.push({ 
                      reccePhotoIndex: originalIndex, // Original index
                      photoType,
                      measurements: approvedReccePhoto?.measurements || { width: 0, height: 0, unit: 'ft' }
                    });
                    fileIndex++;
                  }
                }
              }
              
              // Add metadata
              formData.append('installationPhotosData', JSON.stringify(installationPhotosData));
              formData.append('totalBoards', reccePhotosCount.toString());
              formData.append('completedAt', new Date().toISOString());
              
              // Pre-check total upload size to guarantee staying under Vercel 4.5MB serverless limit
              let totalUploadBytes = 0;
              for (let i = 0; i < reccePhotosCount; i++) {
                const boardPhotos = installationPhotos[i] || {};
                for (const rawUri of Object.values(boardPhotos)) {
                  if (rawUri) {
                    try {
                      const cleanPath = (rawUri as string).replace('file://', '');
                      const stat = await ReactNativeBlobUtil.fs.stat(cleanPath);
                      totalUploadBytes += Number(stat.size) || 0;
                    } catch {
                      // ignore
                    }
                  }
                }
              }

              if (totalUploadBytes > 4.2 * 1024 * 1024) {
                Alert.alert(
                  'Payload Too Large (Server Limit 4.5MB)',
                  `The total size of the photos being submitted is ${(totalUploadBytes / (1024 * 1024)).toFixed(1)}MB, which exceeds the serverless limit of 4.5MB.\n\nThis occurs when high-resolution photos were restored from an older draft.\n\nWould you like to clear the draft photos so you can capture fresh, optimized photos?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Clear Draft Photos',
                      style: 'destructive',
                      onPress: async () => {
                        await AsyncStorage.removeItem(draftKey);
                        setInstallationPhotos({});
                        setInstallationPhotoMeta({});
                        Toast.show({
                          type: 'info',
                          text1: 'Draft Photos Cleared',
                          text2: 'Please capture new optimized photos.'
                        });
                      }
                    }
                  ]
                );
                setLoading(false);
                return;
              }

              await storeService.submitInstallation(storeId, formData);

              // Clear saved draft on successful submission
              try {
                await AsyncStorage.removeItem(draftKey);
              } catch (err) {
                // ignore
              }
              
              Toast.show({
                type: 'success',
                text1: 'Installation Complete',
                text2: 'Installation has been submitted successfully'
              });
              
              navigation.goBack();
            } catch (error: any) {
              if (error.response?.status === 413) {
                Alert.alert(
                  '413: Request Entity Too Large',
                  'The server rejected the upload because total photo size exceeded the 4.5MB server limit (caused by older high-res draft photos).\n\nWould you like to clear the draft photos and take new optimized photos?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Clear Draft Photos',
                      style: 'destructive',
                      onPress: async () => {
                        await AsyncStorage.removeItem(draftKey);
                        setInstallationPhotos({});
                        setInstallationPhotoMeta({});
                        Toast.show({
                          type: 'info',
                          text1: 'Draft Photos Cleared',
                          text2: 'Please capture new lightweight photos.'
                        });
                      }
                    }
                  ]
                );
              } else {
                const serverMsg =
                  error.response?.data?.error ||
                  error.response?.data?.message ||
                  error.message ||
                  'Failed to complete installation';
                Toast.show({
                  type: 'error',
                  text1: 'Submission Failed',
                  text2: typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg)
                });
              }
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const captureInstallationPhoto = (index: number, photoType: 'before' | 'after' | 'closeup') => {
    setCurrentPhotoIndex(index);
    setCurrentPhotoType(photoType);
    setCameraVisible(true);
  };

  const handlePhotoCapture = (photoUri: string, metadata?: {
    hasDrawings?: boolean;
    measurements?: {
      width: number;
      height: number;
      unit: string;
    };
    photoType?: string;
    capturedAt?: string;
    mimeType?: string;
    fileExtension?: string;
    source?: 'camera' | 'gallery';
  }) => {
    setInstallationPhotos(prev => ({
      ...prev,
      [currentPhotoIndex]: {
        ...prev[currentPhotoIndex],
        [currentPhotoType]: photoUri
      }
    }));
    setInstallationPhotoMeta(prev => ({
      ...prev,
      [currentPhotoIndex]: {
        ...prev[currentPhotoIndex],
        [currentPhotoType]: {
          mimeType: metadata?.mimeType || 'image/jpeg',
          fileExtension: metadata?.fileExtension || 'jpg',
        }
      }
    }));
    setCameraVisible(false);
  };

  const handleClearDraft = () => {
    Alert.alert(
      'Clear Saved Draft?',
      'This will remove all temporarily saved installation photos for this store so you can start fresh. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Draft',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(draftKey);
              setInstallationPhotos({});
              setInstallationPhotoMeta({});
              Toast.show({
                type: 'info',
                text1: 'Draft Cleared',
                text2: 'Draft installation photos have been reset.'
              });
            } catch (err) {
              console.warn('Failed to clear draft:', err);
            }
          }
        }
      ]
    );
  };

  const handleCameraClose = () => {
    setCameraVisible(false);
  };

  // Get the approved recce photo for camera measurements
  const getCurrentReccePhoto = () => {
    const approvedPhotos = storeData?.recce?.reccePhotos?.filter(isBoardApproved) || [];
    return approvedPhotos[currentPhotoIndex] || null;
  };

  if (!storeData) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  const approvedReccePhotos = storeData?.recce?.reccePhotos?.filter(isBoardApproved) || [];
  const initialPhotos = storeData?.recce?.initialPhotos || [];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {Object.values(installationPhotos).some(b => Object.keys(b || {}).length > 0) ? (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 }}>
            <TouchableOpacity
              onPress={handleClearDraft}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#EF444415',
                paddingHorizontal: 8,
                paddingVertical: 5,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: '#EF444440',
              }}
            >
              <Trash2 size={13} color="#EF4444" />
              <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                Clear Draft Photos
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {/* Assignment Info */}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>
            Assignment Details
          </Text>
          
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: theme.colors.background, borderRadius: 8, padding: 12 }}>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 }}>Recce Completed By</Text>
              <Text style={{ fontSize: 14, color: theme.colors.text, fontWeight: '600', marginBottom: 2 }}>
                {storeData.workflow?.recceAssignedTo?.name || '-'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                {storeData.workflow?.recceSubmittedAt ? new Date(storeData.workflow.recceSubmittedAt).toLocaleDateString() : '-'}
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: theme.colors.background, borderRadius: 8, padding: 12 }}>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 }}>Installation Assigned To</Text>
              <Text style={{ fontSize: 14, color: theme.colors.text, fontWeight: '600', marginBottom: 2 }}>
                {storeData.workflow?.installationAssignedTo?.name || '-'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                {storeData.workflow?.installationAssignedAt ? new Date(storeData.workflow.installationAssignedAt).toLocaleDateString() : '-'}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>
            Store Details
          </Text>
          
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <View style={{ flex: 1, backgroundColor: theme.colors.background, borderRadius: 8, padding: 12 }}>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 }}>Store Info</Text>
              <Text style={{ fontSize: 14, color: theme.colors.text, fontWeight: '600', marginBottom: 2 }}>
                ID: {storeData.storeId || '-'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 }}>
                Client: {storeData.clientCode || '-'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                Dealer: {storeData.dealerCode || '-'}
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: theme.colors.background, borderRadius: 8, padding: 12 }}>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 }}>Location</Text>
              <Text style={{ fontSize: 14, color: theme.colors.text, fontWeight: '600', marginBottom: 2 }}>
                {storeData.location?.city || '-'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 }}>
                {storeData.location?.state || '-'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                Zone: {storeData.location?.zone || '-'}
              </Text>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: theme.colors.background, borderRadius: 8, padding: 12 }}>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 }}>Board Specs</Text>
              <Text style={{ fontSize: 14, color: theme.colors.text, fontWeight: '600', marginBottom: 2 }}>
                {storeData.specs?.width || '-'} × {storeData.specs?.height || '-'} ft
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                Qty: {storeData.specs?.qty || 1}
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: theme.colors.background, borderRadius: 8, padding: 12 }}>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 }}>Contact</Text>
              <Text style={{ fontSize: 14, color: theme.colors.text, fontWeight: '600', marginBottom: 2 }}>
                {storeData.contact?.personName || '-'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                {storeData.contact?.mobile || '-'}
              </Text>
            </View>
          </View>
        </View>
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
              {initialPhotos
                .filter((p: any) => p && typeof p === 'string' && p.trim() !== '')
                .slice(0, 4)
                .map((photo: string, idx: number) => {
                  const fullUrl = photo.startsWith('http') ? photo : imageService.getFullImageUrl(photo);
                  if (!fullUrl) return null;
                  return (
                    <TouchableOpacity key={idx} onPress={() => setSelectedImage(fullUrl)} style={{ width: 70, height: 70, borderRadius: 8, overflow: 'hidden', backgroundColor: '#0F172A' }}>
                      <Image
                        source={{ uri: fullUrl }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  );
                })}
            </View>
          </View>
        )}

        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16, 
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 }}>
            Installation Photos for Each Approved Board
          </Text>
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 16 }}>
            Upload minimum 2 photos per approved board: Before & After installation ({storeData?.recce?.reccePhotos?.filter(isBoardApproved).length || 0} approved boards)
          </Text>
          
          <View style={{ gap: 16 }}>
            {(storeData?.recce?.reccePhotos?.filter(isBoardApproved) || []).map((reccePhoto: any, index: number) => {
              const boardPhotos = installationPhotos[index] || {};
              const photoCount = Object.values(boardPhotos).filter(photo => photo).length;
              const hasReccePhoto = Boolean(reccePhoto?.photo && typeof reccePhoto.photo === 'string' && reccePhoto.photo.trim() !== '');
              
              return (
                <View key={index} style={{ 
                  backgroundColor: theme.colors.background, 
                  borderRadius: 12, 
                  padding: 16,
                  borderWidth: 1,
                  borderColor: photoCount >= 2 ? '#10B981' : theme.colors.border
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text }}>
                      {hasReccePhoto ? `Approved Board ${index + 1}` : `Direct Installation — Board ${index + 1}`}
                    </Text>
                    <View style={{ 
                      backgroundColor: photoCount >= 2 ? '#10B98120' : '#F59E0B20', 
                      paddingHorizontal: 8, 
                      paddingVertical: 4, 
                      borderRadius: 12 
                    }}>
                      <Text style={{ 
                        color: photoCount >= 2 ? '#10B981' : '#F59E0B', 
                        fontSize: 10, 
                        fontWeight: 'bold' 
                      }}>
                        {photoCount}/2+ Photos
                      </Text>
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                    {/* Recce Photo Reference or Direct Installation Placeholder */}
                    <View style={{ flex: 1 }}>
                      {hasReccePhoto ? (
                        <>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: '#3B82F6', marginBottom: 8 }}>
                            Recce Photo (Reference)
                          </Text>
                          <TouchableOpacity onPress={() => setSelectedImage(imageService.getFullImageUrl(reccePhoto.photo))} style={{ aspectRatio: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: '#0F172A', borderWidth: 2, borderColor: '#3B82F6' }}>
                            <Image
                              source={{ uri: imageService.getFullImageUrl(reccePhoto.photo) }}
                              style={{ width: '100%', height: '100%' }}
                              resizeMode="contain"
                            />
                          </TouchableOpacity>
                        </>
                      ) : (
                        <View style={{
                          aspectRatio: 1,
                          borderRadius: 8,
                          backgroundColor: '#0F172A',
                          borderWidth: 1.5,
                          borderColor: '#3B82F640',
                          borderStyle: 'dashed',
                          padding: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6
                        }}>
                          <View style={{ backgroundColor: '#3B82F620', padding: 8, borderRadius: 20 }}>
                            <Layers size={22} color="#60A5FA" />
                          </View>
                          <Text style={{ color: '#93C5FD', fontSize: 12, fontWeight: '800', textAlign: 'center' }}>
                            Direct Installation
                          </Text>
                          <Text style={{ color: '#94A3B8', fontSize: 10, textAlign: 'center' }}>
                            Board {index + 1} • No recce photo required
                          </Text>
                        </View>
                      )}
                      <View style={{ marginTop: 8, padding: 8, backgroundColor: '#3B82F610', borderRadius: 6 }}>
                        <Text style={{ fontSize: 11, color: '#3B82F6', fontWeight: '600' }}>
                          {reccePhoto?.measurements?.width || 0} × {reccePhoto?.measurements?.height || 0} {reccePhoto?.measurements?.unit || 'ft'}
                        </Text>
                        {reccePhoto?.elements && reccePhoto.elements.length > 0 && (
                          <Text style={{ fontSize: 10, color: '#3B82F6', marginTop: 2 }}>
                            Element: {reccePhoto.elements[0]?.elementName || 'Unknown'}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                  
                  {/* Installation Photos Grid */}
                  <View style={{ gap: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text }}>
                      Installation Photos (Minimum 2 Required)
                    </Text>
                    
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {/* Before Photo */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#10B981', marginBottom: 6, textAlign: 'center' }}>
                          Before Installation *
                        </Text>
                        <TouchableOpacity
                          onPress={() => captureInstallationPhoto(index, 'before')}
                          style={{
                            aspectRatio: 1,
                            backgroundColor: boardPhotos.before ? '#0F172A' : theme.colors.background,
                            borderWidth: 2,
                            borderColor: boardPhotos.before ? '#10B981' : theme.colors.border,
                            borderStyle: boardPhotos.before ? 'solid' : 'dashed',
                            borderRadius: 8,
                            overflow: 'hidden'
                          }}
                        >
                          {boardPhotos.before ? (
                            <Image
                              source={{ uri: boardPhotos.before }}
                              style={{ width: '100%', height: '100%' }}
                              resizeMode="contain"
                            />
                          ) : (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                              <Camera size={20} color={theme.colors.textSecondary} />
                              <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginTop: 4 }}>
                                Before
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>
                      
                      {/* After Photo */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#10B981', marginBottom: 6, textAlign: 'center' }}>
                          After Installation *
                        </Text>
                        <TouchableOpacity
                          onPress={() => captureInstallationPhoto(index, 'after')}
                          style={{
                            aspectRatio: 1,
                            backgroundColor: boardPhotos.after ? '#0F172A' : theme.colors.background,
                            borderWidth: 2,
                            borderColor: boardPhotos.after ? '#10B981' : theme.colors.border,
                            borderStyle: boardPhotos.after ? 'solid' : 'dashed',
                            borderRadius: 8,
                            overflow: 'hidden'
                          }}
                        >
                          {boardPhotos.after ? (
                            <Image
                              source={{ uri: boardPhotos.after }}
                              style={{ width: '100%', height: '100%' }}
                              resizeMode="contain"
                            />
                          ) : (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                              <Camera size={20} color={theme.colors.textSecondary} />
                              <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginTop: 4 }}>
                                After
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>
                      
                      {/* Close-up Photo (Optional) */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B7280', marginBottom: 6, textAlign: 'center' }}>
                          Close-up (Optional)
                        </Text>
                        <TouchableOpacity
                          onPress={() => captureInstallationPhoto(index, 'closeup')}
                          style={{
                            aspectRatio: 1,
                            backgroundColor: boardPhotos.closeup ? '#0F172A' : theme.colors.background,
                            borderWidth: 2,
                            borderColor: boardPhotos.closeup ? '#10B981' : theme.colors.border,
                            borderStyle: boardPhotos.closeup ? 'solid' : 'dashed',
                            borderRadius: 8,
                            overflow: 'hidden'
                          }}
                        >
                          {boardPhotos.closeup ? (
                            <Image
                              source={{ uri: boardPhotos.closeup }}
                              style={{ width: '100%', height: '100%' }}
                              resizeMode="contain"
                            />
                          ) : (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                              <Camera size={20} color={theme.colors.textSecondary} />
                              <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginTop: 4 }}>
                                Detail
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
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
            disabled={loading || Object.values(installationPhotos).some(boardPhotos => {
              const photoCount = Object.values(boardPhotos || {}).filter(photo => photo).length;
              return photoCount < 2;
            }) || (storeData?.recce?.reccePhotos?.filter(isBoardApproved).length || 0) === 0}
            style={{
              flex: 2,
              padding: 16,
              borderRadius: 12,
              backgroundColor: (Object.values(installationPhotos).some(boardPhotos => {
                const photoCount = Object.values(boardPhotos || {}).filter(photo => photo).length;
                return photoCount < 2;
              }) || (storeData?.recce?.reccePhotos?.filter(isBoardApproved).length || 0) === 0) ? theme.colors.border : '#10B981',
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
        width={currentPhotoType === 'before' ? (getCurrentReccePhoto()?.measurements?.width?.toString() || '0') : '0'}
        height={currentPhotoType === 'before' ? (getCurrentReccePhoto()?.measurements?.height?.toString() || '0') : '0'}
        photoType={currentPhotoType === 'before' ? 'front' : currentPhotoType === 'after' ? 'side' : 'closeUp'}
        clientId={currentPhotoType === 'before' ? storeData?.clientId : undefined}
      />
      
      {/* Image Preview Modal */}
      <Modal visible={!!selectedImage} transparent={true} onRequestClose={() => setSelectedImage(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setSelectedImage(null)}
            style={{ position: 'absolute', top: 40, right: 20, zIndex: 1 }}
          >
            <X size={30} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: '90%', height: '80%' }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
      
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