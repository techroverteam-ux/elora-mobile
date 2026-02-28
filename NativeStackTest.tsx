import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { useAuth } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

// Simple screens for testing
const TestSplash = ({ navigation }: any) => (
  <View style={styles.container}>
    <Text style={styles.text}>Elora Mobile</Text>
    <TouchableOpacity 
      style={styles.button} 
      onPress={() => navigation.navigate('Login')}
    >
      <Text style={styles.buttonText}>Go to Login</Text>
    </TouchableOpacity>
  </View>
);

const TestLogin = () => {
  const { login } = useAuth();
  
  const handleLogin = async () => {
    try {
      // Mock login - just set user without API call
      await login('test@example.com', 'password');
    } catch (error) {
      console.log('Login failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Login Screen</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const TestDashboard = () => {
  const { logout } = useAuth();
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dashboard</Text>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const TestLoading = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Loading...</Text>
  </View>
);

function TestNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <TestLoading />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Splash" component={TestSplash} />
          <Stack.Screen name="Login" component={TestLogin} />
        </>
      ) : (
        <Stack.Screen name="Dashboard" component={TestDashboard} />
      )}
    </Stack.Navigator>
  );
}

const NativeStackTest = () => (
  <SafeAreaProvider>
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <TestNavigator />
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
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
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

export default NativeStackTest;