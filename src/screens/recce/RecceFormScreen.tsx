import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Camera, Upload, Save, X, MapPin, Navigation, RefreshCw, Plus, Ruler } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeAPI } from '../../lib/api';
import Toast from 'react-native-toast-message';
import MeasurementCamera from '../../components/MeasurementCamera';
import CustomModal from '../../components/CustomModal';
import { locationService } from '../../services/locationService';

interface RecceFormProps {
  route: {
    params: {
      recceId: string;
      storeId?: string;
    };
  };
  navigation: {
    goBack: () => void;
  };
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
  const [reccePhotos, setReccePhotos] = useState([{
    photo: null as string | null,
    width: '',
    height: '',
    unit: 'ft'
  }]);
  const [formData, setFormData] = useState({
    address: '',
    originalAddress: '',
    updatedAddress: ''
  });

  useEffect(() => {
    loadStoreData();
    getCurrentLocationAndAddress();
  }, []);

  const loadStoreData = async () => {
    try {
      const response = await storeAPI.getStoreById(storeId || recceId);
      const store = response.data.store;
      setStoreData(store);
      setFormData(prev => ({
        ...prev,
        originalAddress: store.location?.address || store.address || '123 Main St, City, State 12345',
        address: store.location?.address || store.address || '123 Main St, City, State 12345'
      }));
    } catch (error) {
      console.error('Failed to load store data:', error);
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
      console.log('Location error:', error);
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
    if (!formData.address) {
      showModal('Error', 'Please enter store address', 'error');
      return;
    }

    if (reccePhotos.length === 0) {
      showModal('Error', 'At least one recce photo is required', 'error');
      return;
    }

    for (let i = 0; i < reccePhotos.length; i++) {
      if (!reccePhotos[i].photo) {
        showModal('Error', `Please capture photo for board ${i + 1}`, 'error');
        return;
      }
      if (!reccePhotos[i].width || !reccePhotos[i].height) {
        showModal('Error', `Please enter measurements for board ${i + 1}`, 'error');
        return;
      }
    }

    try {
      setLoading(true);
      
      const submitData = {
        notes,
        address: formData.address,
        originalAddress: formData.originalAddress,
        coordinates: currentLocation,
        addressCorrected: formData.address !== formData.originalAddress,
        initialPhotos,
        reccePhotos: reccePhotos.map(rp => ({
          photo: rp.photo,
          width: parseFloat(rp.width),
          height: parseFloat(rp.height),
          unit: rp.unit
        }))
      };

      await storeAPI.submitRecce(storeId || recceId, submitData);
      
      Toast.show({
        type: 'success',
        text1: 'Recce Submitted',
        text2: 'Your recce has been submitted successfully'
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
    if (initialPhotos.length >= 4) {
      showModal('Limit Reached', 'Maximum 4 initial photos allowed', 'warning');
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
      // Recce photo
      const newReccePhotos = [...reccePhotos];
      newReccePhotos[currentRecceIndex].photo = photoUri;
      setReccePhotos(newReccePhotos);
      setCurrentRecceIndex(null);
    } else {
      // Initial photo
      setInitialPhotos([...initialPhotos, photoUri]);
    }
    setCameraVisible(false);
  };

  const addReccePhoto = () => {
    setReccePhotos([...reccePhotos, { photo: null, width: '', height: '', unit: 'ft' }]);
  };

  const removeReccePhoto = (index: number) => {
    if (reccePhotos.length === 1) {
      showModal('Error', 'At least one recce photo is required', 'error');
      return;
    }
    setReccePhotos(reccePhotos.filter((_, i) => i !== index));
  };

  const updateReccePhoto = (index: number, field: string, value: string) => {
    const newReccePhotos = [...reccePhotos];
    newReccePhotos[index][field] = value;
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
            Initial Store Photos (4 photos)
          </Text>
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 16 }}>
            Upload initial photos of the store before starting measurements
          </Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {initialPhotos.map((photo, index) => (
              <View key={index} style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: theme.colors.primary + '20', justifyContent: 'center', alignItems: 'center' }}>
                <Camera size={20} color={theme.colors.primary} />
                <Text style={{ color: theme.colors.primary, fontSize: 10, marginTop: 2 }}>Photo {index + 1}</Text>
              </View>
            ))}
          </View>
          
          {initialPhotos.length < 4 && (
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
                Add Initial Photo ({initialPhotos.length}/4)
              </Text>
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
                  Width (ft) *
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
                  Height (ft) *
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
            </View>
            
            {/* Photo Capture */}
            <TouchableOpacity
              onPress={() => captureReccePhoto(index)}
              style={{
                backgroundColor: reccePhoto.photo ? theme.colors.primary + '15' : theme.colors.background,
                borderWidth: 2,
                borderColor: reccePhoto.photo ? theme.colors.primary : theme.colors.border,
                borderStyle: reccePhoto.photo ? 'solid' : 'dashed',
                borderRadius: 12,
                padding: 20,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 120
              }}
            >
              {reccePhoto.photo ? (
                <View style={{ alignItems: 'center' }}>
                  <Camera size={28} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.primary, fontSize: 14, marginTop: 6, fontWeight: '700' }}>
                    Photo Captured
                  </Text>
                  <Text style={{ color: theme.colors.primary, fontSize: 11, marginTop: 2, opacity: 0.8 }}>
                    {reccePhoto.width} × {reccePhoto.height} ft
                  </Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Camera size={28} color={theme.colors.textSecondary} />
                  <Text style={{ color: theme.colors.text, fontSize: 14, marginTop: 6, fontWeight: '600' }}>
                    Capture Board Photo
                  </Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                    {reccePhoto.width && reccePhoto.height 
                      ? `Will show ${reccePhoto.width} × ${reccePhoto.height} ft guide` 
                      : 'Enter measurements first'
                    }
                  </Text>
                </View>
              )}
            </TouchableOpacity>
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
            disabled={loading || reccePhotos.some(rp => !rp.width || !rp.height || !rp.photo) || !formData.address}
            style={{
              flex: 2,
              padding: 16,
              borderRadius: 12,
              backgroundColor: (reccePhotos.some(rp => !rp.width || !rp.height || !rp.photo) || !formData.address) ? theme.colors.border : theme.colors.primary,
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