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

  // Request storage permission
  requestStoragePermission: async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const androidVersion = Platform.Version;
        
        // For Android 11+ (API 30+), we don't need WRITE_EXTERNAL_STORAGE
        // Files are saved to app-specific directories or Downloads folder
        if (androidVersion >= 30) {
          console.log('Android 11+ detected - using scoped storage');
          return true;
        }
        
        // For older Android versions, request storage permission
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app needs storage access to save downloaded files like RFQ documents and reports.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Deny',
            buttonPositive: 'Allow',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Storage permission error:', err);
        return false;
      }
    }
    return true;
  },

  // Check storage permission
  checkStoragePermission: async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const androidVersion = Platform.Version;
        
        // For Android 11+, no permission needed for app-specific storage
        if (androidVersion >= 30) {
          return true;
        }
        
        const result = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        return result;
      } catch (err) {
        console.warn('Storage permission check error:', err);
        return false;
      }
    }
    return true;
  },

  // Show storage permission denied alert
  showStoragePermissionDeniedAlert: () => {
    Alert.alert(
      'Storage Permission Required',
      'Storage access is required to save downloaded files. Please enable storage permission in your device settings.',
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
        // Check camera permission
        const cameraCheck = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        
        // Check storage permission (for older Android versions)
        const storageCheck = await this.checkStoragePermission();
        
        if (cameraCheck && storageCheck) {
          console.log('All permissions already granted');
          return true;
        }

        // Request camera permission
        if (!cameraCheck) {
          const cameraGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Access Required',
              message: 'This app requires camera access to:\n\n• Take photos during store inspections\n• Capture measurement references\n• Document installation progress\n\nPlease allow camera access to continue.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Deny',
              buttonPositive: 'Allow Camera',
            },
          );
          
          if (cameraGranted !== PermissionsAndroid.RESULTS.GRANTED) {
            this.showPermissionDeniedAlert();
            return false;
          }
        }
        
        // Request storage permission for older Android versions
        if (!storageCheck) {
          const storageGranted = await this.requestStoragePermission();
          if (!storageGranted) {
            this.showStoragePermissionDeniedAlert();
            return false;
          }
        }
        
        console.log('All permissions granted successfully');
        return true;
      } catch (err) {
        console.warn('Initial permissions error:', err);
        Alert.alert(
          'Permission Error',
          'Failed to request permissions. Please enable camera and storage access manually in device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    
    // iOS - permissions handled by system
    console.log('iOS detected - permissions handled by system');
    return true;
  },
};