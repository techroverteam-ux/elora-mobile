import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { useGetRegisterUserMutation } from '../../data/redux/services/authApi';
import { getErrorMessage } from '../../data/redux/services/baseQuery';
import CustomTextInput from '../../components/CustomTextInput';
import { AuthStackParamList } from '../../navigation/types';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import LinearGradient from 'react-native-linear-gradient';
import { wp, hp, normalize } from '../../utils/responsive';

const { width, height } = Dimensions.get('window');

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
    <LinearGradient
      colors={['#FF6B35', '#F8803B', '#FFB347']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialDesignIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <MaterialDesignIcons name="account-plus" size={60} color="#fff" />
        </View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Geeta Bal Sanskar community today</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <MaterialDesignIcons name="account-outline" size={20} color="#666" style={styles.inputIcon} />
          <CustomTextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialDesignIcons name="email-outline" size={20} color="#666" style={styles.inputIcon} />
          <CustomTextInput
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialDesignIcons name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
          <CustomTextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            showToggle
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          style={[styles.registerButton, { opacity: isLoading ? 0.7 : 1 }]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.registerButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginTextBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(8),
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: hp(8),
    left: wp(5),
    padding: wp(2.5),
  },
  logoContainer: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2.5),
  },
  title: {
    fontSize: normalize(32),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: normalize(16),
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: wp(10),
  },
  formContainer: {
    flex: 0.6,
    backgroundColor: '#fff',
    borderTopLeftRadius: normalize(30),
    borderTopRightRadius: normalize(30),
    paddingHorizontal: wp(8),
    paddingTop: hp(5),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: normalize(15),
    marginBottom: hp(2.5),
    paddingHorizontal: wp(4),
    height: hp(7),
  },
  inputIcon: {
    marginRight: wp(2.5),
  },
  input: {
    flex: 1,
    fontSize: normalize(16),
    color: '#333',
  },
  registerButton: {
    backgroundColor: '#F8803B',
    borderRadius: normalize(15),
    height: hp(7),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(1.5),
    ...Platform.select({
      ios: {
        shadowColor: '#F8803B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  registerButtonText: {
    color: '#fff',
    fontSize: normalize(18),
    fontWeight: 'bold',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: hp(4),
  },
  loginText: {
    fontSize: normalize(16),
    color: '#666',
  },
  loginTextBold: {
    fontWeight: 'bold',
    color: '#F8803B',
  },
});