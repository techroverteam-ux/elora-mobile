import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'

const RegisterScreen = () => {
  const { navigate } = useNavigation()

  return (
    <View>
      <Text>Register Screen</Text>
      <Button title="Go to Login" onPress={() => navigate('Login')} />
    </View>
  )
}

export default RegisterScreen

const styles = StyleSheet.create({})