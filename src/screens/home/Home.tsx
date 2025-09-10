import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../../localization/i18n';

import CounterControls from '../../components/CounterControls';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import StorageViewer from '../../components/StorageViewer';
import { fetchAndFormatStorage } from '../../utils/storageLogger';
import CardSection from '../../components/CardSection';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import MainAppHeader from '../../components/MainAppHeader';
import CardCarousel from '../../components/CardCarousel';
import PagerView from 'react-native-pager-view';
import { Book, books } from '../../data/bookData';
import { useAuth } from '../../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { useNavigation } from '@react-navigation/native';

const Home = () => {
  const { user } = useAuth();
  console.log("UserDataOnLogin:", user);

  type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;
  const { navigate } = useNavigation<HomeNavigationProp>();

  return (
    <View style={{ flex: 1 }}>
      <MainAppHeader username={user?.name || ''} />

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
            onSeeAll={() => Alert.alert("Coming soon!")}
            onItemPress={(item) => console.log('Pressed:', item)}
          />
          <CardSection<Book>
            title="Videos"
            data={books}
            imageKey="image"
            titleKey="title"
            subtitleKey="time"
            onSeeAll={() => navigate("AllVideos")}
            onItemPress={(item) => {
              navigate('VideoPlayer', {
                item: {
                  videoUri: 'https://www.w3schools.com/html/mov_bbb.mp4',
                  title: item.title,
                  // showDebugInfo: true,
                  // params: { item },
                  showHeaderFromRoutes: ['HomeMain'],
                }
              })
              console.log('Pressed:', item)
            }}
          />
          <CardSection<Book>
            title="Audios"
            data={books}
            imageKey="image"
            titleKey="title"
            subtitleKey="subtitle"
            onSeeAll={() => navigate("AllAudios")}
            onItemPress={(item) => {
              navigate('AudioPlayer', { item })
              console.log('Pressed:', item)
            }}
          />
        </ScrollView>
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
