import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import DummyComponent from './DummyComponent';
import { RootStackParamList } from '../../navigation/types';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

const Downloads = () => {
  const navigation = useNavigation<RootNav>();
  return (
    <View style={{ flex: 1 }}>
      <View>
        <Button
          title="Open Image Viewer Modal"
          onPress={() => navigation.navigate('ImageViewer', { uri: 'https://upload.wikimedia.org/wikipedia/en/3/3b/URI_-_New_poster.jpg' })}
        />
      </View>

      <DummyComponent />

    </View>
  )
}

export default Downloads

const styles = StyleSheet.create({})