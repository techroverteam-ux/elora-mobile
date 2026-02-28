import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import EloraLogo from '../components/EloraLogo';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <EloraLogo width={250} height={80} />
      <ActivityIndicator size="large" color="#F6B21C" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loader: {
    marginTop: 20,
  },
});

export default LoadingScreen;