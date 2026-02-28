// Quick debug script to check authentication status
import AsyncStorage from '@react-native-async-storage/async-storage';

export const debugAuth = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    console.log('=== AUTH DEBUG ===');
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length || 0);
    console.log('Token preview:', token?.substring(0, 20) + '...' || 'None');
    
    // Check if token is expired (if it's a JWT)
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        console.log('Token expired:', isExpired);
        console.log('Expires at:', new Date(payload.exp * 1000));
      } catch (e) {
        console.log('Token format:', 'Not JWT');
      }
    }
    console.log('==================');
  } catch (error) {
    console.error('Auth debug error:', error);
  }
};