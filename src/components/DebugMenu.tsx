import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera, Settings } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

interface DebugMenuProps {
  onOpenCameraTest: () => void;
}

export default function DebugMenu({ onOpenCameraTest }: DebugMenuProps) {
  const { theme } = useTheme();

  // Only show in development mode
  if (!__DEV__) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Debug Menu</Text>
      
      <TouchableOpacity
        style={[styles.debugButton, { backgroundColor: theme.colors.primary }]}
        onPress={onOpenCameraTest}
      >
        <Camera size={16} color="#FFFFFF" />
        <Text style={styles.buttonText}>Camera Detection Test</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});