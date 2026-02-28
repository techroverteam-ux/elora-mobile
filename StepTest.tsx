import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Test 1: Just SafeAreaProvider + NavigationContainer
const Step1App = () => (
  <SafeAreaProvider>
    <NavigationContainer>
      <View style={styles.container}>
        <Text style={styles.text}>Step 1: Basic Navigation Works!</Text>
      </View>
    </NavigationContainer>
  </SafeAreaProvider>
);

// Test 2: Add ThemeProvider
import { ThemeProvider } from './src/context/ThemeContext';
const Step2App = () => (
  <SafeAreaProvider>
    <ThemeProvider>
      <NavigationContainer>
        <View style={styles.container}>
          <Text style={styles.text}>Step 2: ThemeProvider Works!</Text>
        </View>
      </NavigationContainer>
    </ThemeProvider>
  </SafeAreaProvider>
);

// Test 3: Add AuthProvider
import { AuthProvider } from './src/context/AuthContext';
const Step3App = () => (
  <SafeAreaProvider>
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <View style={styles.container}>
            <Text style={styles.text}>Step 3: AuthProvider Works!</Text>
          </View>
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  </SafeAreaProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6B21C',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

// Export Step3App to test AuthProvider
export default Step3App;