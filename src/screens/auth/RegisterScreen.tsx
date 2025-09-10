import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useGetRegisterUserMutation } from '../../data/redux/services/authApi'

const RegisterScreen = () => {
  const { goBack } = useNavigation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [registerUser, { isLoading, error }] = useGetRegisterUserMutation()

  const handleRegister = async () => {
    try {
      const result = await registerUser({ name, email, password }).unwrap()
      console.log('Registered:', result)
      goBack()
    } catch (err) {
      console.error('Register failed:', err)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>
        Please fill the form below to sign up
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#999"
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#999"
      />

      {/* 🔑 Updated password input with show/hide */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Password"
          value={password}
          secureTextEntry={!showPassword}
          onChangeText={setPassword}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={{ fontSize: 16 }}>
            {showPassword ? '🙈' : '👁️'}
          </Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.error}>Registration failed. Try again.</Text>}

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => goBack()}>
        <Text style={styles.link}>
          Already have an account? <Text style={styles.linkHighlight}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default RegisterScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 25,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
    paddingRight: 10, // spacing for the eye icon
  },
  eyeButton: {
    padding: 8,
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#8fbdf0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
  linkHighlight: {
    color: '#007AFF',
    fontWeight: '600',
  },
})
