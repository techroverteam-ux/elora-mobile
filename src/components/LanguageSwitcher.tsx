import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import i18n from '../localization/i18n'; // Adjust the path as needed

interface Props {
  onLanguageChange: (lang: string) => void;
}

const LanguageSwitcher: React.FC<Props> = ({ onLanguageChange }) => {
  const currentLang = i18n.language;

  const languages = [
    { code: 'en', label: 'English', emoji: '🇬🇧' },
    { code: 'fr', label: 'Français', emoji: '🇫🇷' },
  ];

  return (
    <View style={styles.container}>
      {languages.map((lang) => {
        const isActive = lang.code === currentLang;

        return (
          <TouchableOpacity
            key={lang.code}
            onPress={() => onLanguageChange(lang.code)}
            style={[styles.button, isActive && styles.activeButton]}
          >
            <Text style={[styles.buttonText, isActive && styles.activeButtonText]}>
              {lang.emoji} {lang.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default LanguageSwitcher;

const styles = StyleSheet.create({
  container: {
    margin: 20,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-start',
    // paddingVertical: 15,
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  activeButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  activeButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
