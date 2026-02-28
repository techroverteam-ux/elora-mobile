import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { useAuth } from './src/context/AuthContext';

// Test without Stack Navigator - just direct component
const DirectTestScreen = () => {
  const { isLoading, isAuthenticated } = useAuth();
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Direct Navigation Test</Text>
      <Text style={styles.subtext}>Loading: {isLoading ? 'true' : 'false'}</Text>
      <Text style={styles.subtext}>Authenticated: {isAuthenticated ? 'true' : 'false'}</Text>
    </View>
  );
};

const DirectTestApp = () => (
  <SafeAreaProvider>
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <DirectTestScreen />
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
  subtext: {
    fontSize: 16,
    color: '#fff',
    marginTop: 10,
  },
});

export default DirectTestApp;