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
import Svg, {Path, G} from 'react-native-svg';

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
          <Svg width={width * 0.6} height={width * 0.15} viewBox="0 0 5053.18 1243.33">
            <G>
              <Path
                d="M298.73 534.54c-2.3,-105.32 -13.79,-202.98 66.64,-247.03 55.15,-30.64 225.2,-19.15 298.73,-19.15 75.83,0 241.29,-11.49 298.74,19.15 78.13,42.13 68.94,147.45 66.64,248.94l-730.74 -1.91zm928.37 706.62l0 -266.18c-195.33,0 -392.95,0 -588.28,0 -153.96,0 -301.03,28.72 -333.2,-105.32 -9.19,-28.72 -11.49,-109.15 -6.89,-139.79l1031.78 0c0,-95.75 0,-189.58 0,-283.41 0,-256.61 -108,-423.2 -404.44,-442.35 -80.43,-5.75 -489.46,-5.75 -563,1.91 -172.35,21.06 -280.35,97.66 -333.2,233.63 -27.57,78.51 -29.87,160.85 -29.87,248.94 0,93.83 0,187.67 0,281.5 0,199.16 41.37,319.8 165.45,400.22 130.98,86.17 321.71,70.85 496.36,70.85 188.43,0 376.86,0 565.3,0z"
                fill="#F6B21C"
              />
              <Path
                d="M2408.24 1235.41c9.19,-36.39 0,-155.11 2.3,-201.07 -167.75,0 -333.2,0 -498.65,0 -73.54,0 -160.86,5.74 -213.71,-32.56 -52.85,-38.3 -39.07,-128.3 -41.37,-208.73 0,-36.39 -2.3,-86.17 2.3,-120.64 13.79,-139.79 170.05,-114.9 259.67,-114.9l494.06 0c4.59,-36.39 9.19,-172.35 0,-197.24 -29.87,-11.49 -622.74,-9.57 -687.09,0 -98.81,11.49 -174.65,42.13 -225.2,124.47 -50.56,82.34 -41.36,204.9 -41.36,308.31 -2.3,212.56 -9.19,404.06 259.67,442.35 101.11,13.41 241.28,5.74 344.69,5.74 52.85,0 321.71,5.74 344.69,-5.74z"
                fill="#F6B21C"
              />
              <Path
                d="M1608.56 205.17c78.13,5.75 174.65,1.92 255.07,1.92l507.84 0c94.22,-1.92 149.37,0 188.43,63.19 22.98,34.47 18.38,63.19 18.38,109.15 0,42.13 0,84.26 0,126.39l0 631.94c0,70.85 -11.49,101.49 25.28,101.49 55.15,0 135.58,5.74 186.13,-3.83 4.59,-11.49 2.3,-783.22 2.3,-861.73 -4.6,-292.99 -202.22,-371.5 -489.46,-371.5l-693.98 0 0 202.98z"
                fill="#F6B21C"
              />
              <Path
                d="M2998.82 1227.75l33.47 0 0 -1227.48 -36.77 0z"
                fill="#F6B21C"
              />
              <Path
                d="M4039.79 86.44c20.68,-3.83 64.34,-1.92 87.32,-1.92 13.79,0 29.87,0 43.66,0 20.68,0 20.68,0 20.68,21.07 0,53.62 6.89,61.28 -20.68,61.28l-130.98 0 0 -80.43zm-45.96 -44.04l0 266.18 45.96 0 0 -95.75c18.38,0 41.36,0 62.04,0 25.28,0 22.98,7.66 36.77,22.98 9.19,11.49 16.09,22.98 27.57,36.38 9.19,13.41 18.39,24.9 27.57,36.39l52.85 1.91c-4.59,-13.4 -25.28,-36.38 -34.47,-47.87l-27.57 -34.47c-4.6,-7.66 -4.6,-5.74 -9.19,-15.32 71.24,0 62.04,-45.96 62.04,-114.9 0,-59.36 -34.47,-59.36 -89.62,-59.36 -52.85,0 -103.41,0 -153.96,0l0 3.83z"
                fill="#F6B21C"
              />
              <Path
                d="M3571 946.26l133.28 -1.92c20.68,0 22.98,0 22.98,21.07 0,51.7 4.59,57.45 -20.68,57.45l-135.58 0 0 -76.6zm140.18 120.64c43.66,0 62.04,-13.41 62.04,-57.45 2.3,-118.73 -6.89,-107.24 -133.28,-107.24 -32.17,0 -85.02,-3.83 -114.9,0l0 254.69 45.96 0 2.3 -90c101.11,0 71.24,-11.49 119.49,45.96 11.49,15.32 27.58,30.64 36.77,44.05l52.85 0c-4.59,-7.66 -27.57,-36.39 -36.77,-45.96 -11.49,-15.32 -27.57,-28.72 -34.47,-44.04z"
                fill="#FECC00"
              />
            </G>
          </Svg>
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
