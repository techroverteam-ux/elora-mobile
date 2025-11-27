import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useBiometric } from '../context/BiometricContext';
import { useAuth } from '../context/AuthContext';

const BiometricPrompt = () => {
  const { colors } = useTheme();
  const { shouldShowBiometricSetup, setBiometricSetupShown } = useAuth();
  const { isBiometricAvailable, enableBiometric } = useBiometric();

  const handleSetupBiometric = async () => {
    const success = await enableBiometric();
    setBiometricSetupShown();
  };

  const handleSkip = () => {
    setBiometricSetupShown();
  };

  if (!shouldShowBiometricSetup || !isBiometricAvailable) return null;

  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <MaterialDesignIcons name="fingerprint" size={60} color={colors.primary} />
          <Text style={[styles.title, { color: colors.onSurface }]}>Setup Fingerprint?</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Enable fingerprint login for quick and secure access
          </Text>
          
          <View style={styles.buttons}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleSetupBiometric}
            >
              <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Enable</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton, { borderColor: colors.outline }]}
              onPress={handleSkip}
            >
              <Text style={[styles.buttonText, { color: colors.onSurface }]}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    margin: 32,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 280,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
  },
  primaryButton: {
    // backgroundColor set dynamically
  },
  secondaryButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default BiometricPrompt;