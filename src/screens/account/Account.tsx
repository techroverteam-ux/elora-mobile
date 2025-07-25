import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useTheme } from 'react-native-paper';

const Account = () => {
  const { colors } = useTheme(); // From Paper

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Text style={{ color: colors.primary, fontSize: 18 }}>This text uses theme color!</Text>
    </View>
  )
}

export default Account

const styles = StyleSheet.create({})