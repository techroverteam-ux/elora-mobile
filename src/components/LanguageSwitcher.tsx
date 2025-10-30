import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

interface Props {
  onLanguageChange?: (lang: string) => void;
}

const LanguageSwitcher: React.FC<Props> = ({ onLanguageChange }) => {
  const { i18n, t } = useTranslation();
  const { colors } = useTheme();

  const languages = [
    { code: 'en', label: 'English', nativeName: 'English', emoji: '🇺🇸' },
    { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', emoji: '🇮🇳' },
    { code: 'sa', label: 'Sanskrit', nativeName: 'संस्कृतम्', emoji: '🕉️' },
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    onLanguageChange?.(langCode);
  };

  return (
    <View style={styles.container}>
      {languages.map((lang) => {
        const isActive = lang.code === i18n.language;

        return (
          <TouchableOpacity
            key={lang.code}
            onPress={() => handleLanguageChange(lang.code)}
            style={[
              styles.languageItem,
              {
                backgroundColor: isActive ? colors.primary + '20' : colors.surface,
                borderColor: colors.outline,
              },
            ]}
          >
            <View style={styles.languageInfo}>
              <Text style={styles.emoji}>{lang.emoji}</Text>
              <Text style={[styles.languageName, { color: colors.onBackground }]}>
                {lang.nativeName}
              </Text>
            </View>
            {isActive && (
              <MaterialDesignIcons name="check" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default LanguageSwitcher;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
  },
});
