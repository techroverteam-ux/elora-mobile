import { permissionService } from '../services/permissionService';
import Toast from 'react-native-toast-message';

export const initializeApp = async () => {
  try {
    console.log('Initializing app safely...');
    
    // Add delay to ensure app is fully loaded before requesting permissions
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Request permissions in background without blocking UI
    permissionService.requestInitialPermissions()
      .then(granted => {
        console.log(granted ? 'Permissions setup completed' : 'Some permissions need manual setup');
      })
      .catch(error => {
        console.warn('Background permission request failed:', error);
      });
    
    // Always return true to prevent app startup crashes
    return true;
  } catch (error) {
    console.error('App initialization error:', error);
    // Always return true to prevent app crashes
    return true;
  }
};