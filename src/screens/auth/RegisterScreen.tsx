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
  Image,
  KeyboardAvoidingView,
  ScrollView,
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
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const [registerUser, { isLoading }] = useGetRegisterUserMutation();

  const validateName = (name: string) => {
    if (!name.trim()) {
      return 'Full name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }
    return '';
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return '';
  };

  const clearErrors = () => {
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
  };

  const handleRegister = async () => {
    clearErrors();
    
    // Validate inputs
    const nameValidation = validateName(name);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    
    if (nameValidation) {
      setNameError(nameValidation);
    }
    if (emailValidation) {
      setEmailError(emailValidation);
    }
    if (passwordValidation) {
      setPasswordError(passwordValidation);
    }
    
    if (nameValidation || emailValidation || passwordValidation) {
      return;
    }

    try {
      const result = await registerUser({ 
        name: name.trim(), 
        email: email.toLowerCase().trim(), 
        password 
      }).unwrap();
      console.log('Registered:', result);

      Alert.alert('Success', 'Registration successful! You can now login with your credentials.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      console.error('Register failed:', err);
      const message = err?.data?.message ||
        (err?.status === 409 ? 'An account with this email already exists.' :
         err?.status === 429 ? 'Too many registration attempts. Please try again later.' :
         err?.status >= 500 ? 'Server error. Please try again later.' :
         'Registration failed. Please check your connection and try again.');
      setGeneralError(message);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#FF6B35', '#F8803B', '#FFB347']}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialDesignIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/logo1234.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Geeta Bal Sanskar community today</Text>
          </View>

          <View style={styles.formContainer}>
        {generalError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{generalError}</Text>
          </View>
        ) : null}

        <View style={[styles.inputContainer, nameError ? styles.inputError : null]}>
          <MaterialDesignIcons name="account-outline" size={20} color="#666" style={styles.inputIcon} />
          <CustomTextInput
            placeholder="Full Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (nameError) setNameError('');
              if (generalError) setGeneralError('');
            }}
            style={styles.input}
          />
        </View>
        {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}

        <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
          <MaterialDesignIcons name="email-outline" size={20} color="#666" style={styles.inputIcon} />
          <CustomTextInput
            placeholder="Email Address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
              if (generalError) setGeneralError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>
        {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

        <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
          <MaterialDesignIcons name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
          <CustomTextInput
            placeholder="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError('');
              if (generalError) setGeneralError('');
            }}
            secureTextEntry={!showPassword}
            showToggle
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            style={styles.input}
          />
        </View>
        {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}

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
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: height,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(8),
    paddingBottom: hp(4),
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
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2.5),
  },
  logoImage: {
    width: wp(20),
    height: wp(20),
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
    backgroundColor: '#fff',
    borderTopLeftRadius: normalize(30),
    borderTopRightRadius: normalize(30),
    paddingHorizontal: wp(8),
    paddingTop: hp(5),
    paddingBottom: hp(5),
    minHeight: height * 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: normalize(15),
    marginBottom: hp(2.5),
    paddingHorizontal: wp(4),
    height: hp(7),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: wp(2.5),
  },
  input: {
    flex: 1,
    fontSize: normalize(16),
    color: '#333',
    paddingVertical: hp(1),
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
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: normalize(8),
    padding: wp(3),
    marginBottom: hp(2),
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#c62828',
    fontSize: normalize(14),
    textAlign: 'center',
  },
  fieldError: {
    color: '#f44336',
    fontSize: normalize(12),
    marginTop: -hp(2),
    marginBottom: hp(1),
    marginLeft: wp(4),
  },
  inputError: {
    borderColor: '#f44336',
    borderWidth: 1.5,
  },
});