import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { translateContent } from '../utils/contentTranslator';
import AppBarHeader from '../components/AppBarHeader';

const SettingsScreen = () => {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate({});
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const settingsOptions = [
    {
      title: translateContent('Appearance'),
      icon: 'theme-light-dark',
      onPress: () => (navigation as any).navigate('MainTabs', { screen: 'Account', params: { screen: 'Appearence' } }),
    },
    {
      title: translateContent('Language'),
      icon: 'translate',
      onPress: () => (navigation as any).navigate('MainTabs', { screen: 'Account', params: { screen: 'SelectLanguage' } }),
    },
    {
      title: translateContent('About'),
      icon: 'information-outline',
      onPress: () => (navigation as any).navigate('About'),
    },
    {
      title: translateContent('Help & Support'),
      icon: 'help-circle-outline',
      onPress: () => (navigation as any).navigate('HelpSupport'),
    },
    {
      title: translateContent('Rate App'),
      icon: 'star-outline',
      onPress: () => {
        Alert.alert(
          translateContent('Rate App'),
          translateContent('Would you like to rate our app on the store?'),
          [
            { text: translateContent('Cancel'), style: 'cancel' },
            { text: translateContent('Rate Now'), onPress: () => Linking.openURL('market://details?id=com.geetafinal') },
          ]
        );
      },
    },
    {
      title: translateContent('Share App'),
      icon: 'share',
      onPress: () => {
        Alert.alert(
          translateContent('Share App'),
          translateContent('Share Geeta Bal Sanskaar app with your friends and family!'),
          [
            { text: translateContent('Cancel'), style: 'cancel' },
            { text: translateContent('Share'), onPress: () => console.log('Share app') },
          ]
        );
      },
    },
  ];

  return (
    <View key={i18n.language} style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title={translateContent('Settings')} />
      
      <View style={styles.content}>
        {settingsOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.optionItem, { borderBottomColor: colors.outline }]}
            onPress={option.onPress}
          >
            <MaterialDesignIcons name={option.icon} size={24} color={colors.primary} />
            <Text style={[styles.optionText, { color: colors.onBackground }]}>
              {option.title}
            </Text>
            <MaterialDesignIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
  },
});

export default SettingsScreen;