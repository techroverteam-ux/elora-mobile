import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MapPin, Camera, Settings } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { locationService } from '../services/locationService';
import { imageLocationOverlay } from '../services/imageLocationOverlay';
import MeasurementCamera from '../components/MeasurementCamera';

export default function LocationTestScreen() {
  const { theme } = useTheme();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('Not checked');
  const [lastLocation, setLastLocation] = useState<any>(null);

  const testLocationPermission = async () => {
    try {
      setLocationStatus('Checking permissions...');
      
      const hasPermission = await locationService.checkLocationPermission();
      if (!hasPermission) {
        setLocationStatus('Requesting permission...');
        const granted = await locationService.requestLocationPermission();
        if (granted) {
          setLocationStatus('Permission granted');
        } else {
          setLocationStatus('Permission denied');
          return;
        }
      } else {
        setLocationStatus('Permission already granted');
      }

      setLocationStatus('Getting location...');
      const location = await locationService.getCurrentLocation();
      setLastLocation(location);
      setLocationStatus(`Location obtained: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
      
      Alert.alert(
        'Location Test Success',
        `Latitude: ${location.latitude.toFixed(6)}\nLongitude: ${location.longitude.toFixed(6)}\nAccuracy: ${location.accuracy}m`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      setLocationStatus(`Error: ${error.message}`);
      Alert.alert('Location Test Failed', error.message);
    }
  };

  const testLocationOverlay = async () => {
    try {
      setLocationStatus('Testing location overlay...');
      
      const result = await imageLocationOverlay.processImageWithLocation('test', 'test-client-id');
      
      if (result.shouldAddOverlay) {
        setLocationStatus('Location overlay ready');
        Alert.alert(
          'Location Overlay Test',
          `Overlay enabled: ${result.shouldAddOverlay}\nLocation: ${result.locationData?.location.latitude.toFixed(6)}, ${result.locationData?.location.longitude.toFixed(6)}\nAddress: ${result.locationData?.address.formattedAddress}`,
          [{ text: 'OK' }]
        );
      } else {
        setLocationStatus('Location overlay disabled');
        Alert.alert('Location Overlay Test', 'Location overlay is disabled for this client');
      }
    } catch (error) {
      setLocationStatus(`Overlay error: ${error.message}`);
      Alert.alert('Location Overlay Test Failed', error.message);
    }
  };

  const openTestCamera = () => {
    setCameraVisible(true);
  };

  const handlePhotoCapture = (photoUri: string, metadata?: any) => {
    setCameraVisible(false);
    
    let message = `Photo captured: ${photoUri}`;
    if (metadata?.locationData) {
      message += `\n\nGPS Location embedded:\nLat: ${metadata.locationData.location.latitude.toFixed(6)}\nLng: ${metadata.locationData.location.longitude.toFixed(6)}\nAddress: ${metadata.locationData.address.formattedAddress}`;
    }
    
    Alert.alert('Photo Captured', message, [{ text: 'OK' }]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 20 }}>
      <Text style={{ 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: theme.colors.text, 
        marginBottom: 20,
        textAlign: 'center'
      }}>
        GPS Location Test
      </Text>

      <View style={{
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: theme.colors.border
      }}>
        <Text style={{ color: theme.colors.text, fontSize: 14, marginBottom: 8 }}>
          Status: {locationStatus}
        </Text>
        {lastLocation && (
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
            Last Location: {lastLocation.latitude.toFixed(6)}, {lastLocation.longitude.toFixed(6)}
          </Text>
        )}
      </View>

      <View style={{ gap: 16 }}>
        <TouchableOpacity
          onPress={testLocationPermission}
          style={{
            backgroundColor: theme.colors.primary,
            padding: 16,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MapPin size={20} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
            Test Location Permission
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testLocationOverlay}
          style={{
            backgroundColor: '#10B981',
            padding: 16,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Settings size={20} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
            Test Location Overlay
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openTestCamera}
          style={{
            backgroundColor: '#F59E0B',
            padding: 16,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Camera size={20} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
            Test Camera with GPS
          </Text>
        </TouchableOpacity>
      </View>

      <MeasurementCamera
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={handlePhotoCapture}
        width="4"
        height="3"
        photoType="front"
        clientId="test-client-id"
        enableLocationOverlay={true}
      />
    </View>
  );
}