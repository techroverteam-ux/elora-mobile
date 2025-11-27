import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useBiometric } from '../context/BiometricContext';

const BiometricToggle = () => {
  const { colors } = useTheme();
  const { 
    isBiometricEnabled, 
    isBiometricAvailable, 
    enableBiometric, 
    disableBiometric 
  } = useBiometric();

  const handleToggle = async () => {
    if (isBiometricEnabled) {
      await disableBiometric();
    } else {
      await enableBiometric();
    }
  };

  if (!isBiometricAvailable) return null;

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={handleToggle}
    >
      <View style={styles.left}>
        <MaterialDesignIcons name="fingerprint" size={24} color={colors.primary} />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.onSurface }]}>Fingerprint Login</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Use fingerprint to login quickly
          </Text>
        </View>
      </View>
      <Switch
        value={isBiometricEnabled}
        onValueChange={handleToggle}
        trackColor={{ false: colors.outline, true: colors.primary }}
        thumbColor={colors.surface}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default BiometricToggle;