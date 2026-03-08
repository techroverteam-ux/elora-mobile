import AsyncStorage from '@react-native-async-storage/async-storage';
import { recceService } from '../services/recceService';

export const testRecceAPI = async () => {
  console.log('=== Testing Recce API ===');
  
  try {
    // Check if token exists
    const token = await AsyncStorage.getItem('access_token');
    console.log('Token status:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('❌ No authentication token found');
      return { success: false, error: 'No authentication token' };
    }
    
    // Test basic API call
    console.log('Testing recce assignments fetch...');
    const response = await recceService.getAssignments({
      page: 1,
      limit: 5,
      status: 'ALL'
    });
    
    console.log('✅ API Response received:', {
      stores: response?.stores?.length || 0,
      pagination: response?.pagination
    });
    
    return { 
      success: true, 
      data: response,
      storeCount: response?.stores?.length || 0
    };
    
  } catch (error) {
    console.error('❌ API Test Failed:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status
    };
  }
};

// Quick debug function to check storage
export const debugStorage = async () => {
  console.log('=== Storage Debug ===');
  
  const keys = ['access_token', 'authToken', 'refreshToken'];
  
  for (const key of keys) {
    const value = await AsyncStorage.getItem(key);
    console.log(`${key}:`, value ? 'Present' : 'Missing');
  }
};