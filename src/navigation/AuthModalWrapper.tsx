import React from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import AuthNavigator from './AuthNavigator';
import { useRedirect } from '../context/RedirectContext';

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
});
