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
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useAuth } from '../context/AuthContext';

const CustomDrawer = (props: any) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: 'home-outline', label: 'Home', screen: 'Home' },
    { icon: 'view-dashboard-outline', label: 'Categories', screen: 'Categories' },
    { icon: 'book-open-outline', label: 'Geeta Chapters', screen: 'GeetaChapters' },
    { icon: 'headphones', label: 'Audio Library', screen: 'AudioLibrary' },
    { icon: 'video-outline', label: 'Video Library', screen: 'VideoLibrary' },
    { icon: 'download-outline', label: 'Downloads', screen: 'Downloads' },
    { icon: 'bookmark-outline', label: 'Bookmarks', screen: 'Bookmarks' },
    { icon: 'history', label: 'Recently Played', screen: 'RecentlyPlayed' },
    { icon: 'account-group-outline', label: 'Satsang', screen: 'Satsang' },
    { icon: 'school-outline', label: 'Teacher Training', screen: 'TeacherTraining' },
    { icon: 'presentation', label: 'Presentations', screen: 'Presentations' },
    { icon: 'heart', label: 'Activities & Trust', screen: 'Activities' },
    { icon: 'baby-face-outline', label: 'Geeta Bal Sanskar', screen: 'BalSanskar' },
  ];

  const settingsItems = [
    { icon: 'cog-outline', label: 'Settings', screen: 'Settings' },
    { icon: 'translate', label: 'Language', screen: 'Language' },
    { icon: 'theme-light-dark', label: 'Theme', screen: 'Theme' },
    { icon: 'information-outline', label: 'About', screen: 'About' },
    { icon: 'help-circle-outline', label: 'Help & Support', screen: 'Help' },
    { icon: 'star-outline', label: 'Rate App', action: 'rate' },
    { icon: 'share-variant-outline', label: 'Share App', action: 'share' },
  ];

  const handleNavigation = (screen: string) => {
    // Map drawer items to actual navigation screens
    const screenMapping: Record<string, string> = {
      'Home': 'MainTabs',
      'Categories': 'MainTabs',
      'AudioLibrary': 'MainTabs',
      'VideoLibrary': 'MainTabs',
      'Downloads': 'Downloads',
      'Account': 'MainTabs',
      'Settings': 'Settings',
      'About': 'About',
      'Help': 'HelpSupport',
      'Language': 'MainTabs',
      'Theme': 'MainTabs',
    };
    
    const targetScreen = screenMapping[screen] || screen;
    
    if (screen === 'Categories') {
      props.navigation.navigate('MainTabs', { screen: 'Categories' });
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
            'Rate App',
            'Would you like to rate our app on the store?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Rate Now', onPress: () => Linking.openURL('market://details?id=com.geetafinal') },
            ]
          );
        });
        break;
      case 'share':
        import('react-native').then(({ Alert, Share }) => {
          Share.share({
            message: 'Check out Geeta Bal Sanskar app for spiritual learning!',
            url: 'https://play.google.com/store/apps/details?id=com.geetafinal',
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
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialDesignIcons name="book-open-variant" size={50} color="#fff" />
          </View>
          <Text style={styles.appName}>Geeta Bal Sanskaar</Text>
          <Text style={styles.tagline}>Spiritual Wisdom & Guidance</Text>
          {user && (
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Welcome, {user.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          )}
        </View>

        {/* Main Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Main Menu</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleNavigation(item.screen)}
            >
              <MaterialDesignIcons name={item.icon} size={24} color="#666" />
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings & Support</Text>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => item.action ? handleAction(item.action) : handleNavigation(item.screen)}
            >
              <MaterialDesignIcons name={item.icon} size={24} color="#666" />
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {user ? (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => handleAction('logout')}
          >
            <MaterialDesignIcons name="logout" size={24} color="#FF6B6B" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => handleNavigation('Login')}
          >
            <MaterialDesignIcons name="login" size={24} color="#4CAF50" />
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#F8803B',
    padding: 20,
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 12,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  section: {
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 20,
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