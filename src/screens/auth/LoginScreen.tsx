import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const { navigate } = useNavigation()
  const { login } = useAuth();

  return (
    <View>
      <Text>Login Screen</Text>
      <Button title="Login" onPress={login} />
      <Button title="Go to Register" onPress={() => navigate('Register')} />
    </View>
  )
}

export default LoginScreen

const styles = StyleSheet.create({})