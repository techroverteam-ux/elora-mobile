import React from 'react';
import { Text, View } from 'react-native';

const StorageViewer = ({ storageData }: { storageData: string[] }) => {
  return (
    <View>
      {storageData.map((item, index) => (
        <Text key={index}>{item}</Text>
      ))}
    </View>
  );
};

export default StorageViewer;
