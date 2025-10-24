import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import AppBarHeader from '../components/AppBarHeader';

const SettingsScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const settingsOptions = [
    {
      title: 'Appearance',
      icon: 'theme-light-dark',
      onPress: () => (navigation as any).navigate('Account', { screen: 'Appearence' }),
    },
    {
      title: 'Language',
      icon: 'translate',
      onPress: () => (navigation as any).navigate('Account', { screen: 'SelectLanguage' }),
    },
    {
      title: 'About',
      icon: 'information-outline',
      onPress: () => (navigation as any).navigate('About'),
    },
    {
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => (navigation as any).navigate('HelpSupport'),
    },
    {
      title: 'Rate App',
      icon: 'star-outline',
      onPress: () => {
        Alert.alert(
          'Rate App',
          'Would you like to rate our app on the store?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Rate Now', onPress: () => Linking.openURL('market://details?id=com.geetafinal') },
          ]
        );
      },
    },
    {
      title: 'Share App',
      icon: 'share',
      onPress: () => {
        Alert.alert(
          'Share App',
          'Share Geeta Bal Sanskaar app with your friends and family!',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Share', onPress: () => console.log('Share app') },
          ]
        );
      },
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title="Settings" />
      
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