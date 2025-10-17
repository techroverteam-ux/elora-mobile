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
import AutoLoginCredentials from '../AutoLoginCredentials';
import { useTheme } from 'react-native-paper';
import CustomTextInput from '../../components/CustomTextInput';

type AuthNav = NativeStackNavigationProp<AuthStackParamList>;

const LoginScreen = ({ onLoginSuccess }: { onLoginSuccess?: () => void }) => {
  const navigation = useNavigation<AuthNav>();
  const { login } = useAuth();
  const { colors } = useTheme();

  const [isAutoLoginOn, setIsAutoLoginOn] = useState(__DEV__);

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

      // Save to AuthContext
      login(loggedInUser);

      // ✅ Close modal + redirect if provided
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess();
      }

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.onBackground }]}>
        Welcome To Geeta Bal Sanskar
      </Text>

      {/* Auto Login Component */}
      {isAutoLoginOn && (
        <AutoLoginCredentials
          onSelectUser={handleSelectUser}
          isAutoLoginOn={isAutoLoginOn}
          setIsAutoLoginOn={setIsAutoLoginOn}
        />
      )}

      <CustomTextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
      />

      <CustomTextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry={!showPassword}
        showToggle
        showPassword={showPassword}
        setShowPassword={setShowPassword}
      />

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? 'Logging in...' : 'Login'}
          onPress={handleLogin}
          color={colors.primary}
          disabled={isLoading}
        />
      </View>

      <Text
        style={[styles.link, { color: colors.primary }]}
        onPress={() => navigation.navigate('Register')}
      >
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
});