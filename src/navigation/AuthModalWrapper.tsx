import React from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Text, TouchableOpacity } from 'react-native';
import AuthNavigator from './AuthNavigator';
import { useRedirect } from '../context/RedirectContext';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

const AuthModalWrapper = ({ navigation }: any) => {
  const { redirectTo, redirectParams, clearRedirect } = useRedirect();

  const handleLoginSuccess = () => {
    navigation.goBack();

    if (redirectTo) {
      setTimeout(() => {
        navigation.navigate(redirectTo as never, redirectParams as never);
        clearRedirect();
      }, 250);
    }
  };

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.modalContainer}>
        <View style={styles.skipContainer}>
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialDesignIcons name="close" size={24} color="#666" />
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
        <AuthNavigator onLoginSuccess={handleLoginSuccess} />
      </View>
    </View>
  );
};

export default AuthModalWrapper;

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContainer: {
    height: '90%',
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 20,
  },
  skipContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1000,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  skipText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
