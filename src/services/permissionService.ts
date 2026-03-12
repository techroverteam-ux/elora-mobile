import { Platform, PermissionsAndroid, Linking } from 'react-native';
import { themedAlertService } from './themedAlertService';

export const permissionService = {
  // Request camera permission with simple approach
  requestCameraPermission: async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
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
          ]);
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
          ]);
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
        ]);
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

  // Request location permission with simple approach
  requestLocationPermission: async (): Promise<boolean> => {
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

  // Request all required permissions at app start - Ultra Safe approach
  requestInitialPermissions: async (): Promise<boolean> => {
    console.log('Requesting initial permissions with maximum safety...');
    
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
    console.log('iOS detected - permissions handled by system');
    return true;
  },
};