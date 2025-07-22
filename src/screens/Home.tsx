import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../localization/i18n';

import CounterControls from '../components/CounterControls';
import LanguageSwitcher from '../components/LanguageSwitcher';
import StorageViewer from '../components/StorageViewer';
import { fetchAndFormatStorage } from '../utils/storageLogger';
import CardSection from '../components/CardSection';

const Home = () => {
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
    <View style={styles.root}>
      <CardSection />
      {/* <CounterControls />
      <View style={styles.langSwitcher}>
        <LanguageSwitcher onLanguageChange={changeLanguage} />
      </View>
      <View style={styles.translation}>
        <Text>{t('screens.intro.title')}</Text>
        <Text>{t('screens.intro.text.introText')}</Text>
      </View>
      <StorageViewer storageData={storageData} /> */}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  langSwitcher: {
    width: '50%',
    marginVertical: 10,
  },
  translation: {
    marginVertical: 10,
    alignItems: 'center',
  },
});
