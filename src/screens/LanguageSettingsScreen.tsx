import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import LanguageSwitcher from '../components/LanguageSwitcher';

const LanguageSettingsScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.outline }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialDesignIcons name="arrow-left" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>{t('navigation.language')}</Text>
      </View>
      
      <LanguageSwitcher />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default LanguageSettingsScreen;