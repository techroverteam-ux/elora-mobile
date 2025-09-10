import React, { useState } from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import { useAuth, UserType } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useGetLoginUserMutation } from '../../data/redux/services/authApi';

type AuthNav = NativeStackNavigationProp<AuthStackParamList>;

const dummyUsers = [
  { email: 'test@admin.com', password: '123456' },
  { email: 'neel@test.com', password: 'password123' },
  { email: 'bob@test.com', password: 'bob123' },
];

const LoginScreen = () => {
  const navigation = useNavigation<AuthNav>();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 👈 toggle state

  const [loginUser, { isLoading }] = useGetLoginUserMutation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    try {
      const response = await loginUser({ email, password }).unwrap();
      console.log('Login Response:', response);

      const { token, user } = response.data;

      const loggedInUser: UserType = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      };

      login(loggedInUser);
    } catch (error: any) {
      const message =
        error?.data?.message ||
        (error?.status === 401 ? 'Invalid credentials. Please try again.' : 'Something went wrong');
      Alert.alert('Login Failed', message);
    }
  };

  const handleSelectUser = (user: { email: string; password: string }) => {
    setEmail(user.email);
    setPassword(user.password);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>

      {/* Dummy User Quick Fill */}
      <View style={styles.dummyContainer}>
        {dummyUsers.map((user, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dummyButton}
            onPress={() => handleSelectUser(user)}
          >
            <Text style={styles.dummyText}>{user.email}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
      />

      {/* Password input with eye toggle */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Password"
          value={password}
          secureTextEntry={!showPassword}
          onChangeText={setPassword}
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

      <View style={styles.buttonContainer}>
        <Button title={isLoading ? 'Logging in...' : 'Login'} onPress={handleLogin} />
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
  dummyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  dummyButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  dummyText: {
    color: '#333',
    fontSize: 14,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    height: 50,
    paddingRight: 10,
  },
  eyeButton: {
    marginLeft: 10,
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
