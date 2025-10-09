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
  backdrop: { ...StyleSheet.absoluteFillObject },
  modalContainer: {
    height: '70%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
});
