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
import { useAuth, UserType } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../navigation/types';
import { useGetLoginUserMutation } from '../../data/redux/services/authApi';
import AutoLoginCredentials from '../AutoLoginCredentials';
import { useTheme } from 'react-native-paper';
import CustomTextInput from '../../components/CustomTextInput';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import LinearGradient from 'react-native-linear-gradient';
import { wp, hp, normalize } from '../../utils/responsive';

const { width, height } = Dimensions.get('window');

type AuthNav = NativeStackNavigationProp<AuthStackParamList>;

const LoginScreen = ({ onLoginSuccess }: { onLoginSuccess?: () => void }) => {
  const navigation = useNavigation<AuthNav>();
  const { login } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [isAutoLoginOn, setIsAutoLoginOn] = useState(__DEV__);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const [loginUser, { isLoading }] = useGetLoginUserMutation();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return t('auth.login.emailRequired');
    }
    if (!emailRegex.test(email)) {
      return t('auth.login.emailInvalid');
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return t('auth.login.passwordRequired');
    }
    if (password.length < 6) {
      return t('auth.login.passwordMinLength');
    }
    return '';
  };

  const clearErrors = () => {
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
  };

  const handleLogin = async () => {
    clearErrors();
    
    // Validate inputs
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    
    if (emailValidation) {
      setEmailError(emailValidation);
    }
    if (passwordValidation) {
      setPasswordError(passwordValidation);
    }
    
    if (emailValidation || passwordValidation) {
      return;
    }

    try {
      const response = await loginUser({ email: email.toLowerCase().trim(), password }).unwrap();
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

      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess();
      }

    } catch (error: any) {
      console.error('Login error:', error);
      const message = error?.data?.message || 
        (error?.status === 401 ? t('auth.login.invalidCredentials') : 
         error?.status === 429 ? t('auth.login.tooManyAttempts') :
         error?.status >= 500 ? t('auth.login.serverError') :
         t('auth.login.loginFailed'));
      setGeneralError(message);
    }
  };

  const handleSelectUser = (user: { email: string; password: string }) => {
    setEmail(user.email);
    setPassword(user.password);
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
            <Text style={styles.title}>{t('auth.login.title')}</Text>
            <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>
          </View>

          <View style={styles.formContainer}>
        {isAutoLoginOn && (
          <AutoLoginCredentials
            onSelectUser={handleSelectUser}
            isAutoLoginOn={isAutoLoginOn}
            setIsAutoLoginOn={setIsAutoLoginOn}
          />
        )}

        {generalError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{generalError}</Text>
          </View>
        ) : null}

        <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
          <MaterialDesignIcons name="email-outline" size={20} color="#666" style={styles.inputIcon} />
          <CustomTextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
              if (generalError) setGeneralError('');
            }}
            placeholder={t('auth.login.emailPlaceholder')}
            keyboardType="email-address"
            style={styles.input}
            autoCapitalize="none"
          />
        </View>
        {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

        <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
          <MaterialDesignIcons name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
          <CustomTextInput
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError('');
              if (generalError) setGeneralError('');
            }}
            placeholder={t('auth.login.passwordPlaceholder')}
            secureTextEntry={!showPassword}
            showToggle
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            style={styles.input}
          />
        </View>
        {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}

        <TouchableOpacity
          style={[styles.loginButton, { opacity: isLoading ? 0.7 : 1 }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>{t('auth.login.signInButton')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>
            {t('auth.login.noAccount')} <Text style={styles.registerTextBold}>{t('auth.login.signUp')}</Text>
          </Text>
        </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

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
  loginButton: {
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
  loginButtonText: {
    color: '#fff',
    fontSize: normalize(18),
    fontWeight: 'bold',
  },
  registerLink: {
    alignItems: 'center',
    marginTop: hp(4),
  },
  registerText: {
    fontSize: normalize(16),
    color: '#666',
  },
  registerTextBold: {
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