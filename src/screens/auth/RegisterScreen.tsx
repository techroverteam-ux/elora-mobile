import React, { useState, useEffect } from 'react';
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
import { useTranslation } from 'react-i18next';
import { useGetRegisterUserMutation } from '../../data/redux/services/authApi';
import { getErrorMessage } from '../../data/redux/services/baseQuery';
import CustomTextInput from '../../components/CustomTextInput';
import { AuthStackParamList } from '../../navigation/types';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import LinearGradient from 'react-native-linear-gradient';
import { wp, hp, normalize } from '../../utils/responsive';

type AuthNav = NativeStackNavigationProp<AuthStackParamList>;

const RegisterScreen = () => {
  const navigation = useNavigation<AuthNav>();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);
  
  const width = dimensions.width;
  const height = dimensions.height;
  const is7Inch = width >= 600 && width < 800;
  const is10Inch = width >= 800;

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
      return t('auth.register.nameRequired');
    }
    if (name.trim().length < 2) {
      return t('auth.register.nameMinLength');
    }
    return '';
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return t('auth.register.emailRequired');
    }
    if (!emailRegex.test(email)) {
      return t('auth.register.emailInvalid');
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return t('auth.register.passwordRequired');
    }
    if (password.length < 8) {
      return t('auth.register.passwordMinLength');
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return t('auth.register.passwordComplexity');
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

      Alert.alert(t('auth.register.success'), t('auth.register.registrationSuccess'), [
        { text: t('auth.register.ok'), onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      console.error('Register failed:', err);
      const message = err?.data?.message ||
        (err?.status === 409 ? t('auth.register.emailExists') :
         err?.status === 429 ? t('auth.register.tooManyAttempts') :
         err?.status >= 500 ? t('auth.register.serverError') :
         t('auth.register.registrationFailed'));
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
            <Text style={styles.title}>{t('auth.register.title')}</Text>
            <Text style={styles.subtitle}>{t('auth.register.subtitle')}</Text>
          </View>

          <View style={[styles.formContainer, (is7Inch || is10Inch) && { maxWidth: is10Inch ? 600 : 500, alignSelf: 'center', width: '90%' }]}>
        {generalError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{generalError}</Text>
          </View>
        ) : null}

        <View style={[styles.inputContainer, nameError ? styles.inputError : null]}>
          <MaterialDesignIcons name="account-outline" size={20} color="#666" style={styles.inputIcon} />
          <CustomTextInput
            placeholder={t('auth.register.namePlaceholder')}
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
            placeholder={t('auth.register.emailPlaceholder')}
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
            placeholder={t('auth.register.passwordPlaceholder')}
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
            <Text style={styles.registerButtonText}>{t('auth.register.createAccountButton')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.loginText}>
            {t('auth.register.haveAccount')} <Text style={styles.loginTextBold}>{t('auth.register.signIn')}</Text>
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
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(6),
    paddingBottom: hp(3),
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: hp(6),
    left: wp(5),
    padding: wp(2.5),
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: wp(10),
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: wp(8),
    paddingTop: hp(4),
    paddingBottom: hp(3),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: hp(2),
    paddingHorizontal: wp(4),
    height: 56,
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
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  registerButton: {
    backgroundColor: '#F8803B',
    borderRadius: 15,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(2),
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: hp(3),
  },
  loginText: {
    fontSize: 15,
    color: '#666',
  },
  loginTextBold: {
    fontWeight: 'bold',
    color: '#F8803B',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: hp(2),
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
  fieldError: {
    color: '#f44336',
    fontSize: 12,
    marginTop: -hp(1.5),
    marginBottom: hp(1),
    marginLeft: wp(4),
  },
  inputError: {
    borderColor: '#f44336',
    borderWidth: 1.5,
  },
});