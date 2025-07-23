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

  type Book = {
    image: string;
    title: string;
    subtitle: string;
  };

  const books: Book[] = [
    {
      image: 'https://unsplash.it/400/400?image=1',
      title: 'Geeta Press Book',
      subtitle: 'Publisher Name',
    },
    {
      image: 'https://unsplash.it/400/400?image=2',
      title: 'Geeta Press Book',
      subtitle: 'Publisher Name',
    },
    {
      image: 'https://unsplash.it/400/400?image=3',
      title: 'Geeta Press Book',
      subtitle: 'Publisher Name',
    },
    {
      image: 'https://unsplash.it/400/400?image=4',
      title: 'Geeta Press Book',
      subtitle: 'Publisher Name',
    },
    {
      image: 'https://unsplash.it/400/400?image=5',
      title: 'Geeta Press Book',
      subtitle: 'Publisher Name',
    },
    // ... more books
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <MainAppHeader />

      <View style={styles.root}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <CardSection<Book>
            title="Recently Viewed"
            data={books}
            imageKey="image"
            titleKey="title"
            subtitleKey="subtitle"
            onSeeAll={() => console.log('See All')}
            onItemPress={(item) => console.log('Pressed:', item)}
          />
          <CardSection<Book>
            title="Videos"
            data={books}
            imageKey="image"
            titleKey="title"
            subtitleKey="subtitle"
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
