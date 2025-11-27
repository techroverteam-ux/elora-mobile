import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useBiometric } from '../context/BiometricContext';

const BiometricSetup = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { isBiometricAvailable, enableBiometric } = useBiometric();

  const handleEnableBiometric = async () => {
    const success = await enableBiometric();
    if (success) {
      Alert.alert('Success', 'Fingerprint login enabled successfully!');
      navigation.goBack();
    } else {
      Alert.alert('Failed', 'Could not enable fingerprint login');
    }
  };

  if (!isBiometricAvailable) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <MaterialDesignIcons name="fingerprint-off" size={80} color={colors.onSurfaceVariant} />
        <Text style={[styles.title, { color: colors.onBackground }]}>Fingerprint Not Available</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Your device doesn't support fingerprint authentication
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MaterialDesignIcons name="fingerprint" size={80} color={colors.primary} />
      <Text style={[styles.title, { color: colors.onBackground }]}>Setup Fingerprint Login</Text>
      <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
        Use your fingerprint to quickly and securely access your account
      </Text>
      
      <TouchableOpacity 
        style={[styles.enableButton, { backgroundColor: colors.primary }]}
        onPress={handleEnableBiometric}
      >
        <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Enable Fingerprint</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.skipButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.skipText, { color: colors.onSurfaceVariant }]}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  enableButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 16,
  },
  skipText: {
    fontSize: 14,
  },
});

export default BiometricSetup;