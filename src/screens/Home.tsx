import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../localization/i18n';

import CounterControls from '../components/CounterControls';
import LanguageSwitcher from '../components/LanguageSwitcher';
import StorageViewer from '../components/StorageViewer';
import { fetchAndFormatStorage } from '../utils/storageLogger';
import CardSection from '../components/CardSection';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import MainAppHeader from '../components/MainAppHeader';
import CardCarousel from '../components/CardCarousel';
import PagerView from 'react-native-pager-view';
import { Book, books } from '../data/bookData';

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
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <MainAppHeader />

      <View style={styles.root}>
        <ScrollView showsVerticalScrollIndicator={false}>

          <CardCarousel />

          <CardSection<Book>
            title="Recently Viewed"
            data={books}
            imageKey="image"
            titleKey="title"
            subtitleKey="subtitle"
            contentTagName="contentTag"
            onSeeAll={() => console.log('See All')}
            onItemPress={(item) => console.log('Pressed:', item)}
          />
          <CardSection<Book>
            title="Videos"
            data={books}
            imageKey="image"
            titleKey="title"
            subtitleKey="time"
            onSeeAll={() => console.log('See All')}
            onItemPress={(item) => console.log('Pressed:', item)}
          />
          <CardSection<Book>
            title="Audios"
            data={books}
            imageKey="image"
            titleKey="title"
            subtitleKey="subtitle"
            onSeeAll={() => console.log('See All')}
            onItemPress={(item) => console.log('Pressed:', item)}
          />
        </ScrollView>

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
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
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
