import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions, Alert, PermissionsAndroid, Platform, Image } from 'react-native';
import { Camera, X, Capture, RotateCcw, Check, Edit3, Trash2 } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { permissionService } from '../services/permissionService';
import Svg, { Line, Text as SvgText, G, Rect, Path } from 'react-native-svg';
import { launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { PanGestureHandler, State as GestureState } from 'react-native-gesture-handler';

interface MeasurementCameraProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (photoUri: string) => void;
  width: string;
  height: string;
  photoType: 'front' | 'side' | 'closeUp';
  title?: string;
  instructions?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MeasurementCamera({ 
  visible, 
  onClose, 
  onCapture, 
  width, 
  height, 
  photoType 
}: MeasurementCameraProps) {
  const { theme } = useTheme();
  const [showMeasurement, setShowMeasurement] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingPaths, setDrawingPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<{x: number, y: number}[]>([]);
  const [boardOutline, setBoardOutline] = useState<{x: number, y: number}[]>([]);
  const [measuredDimensions, setMeasuredDimensions] = useState<{width: number, height: number} | null>(null);

  useEffect(() => {
    if (visible && width && height && parseFloat(width) > 0 && parseFloat(height) > 0) {
      // Show measurement overlay immediately when camera opens
      setShowMeasurement(true);
    } else {
      setShowMeasurement(false);
      setCapturedPhoto(null);
    }
  }, [visible, width, height]);

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

  const handleCapture = async () => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    
    try {
      // Check camera permission first
      const hasPermission = await permissionService.checkCameraPermission();
      
      if (!hasPermission) {
        const granted = await permissionService.requestCameraPermission();
        if (!granted) {
          permissionService.showPermissionDeniedAlert();
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
        cameraType: 'back' as const,
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      };
      
      launchCamera(options, (response: ImagePickerResponse) => {
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
            setCapturedPhoto(photoUri);
            setShowMeasurement(false); // Hide guide when photo is captured
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

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      setCapturedPhoto(null);
      setShowMeasurement(false);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setIsDrawingMode(false);
    setDrawingPaths([]);
    setCurrentPath('');
    setDrawingPoints([]);
    setBoardOutline([]);
    setMeasuredDimensions(null);
    // Re-show measurement guide after retake
    if (width && height && parseFloat(width) > 0 && parseFloat(height) > 0) {
      setShowMeasurement(true);
    }
  };

  const handleDrawingToggle = () => {
    setIsDrawingMode(!isDrawingMode);
    if (!isDrawingMode) {
      // Clear previous drawings when entering drawing mode
      setDrawingPaths([]);
      setCurrentPath('');
      setDrawingPoints([]);
      setBoardOutline([]);
      setMeasuredDimensions(null);
    }
  };

  const clearDrawing = () => {
    setDrawingPaths([]);
    setCurrentPath('');
    setDrawingPoints([]);
    setBoardOutline([]);
    setMeasuredDimensions(null);
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
    
    // Use the camera view dimensions as reference
    const scaleFactorX = referenceWidth / cameraWidth;
    const scaleFactorY = referenceHeight / cameraHeight;
    
    const realWidth = pixelWidth * scaleFactorX;
    const realHeight = pixelHeight * scaleFactorY;
    
    return {
      width: Math.round(realWidth * 100) / 100, // Round to 2 decimal places
      height: Math.round(realHeight * 100) / 100
    };
  };

  const onGestureEvent = (event: any) => {
    if (!isDrawingMode || !capturedPhoto) return;
    
    const { x, y } = event.nativeEvent;
    
    if (event.nativeEvent.state === GestureState.BEGAN) {
      setIsDrawing(true);
      setCurrentPath(`M${x},${y}`);
      setDrawingPoints([{ x, y }]);
    } else if (event.nativeEvent.state === GestureState.ACTIVE && isDrawing) {
      setCurrentPath(prev => `${prev} L${x},${y}`);
      setDrawingPoints(prev => [...prev, { x, y }]);
    } else if (event.nativeEvent.state === GestureState.END) {
      if (currentPath && drawingPoints.length > 0) {
        // Close the path to create a complete outline
        const closedPath = `${currentPath} Z`;
        setDrawingPaths(prev => [...prev, closedPath]);
        
        // Store the board outline points
        setBoardOutline(drawingPoints);
        
        // Calculate dimensions based on drawn outline
        const dimensions = calculateDimensions(drawingPoints);
        setMeasuredDimensions(dimensions);
        
        setCurrentPath('');
      }
      setIsDrawing(false);
    }
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
  
  // Calculate measurement overlay positions based on entered dimensions
  const measurementWidth = parseFloat(width) || 0;
  const measurementHeight = parseFloat(height) || 0;
  
  // Check if we have valid measurements
  const hasValidMeasurements = measurementWidth > 0 && measurementHeight > 0;
  
  // Create proportional measurement guide
  const maxDimension = Math.max(measurementWidth, measurementHeight);
  const scaleX = (cameraWidth * 0.7) * (measurementWidth / maxDimension);
  const scaleY = (cameraHeight * 0.5) * (measurementHeight / maxDimension);
  const centerX = cameraWidth / 2;
  const centerY = cameraHeight / 2;
  
  const rectWidth = Math.max(scaleX, 100); // Minimum visible size
  const rectHeight = Math.max(scaleY, 60); // Minimum visible size

  const getPhotoTypeInstructions = () => {
    switch(photoType) {
      case 'front':
        return 'Position the board directly in front. Align with the green measurement guide.';
      case 'side':
        return 'Take a side view of the board. Show the depth and mounting surface.';
      case 'closeUp':
        return 'Capture close-up details of the board surface and any existing fixtures.';
      default:
        return 'Align the board with the measurement guide and capture the photo.';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Camera View */}
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onGestureEvent}
          enabled={isDrawingMode && !!capturedPhoto}
        >
          <View style={{ 
            flex: 1, 
            backgroundColor: '#1a1a1a',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          {/* Mock Camera Feed with captured state */}
          <View style={{ 
            width: cameraWidth, 
            height: cameraHeight, 
            backgroundColor: capturedPhoto ? '#000' : '#2a2a2a',
            position: 'relative',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 8,
            overflow: 'hidden'
          }}>
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
                    left: 0
                  }}
                  resizeMode="cover"
                />
                
                {/* Overlay with photo info - only show when not in drawing mode */}
                {!isDrawingMode && (
                  <View style={{ 
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center'
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Check size={20} color="#10B981" />
                      <Text style={{ color: '#10B981', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>
                        Photo Captured
                      </Text>
                    </View>
                    <Text style={{ color: '#FFFFFF', fontSize: 12 }}>
                      {photoType.toUpperCase()} VIEW - {parseFloat(width) * 12} × {parseFloat(height) * 12} in
                    </Text>
                  </View>
                )}
                
                {/* Drawing mode instruction overlay */}
                {isDrawingMode && (
                  <View style={{ 
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    right: 20,
                    backgroundColor: 'rgba(16, 185, 129, 0.9)',
                    padding: 8,
                    borderRadius: 8,
                    alignItems: 'center'
                  }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>
                      Trace the board outline with your finger
                    </Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 10, marginTop: 2 }}>
                      Draw a complete outline to measure dimensions
                    </Text>
                  </View>
                )}
                
                {/* Measured dimensions display */}
                {measuredDimensions && isDrawingMode && (
                  <View style={{ 
                    position: 'absolute',
                    bottom: 80,
                    left: 20,
                    right: 20,
                    backgroundColor: 'rgba(16, 185, 129, 0.95)',
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center'
                  }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>
                      Measured Dimensions
                    </Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginTop: 4 }}>
                      {measuredDimensions.width * 12} × {measuredDimensions.height * 12} in
                    </Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 10, marginTop: 2, opacity: 0.9 }}>
                      Based on your drawn outline
                    </Text>
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
                  <G>
                    {/* Semi-transparent background for better visibility */}
                    <Rect
                      x={centerX - rectWidth/2 - 10}
                      y={centerY - rectHeight/2 - 10}
                      width={rectWidth + 20}
                      height={rectHeight + 20}
                      fill="rgba(16, 185, 129, 0.1)"
                      stroke="none"
                    />
                    
                    {/* Green measurement rectangle with animated dashes */}
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
                      y1={centerX - rectHeight/2}
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
                    
                    {/* Width measurement label */}
                    <Rect
                      x={centerX - 30}
                      y={centerY - rectHeight/2 - 35}
                      width={60}
                      height={20}
                      fill="rgba(16, 185, 129, 0.9)"
                      rx={10}
                    />
                    <SvgText
                      x={centerX}
                      y={centerY - rectHeight/2 - 20}
                      fontSize="12"
                      fill="#FFFFFF"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {`${parseFloat(width) * 12} in`}
                    </SvgText>
                    
                    {/* Height measurement label */}
                    <Rect
                      x={centerX + rectWidth/2 + 10}
                      y={centerY - 10}
                      width={40}
                      height={20}
                      fill="rgba(16, 185, 129, 0.9)"
                      rx={10}
                    />
                    <SvgText
                      x={centerX + rectWidth/2 + 30}
                      y={centerY + 5}
                      fontSize="12"
                      fill="#FFFFFF"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {`${parseFloat(height) * 12} in`}
                    </SvgText>
                  </G>
                </Svg>
              </View>
            )}
            
            {/* Drawing Overlay - show when in drawing mode and photo is captured */}
            {isDrawingMode && capturedPhoto && (
              <View style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%' 
              }}>
                <Svg width={cameraWidth} height={cameraHeight}>
                  <G>
                    {/* Render completed drawing paths */}
                    {drawingPaths.map((path, index) => (
                      <Path
                        key={index}
                        d={path}
                        stroke="#10B981"
                        strokeWidth="4"
                        fill="rgba(16, 185, 129, 0.1)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}
                    
                    {/* Render current drawing path */}
                    {currentPath && (
                      <Path
                        d={currentPath}
                        stroke="#10B981"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    
                    {/* Show dimension lines if we have measured dimensions */}
                    {measuredDimensions && boardOutline.length > 0 && (
                      <G>
                        {/* Width dimension line */}
                        <Line
                          x1={Math.min(...boardOutline.map(p => p.x))}
                          y1={Math.min(...boardOutline.map(p => p.y)) - 20}
                          x2={Math.max(...boardOutline.map(p => p.x))}
                          y2={Math.min(...boardOutline.map(p => p.y)) - 20}
                          stroke="#F59E0B"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                        
                        {/* Height dimension line */}
                        <Line
                          x1={Math.max(...boardOutline.map(p => p.x)) + 20}
                          y1={Math.min(...boardOutline.map(p => p.y))}
                          x2={Math.max(...boardOutline.map(p => p.x)) + 20}
                          y2={Math.max(...boardOutline.map(p => p.y))}
                          stroke="#F59E0B"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                        
                        {/* Dimension labels */}
                        <SvgText
                          x={(Math.min(...boardOutline.map(p => p.x)) + Math.max(...boardOutline.map(p => p.x))) / 2}
                          y={Math.min(...boardOutline.map(p => p.y)) - 25}
                          fontSize="12"
                          fill="#F59E0B"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          {measuredDimensions.width * 12} in
                        </SvgText>
                        
                        <SvgText
                          x={Math.max(...boardOutline.map(p => p.x)) + 35}
                          y={(Math.min(...boardOutline.map(p => p.y)) + Math.max(...boardOutline.map(p => p.y))) / 2}
                          fontSize="12"
                          fill="#F59E0B"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          {measuredDimensions.height * 12} in
                        </SvgText>
                      </G>
                    )}
                  </G>
                </Svg>
              </View>
            )}
          </View>
        </View>
        </PanGestureHandler>

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
            borderRadius: 20 
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
              {photoType.toUpperCase()} VIEW
            </Text>
            {__DEV__ && (
              <Text style={{ color: '#FFFFFF', fontSize: 10, marginTop: 2 }}>
                Guide: {showMeasurement ? 'ON' : 'OFF'} | {width}×{height}
              </Text>
            )}
            {capturedPhoto && (
              <Text style={{ color: isDrawingMode ? '#F59E0B' : '#10B981', fontSize: 10, marginTop: 2 }}>
                {isDrawingMode ? 'DRAWING MODE' : 'PHOTO CAPTURED'}
              </Text>
            )}
          </View>
          
          {/* Debug refresh button */}
          {__DEV__ && !capturedPhoto && (
            <TouchableOpacity 
              onPress={() => {
                if (width && height && parseFloat(width) > 0 && parseFloat(height) > 0) {
                  setShowMeasurement(true);
                  setForceRefresh(prev => prev + 1);
                }
              }}
              style={{ 
                backgroundColor: 'rgba(16, 185, 129, 0.8)', 
                padding: 8, 
                borderRadius: 15 
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>REFRESH</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Measurement Info */}
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
              Target: {parseFloat(width) * 12} × {parseFloat(height) * 12} in
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 11, marginTop: 2, opacity: 0.9 }}>
              Align board with green guide lines
            </Text>
          </View>
        )}

        {/* Instructions */}
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
              Green overlay shows {parseFloat(width) * 12} × {parseFloat(height) * 12} in dimensions
            </Text>
          </View>
        )}
        
        {/* Drawing Instructions */}
        {isDrawingMode && capturedPhoto && (
          <View style={{ 
            position: 'absolute', 
            bottom: measuredDimensions ? 200 : 180, 
            left: 20, 
            right: 20, 
            backgroundColor: 'rgba(16, 185, 129, 0.95)', 
            padding: 16, 
            borderRadius: 12 
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 14, textAlign: 'center', fontWeight: '600' }}>
              Trace the board outline with your finger
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 12, textAlign: 'center', marginTop: 4, opacity: 0.9 }}>
              Draw a complete outline to automatically measure dimensions
            </Text>
            {measuredDimensions && (
              <Text style={{ color: '#FFFFFF', fontSize: 11, textAlign: 'center', marginTop: 6, fontWeight: 'bold' }}>
                ✓ Dimensions calculated from your drawing
              </Text>
            )}
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
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  padding: 16, 
                  borderRadius: 30,
                  opacity: isCapturing ? 0.5 : 1
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
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  paddingHorizontal: 20, 
                  paddingVertical: 12, 
                  borderRadius: 25,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.3)'
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleDrawingToggle}
                style={{ 
                  backgroundColor: isDrawingMode ? '#F59E0B' : 'rgba(255,255,255,0.2)', 
                  paddingHorizontal: 16, 
                  paddingVertical: 12, 
                  borderRadius: 25,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  borderWidth: 1,
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
                    gap: 6
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
                  gap: 6
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
  );
}