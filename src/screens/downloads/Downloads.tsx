import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigation';
import { useNavigation } from '@react-navigation/native';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

const Downloads = () => {
  const navigation = useNavigation<RootNav>();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        title="Open Image Viewer Modal"
        onPress={() => navigation.navigate('ImageViewer', { uri: 'https://upload.wikimedia.org/wikipedia/en/3/3b/URI_-_New_poster.jpg' })}
      />
    </View>
  )
}

export default Downloads

const styles = StyleSheet.create({})