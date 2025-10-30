import { StyleSheet, View } from 'react-native'
import React from 'react'
import AppBarHeader from '../../components/AppBarHeader'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import { useTranslation } from 'react-i18next'
import { translateContent } from '../../utils/contentTranslator'
import i18n from '../../localization/i18n'
import { useTheme } from 'react-native-paper'

const SelectLanguage = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title={translateContent('Language')} />

      <View style={styles.content}>
        <LanguageSwitcher onLanguageChange={changeLanguage} />
      </View>
    </View>
  )
}

export default SelectLanguage

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
})