import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AppBarHeader from '../../components/AppBarHeader';

const AudioCategoryScreen = ({ route }) => {
  const { title } = route.params;

  return (
    <View>
      <AppBarHeader title={title} />
      <Text>AudioCategoryScreen</Text>
    </View>
  )
}

export default AudioCategoryScreen

const styles = StyleSheet.create({})