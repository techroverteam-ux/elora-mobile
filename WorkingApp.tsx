import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { useAuth } from './src/context/AuthContext';

// Simple screens without navigation
const SplashScreen = ({ onContinue }: { onContinue: () => void }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Elora Mobile</Text>
    <TouchableOpacity style={styles.button} onPress={onContinue}>
      <Text style={styles.buttonText}>Continue</Text>
    </TouchableOpacity>
  </View>
);

const LoginScreen = () => {
  const { login } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login('test@example.com', 'password');
    } catch (error) {
      console.log('Login failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const DashboardScreen = () => {
  const { logout, user } = useAuth();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Welcome {user?.name || 'User'}!</Text>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const LoadingScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Loading...</Text>
  </View>
);

// Main app component using conditional rendering
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    if (showSplash) {
      return <SplashScreen onContinue={() => setShowSplash(false)} />;
    }
    return <LoginScreen />;
  }

  return <DashboardScreen />;
}

const WorkingApp = () => (
  <SafeAreaProvider>
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppContent />
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
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#F6B21C',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WorkingApp;