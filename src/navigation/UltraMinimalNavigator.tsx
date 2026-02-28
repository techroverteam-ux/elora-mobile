import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

const Stack = createStackNavigator();

// Ultra-minimal screens with no dependencies
const SimpleSplash = ({ navigation }: any) => (
  <View style={styles.container}>
    <Text style={styles.title}>Elora Mobile</Text>
    <TouchableOpacity 
      style={styles.button} 
      onPress={() => navigation.navigate('Login')}
    >
      <Text style={styles.buttonText}>Continue</Text>
    </TouchableOpacity>
  </View>
);

const SimpleLogin = () => {
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

const SimpleDashboard = () => {
  const { logout } = useAuth();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Welcome to Elora Mobile!</Text>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const SimpleLoading = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Loading...</Text>
  </View>
);

export default function UltraMinimalNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SimpleLoading />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Splash" component={SimpleSplash} />
          <Stack.Screen name="Login" component={SimpleLogin} />
        </>
      ) : (
        <Stack.Screen name="Dashboard" component={SimpleDashboard} />
      )}
    </Stack.Navigator>
  );
}

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
    fontSize: 16,
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