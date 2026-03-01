import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import {Mail, Lock, Eye, EyeOff, RefreshCw, AlertCircle} from 'lucide-react-native';
import {useAuth} from '../context/AuthContext';
import {useTheme} from '../context/ThemeContext';
import FastImage from 'react-native-fast-image';

const {width} = Dimensions.get('window');

const LoginScreen = () => {
  const {login} = useAuth();
  const {darkMode} = useTheme();

  const [email, setEmail] = useState('admin@elora.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    // Auto-fill captcha for development after it's generated
    if (captchaCode) {
      setUserCaptcha(captchaCode);
    }
  }, [captchaCode]);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setUserCaptcha('');
  };

  const handleSubmit = async () => {
    setError('');

    if (userCaptcha !== captchaCode) {
      setError('Incorrect captcha code. Please try again.');
      generateCaptcha();
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Something went wrong. Please check your connection.';
      setError(errorMessage);
      console.error('Login error:', err);
      generateCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  const colors = {
    bg: darkMode ? '#111827' : '#F9FAFB',
    cardBg: darkMode ? '#1F2937CC' : '#FFFFFF',
    text: darkMode ? '#FFFFFF' : '#111827',
    textSecondary: darkMode ? '#9CA3AF' : '#6B7280',
    label: darkMode ? '#D1D5DB' : '#374151',
    border: darkMode ? '#374151' : '#E5E7EB',
    inputBg: darkMode ? '#374151' : '#F9FAFB',
    inputFocusBg: darkMode ? '#4B5563' : '#FFFFFF',
    captchaBg: darkMode ? '#374151' : '#F3F4F6',
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: colors.bg}]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <FastImage
            source={require('../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>

        {/* Card */}
        <View style={[styles.card, {backgroundColor: colors.cardBg, borderColor: darkMode ? '#374151CC' : 'transparent'}]}>
          <Text style={[styles.title, {color: colors.text}]}>Welcome Back</Text>
          <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
            Sign in to your admin dashboard
          </Text>

          {/* Error */}
          {error ? (
            <View style={[styles.errorContainer, {
              borderColor: darkMode ? '#7F1D1DCC' : '#FCA5A5',
              backgroundColor: darkMode ? '#450A0ACC' : '#FEF2F2',
            }]}>
              <AlertCircle size={20} color={darkMode ? '#F87171' : '#DC2626'} />
              <Text style={[styles.errorText, {color: darkMode ? '#F87171' : '#991B1B'}]}>{error}</Text>
            </View>
          ) : null}

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, {color: colors.label}]}>Email Address</Text>
            <View style={[styles.inputContainer, {backgroundColor: colors.inputBg, borderColor: colors.border}]}>
              <Mail size={20} color="#9CA3AF" style={styles.icon} />
              <TextInput
                style={[styles.input, {color: colors.text}]}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, {color: colors.label}]}>Password</Text>
            <View style={[styles.inputContainer, {backgroundColor: colors.inputBg, borderColor: colors.border}]}>
              <Lock size={20} color="#9CA3AF" style={styles.icon} />
              <TextInput
                style={[styles.input, {color: colors.text}]}
                placeholder="Enter your password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Captcha */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, {color: colors.label}]}>Security Check</Text>
            <View style={styles.captchaRow}>
              <View style={[styles.captchaDisplay, {backgroundColor: colors.captchaBg, borderColor: colors.border}]}>
                <Text style={[styles.captchaText, {color: colors.text}]}>{captchaCode}</Text>
                <TouchableOpacity onPress={generateCaptcha} style={styles.refreshButton}>
                  <RefreshCw size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.captchaInput, {backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text}]}
                placeholder="ENTER CODE"
                placeholderTextColor={colors.textSecondary}
                value={userCaptcha}
                onChangeText={(text) => setUserCaptcha(text.toUpperCase())}
                maxLength={6}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In to Dashboard</Text>
            )}
          </TouchableOpacity>

          <Text style={[styles.footer, {color: colors.textSecondary}]}>
            Secure admin access • Protected by encryption
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: width * 0.6,
    height: width * 0.15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    elevation: 3,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F6B21C',
    letterSpacing: 4,
    marginTop: 10,
  },
  card: {
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    height: 56,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  captchaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  captchaDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    height: 56,
  },
  captchaText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 6,
    textDecorationLine: 'line-through',
    textDecorationColor: '#EAB308CC',
    textDecorationStyle: 'solid',
  },
  refreshButton: {
    padding: 4,
    borderRadius: 20,
  },
  captchaInput: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#EAB308',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 32,
  },
});

export default LoginScreen;
