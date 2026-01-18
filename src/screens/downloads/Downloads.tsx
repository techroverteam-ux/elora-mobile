import { Button, StyleSheet, Text, View } from 'react-native'
import React, { use, useEffect } from 'react'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import DummyComponent from './DummyComponent';
import { RootStackParamList } from '../../navigation/types';
import { useGetSectionsMutation } from '../../data/redux/services/sectionsApi';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

const Downloads = () => {
  const navigation = useNavigation<RootNav>();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.buttonContainer}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    padding: 16,
  },
})