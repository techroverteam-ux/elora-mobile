import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import AppBarHeader from '../../components/AppBarHeader'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import { useTranslation } from 'react-i18next'
import { fetchAndFormatStorage } from '../../utils/storageLogger'
import i18n from '../../localization/i18n'
import StorageViewer from '../../components/StorageViewer'

const SelectLanguage = () => {

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
    <View>
      <AppBarHeader title="Select Language" />

      <View>
        <LanguageSwitcher onLanguageChange={changeLanguage} />

        {/* <View style={{ marginVertical: 10, alignItems: 'center' }}>
          <Text>{t('screens.intro.title')}</Text>
          <Text>{t('screens.intro.text.introText')}</Text>
        </View> */}

        {/* <StorageViewer storageData={storageData} /> */}
      </View>
    </View>
  )
}

export default SelectLanguage

const styles = StyleSheet.create({})