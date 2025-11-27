import React, { createContext, useContext, useState, useEffect } from 'react';
import ReactNativeBiometrics from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BiometricContextType {
  isBiometricEnabled: boolean;
  isBiometricAvailable: boolean;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
}

const BiometricContext = createContext<BiometricContextType | undefined>(undefined);

export const BiometricProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
    loadBiometricSettings();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const { available } = await ReactNativeBiometrics.isSensorAvailable();
      setIsBiometricAvailable(available);
    } catch (error) {
      console.error('Biometric check failed:', error);
    }
  };

  const loadBiometricSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem('biometricEnabled');
      setIsBiometricEnabled(enabled === 'true');
    } catch (error) {
      console.error('Failed to load biometric settings:', error);
    }
  };

  const enableBiometric = async (): Promise<boolean> => {
    try {
      const { success } = await ReactNativeBiometrics.simplePrompt({
        promptMessage: 'Confirm fingerprint to enable biometric login',
      });
      
      if (success) {
        await AsyncStorage.setItem('biometricEnabled', 'true');
        setIsBiometricEnabled(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Enable biometric failed:', error);
      return false;
    }
  };

  const disableBiometric = async (): Promise<void> => {
    try {
      await AsyncStorage.setItem('biometricEnabled', 'false');
      setIsBiometricEnabled(false);
    } catch (error) {
      console.error('Disable biometric failed:', error);
    }
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    try {
      const { success } = await ReactNativeBiometrics.simplePrompt({
        promptMessage: 'Use fingerprint to login',
      });
      return success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  };

  return (
    <BiometricContext.Provider value={{
      isBiometricEnabled,
      isBiometricAvailable,
      enableBiometric,
      disableBiometric,
      authenticateWithBiometric,
    }}>
      {children}
    </BiometricContext.Provider>
  );
};

export const useBiometric = () => {
  const context = useContext(BiometricContext);
  if (!context) {
    throw new Error('useBiometric must be used within BiometricProvider');
  }
  return context;
};