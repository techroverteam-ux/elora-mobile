import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { Camera, Upload, Save, X, MapPin, Navigation, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeAPI } from '../../lib/api';
import Toast from 'react-native-toast-message';
import MeasurementCamera from '../../components/MeasurementCamera';
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
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [storeImage, setStoreImage] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [formData, setFormData] = useState({
    width: '',
    height: '',
    notes: '',
    address: '',
    originalAddress: '',
    updatedAddress: '',
    photos: {
      front: null as string | null,
      side: null as string | null,
      closeUp: null as string | null,
    }
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

  const handleSubmit = async () => {
    if (!formData.width || !formData.height || !formData.address) {
      Alert.alert('Error', 'Please fill in all required fields including address');
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
        unit: 'ft',
        notes: formData.notes,
        address: formData.address,
        originalAddress: formData.originalAddress,
        coordinates: currentLocation,
        addressCorrected: formData.address !== formData.originalAddress,
        photos: {
          front: formData.photos.front || null,
          side: formData.photos.side || null,
          closeUp: formData.photos.closeUp || null
        }
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

  const capturePhoto = (type: 'front' | 'side' | 'closeUp') => {
    if (!formData.width || !formData.height) {
      Alert.alert('Measurements Required', 'Please enter width and height measurements before taking photos. This will help show the measurement overlay on camera.');
      return;
    }
    
    setCurrentPhotoType(type);
    setCameraVisible(true);
  };

  const handlePhotoCapture = (photoUri: string) => {
    setFormData(prev => ({
      ...prev,
      photos: {
        ...prev.photos,
        [currentPhotoType]: photoUri
      }
    }));
    setCameraVisible(false);
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
          Fill in the recce details and upload photos
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
          
          {storeImage && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                Current Location View
              </Text>
              <View style={{ width: '100%', height: 150, borderRadius: 8, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.colors.textSecondary }}>Map View</Text>
              </View>
            </View>
          )}
          
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

        {/* Measurements */}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>
            Board Measurements
          </Text>
          
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
                value={formData.width}
                onChangeText={(text) => setFormData({ ...formData, width: text })}
                placeholder="Enter width"
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
                value={formData.height}
                onChangeText={(text) => setFormData({ ...formData, height: text })}
                placeholder="Enter height"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View>
            <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              Notes
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
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Add any notes or observations..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
            />
          </View>
        </View>

        {/* Photo Upload */}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 }}>
            Photos with Measurement Overlay
          </Text>
          
          {(!formData.width || !formData.height) && (
            <View style={{
              backgroundColor: theme.colors.primary + '10',
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.primary,
              padding: 12,
              marginBottom: 16,
              borderRadius: 8
            }}>
              <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '600' }}>
                ⚠️ Enter measurements above to enable measurement overlay on camera
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                The camera will show green guide lines matching your entered dimensions
              </Text>
            </View>
          )}
          
          <View style={{ gap: 12 }}>
            {(['front', 'side', 'closeUp'] as const).map((type) => (
              <View key={type}>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  {type === 'front' ? 'Front View' : type === 'side' ? 'Side View' : 'Close Up'}
                </Text>
                
                <TouchableOpacity
                  onPress={() => capturePhoto(type)}
                  style={{
                    backgroundColor: formData.photos[type] ? theme.colors.primary + '15' : theme.colors.background,
                    borderWidth: 2,
                    borderColor: formData.photos[type] ? theme.colors.primary : theme.colors.border,
                    borderStyle: formData.photos[type] ? 'solid' : 'dashed',
                    borderRadius: 12,
                    padding: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 120
                  }}
                >
                  {formData.photos[type] ? (
                    <View style={{ alignItems: 'center' }}>
                      <Camera size={28} color={theme.colors.primary} />
                      <Text style={{ color: theme.colors.primary, fontSize: 14, marginTop: 6, fontWeight: '700' }}>
                        Photo Captured
                      </Text>
                      <Text style={{ color: theme.colors.primary, fontSize: 11, marginTop: 2, opacity: 0.8 }}>
                        With {formData.width} × {formData.height} ft measurements
                      </Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginTop: 4 }}>
                        Tap to retake
                      </Text>
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Camera size={28} color={theme.colors.textSecondary} />
                      <Text style={{ color: theme.colors.text, fontSize: 14, marginTop: 6, fontWeight: '600' }}>
                        Capture {type === 'front' ? 'Front View' : type === 'side' ? 'Side View' : 'Close Up'}
                      </Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                        {formData.width && formData.height 
                          ? `Will show ${formData.width} × ${formData.height} ft guide` 
                          : 'Enter measurements first for overlay guide'
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
            disabled={loading || !formData.width || !formData.height || !formData.address}
            style={{
              flex: 2,
              padding: 16,
              borderRadius: 12,
              backgroundColor: (!formData.width || !formData.height || !formData.address) ? theme.colors.border : theme.colors.primary,
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
        width={formData.width}
        height={formData.height}
        photoType={currentPhotoType}
      />
    </ScrollView>
  );
}