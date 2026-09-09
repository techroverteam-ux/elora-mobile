import { Platform, PermissionsAndroid, Linking, Alert } from 'react-native';
import { themedAlertService } from './themedAlertService';
import { shouldBypassPermission, PERMISSION_CONFIG } from '../constants/permissionConfig';

export const permissionService = {
  // Helper function to handle 'never_ask_again' state
  handleNeverAskAgainState: (permissionType: 'camera' | 'storage' | 'location') => {
    console.log(`Permission ${permissionType} is set to 'never_ask_again' - directing user to settings`);
    
    // Use clean banking-style alert
    permissionService.showCleanPermissionAlert(permissionType);
  },

  // Clean banking-style permission alert
  showCleanPermissionAlert: (permissionType: 'camera' | 'storage' | 'location') => {
    const messages = {
      storage: {
        title: 'Storage Permission Required',
        message: 'This app needs storage access to save your files.'
      },
      camera: {
        title: 'Camera Permission Required', 
        message: 'This app needs camera access to take photos.'
      },
      location: {
        title: 'Location Permission Required',
        message: 'This app needs location access for GPS features.'
      }
    };

    const config = messages[permissionType];
    
    Alert.alert(
      config.title,
      config.message,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Settings', 
          onPress: async () => {
            try {
              if (Platform.OS === 'ios') {
                await Linking.openURL('app-settings:');
              } else {
                // Try multiple methods to open app settings on Android
                try {
                  await Linking.openURL('android.settings.APPLICATION_DETAILS_SETTINGS:com.geetabalsanskar');
                } catch (error1) {
                  try {
                    await Linking.sendIntent('android.settings.APPLICATION_DETAILS_SETTINGS', [
                      { key: 'package', value: 'com.geetabalsanskar' }
                    ]);
                  } catch (error2) {
                    // Final fallback to general settings
                    await Linking.openSettings();
                  }
                }
              }
            } catch (error) {
              console.error('Failed to open settings:', error);
              // Show user a message if all methods fail
              Alert.alert(
                'Settings Access',
                'Please manually go to Settings > Apps > Elora > Permissions to enable storage access.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  },

  // Check if any permission result is 'never_ask_again'
  hasNeverAskAgainState: (results: { [key: string]: string }) => {
    return Object.values(results).some(result => result === 'never_ask_again');
  },

  // Request camera permission with simple approach
  requestCameraPermission: async (): Promise<boolean> => {
    if (shouldBypassPermission('camera')) {
      console.log('Camera permission request BYPASSED for testing');
      return true;
    }
    
    if (Platform.OS === 'android') {
      try {
        // First check if permission is already granted
        const hasPermission = await permissionService.checkCameraPermission();
        if (hasPermission) {
          return true;
        }
        
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        
        // Handle 'never_ask_again' state
        if (granted === 'never_ask_again') {
          permissionService.handleNeverAskAgainState('camera');
          return false;
        }
        
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
    if (shouldBypassPermission('camera')) {
      if (PERMISSION_CONFIG.VERBOSE_LOGGING) {
        console.log('Camera permission check BYPASSED for testing');
      }
      return true;
    }
    
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
    if (shouldBypassPermission('storage')) {
      console.log('Storage permission request BYPASSED for testing');
      return true;
    }
    
    if (Platform.OS === 'android') {
      try {
        const androidVersion = Platform.Version;
        console.log(`Android version detected: ${androidVersion}`);
        
        // First check if permissions are already granted
        const hasPermission = await permissionService.checkStoragePermission();
        if (hasPermission) {
          return true;
        }
        
        // For Android 13+ (API 33+), request media permissions
        if (androidVersion >= 33) {
          console.log('Android 13+ detected - requesting media permissions');
          const results = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            PermissionsAndroid.PERMISSIONS.CAMERA,
          ]);
          
          console.log('Media permissions results:', results);
          
          // Check for 'never_ask_again' state
          if (permissionService.hasNeverAskAgainState(results)) {
            permissionService.handleNeverAskAgainState('storage');
            return false;
          }
          
          const allGranted = Object.values(results).every(result => result === PermissionsAndroid.RESULTS.GRANTED);
          return allGranted;
        }
        
        // For Android 11-12 (API 30-32), request read permission
        if (androidVersion >= 30) {
          console.log('Android 11-12 detected - requesting read storage permission');
          const results = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.CAMERA,
          ]);
          
          console.log('Storage permissions results:', results);
          
          // Check for 'never_ask_again' state
          if (permissionService.hasNeverAskAgainState(results)) {
            permissionService.handleNeverAskAgainState('storage');
            return false;
          }
          
          const allGranted = Object.values(results).every(result => result === PermissionsAndroid.RESULTS.GRANTED);
          return allGranted;
        }
        
        // For older Android versions (API < 30), request full storage permissions
        console.log('Android < 11 detected - requesting full storage permissions');
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ]);
        
        console.log('Legacy storage permissions results:', results);
        
        // Check for 'never_ask_again' state
        if (permissionService.hasNeverAskAgainState(results)) {
          permissionService.handleNeverAskAgainState('storage');
          return false;
        }
        
        const allGranted = Object.values(results).every(result => result === PermissionsAndroid.RESULTS.GRANTED);
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
    if (shouldBypassPermission('storage')) {
      if (PERMISSION_CONFIG.VERBOSE_LOGGING) {
        console.log('Storage permission check BYPASSED for testing');
      }
      return true;
    }
    
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

  // Request gallery / photo-library permission (read-only — does not also ask for camera)
  requestGalleryPermission: async (): Promise<boolean> => {
    if (shouldBypassPermission('storage')) {
      console.log('Gallery permission request BYPASSED for testing');
      return true;
    }

    if (Platform.OS === 'android') {
      try {
        // First check if permission is already granted
        const hasPermission = await permissionService.checkGalleryPermission();
        if (hasPermission) {
          return true;
        }

        const androidVersion = Platform.Version;
        console.log(`Requesting gallery permission — Android version: ${androidVersion}`);

        // Android 13+ (API 33+) uses the scoped media-images permission
        if (androidVersion >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          );

          if (granted === 'never_ask_again') {
            permissionService.handleNeverAskAgainState('storage');
            return false;
          }

          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }

        // Android 12 and below use the legacy read-storage permission
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );

        if (granted === 'never_ask_again') {
          permissionService.handleNeverAskAgainState('storage');
          return false;
        }

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Gallery permission error:', err);
        return false;
      }
    }
    // iOS: the system shows its own photo-library prompt the first time the
    // picker is launched, driven by NSPhotoLibraryUsageDescription in Info.plist
    return true;
  },

  // Check gallery / photo-library permission
  checkGalleryPermission: async (): Promise<boolean> => {
    if (shouldBypassPermission('storage')) {
      if (PERMISSION_CONFIG.VERBOSE_LOGGING) {
        console.log('Gallery permission check BYPASSED for testing');
      }
      return true;
    }

    if (Platform.OS === 'android') {
      try {
        const androidVersion = Platform.Version;

        if (androidVersion >= 33) {
          return await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          );
        }

        return await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
      } catch (err) {
        console.warn('Gallery permission check error:', err);
        return false;
      }
    }
    return true;
  },

  // Request location permission with simple approach
  requestLocationPermission: async (): Promise<boolean> => {
    if (shouldBypassPermission('location')) {
      console.log('Location permission request BYPASSED for testing');
      return true;
    }
    
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          // Try coarse location as fallback
          const coarseGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
          );
          return coarseGranted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.error('Location permission error:', err);
        return false;
      }
    }
    return true;
  },

  // Check location permission
  checkLocationPermission: async (): Promise<boolean> => {
    if (shouldBypassPermission('location')) {
      if (PERMISSION_CONFIG.VERBOSE_LOGGING) {
        console.log('Location permission check BYPASSED for testing');
      }
      return true;
    }
    
    if (Platform.OS === 'android') {
      try {
        const fineLocationGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        
        if (fineLocationGranted) {
          return true;
        }
        
        // Check coarse location as fallback
        const coarseLocationGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
        );
        
        return coarseLocationGranted;
      } catch (err) {
        console.error('Location permission check error:', err);
        return false;
      }
    }
    return true;
  },

  showPermissionDeniedAlert: () => {
    themedAlertService.showCameraPermissionDeniedAlert();
  },

  // Show location permission denied alert
  showLocationPermissionDeniedAlert: () => {
    themedAlertService.showLocationPermissionDeniedAlert();
  },
  
  showStoragePermissionDeniedAlert: () => {
    themedAlertService.showStoragePermissionDeniedAlert();
  },

  // Request all required permissions at app start
  requestInitialPermissions: async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        // Add delay to ensure app is fully initialized
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const androidVersion = Platform.Version;
        console.log(`Device Android version: ${androidVersion}`);
        
        // Only request camera permission initially to minimize crashes
        const essentialPermissions = [PermissionsAndroid.PERMISSIONS.CAMERA];
        
        console.log('Requesting only camera permission initially');
        
        // Request permissions with maximum safety
        for (const permission of essentialPermissions) {
          try {
            // Add small delay between permission requests
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const result = await PermissionsAndroid.request(permission);
            
            const granted = result === PermissionsAndroid.RESULTS.GRANTED;
            console.log(`${permission}: ${granted ? 'GRANTED' : 'DENIED'}`);
            
            // Don't fail if permission is denied - just continue
            if (!granted) {
              console.log('Permission denied, but app will continue normally');
            }
          } catch (permError) {
            console.warn(`Error requesting ${permission}:`, permError);
            // Continue even if individual permission fails
          }
        }
        
        console.log('Initial permission setup completed safely');
        return true; // Always return true to prevent crashes
      } catch (err) {
        console.warn('Initial permissions error (handled safely):', err);
        return true; // Always return true to prevent app crashes
      }
    }
    
    // iOS - permissions handled by system
    console.log('iOS permissions handled by system');
    return true;
  },
};