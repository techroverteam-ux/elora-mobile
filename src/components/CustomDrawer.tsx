import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useAuth } from '../context/AuthContext';
import { translateContent } from '../utils/contentTranslator';

const CustomDrawer = (props: any) => {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const menuItems = [
    { icon: 'home', label: t('drawer.home'), screen: 'Home' },
    { icon: 'view-dashboard', label: t('drawer.categories'), screen: 'Categories' },
    { icon: 'headphones', label: t('drawer.audioLibrary'), screen: 'AudioLibrary' },
    { icon: 'play-circle', label: t('drawer.videoLibrary'), screen: 'VideoLibrary' },
    { icon: 'book-open-variant', label: t('drawer.books'), screen: 'Books' },
    { icon: 'image-multiple', label: t('drawer.imageLibrary'), screen: 'ImageLibrary' },
    { icon: 'bookmark', label: t('drawer.bookmarks'), screen: 'Bookmarks' },
    { icon: 'history', label: t('drawer.recentlyPlayed'), screen: 'RecentlyPlayed' },
  ];

  const settingsItems = [
    { icon: 'cog', label: t('drawer.settings'), screen: 'Settings' },
    { icon: 'translate', label: t('drawer.language'), screen: 'Language' },
    { icon: 'theme-light-dark', label: t('drawer.theme'), screen: 'Theme' },
    { icon: 'information', label: t('drawer.about'), screen: 'About' },
    { icon: 'help-circle', label: t('drawer.helpSupport'), screen: 'Help' },
    { icon: 'star', label: t('drawer.rateApp'), action: 'rate' },
    { icon: 'share-variant', label: t('drawer.shareApp'), action: 'share' },
  ];

  const handleNavigation = (screen: string) => {
    // Map drawer items to actual navigation screens
    const screenMapping: Record<string, string> = {
      'Home': 'MainTabs',
      'Categories': 'MainTabs',
      'AudioLibrary': 'MainTabs',
      'VideoLibrary': 'MainTabs',
      'ImageLibrary': 'GalleryList',
      'Books': 'MainTabs',
      'Bookmarks': 'BookmarksScreen',
      'RecentlyPlayed': 'RecentlyPlayedScreen',
      'Account': 'MainTabs',
      'Settings': 'Settings',
      'About': 'About',
      'Help': 'HelpSupport',
      'Language': 'MainTabs',
      'Theme': 'MainTabs',
    };
    
    const targetScreen = screenMapping[screen] || screen;
    
    if (screen === 'Categories') {
      props.navigation.navigate('MainTabs', { screen: 'Categories', params: { screen: 'CategoriesMain' } });
    } else if (screen === 'AudioLibrary') {
      props.navigation.navigate('MainTabs', { 
        screen: 'Home',
        params: { screen: 'AllAudios' }
      });
    } else if (screen === 'VideoLibrary') {
      props.navigation.navigate('MainTabs', { 
        screen: 'Home',
        params: { screen: 'AllVideos' }
      });
    } else if (screen === 'ImageLibrary') {
      props.navigation.navigate('GalleryList');
    } else if (screen === 'Books') {
      props.navigation.navigate('MainTabs', { 
        screen: 'Home',
        params: { screen: 'AllPDFs' }
      });
    } else if (screen === 'Language') {
      props.navigation.navigate('MainTabs', {
        screen: 'Account',
        params: { screen: 'SelectLanguage' }
      });
    } else if (screen === 'Theme') {
      props.navigation.navigate('MainTabs', {
        screen: 'Account',
        params: { screen: 'Appearence' }
      });
    } else {
      props.navigation.navigate(targetScreen);
    }
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'rate':
        import('react-native').then(({ Alert, Linking }) => {
          Alert.alert(
            translateContent('Rate App'),
            translateContent('Would you like to rate our app on the store?'),
            [
              { text: translateContent('Cancel'), style: 'cancel' },
              { text: translateContent('Rate Now'), onPress: () => Linking.openURL('https://play.google.com/store/apps/details?id=com.geetabalsanskar') },
            ]
          );
        });
        break;
      case 'share':
        import('react-native').then(({ Alert, Share }) => {
          Share.share({
            message: `${translateContent('Share Geeta Bal Sanskaar app with your friends and family!')}\n\nDownload: https://play.google.com/store/apps/details?id=com.geetabalsanskar`,
            url: 'https://play.google.com/store/apps/details?id=com.geetabalsanskar',
            title: translateContent('Geeta Bal Sanskar App'),
          });
        });
        break;
      case 'logout':
        logout();
        break;
    }
  };

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo1234.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>{translateContent('Geeta Bal Sanskar')}</Text>
        <Text style={styles.tagline}>{translateContent('Spiritual Wisdom & Guidance')}</Text>
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{t('drawer.welcome')}, {user.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        )}
      </View>

      {/* Scrollable Menu */}
      <ScrollView style={styles.menuScrollView} showsVerticalScrollIndicator={false}>
        {/* Main Menu */}
        <View style={[styles.section, styles.firstSection]}>
          <Text style={styles.sectionTitle}>{t('drawer.mainMenu')}</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { borderBottomColor: colors.outline + '30' }]}
              onPress={() => handleNavigation(item.screen)}
            >
              <MaterialDesignIcons name={item.icon} size={20} color={colors.primary} />
              <Text style={[styles.menuText, { color: colors.onBackground }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('drawer.settingsSupport')}</Text>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { borderBottomColor: colors.outline + '30' }]}
              onPress={() => item.action ? handleAction(item.action) : handleNavigation(item.screen)}
            >
              <MaterialDesignIcons name={item.icon} size={20} color={colors.primary} />
              <Text style={[styles.menuText, { color: colors.onBackground }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        {user ? (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => handleAction('logout')}
          >
            <MaterialDesignIcons name="logout" size={24} color="#FF6B6B" />
            <Text style={styles.logoutText}>{t('drawer.logout')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => props.navigation.navigate('AuthModal')}
          >
            <MaterialDesignIcons name="login" size={24} color="#4CAF50" />
            <Text style={styles.loginText}>{t('drawer.login')}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.version}>{t('drawer.version')} 1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#F8803B',
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 0,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  menuScrollView: {
    flex: 1,
    paddingHorizontal: 0,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: 0.3,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  userName: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  section: {
    paddingVertical: 5,
    marginTop: 10,
  },
  firstSection: {
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  menuText: {
    fontSize: 15,
    marginLeft: 12,
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginLeft: 15,
    fontWeight: '600',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  loginText: {
    fontSize: 16,
    color: '#4CAF50',
    marginLeft: 15,
    fontWeight: '600',
  },
  version: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default CustomDrawer;