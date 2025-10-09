import React from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import AuthNavigator from './AuthNavigator';

const AuthModalWrapper = ({ navigation, route }: any) => {
  const { redirectTo, redirectParams } = route.params || {};

  const handleCloseAfterLogin = () => {
    // Close modal
    navigation.goBack();

    // If redirect target exists, navigate there
    if (redirectTo) {
      setTimeout(() => {
        navigation.navigate(redirectTo, redirectParams);
      }, 100); // small delay to ensure modal closes smoothly
    }
  };

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.modalContainer}>
        {/* 👇 Pass the callback into AuthNavigator */}
        <AuthNavigator onLoginSuccess={handleCloseAfterLogin} />
      </View>
    </View>
  );
};

export default AuthModalWrapper;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    height: '70%', // 70% height modal
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
});