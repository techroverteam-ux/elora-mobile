import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';

const Stack = createStackNavigator();

// Test 4: Add basic Stack Navigator
const SimpleScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Step 4: Stack Navigator Works!</Text>
  </View>
);

const Step4App = () => (
  <SafeAreaProvider>
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Test" component={SimpleScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  </SafeAreaProvider>
);

// Test 5: Add useAuth hook
import { useAuth } from './src/context/AuthContext';

const AuthTestScreen = () => {
  const { isLoading } = useAuth();
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Step 5: useAuth Works!</Text>
      <Text style={styles.subtext}>Loading: {isLoading ? 'true' : 'false'}</Text>
    </View>
  );
};

const Step5App = () => (
  <SafeAreaProvider>
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Test" component={AuthTestScreen} />
          </Stack.Navigator>
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

// Start with Step4App
export default Step4App;