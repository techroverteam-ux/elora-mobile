import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';

export const permissionService = {
  // Request camera permission with better messaging
  requestCameraPermission: async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: '📸 Camera Access Required',
            message: 'We need camera access to help you:\n\n• Take photos during store inspections\n• Capture measurement references\n• Document installation progress\n• Create visual reports\n\nYour photos are stored securely and only used for project documentation.',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Not Now',
            buttonPositive: 'Allow Camera',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Camera permission error:', err);
        return false;
      }
    }
    return true;
  },

  // Check camera permission
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

  // Request storage permission for all Android versions with better messaging
  requestStoragePermission: async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const androidVersion = Platform.Version;
        console.log(`Android version detected: ${androidVersion}`);
        
        // For Android 13+ (API 33+), request media permissions
        if (androidVersion >= 33) {
          console.log('Android 13+ detected - requesting media permissions');
          const results = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            PermissionsAndroid.PERMISSIONS.CAMERA,
          ], {
            title: '📁 Storage & Camera Access',
            message: 'We need these permissions to help you:\n\n📸 Camera: Take photos during inspections\n📋 Storage: Save reports and documents\n🔄 Sync: Keep your work backed up\n\nYour data stays secure and is only used for work purposes.',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Not Now', 
            buttonPositive: 'Allow Access',
          });
          const allGranted = Object.values(results).every(result => result === PermissionsAndroid.RESULTS.GRANTED);
          console.log('Media permissions results:', results);
          return allGranted;
        }
        
        // For Android 11-12 (API 30-32), request read permission
        if (androidVersion >= 30) {
          console.log('Android 11-12 detected - requesting read storage permission');
          const results = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.CAMERA,
          ], {
            title: '📁 File Access Required',
            message: 'We need access to:\n\n📸 Camera: Take inspection photos\n📄 Files: Download reports and RFQ documents\n💾 Storage: Save your work locally\n\nThis helps you work efficiently and keeps your data accessible.',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Not Now',
            buttonPositive: 'Allow Access',
          });
          const allGranted = Object.values(results).every(result => result === PermissionsAndroid.RESULTS.GRANTED);
          console.log('Storage permissions results:', results);
          return allGranted;
        }
        
        // For older Android versions (API < 30), request full storage permissions
        console.log('Android < 11 detected - requesting full storage permissions');
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ], {
          title: '📱 App Permissions Required',
          message: 'To provide the best experience, we need:\n\n📸 Camera: Capture inspection photos\n📁 Storage: Save and access documents\n📊 Files: Download reports and RFQs\n\nThese permissions help you complete your work tasks efficiently.',
          buttonNeutral: 'Ask Later',
          buttonNegative: 'Not Now',
          buttonPositive: 'Allow All',
        });
        const allGranted = Object.values(results).every(result => result === PermissionsAndroid.RESULTS.GRANTED);
        console.log('Legacy storage permissions results:', results);
        return allGranted;
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
        
        // For Android 13+ (API 33+), check media permissions
        if (androidVersion >= 33) {
          const imagePermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          );
          const videoPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          );
          return imagePermission && videoPermission;
        }
        
        // For Android 11-12, check read permission
        if (androidVersion >= 30) {
          const result = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          );
          return result;
        }
        
        // For older versions, check write permission
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

  // Show permission denied alert with better design
  showPermissionDeniedAlert: () => {
    Alert.alert(
      '📸 Camera Access Needed',
      'Camera access is required to take photos during store inspections and measurements.\n\nTo enable camera access:\n1. Go to Settings\n2. Find this app\n3. Enable Camera permission\n\nThis helps you document your work and create visual reports.',
      [
        { text: 'Maybe Later', style: 'cancel' },
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

  // Show storage permission denied alert with better design
  showStoragePermissionDeniedAlert: () => {
    Alert.alert(
      '📁 Storage Access Needed',
      'Storage access is required to save and download important files like:\n\n• RFQ documents\n• Installation reports\n• Project photos\n• Work summaries\n\nTo enable storage access:\n1. Go to Settings\n2. Find this app\n3. Enable Storage/Files permission',
      [
        { text: 'Maybe Later', style: 'cancel' },
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

  // Request all required permissions at app start - Universal for all devices
  requestInitialPermissions: async (): Promise<boolean> => {
    console.log('Requesting initial permissions for all Android devices...');
    
    if (Platform.OS === 'android') {
      try {
        const androidVersion = Platform.Version;
        console.log(`Device Android version: ${androidVersion}`);
        
        // Define permissions based on Android version
        let permissionsToRequest: string[] = [];
        
        if (androidVersion >= 33) {
          // Android 13+ permissions
          permissionsToRequest = [
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          ];
        } else if (androidVersion >= 30) {
          // Android 11-12 permissions
          permissionsToRequest = [
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          ];
        } else {
          // Android < 11 permissions
          permissionsToRequest = [
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          ];
        }
        
        console.log('Requesting permissions:', permissionsToRequest);
        
        // Request all permissions at once
        const results = await PermissionsAndroid.requestMultiple(permissionsToRequest);
        console.log('Permission results:', results);
        
        // Check if all permissions were granted
        const allGranted = Object.entries(results).every(([permission, result]) => {
          const granted = result === PermissionsAndroid.RESULTS.GRANTED;
          console.log(`${permission}: ${granted ? 'GRANTED' : 'DENIED'}`);
          return granted;
        });
        
        if (!allGranted) {
          // Show detailed permission alert
          const deniedPermissions = Object.entries(results)
            .filter(([_, result]) => result !== PermissionsAndroid.RESULTS.GRANTED)
            .map(([permission, _]) => permission.split('.').pop())
            .join(', ');
            
          Alert.alert(
            'Permissions Required',
            `The following permissions are required for the app to work properly:\n\n${deniedPermissions}\n\nPlease enable these permissions in your device settings.`,
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: () => {
                  Linking.openSettings();
                }
              }
            ]
          );
          return false;
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