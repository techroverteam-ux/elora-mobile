import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import AppBarHeader from '../../components/AppBarHeader'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import { useTranslation } from 'react-i18next'
import { fetchAndFormatStorage } from '../../utils/storageLogger'
import i18n from '../../localization/i18n'
import StorageViewer from '../../components/StorageViewer'
import { useTheme } from 'react-native-paper'

const SelectLanguage = () => {
  const { colors } = useTheme();

  const { t } = useTranslation();
  const [storageData, setStorageData] = useState<string[]>([]);

  const refreshStorage = async () => {
    const data = await fetchAndFormatStorage();
    setStorageData(data);
  };

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    await refreshStorage(); // refresh after language change
  };

  useEffect(() => {
    refreshStorage();
  }, []);


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title={t('account.selectLanguage')} />

      <View style={styles.content}>
        <LanguageSwitcher onLanguageChange={changeLanguage} />

        <View style={styles.textBlock}>
          <Text style={[styles.titleText, { color: colors.onSurface }]}>
            {t('screens.intro.title')}
          </Text>
          <Text style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
            {t('screens.intro.text.introText')}
          </Text>
        </View>

        {/* <StorageViewer storageData={storageData} /> */}
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
  textBlock: {
    marginVertical: 10,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 14,
    textAlign: 'center',
  },
})