import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Camera, Upload, Save, X, MapPin, Navigation, RefreshCw, Plus, Ruler } from 'lucide-react-native';
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
  width: string;
  height: string;
  unit: string;
  elementId: string;
  elementName: string;
}

export default function RecceFormScreen({ route, navigation }: RecceFormProps) {
  const { theme } = useTheme();
  const { recceId, storeId } = route.params;
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

  useEffect(() => {
    loadStoreData();
    getCurrentLocationAndAddress();
  }, []);

  const loadStoreData = async () => {
    try {
      const response = await storeService.getById(storeId || recceId);
      const store = response.store;
      setStoreData(store);
      setFormData(prev => ({
        ...prev,
        originalAddress: store.location?.address || store.address || '123 Main St, City, State 12345',
        address: store.location?.address || store.address || '123 Main St, City, State 12345'
      }));
      
      // Fetch client elements if clientId exists
      if (store.clientId) {
        try {
          const clientRes = await storeService.getClientElements(store.clientId);
          setClientElements(clientRes.elements || []);
        } catch (err) {
          setClientElements([]);
        }
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
          setLocalInitialPhotos([]); // Clear local photos when loading from server
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
      setFormData(prev => ({
        ...prev,
        originalAddress: '123 Main St, City, State 12345',
        address: '123 Main St, City, State 12345'
      }));
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
        updatedAddress: addressData.formattedAddress || ''
      }));
    } catch (error) {
      // Location error - continue without location
    } finally {
      setLocationLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if (currentLocation) {
      setFormData(prev => ({
        ...prev,
        address: prev.updatedAddress
      }));
      Toast.show({
        type: 'success',
        text1: 'Address Updated',
        text2: 'Using current location address'
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
      
      // Add initial photos count and files
      const newInitialPhotos = localInitialPhotos; // Use local photos for upload
      submitFormData.append('initialPhotosCount', newInitialPhotos.length.toString());
      newInitialPhotos.forEach((photoUri, index) => {
        submitFormData.append(`initialPhoto${index}`, {
          uri: photoUri,
          type: 'image/jpeg',
          name: `initial_${index}.jpg`,
        } as any);
      });
      
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
      reccePhotos.forEach((rp) => {
        if (rp.localPhoto) {
          submitFormData.append(`reccePhoto${photoIndex}`, {
            uri: rp.localPhoto,
            type: 'image/jpeg',
            name: `recce_${photoIndex}.jpg`,
          } as any);
          photoIndex++;
        }
      });
      
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

      await storeService.submitRecce(storeId || recceId, submitFormData);
      
      // After successful upload, refresh data to get server URLs
      await loadStoreData();
      
      Toast.show({
        type: 'success',
        text1: isResubmission ? 'Recce Updated Successfully!' : 'Recce Submitted Successfully!',
        text2: isResubmission ? 'Your recce has been updated' : 'Your recce has been submitted successfully'
      });
      
      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: error.response?.data?.message || 'Failed to submit recce'
      });
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

  const handlePhotoCapture = (photoUri: string) => {
    if (currentRecceIndex !== null) {
      // Recce photo - store locally for immediate preview
      const newReccePhotos = [...reccePhotos];
      newReccePhotos[currentRecceIndex].localPhoto = photoUri; // Store in local for preview
      newReccePhotos[currentRecceIndex].photo = null; // Clear server photo
      newReccePhotos[currentRecceIndex].file = null; // New photo, not a file
      setReccePhotos(newReccePhotos);
      setCurrentRecceIndex(null);
    } else {
      // Initial photo - store locally for immediate preview
      setLocalInitialPhotos([...localInitialPhotos, photoUri]);
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
        <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginBottom: 24 }}>
          Upload initial photos, then add measurements for each board
        </Text>

        {/* Store Location & Address */}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>
            Store Location
          </Text>
          
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
                {formData.originalAddress || 'Loading...'}
              </Text>
            </View>
          </View>
          
          {currentLocation && (
            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <MapPin size={16} color={theme.colors.primary} />
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginLeft: 4 }}>
                  Current Location Address
                </Text>
                <TouchableOpacity 
                  onPress={getCurrentLocationAndAddress}
                  disabled={locationLoading}
                  style={{ marginLeft: 8 }}
                >
                  <RefreshCw size={14} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
              <View style={{
                backgroundColor: theme.colors.primary + '10',
                borderWidth: 1,
                borderColor: theme.colors.primary + '30',
                borderRadius: 8,
                padding: 12
              }}>
                <Text style={{ color: theme.colors.text, fontSize: 14 }}>
                  {formData.updatedAddress || 'Getting location...'}
                </Text>
              </View>
            </View>
          )}
          
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              Corrected Address *
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
          
          {currentLocation && formData.updatedAddress && (
            <TouchableOpacity
              onPress={useCurrentLocation}
              style={{
                backgroundColor: theme.colors.primary + '15',
                borderWidth: 1,
                borderColor: theme.colors.primary,
                borderRadius: 8,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Navigation size={16} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
                Use Current Location Address
              </Text>
            </TouchableOpacity>
          )}
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
          
          {/* Debug info */}
          {__DEV__ && (
            <Text style={{ fontSize: 10, color: theme.colors.textSecondary, marginBottom: 8 }}>
              Debug: Server: {initialPhotos.length}, Local: {localInitialPhotos.length} photos
            </Text>
          )}
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {/* Display server photos first */}
            {initialPhotos.map((photo, index) => (
              <View key={`server-${index}`} style={{ position: 'relative' }}>
                <View style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', backgroundColor: theme.colors.primary + '20' }}>
                  <Image 
                    source={{ uri: photo }} 
                    style={{ width: '100%', height: '100%' }} 
                    resizeMode="cover"
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
                </View>
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
                <View style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', backgroundColor: theme.colors.primary + '20' }}>
                  <Image 
                    source={{ uri: photo }} 
                    style={{ width: '100%', height: '100%' }} 
                    resizeMode="cover"
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
                </View>
                <TouchableOpacity
                  onPress={() => {
                    const newPhotos = localInitialPhotos.filter((_, i) => i !== index);
                    setLocalInitialPhotos(newPhotos);
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
            
            {/* Element Selection */}
            {clientElements.length > 0 && (
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
                  Photo Preview
                </Text>
                <View style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
                  <Image 
                    source={{ uri: reccePhoto.localPhoto || reccePhoto.photo }} 
                    style={{ width: '100%', height: 200, backgroundColor: theme.colors.background }} 
                    resizeMode="cover" 
                  />
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
      />
      
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        buttons={modalConfig.buttons}
      />
    </ScrollView>
  );
}