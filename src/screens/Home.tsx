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
    contentTag?: string;
    time?: string
  };

  const books: Book[] = [
    {
      image: 'https://unsplash.it/400/400?image=1',
      title: 'Bhagavad Gita – As It Is',
      subtitle: 'Geeta Press, Gorakhpur',
      contentTag: 'Trending',
      time: "5:30 min"
    },
    {
      image: 'https://unsplash.it/400/400?image=2',
      title: 'Ramcharitmanas',
      subtitle: 'Geeta Press, Gorakhpur',
      contentTag: 'Best Seller',
      time: "8:15 min"
    },
    {
      image: 'https://unsplash.it/400/400?image=3',
      title: 'Shri Krishna Leela',
      subtitle: 'Chaukhamba Sanskrit Sansthan',
      contentTag: 'Editor’s Pick',
      time: "4:45 min"
    },
    {
      image: 'https://unsplash.it/400/400?image=4',
      title: 'Vedas for Beginners',
      subtitle: 'Motilal Banarsidass Publishers',
      contentTag: '',
      time: "3:20 min"
    },
    {
      image: 'https://unsplash.it/400/400?image=5',
      title: 'Upanishads: The Essence of Vedas',
      subtitle: 'Ramakrishna Mission',
      contentTag: '',
      time: "6:10 min"
    },
    {
      image: 'https://unsplash.it/400/400?image=6',
      title: 'Hanuman Chalisa – Illustrated Edition',
      subtitle: 'Geeta Press, Gorakhpur',
      contentTag: 'New Arrival',
      time: "1:30 min"
    },
    {
      image: 'https://unsplash.it/400/400?image=7',
      title: 'Stories of Indian Saints',
      subtitle: 'Bharatiya Vidya Bhavan',
      contentTag: '',
      time: "7:00 min"
    },
    {
      image: 'https://unsplash.it/400/400?image=8',
      title: 'Essence of the Mahabharata',
      subtitle: 'Chinmaya Mission',
      contentTag: 'Recommended',
      time: "9:45 min"
    },
  ];

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
