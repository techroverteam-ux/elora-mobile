import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';

export const permissionService = {
  // Request camera permission
  requestCameraPermission: async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission Required',
            message: 'This app needs camera access to take photos for store inspections and measurements.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Deny',
            buttonPositive: 'Allow',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Camera permission error:', err);
        return false;
      }
    }
    // iOS permissions are handled automatically by react-native-image-picker
    return true;
  },

  // Check if camera permission is granted
  checkCameraPermission: async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const result = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        return result;
      } catch (err) {
        console.warn('Camera permission check error:', err);
        return false;
      }
    }
    return true;
  },

  // Show permission denied alert with settings option
  showPermissionDeniedAlert: () => {
    Alert.alert(
      'Camera Permission Required',
      'Camera access is required to take photos for store inspections. Please enable camera permission in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Settings', 
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }
        }
      ]
    );
  },

  // Request all required permissions at app start
  requestInitialPermissions: async (): Promise<boolean> => {
    console.log('Requesting initial permissions...');
    
    if (Platform.OS === 'android') {
      try {
        // First check if permissions are already granted
        const cameraCheck = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        
        if (cameraCheck) {
          console.log('Camera permission already granted');
          return true;
        }

        // Request camera permission with clear explanation
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Access Required',
            message: 'This app requires camera access to:\n\n• Take photos during store inspections\n• Capture measurement references\n• Document installation progress\n\nPlease allow camera access to continue.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Deny',
            buttonPositive: 'Allow Camera',
          },
        );
        
        const cameraGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        
        if (!cameraGranted) {
          this.showPermissionDeniedAlert();
          return false;
        }
        
        console.log('Camera permission granted successfully');
        return true;
      } catch (err) {
        console.warn('Initial permissions error:', err);
        Alert.alert(
          'Permission Error',
          'Failed to request camera permission. Please enable camera access manually in device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    
    // iOS - permissions handled by image picker, but show info
    console.log('iOS detected - camera permissions handled by system');
    return true;
  },
};