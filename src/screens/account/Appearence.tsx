import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useThemeContext } from '../../context/ThemeContext';
import AppBarHeader from '../../components/AppBarHeader';

const Appearence = () => {
  const { preference, setPreference } = useThemeContext();

  return (
    <View>

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
  )
}

export default Appearence

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
    borderColor: '#ccc',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },

  selectedButton: {
    borderColor: '#F8803B',
    backgroundColor: '#F8803B20',
  },

  themeOptionText: {
    fontWeight: '500',
  },
})