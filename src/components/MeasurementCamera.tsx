import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions, Alert, PermissionsAndroid, Platform, Image, PanResponder, Linking } from 'react-native';
import { Camera, X, Capture, RotateCcw, Check, Edit3, Trash2 } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { permissionService } from '../services/permissionService';
import { cameraDetectionService, CameraOption } from '../services/cameraDetectionService';
import Svg, { Line, Text as SvgText, G, Rect, Path } from 'react-native-svg';
import { launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import ViewShot from 'react-native-view-shot';
import LocationOverlay from './LocationOverlay';
import { imageLocationOverlay, LocationOverlayData, LocationOverlayConfig } from '../services/imageLocationOverlay';
import { clientService } from '../services/clientService';

interface MeasurementCameraProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (photoUri: string, metadata?: {
    hasDrawings?: boolean;
    measurements?: {
      width: number;
      height: number;
      unit: string;
    };
    photoType?: string;
    capturedAt?: string;
    locationData?: LocationOverlayData;
  }) => void;
  width: string;
  height: string;
  photoType: 'front' | 'side' | 'closeUp';
  title?: string;
  instructions?: string;
  clientId?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MeasurementCamera({ 
  visible, 
  onClose, 
  onCapture, 
  width, 
  height, 
  photoType,
  clientId
}: MeasurementCameraProps) {
  const { theme } = useTheme();
  const [showMeasurement, setShowMeasurement] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [brushSize, setBrushSize] = useState(4);
  const [brushColor, setBrushColor] = useState('#00C853');
  const [drawingPaths, setDrawingPaths] = useState<{ d: string; size: number; color: string }[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);

  // Refs so PanResponder always reads latest values without stale closure
  const isDrawingModeRef = useRef(false);
  const capturedPhotoRef = useRef<string | null>(null);
  const brushSizeRef = useRef(4);
  const brushColorRef = useRef('#00C853');
  const currentPathRef = useRef('');
  const isDrawingRef = useRef(false);
  // Touch-based measurement controls
  const [touchMode, setTouchMode] = useState<'position' | 'resize' | 'off'>('off');
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const [initialOverlayPos, setInitialOverlayPos] = useState({ x: 0, y: 0 });
  const [initialOverlaySize, setInitialOverlaySize] = useState(1.0);
  
  // Overlay size and position controls
  const [overlaySize, setOverlaySize] = useState(1.0); // Scale factor for measurement overlay
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 }); // Offset from center
  const [overlayOpacity, setOverlayOpacity] = useState(0.8); // User controllable opacity
  const [showMeasurementLabels, setShowMeasurementLabels] = useState(true); // User can toggle labels
  const [measurementColor, setMeasurementColor] = useState('#10B981'); // User can change color
  const [measurementStyle, setMeasurementStyle] = useState<'dashed' | 'solid' | 'dotted'>('dashed'); // User can change style
  const viewShotRef = useRef<ViewShot>(null);
  
  // Location overlay state
  const [locationOverlayData, setLocationOverlayData] = useState<LocationOverlayData | null>(null);
  const [locationConfig, setLocationConfig] = useState<LocationOverlayConfig | null>(null);
  const [mapImageUri, setMapImageUri] = useState<string>('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showCameraSelector, setShowCameraSelector] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<CameraOption[]>([]);
  const [isDetectingCameras, setIsDetectingCameras] = useState(false);

  // Create PanResponder for touch-based measurement adjustment
  const measurementPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => touchMode !== 'off' && !!capturedPhoto && hasValidMeasurements,
      onMoveShouldSetPanResponder: () => touchMode !== 'off' && !!capturedPhoto && hasValidMeasurements,
      onPanResponderGrant: (event) => {
        if (touchMode === 'off' || !capturedPhoto || !hasValidMeasurements) return;
        
        const { locationX, locationY } = event.nativeEvent;
        setTouchStartPos({ x: locationX, y: locationY });
        setInitialOverlayPos({ ...overlayPosition });
        setInitialOverlaySize(overlaySize);
        
        if (touchMode === 'position') {
          setIsDragging(true);
        } else if (touchMode === 'resize') {
          setIsResizing(true);
        }
      },
      onPanResponderMove: (event) => {
        if (touchMode === 'off' || !capturedPhoto || !hasValidMeasurements) return;
        
        const { locationX, locationY } = event.nativeEvent;
        const deltaX = locationX - touchStartPos.x;
        const deltaY = locationY - touchStartPos.y;
        
        if (touchMode === 'position' && isDragging) {
          // Move the measurement overlay with bounds checking
          const maxX = cameraWidth / 2 - 50;
          const maxY = cameraHeight / 2 - 50;
          const newX = Math.max(-maxX, Math.min(maxX, initialOverlayPos.x + deltaX));
          const newY = Math.max(-maxY, Math.min(maxY, initialOverlayPos.y + deltaY));
          
          setOverlayPosition({ x: newX, y: newY });
        } else if (touchMode === 'resize' && isResizing) {
          // Resize the measurement overlay based on distance from touch start
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const scaleFactor = Math.max(0.3, Math.min(3.0, initialOverlaySize + (distance / 150)));
          setOverlaySize(scaleFactor);
        }
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
        setIsResizing(false);
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
        setIsResizing(false);
      },
    })
  ).current;

  // Create PanResponder for drawing — uses refs to avoid stale closures
  const drawingPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (event) => {
        const { locationX, locationY } = event.nativeEvent;
        const path = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        currentPathRef.current = path;
        isDrawingRef.current = true;
        setCurrentPath(path);
      },
      onPanResponderMove: (event) => {
        if (!isDrawingRef.current) return;
        const { locationX, locationY } = event.nativeEvent;
        const next = `${currentPathRef.current} L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        currentPathRef.current = next;
        setCurrentPath(next);
      },
      onPanResponderRelease: () => {
        if (!currentPathRef.current) return;
        const finished = currentPathRef.current;
        setDrawingPaths(prev => [...prev, { d: finished, size: brushSizeRef.current, color: brushColorRef.current }]);
        currentPathRef.current = '';
        isDrawingRef.current = false;
        setCurrentPath('');
      },
      onPanResponderTerminate: () => {
        isDrawingRef.current = false;
        currentPathRef.current = '';
        setCurrentPath('');
      },
    })
  ).current;

  // Keep refs in sync with state
  useEffect(() => { isDrawingModeRef.current = isDrawingMode; }, [isDrawingMode]);
  useEffect(() => { capturedPhotoRef.current = capturedPhoto; }, [capturedPhoto]);
  useEffect(() => { brushSizeRef.current = brushSize; }, [brushSize]);
  useEffect(() => { brushColorRef.current = brushColor; }, [brushColor]);

  useEffect(() => {
    if (visible && width && height && parseFloat(width) > 0 && parseFloat(height) > 0) {
      // Show measurement overlay only when valid measurements are provided
      setShowMeasurement(true);
      
      // Initialize location overlay if client has it enabled
      if (clientId) {
        initializeLocationOverlay();
      }
    } else {
      // No measurements provided - this is for clean photos (after installation, closeup, etc.)
      setShowMeasurement(false);
      setCapturedPhoto(null);
      setLocationOverlayData(null);
      setLocationConfig(null);
      setMapImageUri('');
    }
  }, [visible, width, height, clientId]);

  // Force refresh measurement guide when component becomes visible
  useEffect(() => {
    if (visible && !capturedPhoto) {
      const timer = setTimeout(() => {
        if (width && height && parseFloat(width) > 0 && parseFloat(height) > 0) {
          setShowMeasurement(true);
          setForceRefresh(prev => prev + 1);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [visible, capturedPhoto, width, height]);

  const initializeLocationOverlay = async () => {
    try {
      setIsLoadingLocation(true);
      
      if (!clientId) {
        console.log('No clientId provided for location overlay');
        setIsLoadingLocation(false);
        return;
      }
      
      // Check if location overlay should be enabled for this client
      const locationConfig = await clientService.getLocationConfig(clientId);
      console.log('Client location config:', locationConfig);
      
      if (locationConfig.enableLocationOverlay) {
        // Get location data and process image
        const result = await imageLocationOverlay.processImageWithLocation('', clientId);
        console.log('Location overlay result:', result);
        
        if (result.shouldAddOverlay && result.locationData && result.config) {
          setLocationOverlayData(result.locationData);
          setLocationConfig(result.config);
          
          // Download map image with better error handling
          if (result.locationData.mapUrl) {
            try {
              console.log('Downloading map image from:', result.locationData.mapUrl);
              const mapUri = await imageLocationOverlay.downloadMapImage(result.locationData.mapUrl);
              if (mapUri) {
                console.log('Map image downloaded successfully:', mapUri);
                setMapImageUri(mapUri);
              } else {
                console.warn('Map image download returned empty URI');
                // Continue without map image - will show placeholder
              }
            } catch (mapError) {
              console.warn('Failed to download map image:', mapError);
              // Continue without map image - will show placeholder
            }
          } else {
            console.warn('No map URL provided in location data');
          }
        } else {
          console.log('Location overlay not enabled or data unavailable');
        }
      } else {
        console.log('Location overlay disabled for client:', clientId);
      }
    } catch (error) {
      console.error('Error initializing location overlay:', error);
      // Don't show error to user, just continue without location overlay
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const detectAvailableCameras = async (): Promise<CameraOption[]> => {
    setIsDetectingCameras(true);
    try {
      const result = await cameraDetectionService.detectAllCameras();
      // Only show installed/available cameras
      const all = [
        ...result.deviceCameras.filter(c => c.isAvailable),
        ...result.gpsApps.filter(c => c.isAvailable),
      ];
      setAvailableCameras(all);
      return all;
    } finally {
      setIsDetectingCameras(false);
    }
  };

  const handleCameraSelect = async (camera: CameraOption) => {
    setShowCameraSelector(false);
    if (camera.type === 'gps_app') {
      // Open the GPS app directly via Linking
      await cameraDetectionService.launchSelectedCamera(
        camera,
        (photoUri, metadata) => {
          setCapturedPhoto(photoUri);
          setShowMeasurement(false);
        },
        (error) => Alert.alert('Camera Error', error)
      );
    } else {
      // Device camera — use react-native-image-picker
      const cameraType = camera.id === 'device_front' ? 'front' as const : 'back' as const;
      triggerCapture(cameraType);
    }
  };

  const handleCapture = async () => {
    if (isCapturing) return;
    const cameras = await detectAvailableCameras();
    if (cameras.length === 1) {
      // Only one camera available, skip selector
      handleCameraSelect(cameras[0]);
    } else {
      setShowCameraSelector(true);
    }
  };

  const triggerCapture = async (cameraType: 'back' | 'front') => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    
    try {
      // Check camera permission first
      const hasPermission = await permissionService.checkCameraPermission();
      
      if (!hasPermission) {
        const granted = await permissionService.requestCameraPermission();
        if (!granted) {
          Alert.alert(
            'Camera Permission Required',
            'Camera access is needed to take photos. Please enable camera permission in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }}
            ]
          );
          setIsCapturing(false);
          return;
        }
      }
      
      const options = {
        mediaType: 'photo' as MediaType,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8,
        saveToPhotos: false,
        cameraType: cameraType,
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      };
      
      launchCamera(options, async (response: ImagePickerResponse) => {
        setIsCapturing(false);
        
        if (response.didCancel) {
          // Re-show measurement guide when camera is cancelled
          if (width && height && parseFloat(width) > 0 && parseFloat(height) > 0) {
            setShowMeasurement(true);
          }
          return;
        }
        
        if (response.errorCode) {
          let errorMessage = 'Camera error occurred';
          switch (response.errorCode) {
            case 'camera_unavailable':
              errorMessage = 'Camera is not available on this device. Please ensure you are using a real device with a working camera.';
              break;
            case 'permission':
              errorMessage = 'Camera permission denied. Please enable camera permission in settings.';
              permissionService.showPermissionDeniedAlert();
              return;
            default:
              errorMessage = `Camera error: ${response.errorMessage || response.errorCode}`;
          }
          
          Alert.alert('Camera Error', errorMessage);
          return;
        }
        
        if (response.errorMessage) {
          Alert.alert('Camera Error', `${response.errorMessage}\n\nNote: Camera functionality requires a real device with camera hardware.`);
          return;
        }
        
        if (response.assets && response.assets[0]) {
          const photoUri = response.assets[0].uri;
          if (photoUri) {
            // Set the captured photo first
            setCapturedPhoto(photoUri);
            setShowMeasurement(false);
            
            // Wait for UI to update and render all overlays, then capture combined view
            setTimeout(async () => {
              try {
                // Additional delay to ensure all overlays (measurement + map + address) are fully rendered
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Capture the combined view with all overlays using explicit options
                const combinedImageUri = await viewShotRef.current?.capture?.({
                  format: 'jpg',
                  quality: 1.0,
                  result: 'tmpfile',
                  width: cameraWidth,
                  height: cameraHeight
                });
                
                if (combinedImageUri) {
                  // Update with the combined image that includes photo + overlays
                  setCapturedPhoto(combinedImageUri);
                } else {
                  // Keep original photo if ViewShot capture fails
                  setCapturedPhoto(photoUri);
                }
              } catch (error) {
                // Keep original photo on error
                setCapturedPhoto(photoUri);
              }
            }, 200);
          } else {
            // Re-show measurement guide on failure
            if (width && height && parseFloat(width) > 0 && parseFloat(height) > 0) {
              setShowMeasurement(true);
            }
            Alert.alert('Error', 'Failed to capture photo. Please try again.');
          }
        } else {
          // Re-show measurement guide on failure
          if (width && height && parseFloat(width) > 0 && parseFloat(height) > 0) {
            setShowMeasurement(true);
          }
          Alert.alert('Error', 'No photo was captured. Please try again.');
        }
      });
    } catch (error) {
      setIsCapturing(false);
      Alert.alert('Camera Error', 'Failed to open camera. Please ensure you are using a real device with camera access enabled.');
    }
  };

  const handleConfirm = async () => {
    if (capturedPhoto) {
      try {
        let finalImageUri = capturedPhoto;
        let hasDrawings = false;
        let measurements = null;
        
        // Always capture the view to include any overlays (measurements, drawings, location)
        const shouldCaptureView =
          (isDrawingMode && drawingPaths.length > 0) ||
          (locationOverlayData && locationConfig) ||
          hasValidMeasurements;

        if (shouldCaptureView) {
          try {
            const combinedImageUri = await viewShotRef.current?.capture?.({
              format: 'jpg',
              quality: 1.0,
              result: 'tmpfile',
              width: cameraWidth,
              height: cameraHeight
            });
            if (combinedImageUri) {
              finalImageUri = combinedImageUri;
              if (isDrawingMode && drawingPaths.length > 0) hasDrawings = true;
              if (hasValidMeasurements) {
                measurements = { width: measurementWidthInches, height: measurementHeightInches, unit: 'inches' };
              }
            }
          } catch {
            finalImageUri = capturedPhoto;
          }
        }
        
        // Pass the image with metadata
        onCapture(finalImageUri, {
          hasDrawings,
          measurements,
          photoType,
          capturedAt: new Date().toISOString(),
          locationData: locationOverlayData || undefined
        });
        
        // Reset state
        setCapturedPhoto(null);
        setShowMeasurement(false);
        setIsDrawingMode(false);
        isDrawingModeRef.current = false;
        setDrawingPaths([]);
        setCurrentPath('');
        currentPathRef.current = '';
        // Reset overlay customization and touch mode
        setOverlaySize(1.0);
        setOverlayPosition({ x: 0, y: 0 });
        setOverlayOpacity(0.8);
        setShowMeasurementLabels(true);
        setMeasurementColor('#10B981');
        setMeasurementStyle('dashed');
        setTouchMode('off');
        setIsDragging(false);
        setIsResizing(false);
        setLocationOverlayData(null);
        setLocationConfig(null);
        setMapImageUri('');
        onClose();
      } catch (error) {
        // Fallback to original photo
        onCapture(capturedPhoto, {
          photoType,
          capturedAt: new Date().toISOString(),
          locationData: locationOverlayData || undefined,
          measurements: hasValidMeasurements ? {
            width: measurementWidthInches,
            height: measurementHeightInches,
            unit: 'inches'
          } : undefined
        });
        setCapturedPhoto(null);
        setShowMeasurement(false);
        setIsDrawingMode(false);
        isDrawingModeRef.current = false;
        setDrawingPaths([]);
        setCurrentPath('');
        currentPathRef.current = '';
        setLocationOverlayData(null);
        setLocationConfig(null);
        setMapImageUri('');
        onClose();
      }
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    capturedPhotoRef.current = null;
    setIsDrawingMode(false);
    isDrawingModeRef.current = false;
    setDrawingPaths([]);
    setCurrentPath('');
    currentPathRef.current = '';
    setOverlaySize(1.0);
    setOverlayPosition({ x: 0, y: 0 });
    setOverlayOpacity(0.8);
    setShowMeasurementLabels(true);
    setMeasurementColor('#10B981');
    setMeasurementStyle('dashed');
    // Re-show measurement guide after retake
    if (width && height && parseFloat(width) > 0 && parseFloat(height) > 0) {
      setShowMeasurement(true);
    }
  };

  const handleDrawingToggle = () => {
    const next = !isDrawingMode;
    setIsDrawingMode(next);
    isDrawingModeRef.current = next;
    if (next) {
      setDrawingPaths([]);
      setCurrentPath('');
      currentPathRef.current = '';
    }
  };

  const clearDrawing = () => {
    setDrawingPaths([]);
    setCurrentPath('');
    currentPathRef.current = '';
  };

  const calculateDimensions = (points: {x: number, y: number}[]) => {
    if (points.length < 4) return null;
    
    // Find bounding box of the drawn outline
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    
    // Calculate pixel dimensions
    const pixelWidth = maxX - minX;
    const pixelHeight = maxY - minY;
    
    // Convert to real dimensions based on the reference measurements
    const referenceWidth = parseFloat(width) || 1;
    const referenceHeight = parseFloat(height) || 1;
    
    // Simple proportional scaling based on drawn area vs reference
    const drawnRatio = pixelWidth / pixelHeight;
    const referenceRatio = referenceWidth / referenceHeight;
    
    let calculatedWidth, calculatedHeight;
    
    if (drawnRatio > referenceRatio) {
      // Drawn shape is wider than reference, scale by height
      calculatedHeight = referenceHeight;
      calculatedWidth = calculatedHeight * drawnRatio;
    } else {
      // Drawn shape is taller than reference, scale by width
      calculatedWidth = referenceWidth;
      calculatedHeight = calculatedWidth / drawnRatio;
    }
    
    return {
      width: Math.round(calculatedWidth * 100) / 100,
      height: Math.round(calculatedHeight * 100) / 100
    };
  };

  const onGestureEvent = (event: any) => {
    // This function is no longer needed as we're using PanResponder
  };

  const onTouchStart = (event: any) => {
    // This function is no longer needed as we're using PanResponder
  };

  const onTouchMove = (event: any) => {
    // This function is no longer needed as we're using PanResponder
  };

  const onTouchEnd = () => {
    // This function is no longer needed as we're using PanResponder
  };

  const handleClose = () => {
    if (capturedPhoto) {
      Alert.alert(
        'Discard Photo?',
        'Are you sure you want to discard this photo?',
        [
          { text: 'Keep Photo', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onClose }
        ]
      );
    } else {
      onClose();
    }
  };

  if (!visible) return null;

  const cameraWidth = screenWidth;
  const cameraHeight = screenHeight * 0.75;
  
  // Calculate measurement overlay positions - treat input as inches directly
  const measurementWidthInches = parseFloat(width) || 0;
  const measurementHeightInches = parseFloat(height) || 0;
  
  // Check if we have valid measurements
  const hasValidMeasurements = measurementWidthInches > 0 && measurementHeightInches > 0;
  
  // Create proportional measurement guide with proper scaling
  const aspectRatio = measurementWidthInches / measurementHeightInches;
  
  // Base size should be reasonable for the screen
  const baseWidth = Math.min(cameraWidth * 0.6, 300);
  const baseHeight = Math.min(cameraHeight * 0.4, 200);
  
  let rectWidth, rectHeight;
  
  if (aspectRatio > 1) {
    // Width is larger - use baseWidth and scale height
    rectWidth = baseWidth;
    rectHeight = baseWidth / aspectRatio;
  } else {
    // Height is larger or equal - use baseHeight and scale width
    rectHeight = baseHeight;
    rectWidth = baseHeight * aspectRatio;
  }
  
  // Ensure minimum visible size but respect aspect ratio
  const minSize = 80;
  if (rectWidth < minSize || rectHeight < minSize) {
    if (rectWidth < rectHeight) {
      rectWidth = minSize;
      rectHeight = minSize / aspectRatio;
    } else {
      rectHeight = minSize;
      rectWidth = minSize * aspectRatio;
    }
  }
  
  const centerX = cameraWidth / 2;
  const centerY = cameraHeight / 2;

  const getPhotoTypeInstructions = () => {
    switch(photoType) {
      case 'front':
        return hasValidMeasurements 
          ? 'Position the board directly in front. Align with the green measurement guide.' 
          : 'Capture a clear front view of the installation area.';
      case 'side':
        return hasValidMeasurements 
          ? 'Take a side view of the board. Show the depth and mounting surface.' 
          : 'Capture the completed installation from the side.';
      case 'closeUp':
        return 'Capture close-up details of the installation work and connections.';
      default:
        return hasValidMeasurements 
          ? 'Align the board with the measurement guide and capture the photo.' 
          : 'Capture a clear photo of the installation.';
    }
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Camera View */}
        <View style={{ 
          flex: 1, 
          backgroundColor: capturedPhoto ? 'transparent' : '#f5f5f5',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Mock Camera Feed with captured state */}
          <ViewShot 
            ref={viewShotRef}
            options={{ format: 'jpg', quality: 1.0, result: 'tmpfile' }}
            style={{ 
              width: cameraWidth, 
              height: cameraHeight, 
              position: 'relative',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 8,
              overflow: 'hidden'
            }}
          >
            {capturedPhoto ? (
              <>
                {/* Show the actual captured photo */}
                <Image 
                  source={{ uri: capturedPhoto }}
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    backgroundColor: 'transparent'
                  }}
                  resizeMode="cover"
                />
                
                {/* Add measurement overlay to captured photo if measurements exist and not in drawing mode */}
                {hasValidMeasurements && !isDrawingMode && (
                  <View style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%' 
                  }}>
                    <Svg width={cameraWidth} height={cameraHeight}>
                      {/* Clean measurement rectangle overlay on photo */}
                      <Line
                        x1={centerX - rectWidth/2}
                        y1={centerY - rectHeight/2}
                        x2={centerX + rectWidth/2}
                        y2={centerY - rectHeight/2}
                        stroke="#10B981"
                        strokeWidth="2"
                      />
                      <Line
                        x1={centerX + rectWidth/2}
                        y1={centerY - rectHeight/2}
                        x2={centerX + rectWidth/2}
                        y2={centerY + rectHeight/2}
                        stroke="#10B981"
                        strokeWidth="2"
                      />
                      <Line
                        x1={centerX + rectWidth/2}
                        y1={centerY + rectHeight/2}
                        x2={centerX - rectWidth/2}
                        y2={centerY + rectHeight/2}
                        stroke="#10B981"
                        strokeWidth="2"
                      />
                      <Line
                        x1={centerX - rectWidth/2}
                        y1={centerY + rectHeight/2}
                        x2={centerX - rectWidth/2}
                        y2={centerY - rectHeight/2}
                        stroke="#10B981"
                        strokeWidth="2"
                      />
                      
                      {/* Clean measurement labels */}
                      <SvgText
                        x={centerX}
                        y={centerY - rectHeight/2 - 15}
                        fontSize="14"
                        fill="#10B981"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {`${measurementWidthInches} × ${measurementHeightInches} inches`}
                      </SvgText>
                    </Svg>
                  </View>
                )}
                
    
              </>
            ) : (
              <>
                <Text style={{ color: '#666', fontSize: 16 }}>
                  {isCapturing ? 'Capturing...' : 'Camera Feed'}
                </Text>
                <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                  {photoType.toUpperCase()} VIEW
                </Text>
              </>
            )}
            
            {/* Measurement Overlay - only show when not captured and measurements available */}
            {showMeasurement && !capturedPhoto && hasValidMeasurements && (
              <View 
                key={`measurement-${forceRefresh}`}
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%' 
                }}>
                <Svg width={cameraWidth} height={cameraHeight}>
                  {/* Clean measurement rectangle */}
                  <Line
                    x1={centerX - rectWidth/2}
                    y1={centerY - rectHeight/2}
                    x2={centerX + rectWidth/2}
                    y2={centerY - rectHeight/2}
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeDasharray="8,4"
                  />
                  <Line
                    x1={centerX + rectWidth/2}
                    y1={centerY - rectHeight/2}
                    x2={centerX + rectWidth/2}
                    y2={centerY + rectHeight/2}
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeDasharray="8,4"
                  />
                  <Line
                    x1={centerX + rectWidth/2}
                    y1={centerY + rectHeight/2}
                    x2={centerX - rectWidth/2}
                    y2={centerY + rectHeight/2}
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeDasharray="8,4"
                  />
                  <Line
                    x1={centerX - rectWidth/2}
                    y1={centerY + rectHeight/2}
                    x2={centerX - rectWidth/2}
                    y2={centerY - rectHeight/2}
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeDasharray="8,4"
                  />
                  
                  {/* Corner markers for better alignment */}
                  <Line
                    x1={centerX - rectWidth/2 - 15}
                    y1={centerY - rectHeight/2}
                    x2={centerX - rectWidth/2 + 15}
                    y2={centerY - rectHeight/2}
                    stroke="#10B981"
                    strokeWidth="2"
                  />
                  <Line
                    x1={centerX - rectWidth/2}
                    y1={centerY - rectHeight/2 - 15}
                    x2={centerX - rectWidth/2}
                    y2={centerY - rectHeight/2 + 15}
                    stroke="#10B981"
                    strokeWidth="2"
                  />
                  
                  {/* Clean measurement labels */}
                  <SvgText
                    x={centerX}
                    y={centerY - rectHeight/2 - 20}
                    fontSize="14"
                    fill="#10B981"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {`${measurementWidthInches} × ${measurementHeightInches} inches`}
                  </SvgText>
                </Svg>
              </View>
            )}
            
            {/* Drawing Overlay */}
            {isDrawingMode && capturedPhoto && (
              <View
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                pointerEvents="box-only"
                {...drawingPanResponder.panHandlers}
              >
                <Svg width={cameraWidth} height={cameraHeight}>
                  {/* Completed strokes */}
                  {drawingPaths.map((stroke, index) => (
                    <Path
                      key={index}
                      d={stroke.d}
                      stroke={stroke.color}
                      strokeWidth={stroke.size}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                  {/* Live stroke */}
                  {currentPath ? (
                    <Path
                      d={currentPath}
                      stroke={brushColor}
                      strokeWidth={brushSize}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : null}
                </Svg>

                {/* Brush toolbar */}
                <View style={{
                  position: 'absolute', top: 10, left: 10, right: 10,
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 12,
                  paddingHorizontal: 12, paddingVertical: 8, gap: 10
                }}>
                  {/* Color swatches */}
                  {['#00C853','#FF3B30','#FF9500','#FFCC00','#007AFF','#FFFFFF'].map(c => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => { setBrushColor(c); brushColorRef.current = c; }}
                      style={{
                        width: 22, height: 22, borderRadius: 11,
                        backgroundColor: c,
                        borderWidth: brushColor === c ? 3 : 1,
                        borderColor: brushColor === c ? '#FFFFFF' : 'rgba(255,255,255,0.4)'
                      }}
                    />
                  ))}

                  <View style={{ flex: 1 }} />

                  {/* Brush size buttons */}
                  {[2, 4, 8, 14].map(s => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => { setBrushSize(s); brushSizeRef.current = s; }}
                      style={{
                        width: 28, height: 28, borderRadius: 14,
                        backgroundColor: brushSize === s ? brushColor : 'rgba(255,255,255,0.15)',
                        justifyContent: 'center', alignItems: 'center',
                        borderWidth: brushSize === s ? 2 : 1,
                        borderColor: brushSize === s ? '#FFFFFF' : 'rgba(255,255,255,0.3)'
                      }}
                    >
                      <View style={{
                        width: Math.min(s + 2, 18), height: Math.min(s + 2, 18),
                        borderRadius: 10, backgroundColor: '#FFFFFF'
                      }} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            {/* Location Overlay - show when enabled and photo is captured with improved positioning */}
            {locationOverlayData && locationConfig && capturedPhoto && (
              <View style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%',
                zIndex: 100 // Ensure it appears above other overlays
              }}>
                <LocationOverlay
                  locationData={locationOverlayData}
                  config={locationConfig}
                  imageWidth={cameraWidth}
                  imageHeight={cameraHeight}
                  mapImageUri={mapImageUri}
                />
              </View>
            )}
          </ViewShot>
        </View>

        {/* Top Controls */}
        <View style={{ 
          position: 'absolute', 
          top: 50, 
          left: 0, 
          right: 0, 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          paddingHorizontal: 20 
        }}>
          <TouchableOpacity 
            onPress={handleClose}
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              padding: 12, 
              borderRadius: 25 
            }}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={{ 
            backgroundColor: 'rgba(0,0,0,0.8)', 
            paddingHorizontal: 16, 
            paddingVertical: 8, 
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
              {photoType.toUpperCase()} VIEW
            </Text>
            {capturedPhoto && (
              <Text style={{ color: isDrawingMode ? '#F59E0B' : '#10B981', fontSize: 10, marginTop: 2, marginLeft: 8 }}>
                {isDrawingMode ? 'DRAWING MODE' : 'PHOTO CAPTURED'}
              </Text>
            )}
          </View>
          

        </View>

        {/* Measurement Info with location status - simplified to prevent memory issues */}
        {showMeasurement && !capturedPhoto && hasValidMeasurements && (
          <View style={{ 
            position: 'absolute', 
            top: 120, 
            left: 20, 
            right: 20,
            backgroundColor: 'rgba(16, 185, 129, 0.95)', 
            paddingHorizontal: 16, 
            paddingVertical: 12, 
            borderRadius: 12,
            alignItems: 'center'
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
              Target: {measurementWidthInches} × {measurementHeightInches} inches
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 11, marginTop: 2, opacity: 0.9 }}>
              Align board with measurement guide
            </Text>
          </View>
        )}

        {/* Instructions with correct measurements - only show for measurement photos */}
        {showMeasurement && !capturedPhoto && hasValidMeasurements && (
          <View style={{ 
            position: 'absolute', 
            bottom: 180, 
            left: 20, 
            right: 20, 
            backgroundColor: 'rgba(0,0,0,0.85)', 
            padding: 16, 
            borderRadius: 12 
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 14, textAlign: 'center', fontWeight: '600' }}>
              {getPhotoTypeInstructions()}
            </Text>
            <Text style={{ color: '#10B981', fontSize: 12, textAlign: 'center', marginTop: 6 }}>
              Overlay shows {measurementWidthInches} × {measurementHeightInches} inches dimensions
            </Text>
          </View>
        )}
        
        {/* Instructions for clean photos (no measurements) */}
        {!showMeasurement && !capturedPhoto && (
          <View style={{ 
            position: 'absolute', 
            bottom: 180, 
            left: 20, 
            right: 20, 
            backgroundColor: 'rgba(0,0,0,0.85)', 
            padding: 16, 
            borderRadius: 12 
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 14, textAlign: 'center', fontWeight: '600' }}>
              {photoType === 'side' ? 'Capture After Installation Photo' : 'Capture Close-up Detail Photo'}
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 12, textAlign: 'center', marginTop: 6, opacity: 0.8 }}>
              Clean photo without measurement overlay
            </Text>
          </View>
        )}
        


        {/* Bottom Controls */}
        <View style={{ 
          position: 'absolute', 
          bottom: 50, 
          left: 0, 
          right: 0, 
          alignItems: 'center' 
        }}>
          {!capturedPhoto ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 40 }}>
              <TouchableOpacity 
                onPress={handleRetake}
                disabled={isCapturing}
                style={{ 
                  backgroundColor: 'rgba(0,0,0,0.7)', 
                  padding: 16, 
                  borderRadius: 30,
                  opacity: isCapturing ? 0.5 : 1,
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.3)'
                }}
              >
                <RotateCcw size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleCapture}
                disabled={isCapturing}
                style={{ 
                  backgroundColor: isCapturing ? '#059669' : '#10B981', 
                  padding: 20, 
                  borderRadius: 40,
                  borderWidth: 4,
                  borderColor: '#FFFFFF',
                  transform: [{ scale: isCapturing ? 0.95 : 1 }]
                }}
              >
                <Camera size={32} color="#FFFFFF" />
              </TouchableOpacity>
              
              <View style={{ width: 56 }} />
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <TouchableOpacity 
                onPress={handleRetake}
                style={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  paddingHorizontal: 20, 
                  paddingVertical: 12, 
                  borderRadius: 25,
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.3)'
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleDrawingToggle}
                style={{ 
                  backgroundColor: isDrawingMode ? '#F59E0B' : 'rgba(0,0,0,0.8)', 
                  paddingHorizontal: 16, 
                  paddingVertical: 12, 
                  borderRadius: 25,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  borderWidth: 2,
                  borderColor: isDrawingMode ? '#F59E0B' : 'rgba(255,255,255,0.3)'
                }}
              >
                <Edit3 size={16} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>
                  {isDrawingMode ? 'Exit' : 'Draw'}
                </Text>
              </TouchableOpacity>
              
              {drawingPaths.length > 0 && (
                <TouchableOpacity 
                  onPress={clearDrawing}
                  style={{ 
                    backgroundColor: '#EF4444', 
                    paddingHorizontal: 16, 
                    paddingVertical: 12, 
                    borderRadius: 25,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    borderWidth: 2,
                    borderColor: '#EF4444'
                  }}
                >
                  <Trash2 size={16} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>Clear</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                onPress={handleConfirm}
                style={{ 
                  backgroundColor: '#10B981', 
                  paddingHorizontal: 24, 
                  paddingVertical: 12, 
                  borderRadius: 25,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  borderWidth: 2,
                  borderColor: '#10B981'
                }}
              >
                <Check size={18} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Use Photo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>

      {/* Camera Selector Modal */}
      {showCameraSelector && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#1F2937', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>
                Choose Camera
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12, textAlign: 'center', marginBottom: 20 }}>
                {availableCameras.length} camera{availableCameras.length !== 1 ? 's' : ''} found on this device
              </Text>

              {availableCameras.map((camera) => (
                <TouchableOpacity
                  key={camera.id}
                  onPress={() => handleCameraSelect(camera)}
                  style={{
                    backgroundColor: camera.type === 'gps_app' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.08)',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: camera.type === 'gps_app' ? '#10B981' : 'rgba(255,255,255,0.12)',
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{camera.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>{camera.name}</Text>
                    <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>{camera.description}</Text>
                  </View>
                  {camera.type === 'gps_app' && (
                    <View style={{ backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>GPS</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => setShowCameraSelector(false)}
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: 14, borderRadius: 10, marginTop: 4, alignItems: 'center' }}
              >
                <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}