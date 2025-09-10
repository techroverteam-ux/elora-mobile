import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchAndFormatStorage = async (): Promise<string[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const result = await AsyncStorage.multiGet(keys);
    const formatted = result.map(([key, value]) => `${key}: ${value}`);
    console.log('📦 AsyncStorage contents:', formatted);

    return formatted;
  } catch (error) {
    console.log('Error reading AsyncStorage:', error);
    return [];
  }
};
