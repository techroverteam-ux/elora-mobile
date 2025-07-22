import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../localization/i18n';

import CounterControls from '../screens/components/CounterControls';
import LanguageSwitcher from '../screens/components/LanguageSwitcher';
import StorageViewer from '../screens/components/StorageViewer';

const Home = () => {
  const { t } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <View style={styles.root}>
      <CounterControls />
      <View style={styles.langSwitcher}>
        <LanguageSwitcher onLanguageChange={changeLanguage} />
      </View>
      <View style={styles.translation}>
        <Text>{t('screens.intro.title')}</Text>
        <Text>{t('screens.intro.text.introText')}</Text>
      </View>
      <StorageViewer />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
