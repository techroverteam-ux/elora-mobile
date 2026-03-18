import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Camera, Settings, Smartphone, MapPin, Download, RefreshCw, CheckCircle, XCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useCameraDetection } from '../hooks/useCameraDetection';
import { cameraDetectionService } from '../services/cameraDetectionService';

export default function CameraTestingScreen() {
  const { theme } = useTheme();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const {
    cameraDetection,
    isDetecting,
    detectCameras,
    getAvailableCameras,
    getGPSCameras,
    getDeviceCameras,
    getRecommendedCameras
  } = useCameraDetection({ autoDetect: true });

  const addTestResult = (test: string, result: 'pass' | 'fail' | 'info', details: string) => {
    setTestResults(prev => [...prev, {
      test,
      result,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runCameraTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    try {
      // Test 1: Basic camera detection
      addTestResult('Camera Detection', 'info', 'Starting camera detection tests...');
      
      await detectCameras();
      
      if (cameraDetection) {
        addTestResult('Camera Detection', 'pass', `Found ${cameraDetection.totalAvailable} total cameras`);
        
        // Test 2: Device cameras
        const deviceCameras = getDeviceCameras();
        addTestResult('Device Cameras', deviceCameras.length > 0 ? 'pass' : 'fail', 
          `Found ${deviceCameras.length} device cameras: ${deviceCameras.map(c => c.name).join(', ')}`);
        
        // Test 3: GPS camera apps
        const gpsCameras = getGPSCameras();
        addTestResult('GPS Camera Apps', 'info', 
          `Found ${gpsCameras.length} GPS camera apps: ${gpsCameras.map(c => c.name).join(', ') || 'None installed'}`);
        
        // Test 4: Recommendations
        const recommended = getRecommendedCameras();
        addTestResult('Camera Recommendations', recommended.length > 0 ? 'pass' : 'info',
          `${recommended.length} recommended cameras for documentation`);
        
        // Test 5: Individual GPS app detection
        if (Platform.OS === 'android') {
          const gpsApps = [
            'com.gpsmapcamera.app',
            'com.gpsmapcamera.timestamp',
            'com.gpsmapcamera.location'
          ];
          
          for (const packageName of gpsApps) {
            try {
              const isAvailable = await cameraDetectionService['checkAndroidAppAvailability'](packageName);
              addTestResult(`GPS App: ${packageName}`, isAvailable ? 'pass' : 'info',
                isAvailable ? 'App is installed' : 'App not installed');
            } catch (error) {
              addTestResult(`GPS App: ${packageName}`, 'fail', `Error checking: ${error}`);
            }
          }
        }
        
      } else {
        addTestResult('Camera Detection', 'fail', 'Camera detection returned null');
      }
      
    } catch (error) {
      addTestResult('Camera Tests', 'fail', `Error running tests: ${error}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  const testCameraLaunch = async () => {
    const availableCameras = getAvailableCameras();
    
    if (availableCameras.length === 0) {
      Alert.alert('No Cameras', 'No cameras available for testing');
      return;
    }

    // Test launching the first available camera
    const testCamera = availableCameras[0];
    
    Alert.alert(
      'Test Camera Launch',
      `Test launching ${testCamera.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Test',
          onPress: async () => {
            try {
              await cameraDetectionService.launchSelectedCamera(
                testCamera,
                (photoUri, metadata) => {
                  addTestResult('Camera Launch Test', 'pass', 
                    `Successfully captured photo with ${testCamera.name}. URI: ${photoUri.substring(0, 50)}...`);
                  Alert.alert('Success', `Photo captured with ${testCamera.name}!`);
                },
                (error) => {
                  addTestResult('Camera Launch Test', 'fail', `Error: ${error}`);
                  Alert.alert('Error', error);
                }
              );
            } catch (error) {
              addTestResult('Camera Launch Test', 'fail', `Exception: ${error}`);
              Alert.alert('Error', `Failed to launch camera: ${error}`);
            }
          }
        }
      ]
    );
  };

  const getResultIcon = (result: 'pass' | 'fail' | 'info') => {
    switch (result) {
      case 'pass': return <CheckCircle size={16} color="#10B981" />;
      case 'fail': return <XCircle size={16} color="#EF4444" />;
      case 'info': return <Settings size={16} color="#3B82F6" />;
    }
  };

  const getResultColor = (result: 'pass' | 'fail' | 'info') => {
    switch (result) {
      case 'pass': return '#10B981';
      case 'fail': return '#EF4444';
      case 'info': return '#3B82F6';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Camera Detection Testing
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Debug camera detection on real device
        </Text>
      </View>

      {/* Device Info */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Device Info</Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Platform:</Text>
          <Text style={[styles.infoValue, { color: theme.colors.text }]}>{Platform.OS} {Platform.Version}</Text>
        </View>
      </View>

      {/* Camera Status */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Camera Status</Text>
        
        {isDetecting ? (
          <View style={styles.statusRow}>
            <RefreshCw size={16} color={theme.colors.primary} />
            <Text style={[styles.statusText, { color: theme.colors.text }]}>Detecting cameras...</Text>
          </View>
        ) : cameraDetection ? (
          <>
            <View style={styles.statusRow}>
              <Smartphone size={16} color={theme.colors.primary} />
              <Text style={[styles.statusText, { color: theme.colors.text }]}>
                {cameraDetection.totalAvailable} total cameras available
              </Text>
            </View>
            
            <View style={styles.statusRow}>
              <Camera size={16} color="#10B981" />
              <Text style={[styles.statusText, { color: theme.colors.text }]}>
                {cameraDetection.deviceCameras.length} device cameras
              </Text>
            </View>
            
            <View style={styles.statusRow}>
              <MapPin size={16} color="#F59E0B" />
              <Text style={[styles.statusText, { color: theme.colors.text }]}>
                {cameraDetection.gpsApps.filter(app => app.isAvailable).length} GPS apps installed
              </Text>
            </View>
          </>
        ) : (
          <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
            No camera detection data
          </Text>
        )}
      </View>

      {/* Available Cameras */}
      {cameraDetection && (
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Available Cameras</Text>
          
          {getAvailableCameras().map((camera, index) => (
            <View key={camera.id} style={[styles.cameraItem, { borderColor: theme.colors.border }]}>
              <View style={styles.cameraHeader}>
                <Text style={styles.cameraIcon}>{camera.icon}</Text>
                <View style={styles.cameraInfo}>
                  <Text style={[styles.cameraName, { color: theme.colors.text }]}>{camera.name}</Text>
                  <Text style={[styles.cameraType, { color: theme.colors.textSecondary }]}>
                    {camera.type === 'device' ? 'Device Camera' : 'GPS App'}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: camera.isAvailable ? '#10B981' : '#EF4444' }
                ]}>
                  <Text style={styles.statusBadgeText}>
                    {camera.isAvailable ? 'Available' : 'Unavailable'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.cameraDescription, { color: theme.colors.textSecondary }]}>
                {camera.description}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Test Controls */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Test Controls</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: theme.colors.primary }]}
            onPress={runCameraTests}
            disabled={isRunningTests}
          >
            <Settings size={16} color="#FFFFFF" />
            <Text style={styles.buttonText}>
              {isRunningTests ? 'Running Tests...' : 'Run Camera Tests'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#10B981' }]}
            onPress={testCameraLaunch}
            disabled={getAvailableCameras().length === 0}
          >
            <Camera size={16} color="#FFFFFF" />
            <Text style={styles.buttonText}>Test Camera Launch</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: '#F59E0B', marginTop: 8 }]}
          onPress={detectCameras}
          disabled={isDetecting}
        >
          <RefreshCw size={16} color="#FFFFFF" />
          <Text style={styles.buttonText}>Refresh Detection</Text>
        </TouchableOpacity>
      </View>

      {/* Test Results */}
      {testResults.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Test Results</Text>
          
          {testResults.map((result, index) => (
            <View key={index} style={[styles.testResult, { borderColor: theme.colors.border }]}>
              <View style={styles.testHeader}>
                {getResultIcon(result.result)}
                <Text style={[styles.testName, { color: theme.colors.text }]}>{result.test}</Text>
                <Text style={[styles.testTime, { color: theme.colors.textSecondary }]}>{result.timestamp}</Text>
              </View>
              <Text style={[styles.testDetails, { color: getResultColor(result.result) }]}>
                {result.details}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Debug Info */}
      {__DEV__ && cameraDetection && (
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Debug Info</Text>
          <Text style={[styles.debugText, { color: theme.colors.textSecondary }]}>
            {JSON.stringify(cameraDetection, null, 2)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    marginLeft: 8,
  },
  cameraItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cameraIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  cameraInfo: {
    flex: 1,
  },
  cameraName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraType: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cameraDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  testButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  testResult: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  testName: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 8,
  },
  testTime: {
    fontSize: 10,
  },
  testDetails: {
    fontSize: 12,
    lineHeight: 16,
  },
  debugText: {
    fontSize: 10,
    fontFamily: 'monospace',
    lineHeight: 14,
  },
});