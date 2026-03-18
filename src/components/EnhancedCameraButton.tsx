import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, Modal } from 'react-native';
import { Camera, MapPin, Settings, X, Smartphone, Download } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { cameraDetectionService, CameraOption, CameraDetectionResult } from '../services/cameraDetectionService';

interface EnhancedCameraButtonProps {
  clientId?: string;
  photoType: 'front' | 'side' | 'closeUp';
  onPhotoCapture: (photoUri: string, metadata?: any) => void;
  width?: string;
  height?: string;
  title?: string;
  useCase?: 'measurement' | 'documentation' | 'proof';
}

export default function EnhancedCameraButton({
  clientId,
  photoType,
  onPhotoCapture,
  width,
  height,
  title,
  useCase = 'documentation'
}: EnhancedCameraButtonProps) {
  const { theme } = useTheme();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraDetection, setCameraDetection] = useState<CameraDetectionResult | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    detectCameras();
  }, []);

  const detectCameras = async () => {
    try {
      setIsDetecting(true);
      const detection = await cameraDetectionService.detectAllCameras();
      setCameraDetection(detection);
    } catch (error) {
      console.error('Error detecting cameras:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleCameraSelection = () => {
    if (!cameraDetection) {
      detectCameras();
      return;
    }

    if (cameraDetection.totalAvailable === 0) {
      Alert.alert('No Cameras Available', 'No cameras found on this device.');
      return;
    }

    if (cameraDetection.totalAvailable === 1) {
      // Only one camera available, use it directly
      const availableCamera = [...cameraDetection.deviceCameras, ...cameraDetection.gpsApps]
        .find(camera => camera.isAvailable);
      
      if (availableCamera) {
        launchCamera(availableCamera);
      }
    } else {
      // Multiple cameras available, show selection modal
      setShowCameraModal(true);
    }
  };

  const launchCamera = async (camera: CameraOption) => {
    setIsCapturing(true);
    setShowCameraModal(false);

    try {
      await cameraDetectionService.launchSelectedCamera(
        camera,
        (photoUri: string, metadata?: any) => {
          setIsCapturing(false);
          setCapturedPhoto(photoUri);
          onPhotoCapture(photoUri, {
            ...metadata,
            cameraUsed: camera.name,
            cameraType: camera.type,
            hasGPSData: camera.type === 'gps_app'
          });

          // Show success message
          Alert.alert(
            'Photo Captured',
            `Photo captured successfully with ${camera.name}${camera.type === 'gps_app' ? ' (GPS data included)' : ''}!`,
            [{ text: 'OK' }]
          );
        },
        (error: string) => {
          setIsCapturing(false);
          Alert.alert('Camera Error', error);
        }
      );
    } catch (error) {
      setIsCapturing(false);
      Alert.alert('Error', 'Failed to launch camera');
    }
  };

  const getButtonTitle = () => {
    if (title) return title;
    
    switch (photoType) {
      case 'front':
        return 'Take Front Photo';
      case 'side':
        return 'Take Side Photo';
      case 'closeUp':
        return 'Take Close-up Photo';
      default:
        return 'Take Photo';
    }
  };

  const getInstructions = () => {
    if (width && height) {
      return `Target size: ${width} × ${height} inches`;
    }
    return 'Capture photo for documentation';
  };

  const getCameraStatusText = () => {
    if (isDetecting) return 'Detecting cameras...';
    if (!cameraDetection) return 'Camera detection pending';
    
    const availableCount = cameraDetection.deviceCameras.filter(c => c.isAvailable).length +
                          cameraDetection.gpsApps.filter(c => c.isAvailable).length;
    const gpsCount = cameraDetection.gpsApps.filter(c => c.isAvailable).length;
    
    return `${availableCount} camera${availableCount !== 1 ? 's' : ''} available${gpsCount > 0 ? ` (${gpsCount} GPS)` : ''}`;
  };

  const getRecommendedCameras = () => {
    if (!cameraDetection) return [];
    
    const recommended = cameraDetectionService.getRecommendedCameras(useCase);
    const allCameras = [...cameraDetection.deviceCameras, ...cameraDetection.gpsApps];
    
    return recommended
      .map(id => allCameras.find(camera => camera.id === id))
      .filter((camera): camera is CameraOption => camera !== undefined && camera.isAvailable);
  };

  const renderCameraOption = (camera: CameraOption, isRecommended: boolean = false) => (
    <TouchableOpacity
      key={camera.id}
      style={[
        styles.cameraOption,
        { 
          backgroundColor: theme.colors.background,
          borderColor: isRecommended ? theme.colors.primary : theme.colors.border,
          borderWidth: isRecommended ? 2 : 1
        }
      ]}
      onPress={() => launchCamera(camera)}
      disabled={!camera.isAvailable}
    >
      <View style={styles.cameraOptionHeader}>
        <View style={styles.cameraOptionTitle}>
          <Text style={styles.cameraIcon}>{camera.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cameraName, { color: theme.colors.text }]}>
              {camera.name}
              {isRecommended && <Text style={{ color: theme.colors.primary }}> ⭐</Text>}
            </Text>
            <Text style={[styles.cameraDescription, { color: theme.colors.textSecondary }]}>
              {camera.description}
            </Text>
          </View>
        </View>
        
        <View style={[
          styles.cameraStatus,
          { backgroundColor: camera.isAvailable ? '#10B981' : '#EF4444' }
        ]}>
          <Text style={styles.cameraStatusText}>
            {camera.isAvailable ? 'Available' : 'Not Installed'}
          </Text>
        </View>
      </View>

      <View style={styles.cameraFeatures}>
        {camera.features.slice(0, 3).map((feature, index) => (
          <View key={index} style={[styles.featureTag, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={[styles.featureText, { color: theme.colors.primary }]}>
              {feature}
            </Text>
          </View>
        ))}
        {camera.features.length > 3 && (
          <Text style={[styles.moreFeatures, { color: theme.colors.textSecondary }]}>
            +{camera.features.length - 3} more
          </Text>
        )}
      </View>

      {!camera.isAvailable && camera.type === 'gps_app' && (
        <TouchableOpacity
          style={[styles.installButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            // Handle installation
            Alert.alert('Install App', `Would you like to install ${camera.name}?`);
          }}
        >
          <Download size={14} color="#FFFFFF" />
          <Text style={styles.installButtonText}>Install</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Camera Status */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusItem, { backgroundColor: theme.colors.background }]}>
          <Smartphone size={16} color={theme.colors.text} />
          <Text style={[styles.statusText, { color: theme.colors.text }]}>
            {getCameraStatusText()}
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={detectCameras}
          style={[styles.refreshButton, { backgroundColor: theme.colors.primary + '20' }]}
          disabled={isDetecting}
        >
          <Settings size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <Text style={[styles.instructions, { color: theme.colors.textSecondary }]}>
        {getInstructions()}
      </Text>

      {/* Captured Photo Preview */}
      {capturedPhoto && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedPhoto }} style={styles.preview} />
          <Text style={[styles.previewText, { color: theme.colors.textSecondary }]}>
            Last captured photo
          </Text>
        </View>
      )}

      {/* Main Camera Button */}
      <TouchableOpacity
        style={[styles.cameraButton, { 
          backgroundColor: isCapturing ? theme.colors.primary + '80' : theme.colors.primary,
          opacity: isCapturing ? 0.7 : 1
        }]}
        onPress={handleCameraSelection}
        disabled={isCapturing || isDetecting}
      >
        <Camera size={24} color="#FFFFFF" />
        <Text style={styles.buttonText}>
          {isCapturing ? 'Opening Camera...' : 
           isDetecting ? 'Detecting Cameras...' : 
           cameraDetection?.totalAvailable === 1 ? getButtonTitle() : 
           `Choose Camera (${cameraDetection?.totalAvailable || 0})`}
        </Text>
      </TouchableOpacity>

      {/* Camera Selection Modal */}
      <Modal
        visible={showCameraModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCameraModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Select Camera
            </Text>
            <TouchableOpacity
              onPress={() => setShowCameraModal(false)}
              style={styles.closeButton}
            >
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Recommended Cameras */}
            {getRecommendedCameras().length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  ⭐ Recommended for {useCase}
                </Text>
                {getRecommendedCameras().map(camera => renderCameraOption(camera, true))}
              </View>
            )}

            {/* Device Cameras */}
            {cameraDetection?.deviceCameras.some(c => c.isAvailable) && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  📱 Device Cameras
                </Text>
                {cameraDetection.deviceCameras
                  .filter(camera => camera.isAvailable)
                  .map(camera => renderCameraOption(camera))}
              </View>
            )}

            {/* GPS Camera Apps */}
            {cameraDetection?.gpsApps.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  📍 GPS Camera Apps
                </Text>
                {cameraDetection.gpsApps.map(camera => renderCameraOption(camera))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
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
    marginBottom: 12,
    gap: 8,
  },
  statusItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  preview: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 12,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cameraOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cameraOptionHeader: {
    marginBottom: 8,
  },
  cameraOptionTitle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cameraIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  cameraName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cameraDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  cameraStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cameraStatusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cameraFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  featureTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 10,
    fontWeight: '600',
  },
  moreFeatures: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  installButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    gap: 4,
  },
  installButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});