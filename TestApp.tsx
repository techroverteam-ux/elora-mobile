import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Completely isolated test component
const TestScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>App is Working!</Text>
    <Text style={styles.subtext}>Navigation is functional</Text>
  </View>
);

const TestApp = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <TestScreen />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6B21C',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: '#fff',
  },
});

export default TestApp;