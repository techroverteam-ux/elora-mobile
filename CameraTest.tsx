import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ThemeProvider } from './src/context/ThemeContext';
import { permissionService } from './src/services/permissionService';
import MeasurementCamera from './src/components/MeasurementCamera';

function CameraTestContent() {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const testPermissions = async () => {
    const hasPermission = await permissionService.checkCameraPermission();
    
    if (!hasPermission) {
      const granted = await permissionService.requestCameraPermission();
      
      if (!granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to test camera functionality.');
        return;
      }
    }
    
    Alert.alert('Permission Check', 'Camera permission is available! You can now test the camera.');
  };

  const openCamera = () => {
    setShowCamera(true);
  };

  const handlePhotoCapture = (photoUri: string) => {
    setCapturedPhoto(photoUri);
    Alert.alert('Success!', 'Photo captured successfully!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camera Test</Text>
      
      <TouchableOpacity style={styles.button} onPress={testPermissions}>
        <Text style={styles.buttonText}>Test Camera Permissions</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={openCamera}>
        <Text style={styles.buttonText}>Open Camera</Text>
      </TouchableOpacity>
      
      {capturedPhoto && (
        <View style={styles.result}>
          <Text style={styles.resultText}>Photo captured successfully!</Text>
        </View>
      )}
      
      <MeasurementCamera
        visible={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handlePhotoCapture}
        width="10"
        height="8"
        photoType="front"
      />
    </View>
  );
}

export default function CameraTest() {
  return (
    <ThemeProvider>
      <CameraTestContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#10B981',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  result: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    maxWidth: '100%',
  },
  resultText: {
    color: '#2d5a2d',
    fontSize: 12,
    textAlign: 'center',
  },
});