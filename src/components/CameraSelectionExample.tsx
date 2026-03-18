import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Camera, Settings } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useCameraDetection } from '../hooks/useCameraDetection';

interface CameraSelectionExampleProps {
  clientId?: string;
  photoType: 'front' | 'side' | 'closeUp';
  onPhotoCapture: (photoUri: string, metadata?: any) => void;
  width?: string;
  height?: string;
}

export default function CameraSelectionExample({
  clientId,
  photoType,
  onPhotoCapture,
  width,
  height
}: CameraSelectionExampleProps) {
  const { theme } = useTheme();
  const [lastCapturedPhoto, setLastCapturedPhoto] = useState<string | null>(null);

  const {
    cameraDetection,
    isDetecting,
    isCapturing,
    detectCameras,
    showCameraSelection,
    launchCamera,
    getRecommendedCameras,
    getAvailableCameras,
    getGPSCameras,
    getDeviceCameras
  } = useCameraDetection({
    useCase: width && height ? 'measurement' : 'documentation'
  });

  const handleCameraButtonPress = async () => {
    if (!cameraDetection) {
      await detectCameras();
      return;
    }

    const availableCameras = getAvailableCameras();
    
    if (availableCameras.length === 0) {
      Alert.alert('No Cameras Available', 'No cameras found on this device.');
      return;
    }

    if (availableCameras.length === 1) {
      // Only one camera available, use it directly
      const camera = availableCameras[0];
      await launchCamera(
        camera,
        (photoUri, metadata) => {
          setLastCapturedPhoto(photoUri);
          onPhotoCapture(photoUri, metadata);
          
          Alert.alert(
            'Photo Captured',
            `Photo captured with ${camera.name}${camera.type === 'gps_app' ? ' (GPS data included)' : ''}!`
          );
        },
        (error) => {
          Alert.alert('Camera Error', error);
        }
      );
    } else {
      // Multiple cameras available, show selection
      await showCameraSelection(
        async (selectedCamera) => {
          await launchCamera(
            selectedCamera,
            (photoUri, metadata) => {
              setLastCapturedPhoto(photoUri);
              onPhotoCapture(photoUri, metadata);
              
              Alert.alert(
                'Photo Captured',
                `Photo captured with ${selectedCamera.name}${selectedCamera.type === 'gps_app' ? ' (GPS data included)' : ''}!`
              );
            },
            (error) => {
              Alert.alert('Camera Error', error);
            }
          );
        },
        () => {
          console.log('Camera selection cancelled');
        }
      );
    }
  };

  const getCameraStatusText = () => {
    if (isDetecting) return 'Detecting cameras...';
    if (!cameraDetection) return 'Tap to detect cameras';
    
    const availableCount = getAvailableCameras().length;
    const gpsCount = getGPSCameras().length;
    const deviceCount = getDeviceCameras().length;
    
    return `${availableCount} camera${availableCount !== 1 ? 's' : ''} (${deviceCount} device, ${gpsCount} GPS)`;
  };

  const getButtonText = () => {
    if (isCapturing) return 'Opening Camera...';
    if (isDetecting) return 'Detecting Cameras...';
    if (!cameraDetection) return 'Detect & Take Photo';
    
    const availableCount = getAvailableCameras().length;
    if (availableCount === 0) return 'No Cameras Available';
    if (availableCount === 1) return `Take Photo (${getAvailableCameras()[0].name})`;
    return `Choose Camera (${availableCount} available)`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Camera Detection Status */}
      <View style={[styles.statusContainer, { backgroundColor: theme.colors.background }]}>
        <Camera size={16} color={theme.colors.text} />
        <Text style={[styles.statusText, { color: theme.colors.text }]}>
          {getCameraStatusText()}
        </Text>
        <TouchableOpacity
          onPress={detectCameras}
          style={[styles.refreshButton, { backgroundColor: theme.colors.primary + '20' }]}
          disabled={isDetecting}
        >
          <Settings size={14} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Camera Details */}
      {cameraDetection && (
        <View style={styles.detailsContainer}>
          <Text style={[styles.detailsText, { color: theme.colors.textSecondary }]}>
            Device Cameras: {getDeviceCameras().length} • GPS Apps: {getGPSCameras().length}
          </Text>
          {getRecommendedCameras().length > 0 && (
            <Text style={[styles.recommendedText, { color: theme.colors.primary }]}>
              ⭐ {getRecommendedCameras().length} recommended for {width && height ? 'measurements' : 'documentation'}
            </Text>
          )}
        </View>
      )}

      {/* Instructions */}
      {width && height && (
        <Text style={[styles.instructions, { color: theme.colors.textSecondary }]}>
          Target size: {width} × {height} inches
        </Text>
      )}

      {/* Main Camera Button */}
      <TouchableOpacity
        style={[styles.cameraButton, { 
          backgroundColor: (isCapturing || isDetecting) ? theme.colors.primary + '80' : theme.colors.primary,
          opacity: (isCapturing || isDetecting) ? 0.7 : 1
        }]}
        onPress={handleCameraButtonPress}
        disabled={isCapturing || isDetecting}
      >
        <Camera size={24} color="#FFFFFF" />
        <Text style={styles.buttonText}>
          {getButtonText()}
        </Text>
      </TouchableOpacity>

      {/* Last Captured Photo Info */}
      {lastCapturedPhoto && (
        <Text style={[styles.capturedInfo, { color: theme.colors.success }]}>
          ✓ Photo captured successfully
        </Text>
      )}

      {/* Debug Info (can be removed in production) */}
      {__DEV__ && cameraDetection && (
        <View style={[styles.debugContainer, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.debugTitle, { color: theme.colors.text }]}>Debug Info:</Text>
          <Text style={[styles.debugText, { color: theme.colors.textSecondary }]}>
            Total Available: {cameraDetection.totalAvailable}
          </Text>
          <Text style={[styles.debugText, { color: theme.colors.textSecondary }]}>
            Device Cameras: {cameraDetection.deviceCameras.map(c => c.name).join(', ')}
          </Text>
          <Text style={[styles.debugText, { color: theme.colors.textSecondary }]}>
            GPS Apps: {cameraDetection.gpsApps.filter(c => c.isAvailable).map(c => c.name).join(', ') || 'None installed'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    margin: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  statusText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  refreshButton: {
    padding: 6,
    borderRadius: 6,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailsText: {
    fontSize: 11,
    textAlign: 'center',
  },
  recommendedText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '600',
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  capturedInfo: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  debugContainer: {
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  debugText: {
    fontSize: 10,
    marginBottom: 2,
  },
});