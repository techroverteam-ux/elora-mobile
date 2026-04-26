import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

// Minimal app for testing - no complex dependencies
const MinimalApp = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Elora Mobile</Text>
        <Text style={styles.subtitle}>Test Version - No Permissions</Text>
        <Text style={styles.version}>Version 1.4-minimal</Text>
        <Text style={styles.status}>✅ App Started Successfully</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
});

export default MinimalApp;