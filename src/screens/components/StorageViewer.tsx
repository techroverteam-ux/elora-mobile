import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { fetchAndFormatStorage } from '../../utils/storageLogger';

const StorageViewer = () => {
  const [storageData, setStorageData] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAndFormatStorage();
      setStorageData(data);
    };
    fetchData();
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
