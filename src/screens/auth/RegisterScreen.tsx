import React, { useState } from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';

import { useGetRegisterUserMutation } from '../../data/redux/services/authApi';
import { getErrorMessage } from '../../data/redux/services/baseQuery';
import CustomTextInput from '../../components/CustomTextInput';
import { AuthStackParamList } from '../../navigation/types';

type AuthNav = NativeStackNavigationProp<AuthStackParamList>;

const RegisterScreen = () => {
  const navigation = useNavigation<AuthNav>();
  const { colors } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [registerUser, { isLoading }] = useGetRegisterUserMutation();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    try {
      const result = await registerUser({ name, email, password }).unwrap();
      console.log('Registered:', result);

      Alert.alert('Success', 'Registration successful!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      console.error('Register failed:', err);
      const message = getErrorMessage(err) || 'Something went wrong. Please try again.';
      Alert.alert('Registration Failed', message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.onBackground }]}>
        Create Account
      </Text>
      <Text style={[styles.subtitle, { color: colors.onBackground }]}>
        Please fill the form below to sign up
      </Text>

      <CustomTextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <CustomTextInput
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <CustomTextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        showToggle
        showPassword={showPassword}
        setShowPassword={setShowPassword}
      />

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? 'Registering...' : 'Register'}
          onPress={handleRegister}
          color={colors.primary}
          disabled={isLoading}
        />
      </View>

      <Text
        style={[styles.link, { color: colors.primary }]}
        onPress={() => navigation.goBack()}
      >
        Already have an account? Login
      </Text>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
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
