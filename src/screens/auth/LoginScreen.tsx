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
import { useAuth, UserType } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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

  const [isAutoLoginOn, setIsAutoLoginOn] = useState(__DEV__);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    <LinearGradient
      colors={['#FF6B35', '#F8803B', '#FFB347']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialDesignIcons name="book-open-variant" size={60} color="#fff" />
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue to Geeta Bal Sanskar</Text>
      </View>

      <View style={styles.formContainer}>
        {isAutoLoginOn && (
          <AutoLoginCredentials
            onSelectUser={handleSelectUser}
            isAutoLoginOn={isAutoLoginOn}
            setIsAutoLoginOn={setIsAutoLoginOn}
          />
        )}

        <View style={styles.inputContainer}>
          <MaterialDesignIcons name="email-outline" size={20} color="#666" style={styles.inputIcon} />
          <CustomTextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email Address"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialDesignIcons name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
          <CustomTextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry={!showPassword}
            showToggle
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          style={[styles.loginButton, { opacity: isLoading ? 0.7 : 1 }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>
            Don't have an account? <Text style={styles.registerTextBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(8),
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
});