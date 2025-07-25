import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth, UserType } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import TestUserPicker from '../../utils/TestUserPicker';

const testUsers: UserType[] = [
  { name: 'Neel', email: 'neel@gmail.com' },
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
];

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleLogin = () => {
    if (email && name) {
      login({ name, email });
    } else {
      Alert.alert('Validation Error', 'Please enter both name and email.');
    }
  };

  const handleSelectUser = (user: UserType) => {
    setName(user.name);
    setEmail(user.email);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>

      {/* Test user picker component */}
      <TestUserPicker users={testUsers} onSelectUser={handleSelectUser} />

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        keyboardType="email-address"
        onChangeText={setEmail}
      />

      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={handleLogin} />
      </View>

      <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
        Don’t have an account? Register
      </Text>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  link: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
});
