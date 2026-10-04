import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Modal, Platform, AppState, AppStateStatus, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Camera, Upload, Save, X, MapPin, Navigation, RefreshCw, Plus, Ruler, CheckCircle, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeService } from '../../services/storeService';
import Toast from 'react-native-toast-message';
import MeasurementCamera from '../../components/MeasurementCamera';
import CustomModal from '../../components/CustomModal';
import ElementDropdown from '../../components/ElementDropdown';
import { locationService } from '../../services/locationService';
import imageService from '../../services/imageService';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RecceStackParamList } from '../../navigation/types';

type RecceFormScreenNavigationProp = StackNavigationProp<RecceStackParamList, 'RecceForm'>;
type RecceFormScreenRouteProp = RouteProp<RecceStackParamList, 'RecceForm'>;

interface RecceFormProps {
  route: RecceFormScreenRouteProp;
  navigation: RecceFormScreenNavigationProp;
}

interface ReccePhoto {
  file?: File | null;
  photo: string | null;
  localPhoto?: string | null; // For local preview before upload
  localPhotoMimeType?: string; // Real mime type of localPhoto (camera or gallery), for correct upload
  localPhotoFileExtension?: string; // Matching file extension for localPhoto
  width: string;
  height: string;
  unit: string;
  elementId: string;
  elementName: string;
}

interface LocalPhotoMeta {
  mimeType: string;
  fileExtension: string;
}

export default function RecceFormScreen({ route, navigation }: RecceFormProps) {
  const { theme } = useTheme();
  const { recceId, storeId } = route.params;
  const targetId = storeId || recceId;
  const draftKey = `@draft_recce_${targetId}`;

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [currentPhotoType, setCurrentPhotoType] = useState<'front' | 'side' | 'closeUp'>('front');
  const [currentRecceIndex, setCurrentRecceIndex] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [storeImage, setStoreImage] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'warning' | 'info',
    buttons: [] as Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  });
  
  const [notes, setNotes] = useState('');
  const [initialPhotos, setInitialPhotos] = useState<string[]>([]);
  const [localInitialPhotos, setLocalInitialPhotos] = useState<string[]>([]); // Local storage for immediate preview
  const [localInitialPhotoMeta, setLocalInitialPhotoMeta] = useState<LocalPhotoMeta[]>([]); // Real mime type/extension per localInitialPhotos entry, for correct upload
  const [reccePhotos, setReccePhotos] = useState<ReccePhoto[]>([{
    file: null,
    photo: null,
    width: '',
    height: '',
    unit: 'in',
    elementId: '',
    elementName: ''
  }]);
  const [clientElements, setClientElements] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    address: '',
    originalAddress: '',
    updatedAddress: ''
  });

  // Enhanced state for better UX
  const [isResubmission, setIsResubmission] = useState(false);
  const [showElementSelector, setShowElementSelector] = useState<number | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Refs for immediate flush-save on AppState change without stale state
  const stateRef = useRef({
    notes,
    localInitialPhotos,
    localInitialPhotoMeta,
    reccePhotos,
    formData,
    currentLocation,
  });

  useEffect(() => {
    stateRef.current = {
      notes,
      localInitialPhotos,
      localInitialPhotoMeta,
      reccePhotos,
      formData,
      currentLocation,
    };
  }, [notes, localInitialPhotos, localInitialPhotoMeta, reccePhotos, formData, currentLocation]);

  const saveDraftToStorage = async () => {
    if (!targetId) return;
    try {
      const current = stateRef.current;
      // Only save draft if user has entered data or captured photos
      const hasWork =
        current.notes.trim().length > 0 ||
        current.localInitialPhotos.length > 0 ||
        current.reccePhotos.some(rp => rp.localPhoto || rp.width || rp.height || rp.elementId);
      
      if (hasWork) {
        const draft = {
          ...current,
          savedAt: Date.now(),
        };
        await AsyncStorage.setItem(draftKey, JSON.stringify(draft));
      }
    } catch (err) {
      console.warn('Failed to save recce draft:', err);
    }
  };

  // Restore draft and load store data on mount
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      await loadStoreData();
      getCurrentLocationAndAddress();

      // Check for saved draft
      try {
        const rawDraft = await AsyncStorage.getItem(draftKey);
        if (rawDraft && isMounted) {
          const draft = JSON.parse(rawDraft);
          if (draft) {
            if (draft.notes) setNotes(draft.notes);
            if (Array.isArray(draft.localInitialPhotos) && draft.localInitialPhotos.length > 0) {
              setLocalInitialPhotos(draft.localInitialPhotos);
            }
            if (Array.isArray(draft.localInitialPhotoMeta) && draft.localInitialPhotoMeta.length > 0) {
              setLocalInitialPhotoMeta(draft.localInitialPhotoMeta);
            }
            if (Array.isArray(draft.reccePhotos) && draft.reccePhotos.length > 0) {
              setReccePhotos(draft.reccePhotos);
            }
            if (draft.formData) {
              setFormData(prev => ({
                ...prev,
                address: draft.formData.address || prev.address,
                updatedAddress: draft.formData.updatedAddress || prev.updatedAddress,
              }));
            }
            if (draft.currentLocation) {
              setCurrentLocation(draft.currentLocation);
            }
            Toast.show({
              type: 'info',
              text1: 'Ongoing Work Restored',
              text2: 'Your measurements and photos were restored intact.',
              visibilityTime: 4000,
            });
          }
        }
      } catch (err) {
        console.warn('Failed to restore draft:', err);
      } finally {
        if (isMounted) setDraftLoaded(true);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [targetId]);

  // Auto-save draft on state change with debounce
  useEffect(() => {
    if (!draftLoaded) return;
    const timer = setTimeout(() => {
      saveDraftToStorage();
    }, 1500);
    return () => clearTimeout(timer);
  }, [notes, localInitialPhotos, localInitialPhotoMeta, reccePhotos, formData, currentLocation, draftLoaded]);

  // Flush-save draft immediately when phone call arrives, phone locks, or app is backgrounded
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'inactive' || nextState === 'background') {
        saveDraftToStorage();
      }
    };
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [targetId]);

  const loadStoreData = async () => {
    try {
      const response = await storeService.getById(storeId || recceId);
      const store = response.store;
      setStoreData(store);
      setFormData(prev => ({
        ...prev,
        originalAddress: store.location?.address || store.address || '',
        address: prev.address || store.location?.address || store.address || ''
      }));
      
      // Fetch client elements if clientId exists
      if (store.clientId) {
        try {
          const clientRes = await storeService.getClientElements(store.clientId);
          const elements = clientRes.client?.elements || clientRes.elements || [];
          setClientElements(elements);
        } catch (err) {
          setClientElements([]);
        }
      } else {
        setClientElements([]);
      }
      
      // Load existing recce data if resubmission
      if (store.recce && store.recce.submittedDate) {
        setIsResubmission(true);
        if (store.recce.notes) setNotes(store.recce.notes);
        
        // Load existing initial photos
        if (store.recce.initialPhotos && store.recce.initialPhotos.length > 0) {
          const existingInitialPhotos = store.recce.initialPhotos.map((photo: string) => 
            imageService.getFullImageUrl(photo)
          );
          setInitialPhotos(existingInitialPhotos);
        }
        
        // Load existing recce photos
        if (store.recce.reccePhotos && store.recce.reccePhotos.length > 0) {
          const existingReccePhotos = store.recce.reccePhotos.map((rp: any) => ({
            file: null,
            photo: imageService.getFullImageUrl(rp.photo), // Server URL
            localPhoto: null, // No local photo for existing
            width: String(rp.measurements.width || ''),
            height: String(rp.measurements.height || ''),
            unit: rp.measurements.unit || 'in',
            elementId: rp.elements?.[0]?.elementId || '',
            elementName: rp.elements?.[0]?.elementName || ''
          }));
          setReccePhotos(existingReccePhotos);
        }
      }
    } catch (error) {
      console.warn('Failed to load store data:', error);
    }
  };

  const getCurrentLocationAndAddress = async () => {
    try {
      setLocationLoading(true);
      const location = await locationService.getCurrentLocation();
      const addressData = await locationService.reverseGeocode(location.latitude, location.longitude);
      
      setCurrentLocation(location);
      setFormData(prev => ({
        ...prev,
        updatedAddress: addressData.formattedAddress || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
      }));
    } catch (error: any) {
      console.warn('Failed to get GPS location:', error);
      Toast.show({
        type: 'error',
        text1: 'GPS Location',
        text2: error?.message || 'Could not fetch current GPS location. Please check device location settings.'
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if (formData.updatedAddress) {
      setFormData(prev => ({
        ...prev,
        address: prev.updatedAddress
      }));
      Toast.show({
        type: 'success',
        text1: 'Address Updated',
        text2: 'Using current GPS location address'
      });
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
    // Validation exactly like web portal
    if (reccePhotos.length === 0) {
      showModal('Error', 'At least one recce photo is required', 'error');
      return;
    }

    for (let i = 0; i < reccePhotos.length; i++) {
      if (!reccePhotos[i].photo && !reccePhotos[i].localPhoto) {
        showModal('Error', `Please upload photo for recce photo ${i + 1}`, 'error');
        return;
      }
      if (!reccePhotos[i].width || !reccePhotos[i].height) {
        showModal('Error', `Please enter measurements for recce photo ${i + 1}`, 'error');
        return;
      }
      if (!reccePhotos[i].elementId) {
        showModal('Error', `Please select an element for recce photo ${i + 1}`, 'error');
        return;
      }
    }

    try {
      setLoading(true);
      
      // Create FormData exactly matching web portal structure
      const submitFormData = new FormData();
      
      // Add notes
      submitFormData.append('notes', notes);
      
      // Check if this is a resubmission
      const isResubmission = storeData?.recce?.submittedDate;
      
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

      // Add initial photos count and files
      const newInitialPhotos = localInitialPhotos; // Use local photos for upload
      submitFormData.append('initialPhotosCount', newInitialPhotos.length.toString());
      for (let index = 0; index < newInitialPhotos.length; index++) {
        let photoUri = newInitialPhotos[index];
        photoUri = await ensureLocalFileUri(photoUri);
        const meta = localInitialPhotoMeta[index];
        const mimeType = meta?.mimeType || 'image/jpeg';
        const fileExtension = meta?.fileExtension || 'jpg';
        submitFormData.append(`initialPhoto${index}`, {
          uri: photoUri,
          type: mimeType,
          name: `initial_${index}.${fileExtension}`,
        } as any);
      }
      
      // Add recce photos data and files - handle both new and existing photos
      const reccePhotosData = reccePhotos.map((rp) => ({
        width: rp.width,
        height: rp.height,
        unit: rp.unit,
        elements: [{ elementId: rp.elementId, elementName: rp.elementName, quantity: 1 }],
      }));
      submitFormData.append('reccePhotosData', JSON.stringify(reccePhotosData));
      
      // Add new photos (localPhoto) to FormData
      let photoIndex = 0;
      for (const rp of reccePhotos) {
        if (rp.localPhoto) {
          const resolvedUri = await ensureLocalFileUri(rp.localPhoto);
          const mimeType = rp.localPhotoMimeType || 'image/jpeg';
          const fileExtension = rp.localPhotoFileExtension || 'jpg';
          submitFormData.append(`reccePhoto${photoIndex}`, {
            uri: resolvedUri,
            type: mimeType,
            name: `recce_${photoIndex}.${fileExtension}`,
          } as any);
          photoIndex++;
        }
      }
      
      // For resubmission, send existing photos data
      if (isResubmission) {
        const existingReccePhotos = reccePhotos
          .filter(rp => rp.photo && rp.photo.startsWith('http'))
          .map((rp) => ({
            photo: rp.photo?.replace('https://storage.enamorimpex.com/', ''),
            width: rp.width,
            height: rp.height,
            unit: rp.unit,
            elements: [{ elementId: rp.elementId, elementName: rp.elementName, quantity: 1 }],
          }));
        submitFormData.append('existingReccePhotos', JSON.stringify(existingReccePhotos));
        
        const existingInitialPhotos = initialPhotos
          .filter(photo => photo.startsWith('http'))
          .map(photo => photo.replace(imageService.baseUrl + '/', ''));
        submitFormData.append('existingInitialPhotos', JSON.stringify(existingInitialPhotos));
      }

      // Pre-check total upload size to guarantee staying under Vercel 4.5MB serverless limit
      let totalUploadBytes = 0;
      const allResolvedUris: string[] = [];
      for (const uri of newInitialPhotos) {
        if (uri) {
          const resolved = await ensureLocalFileUri(uri);
          allResolvedUris.push(resolved);
        }
      }
      for (const rp of reccePhotos) {
        if (rp.localPhoto) {
          const resolved = await ensureLocalFileUri(rp.localPhoto);
          allResolvedUris.push(resolved);
        }
      }

      for (const uri of allResolvedUris) {
        try {
          const cleanPath = uri.replace('file://', '');
          const stat = await ReactNativeBlobUtil.fs.stat(cleanPath);
          totalUploadBytes += Number(stat.size) || 0;
        } catch {
          // ignore stat error
        }
      }

      console.log('Total recce upload payload bytes:', totalUploadBytes);

      if (totalUploadBytes > 4.2 * 1024 * 1024) {
        Alert.alert(
          'Payload Too Large (Server Limit 4.5MB)',
          `The total size of the photos being submitted is ${(totalUploadBytes / (1024 * 1024)).toFixed(1)}MB, which exceeds the serverless limit of 4.5MB.\n\nThis occurs when high-resolution photos were restored from an older draft.\n\nWould you like to clear the draft photos so you can capture fresh, lightweight photos?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Clear Draft Photos',
              style: 'destructive',
              onPress: async () => {
                await AsyncStorage.removeItem(draftKey);
                setLocalInitialPhotos([]);
                setLocalInitialPhotoMeta([]);
                setReccePhotos(prev => prev.map(rp => ({ ...rp, localPhoto: null, file: null })));
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

      await storeService.submitRecce(storeId || recceId, submitFormData);
      
      // Clear saved draft on successful submission
      try {
        await AsyncStorage.removeItem(draftKey);
      } catch (err) {
        // ignore
      }

      // After successful upload, refresh data to get server URLs
      await loadStoreData();
      
      Toast.show({
        type: 'success',
        text1: isResubmission ? 'Recce Updated Successfully!' : 'Recce Submitted Successfully!',
        text2: isResubmission ? 'Your recce has been updated' : 'Your recce has been submitted successfully'
      });
      
      navigation.goBack();
    } catch (error: any) {
      console.error('Submit error:', error);
      console.error('Submit error response:', error.response?.data);
      console.error('Submit error status:', error.response?.status);

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
                setLocalInitialPhotos([]);
                setLocalInitialPhotoMeta([]);
                setReccePhotos(prev => prev.map(rp => ({ ...rp, localPhoto: null, file: null })));
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
        const serverDetails =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          'Failed to submit recce';
        Toast.show({
          type: 'error',
          text1: 'Submission Failed',
          text2: typeof serverDetails === 'string' ? serverDetails : JSON.stringify(serverDetails)
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const captureInitialPhoto = () => {
    const totalPhotos = initialPhotos.length + localInitialPhotos.length;
    if (totalPhotos >= 10) {
      showModal('Limit Reached', 'Maximum 10 initial photos allowed', 'warning');
      return;
    }
    setCurrentRecceIndex(null);
    setCurrentPhotoType('front');
    setCameraVisible(true);
  };

  const captureReccePhoto = (index: number) => {
    if (!reccePhotos[index].width || !reccePhotos[index].height) {
      showModal('Measurements Required', 'Please enter width and height measurements before taking photos.', 'warning');
      return;
    }
    setCurrentRecceIndex(index);
    setCurrentPhotoType('front');
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
    locationData?: any;
    mimeType?: string;
    fileExtension?: string;
    source?: 'camera' | 'gallery';
  }) => {
    if (currentRecceIndex !== null) {
      // Recce photo - store locally for immediate preview
      const newReccePhotos = [...reccePhotos];
      newReccePhotos[currentRecceIndex].localPhoto = photoUri; // Store in local for preview
      newReccePhotos[currentRecceIndex].localPhotoMimeType = metadata?.mimeType || 'image/jpeg';
      newReccePhotos[currentRecceIndex].localPhotoFileExtension = metadata?.fileExtension || 'jpg';
      newReccePhotos[currentRecceIndex].photo = null; // Clear server photo
      newReccePhotos[currentRecceIndex].file = null; // New photo, not a file

      // If measurements were drawn, update the measurements
      if (metadata?.hasDrawings && metadata?.measurements) {
        newReccePhotos[currentRecceIndex].width = metadata.measurements.width.toString();
        newReccePhotos[currentRecceIndex].height = metadata.measurements.height.toString();
        newReccePhotos[currentRecceIndex].unit = metadata.measurements.unit === 'feet' ? 'ft' : 'in';
      }
      
      // Show success message with location info if available
      if (metadata?.locationData) {
        Toast.show({
          type: 'success',
          text1: 'Photo Captured with GPS Location',
          text2: 'Location data embedded in image'
        });
      }
      
      setReccePhotos(newReccePhotos);
      setCurrentRecceIndex(null);
    } else {
      // Initial photo - store locally for immediate preview
      setLocalInitialPhotos([...localInitialPhotos, photoUri]);
      setLocalInitialPhotoMeta([...localInitialPhotoMeta, {
        mimeType: metadata?.mimeType || 'image/jpeg',
        fileExtension: metadata?.fileExtension || 'jpg',
      }]);
    }
    setCameraVisible(false);
  };

  const addReccePhoto = () => {
    setReccePhotos([...reccePhotos, { 
      file: null, 
      photo: null, 
      localPhoto: null,
      width: '', 
      height: '', 
      unit: 'in', 
      elementId: '', 
      elementName: '' 
    }]);
  };

  const removeReccePhoto = (index: number) => {
    if (reccePhotos.length === 1) {
      showModal('Error', 'At least one recce photo is required', 'error');
      return;
    }
    setReccePhotos(reccePhotos.filter((_, i) => i !== index));
  };

  const updateReccePhoto = (index: number, field: keyof ReccePhoto, value: string) => {
    const newReccePhotos = [...reccePhotos];
    if (field === 'elementId') {
      const selectedElement = clientElements.find(el => (el.elementId || el._id)?.toString() === value);
      newReccePhotos[index].elementId = value;
      newReccePhotos[index].elementName = selectedElement?.elementName || '';
    } else {
      (newReccePhotos[index] as any)[field] = value;
    }
    setReccePhotos(newReccePhotos);
  };

  const handleClearDraft = () => {
    Alert.alert(
      'Clear Saved Draft?',
      'This will remove all temporarily saved draft photos and measurements for this store so you can start fresh. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Draft',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(draftKey);
              setLocalInitialPhotos([]);
              setLocalInitialPhotoMeta([]);
              setReccePhotos([{ 
                file: null, 
                photo: null, 
                localPhoto: null, 
                width: '', 
                height: '', 
                unit: 'in', 
                elementId: '', 
                elementName: '' 
              }]);
              setNotes('');
              Toast.show({
                type: 'info',
                text1: 'Draft Cleared',
                text2: 'Draft photos and measurements have been reset.'
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 }}>
          Submit Recce - {storeData?.storeName || 'Store'}
        </Text>
        <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginBottom: 8 }}>
          Store ID: {storeData?.storeId || storeData?._id || storeId}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: 14, color: theme.colors.textSecondary, flex: 1 }}>
            Upload initial photos, then add measurements for each board
          </Text>
          {(localInitialPhotos.length > 0 || reccePhotos.some(p => p.localPhoto)) ? (
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
                marginLeft: 8,
              }}
            >
              <Trash2 size={13} color="#EF4444" />
              <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                Clear Draft
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Store Location & Address */}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>
              Store Location & GPS
            </Text>
            <TouchableOpacity 
              onPress={getCurrentLocationAndAddress}
              disabled={locationLoading}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.colors.primary + '15',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.colors.primary + '30'
              }}
            >
              <RefreshCw size={14} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                {locationLoading ? 'Locating...' : 'Refresh GPS'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              Original Store Address
            </Text>
            <View style={{
              backgroundColor: theme.colors.background,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: 8,
              padding: 12
            }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
                {formData.originalAddress || 'Not specified'}
              </Text>
            </View>
          </View>
          
          {/* Current GPS Location Status Card */}
          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <MapPin size={16} color={currentLocation ? '#10B981' : theme.colors.primary} />
              <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginLeft: 4 }}>
                Current GPS Location
              </Text>
              {currentLocation && (
                <View style={{ backgroundColor: '#10B98120', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 }}>
                  <Text style={{ color: '#10B981', fontSize: 11, fontWeight: 'bold' }}>
                    {currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}
                  </Text>
                </View>
              )}
            </View>
            <View style={{
              backgroundColor: theme.colors.primary + '10',
              borderWidth: 1,
              borderColor: theme.colors.primary + '30',
              borderRadius: 8,
              padding: 12
            }}>
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>
                {locationLoading 
                  ? 'Fetching GPS coordinates and address...'
                  : (formData.updatedAddress || 'GPS location not yet acquired. Tap "Refresh GPS" to detect.')}
              </Text>
            </View>
          </View>
          
          {formData.updatedAddress ? (
            <TouchableOpacity
              onPress={useCurrentLocation}
              style={{
                backgroundColor: theme.colors.primary + '15',
                borderWidth: 1,
                borderColor: theme.colors.primary,
                borderRadius: 8,
                padding: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12
              }}
            >
              <Navigation size={15} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '600', marginLeft: 8 }}>
                Use Current Location Address
              </Text>
            </TouchableOpacity>
          ) : null}

          <View style={{ marginBottom: 4 }}>
            <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              Corrected Store Address *
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.colors.background,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 8,
                padding: 12,
                color: theme.colors.text,
                fontSize: 16,
                minHeight: 60,
                textAlignVertical: 'top'
              }}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Enter the correct store address"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
            />
          </View>
        </View>

        {/* Initial Photos Section */}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 }}>
            Initial Store Photos (Optional - Max 10)
          </Text>
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 16 }}>
            Upload initial photos of the store before starting measurements
          </Text>
          

          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {/* Display server photos first */}
            {initialPhotos.map((photo, index) => (
              <View key={`server-${index}`} style={{ position: 'relative' }}>
                <TouchableOpacity 
                  onPress={() => setSelectedImagePreview(photo)}
                  style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', backgroundColor: '#0F172A' }}
                >
                  <Image 
                    source={{ uri: photo }} 
                    style={{ width: '100%', height: '100%' }} 
                    resizeMode="contain"
                  />
                  {/* Server photo indicator */}
                  <View style={{
                    position: 'absolute',
                    top: 2,
                    left: 2,
                    backgroundColor: '#10B981',
                    borderRadius: 4,
                    paddingHorizontal: 4,
                    paddingVertical: 1
                  }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 8, fontWeight: 'bold' }}>✓</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const newPhotos = initialPhotos.filter((_, i) => i !== index);
                    setInitialPhotos(newPhotos);
                  }}
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    backgroundColor: '#EF4444',
                    borderRadius: 10,
                    width: 20,
                    height: 20,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <X size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            
            {/* Display local photos */}
            {localInitialPhotos.map((photo, index) => (
              <View key={`local-${index}`} style={{ position: 'relative' }}>
                <TouchableOpacity 
                  onPress={() => setSelectedImagePreview(photo)}
                  style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', backgroundColor: '#0F172A' }}
                >
                  <Image 
                    source={{ uri: photo }} 
                    style={{ width: '100%', height: '100%' }} 
                    resizeMode="contain"
                  />
                  {/* Local photo indicator */}
                  <View style={{
                    position: 'absolute',
                    top: 2,
                    left: 2,
                    backgroundColor: '#F59E0B',
                    borderRadius: 4,
                    paddingHorizontal: 4,
                    paddingVertical: 1
                  }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 8, fontWeight: 'bold' }}>📱</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const newPhotos = localInitialPhotos.filter((_, i) => i !== index);
                    setLocalInitialPhotos(newPhotos);
                    setLocalInitialPhotoMeta(localInitialPhotoMeta.filter((_, i) => i !== index));
                  }}
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    backgroundColor: '#EF4444',
                    borderRadius: 10,
                    width: 20,
                    height: 20,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <X size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          {(initialPhotos.length + localInitialPhotos.length) < 10 && (
            <TouchableOpacity
              onPress={captureInitialPhoto}
              style={{
                backgroundColor: theme.colors.background,
                borderWidth: 2,
                borderColor: theme.colors.border,
                borderStyle: 'dashed',
                borderRadius: 12,
                padding: 20,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Camera size={24} color={theme.colors.textSecondary} />
              <Text style={{ color: theme.colors.text, fontSize: 14, marginTop: 6, fontWeight: '600' }}>
                Add Initial Photo ({initialPhotos.length + localInitialPhotos.length}/10)
              </Text>
              {localInitialPhotos.length > 0 && (
                <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginTop: 2 }}>
                  {localInitialPhotos.length} pending upload
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Recce Photos with Measurements */}
        {reccePhotos.map((reccePhoto, index) => (
          <View key={index} style={{ 
            backgroundColor: theme.colors.surface, 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ruler size={20} color={theme.colors.primary} />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                  Board {index + 1} Measurement
                </Text>
              </View>
              {reccePhotos.length > 1 && (
                <TouchableOpacity onPress={() => removeReccePhoto(index)}>
                  <X size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Measurements */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  Width *
                </Text>
                <TextInput
                  style={{
                    backgroundColor: theme.colors.background,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 8,
                    padding: 12,
                    color: theme.colors.text,
                    fontSize: 16
                  }}
                  value={reccePhoto.width}
                  onChangeText={(text) => updateReccePhoto(index, 'width', text)}
                  placeholder="0.0"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  Height *
                </Text>
                <TextInput
                  style={{
                    backgroundColor: theme.colors.background,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 8,
                    padding: 12,
                    color: theme.colors.text,
                    fontSize: 16
                  }}
                  value={reccePhoto.height}
                  onChangeText={(text) => updateReccePhoto(index, 'height', text)}
                  placeholder="0.0"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={{ flex: 0.8 }}>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  Unit *
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    // Simple unit toggle
                    const newUnit = reccePhoto.unit === 'in' ? 'ft' : 'in';
                    updateReccePhoto(index, 'unit', newUnit);
                  }}
                  style={{
                    backgroundColor: theme.colors.background,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 8,
                    padding: 12,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>
                    {reccePhoto.unit === 'in' ? 'Inches' : 'Feet'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            

            
            {/* Element Selection - Always show if elements are available */}
            {clientElements && clientElements.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  Select Element *
                </Text>
                <ElementDropdown
                  elements={clientElements}
                  selectedElementId={reccePhoto.elementId}
                  selectedElementName={reccePhoto.elementName}
                  onSelect={(elementId) => updateReccePhoto(index, 'elementId', elementId)}
                  isOpen={showElementSelector === index}
                  onToggle={() => setShowElementSelector(showElementSelector === index ? null : index)}
                />
              </View>
            )}
            
            {/* Recce Photos with Measurements Preview */}
            {(reccePhoto.photo || reccePhoto.localPhoto) && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  Photo Preview (Tap to view full size)
                </Text>
                <View style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', backgroundColor: '#0F172A' }}>
                  <TouchableOpacity onPress={() => setSelectedImagePreview(reccePhoto.localPhoto || reccePhoto.photo)}>
                    <Image 
                      source={{ uri: reccePhoto.localPhoto || reccePhoto.photo }} 
                      style={{ width: '100%', height: 220, backgroundColor: '#0F172A' }} 
                      resizeMode="contain" 
                    />
                  </TouchableOpacity>
                  {/* Photo source indicator */}
                  <View style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: reccePhoto.localPhoto ? '#F59E0B' : '#10B981',
                    borderRadius: 4,
                    paddingHorizontal: 6,
                    paddingVertical: 2
                  }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>
                      {reccePhoto.localPhoto ? '📱 Local' : '✓ Server'}
                    </Text>
                  </View>
                  <View style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: 12
                  }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                      {reccePhoto.elementName || 'No element selected'}
                    </Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>
                      {reccePhoto.width} × {reccePhoto.height} {reccePhoto.unit}
                      {reccePhoto.width && reccePhoto.height && (
                        <Text style={{ fontSize: 12, opacity: 0.8 }}>
                          {' '}({reccePhoto.unit === 'in' 
                            ? `${(parseFloat(reccePhoto.width) / 12).toFixed(2)} × ${(parseFloat(reccePhoto.height) / 12).toFixed(2)} ft`
                            : `${parseFloat(reccePhoto.width).toFixed(2)} × ${parseFloat(reccePhoto.height).toFixed(2)} ft`
                          })
                        </Text>
                      )}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => captureReccePhoto(index)}
                  style={{
                    backgroundColor: theme.colors.primary + '15',
                    borderWidth: 1,
                    borderColor: theme.colors.primary,
                    borderRadius: 8,
                    padding: 12,
                    alignItems: 'center',
                    marginTop: 8
                  }}
                >
                  <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: '600' }}>
                    Retake Photo
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Photo Capture Button */}
            {!reccePhoto.photo && !reccePhoto.localPhoto && (
              <TouchableOpacity
                onPress={() => captureReccePhoto(index)}
                style={{
                  backgroundColor: theme.colors.background,
                  borderWidth: 2,
                  borderColor: theme.colors.border,
                  borderStyle: 'dashed',
                  borderRadius: 12,
                  padding: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 120
                }}
              >
                <Camera size={28} color={theme.colors.textSecondary} />
                <Text style={{ color: theme.colors.text, fontSize: 14, marginTop: 6, fontWeight: '600' }}>
                  Capture Board Photo
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                  {reccePhoto.width && reccePhoto.height 
                    ? `Will show ${reccePhoto.width} × ${reccePhoto.height} ${reccePhoto.unit} guide` 
                    : 'Enter measurements first'
                  }
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        {/* Add Board Button */}
        <TouchableOpacity
          onPress={addReccePhoto}
          style={{
            backgroundColor: theme.colors.background,
            borderWidth: 2,
            borderColor: theme.colors.border,
            borderStyle: 'dashed',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            flexDirection: 'row'
          }}
        >
          <Plus size={20} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.primary, fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
            Add Another Board
          </Text>
        </TouchableOpacity>
        
        {/* Notes Section */}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>
            Remarks
          </Text>
          <TextInput
            style={{
              backgroundColor: theme.colors.background,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: 8,
              padding: 12,
              color: theme.colors.text,
              fontSize: 16,
              minHeight: 80,
              textAlignVertical: 'top'
            }}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes or observations..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
          />
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
            disabled={loading || reccePhotos.some(rp => !rp.width || !rp.height || (!rp.photo && !rp.localPhoto)) || !formData.address}
            style={{
              flex: 2,
              padding: 16,
              borderRadius: 12,
              backgroundColor: (reccePhotos.some(rp => !rp.width || !rp.height || (!rp.photo && !rp.localPhoto)) || !formData.address) ? theme.colors.border : theme.colors.primary,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center'
            }}
          >
            <Upload size={20} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
              {loading ? 'Submitting...' : 'Submit Recce'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <MeasurementCamera
        visible={cameraVisible}
        onClose={handleCameraClose}
        onCapture={handlePhotoCapture}
        width={currentRecceIndex !== null ? reccePhotos[currentRecceIndex]?.width || '0' : '0'}
        height={currentRecceIndex !== null ? reccePhotos[currentRecceIndex]?.height || '0' : '0'}
        photoType={currentPhotoType}
        clientId={storeData?.clientId}
      />
      
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        buttons={modalConfig.buttons}
      />
      
      {/* Image Preview Modal */}
      <Modal visible={!!selectedImagePreview} transparent={true} onRequestClose={() => setSelectedImagePreview(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setSelectedImagePreview(null)}
            style={{ position: 'absolute', top: 50, right: 20, zIndex: 1 }}
          >
            <X size={30} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedImagePreview && (
            <Image
              source={{ uri: selectedImagePreview }}
              style={{ width: '90%', height: '80%' }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}