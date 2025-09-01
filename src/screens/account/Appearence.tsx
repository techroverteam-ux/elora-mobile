import { Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useThemeContext } from '../../context/ThemeContext';
import AppBarHeader from '../../components/AppBarHeader';
import { useTheme } from 'react-native-paper';

const Appearence = () => {
  const { colors } = useTheme();
  const { preference, setPreference } = useThemeContext();

  const styles = StyleSheet.create({
    themeOptions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 12,
      marginHorizontal: 8,
    },

    themeOptionButton: {
      flex: 1,
      paddingVertical: 10,
      marginHorizontal: 4,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.outline, // Use appropriate color from Paper theme
      alignItems: 'center',
      backgroundColor: colors.surfaceVariant || colors.surface, // Fallback if `surfaceVariant` not available
    },

    selectedButton: {
      borderColor: '#F8803B',
      backgroundColor: '#F8803B20',
    },

    themeOptionText: {
      fontWeight: '500',
      color: colors.onSurface, // text on top of surface
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppBarHeader title="Appearance" />

      <View style={styles.themeOptions}>
        <Pressable
          onPress={() => setPreference('light')}
          style={[styles.themeOptionButton, preference === 'light' && styles.selectedButton]}
        >
          <Text style={styles.themeOptionText}>Light</Text>
        </Pressable>
        <Pressable
          onPress={() => setPreference('dark')}
          style={[styles.themeOptionButton, preference === 'dark' && styles.selectedButton]}
        >
          <Text style={styles.themeOptionText}>Dark</Text>
        </Pressable>
        <Pressable
          onPress={() => setPreference('system')}
          style={[styles.themeOptionButton, preference === 'system' && styles.selectedButton]}
        >
          <Text style={styles.themeOptionText}>System</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Appearence;
