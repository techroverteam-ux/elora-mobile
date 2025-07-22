import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StorageViewer = () => {
  const [storageData, setStorageData] = useState<string[]>([]);

  const fetchAsyncStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys);
      const formatted = result.map(([key, value]) => `${key}: ${value}`);
      setStorageData(formatted);
    } catch (error) {
      console.error('Error reading AsyncStorage:', error);
    }
  };

  useEffect(() => {
    fetchAsyncStorage();
  }, []);

  return (
    <View>
      {storageData.map((item, index) => (
        <Text key={index}>{item}</Text>
      ))}
    </View>
  );
};

export default StorageViewer;
