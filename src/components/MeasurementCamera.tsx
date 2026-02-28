import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions, Alert } from 'react-native';
import { Camera, X, Capture, RotateCcw, Check } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import Svg, { Line, Text as SvgText, G, Rect } from 'react-native-svg';

interface MeasurementCameraProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (photoUri: string) => void;
  width: string;
  height: string;
  photoType: 'front' | 'side' | 'closeUp';
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

  useEffect(() => {
    if (visible && width && height) {
      // Show measurement overlay after camera loads
      setTimeout(() => setShowMeasurement(true), 800);
    } else {
      setShowMeasurement(false);
      setCapturedPhoto(null);
    }
  }, [visible, width, height]);

  const handleCapture = async () => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    
    // Simulate photo capture with loading
    setTimeout(() => {
      const mockPhotoUri = `recce_${photoType}_${width}x${height}_${Date.now()}.jpg`;
      setCapturedPhoto(mockPhotoUri);
      setIsCapturing(false);
    }, 1000);
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
            backgroundColor: capturedPhoto ? '#2a4a2a' : '#2a2a2a',
            position: 'relative',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 8,
            overflow: 'hidden'
          }}>
            {capturedPhoto ? (
              <View style={{ alignItems: 'center' }}>
                <Check size={48} color="#10B981" />
                <Text style={{ color: '#10B981', fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>
                  Photo Captured
                </Text>
                <Text style={{ color: '#10B981', fontSize: 14, marginTop: 4 }}>
                  {photoType.toUpperCase()} VIEW - {width} × {height} ft
                </Text>
              </View>
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
            {showMeasurement && !capturedPhoto && measurementWidth > 0 && measurementHeight > 0 && (
              <View style={{ 
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
                      {width} ft
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
                      {height} ft
                    </SvgText>
                  </G>
                </Svg>
              </View>
            )}
          </View>
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
            borderRadius: 20 
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
              {photoType.toUpperCase()} VIEW
            </Text>
          </View>
        </View>

        {/* Measurement Info */}
        {showMeasurement && !capturedPhoto && (
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
              Target: {width} × {height} ft
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 11, marginTop: 2, opacity: 0.9 }}>
              Align board with green guide lines
            </Text>
          </View>
        )}

        {/* Instructions */}
        {showMeasurement && !capturedPhoto && (
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
              Green overlay shows {width} × {height} ft dimensions
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
            <View style={{ flexDirection: 'row', gap: 20 }}>
              <TouchableOpacity 
                onPress={handleRetake}
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  paddingHorizontal: 24, 
                  paddingVertical: 14, 
                  borderRadius: 25,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.3)'
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleConfirm}
                style={{ 
                  backgroundColor: '#10B981', 
                  paddingHorizontal: 28, 
                  paddingVertical: 14, 
                  borderRadius: 25,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Check size={20} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>Use Photo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}