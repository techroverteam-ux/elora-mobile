import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import EloraLogo from '../../components/EloraLogo';

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        Alert.alert('Login Failed', result.message || 'Please try again');
        setIsLoading(false); // Reset loading state on failure
      }
      // Don't reset loading state on success - let AuthContext handle navigation
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setIsLoading(false); // Reset loading state on error
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Logo */}
          <LinearGradient
            colors={colors.gradient.primary}
            style={styles.header}
          >
            <View style={styles.logoContainer}>
              <EloraLogo width={300} height={100} />
              <Text style={styles.creativeText}>WE DON'T JUST PRINT.</Text>
              <Text style={styles.creativeText}>WE INSTALL YOUR BRAND</Text>
              <Text style={styles.creativeText}>INTO THE REAL WORLD</Text>
            </View>
          </LinearGradient>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
              
              <View style={styles.formHeader}>
                <View style={styles.welcomeContainer}>
                  <Shield color={colors.primary} size={24} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>
                    Secure Login
                  </Text>
                </View>
                <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
                  Access your admin dashboard
                </Text>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
                <View style={[styles.inputWrapper, { 
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceSecondary
                }]}>
                  <Mail color={colors.textSecondary} size={20} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textTertiary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                <View style={[styles.inputWrapper, { 
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceSecondary
                }]}>
                  <Lock color={colors.textSecondary} size={20} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    activeOpacity={0.7}
                  >
                    {showPassword ? (
                      <EyeOff color={colors.textSecondary} size={20} />
                    ) : (
                      <Eye color={colors.textSecondary} size={20} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.submitButton, { opacity: isLoading ? 0.7 : 1 }]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={colors.gradient.primary}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitText}>
                    {isLoading ? 'Signing In...' : 'Access Dashboard'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <View style={styles.securityBadge}>
                  <Shield color={colors.success} size={14} />
                  <Text style={[styles.securityText, { color: colors.textSecondary }]}>
                    256-bit SSL Encrypted
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardContainer: { flex: 1 },
  scrollContainer: { flexGrow: 1 },
  header: {
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: { alignItems: 'center' },
  creativeText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    marginTop: -20,
  },
  formCard: {
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  formHeader: { alignItems: 'center', marginBottom: 28 },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  formTitle: { fontSize: 24, fontWeight: '700', marginLeft: 8 },
  formSubtitle: { fontSize: 16, fontWeight: '500' },
  inputContainer: { marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 10 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  inputIcon: { marginRight: 14 },
  input: { flex: 1, fontSize: 16, fontWeight: '500' },
  eyeIcon: { padding: 6 },
  submitButton: { borderRadius: 16, overflow: 'hidden', marginTop: 12 },
  submitGradient: { paddingVertical: 18, paddingHorizontal: 28 },
  submitText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  footer: { alignItems: 'center', marginTop: 28 },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  securityText: { fontSize: 12, fontWeight: '600', marginLeft: 6 },
});