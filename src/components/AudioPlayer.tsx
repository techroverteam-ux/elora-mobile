import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useRoute } from '@react-navigation/native'
import AppBarHeader from './AppBarHeader';

const AudioPlayer = () => {
  const { params } = useRoute();

  return (
    <View>
      <AppBarHeader title="Audio Player" />

      <Text>{JSON.stringify(params)}</Text>
    </View>
  )
}

export default AudioPlayer

const styles = StyleSheet.create({})