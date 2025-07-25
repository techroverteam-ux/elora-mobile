import React from 'react';
import { View, Text, Image, Button, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigation';

type ImageViewerRouteProp = RouteProp<RootStackParamList, 'ImageViewer'>;

const ImageViewer = () => {
  const navigation = useNavigation();
  const route = useRoute<ImageViewerRouteProp>();
  const { uri } = route.params;

  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} resizeMode="contain" />
      <Button title="Close" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default ImageViewer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '90%',
    height: '80%',
    marginBottom: 20,
  },
});