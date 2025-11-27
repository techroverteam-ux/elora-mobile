import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useBiometric } from '../context/BiometricContext';
import { useAuth } from '../context/AuthContext';

const BiometricLoginButton = () => {
  const { colors } = useTheme();
  const { isBiometricEnabled, isBiometricAvailable, authenticateWithBiometric } = useBiometric();
  const { login } = useAuth();

  const handleBiometricLogin = async () => {
    try {
      const success = await authenticateWithBiometric();
      if (success) {
        // Get stored user data and login
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const userData = await AsyncStorage.getItem('USER_KEY');
        if (userData) {
          login(JSON.parse(userData));
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Biometric authentication failed');
    }
  };

  if (!isBiometricAvailable || !isBiometricEnabled) return null;

  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.outline }]}
      onPress={handleBiometricLogin}
    >
      <MaterialDesignIcons name="fingerprint" size={32} color={colors.primary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 16,
  },
});

export default BiometricLoginButton;