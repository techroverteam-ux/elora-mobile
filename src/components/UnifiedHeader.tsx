import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, Bell, User, Sun, Moon } from 'lucide-react-native';
import { lightTheme, darkTheme } from '../theme/colors';

interface UnifiedHeaderProps {
  onMenuPress: () => void;
  title?: string;
  showLogo?: boolean;
  hasNotifications?: boolean;
}

const UnifiedHeader = ({ 
  onMenuPress, 
  title = 'Dashboard',
  showLogo = false,
  hasNotifications = false 
}: UnifiedHeaderProps) => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const theme = darkMode ? darkTheme : lightTheme;
  const colors = theme.colors;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.headerBg }]}>
      <StatusBar 
        backgroundColor={colors.headerBg} 
        barStyle={darkMode ? 'light-content' : 'dark-content'} 
      />
      
      <View style={[styles.content, { borderBottomColor: colors.headerBorder }]}>
        {/* Left Menu Button */}
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: darkMode ? colors.surface : colors.surfaceSecondary }]} 
          onPress={onMenuPress}
        >
          <Menu size={20} color={colors.headerText} strokeWidth={2} />
        </TouchableOpacity>
        
        {/* Center Content */}
        <View style={styles.centerContent}>
          {showLogo ? (
            <View style={styles.logoSection}>
              <View style={[styles.logoContainer, { backgroundColor: '#FFFFFF' }]}>
                <Image
                  source={require('../assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.welcomeText}>
                <Text style={[styles.greeting, { color: colors.headerText }]}>
                  Welcome, {user?.name?.split(' ')[0] || 'User'}
                </Text>
                <Text style={[styles.role, { color: colors.textSecondary }]}>
                  {user?.roles?.[0]?.name || 'Dashboard'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.titleSection}>
              <Text style={[styles.title, { color: colors.headerText }]}>{title}</Text>
            </View>
          )}
        </View>
        
        {/* Right Actions */}
        <View style={styles.rightActions}>
          {/* Theme Toggle */}
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: darkMode ? colors.surface : colors.surfaceSecondary }]} 
            onPress={toggleTheme}
          >
            {darkMode ? (
              <Sun size={18} color={colors.headerText} />
            ) : (
              <Moon size={18} color={colors.headerText} />
            )}
          </TouchableOpacity>
          
          {/* Notifications */}
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: darkMode ? colors.surface : colors.surfaceSecondary }]}
          >
            <Bell size={18} color={colors.headerText} strokeWidth={2} />
            {hasNotifications && <View style={styles.notificationBadge} />}
          </TouchableOpacity>
          
          {/* Profile */}
          <TouchableOpacity style={[styles.profileButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  centerContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logo: {
    width: 32,
    height: 32,
  },
  welcomeText: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  role: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  titleSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default UnifiedHeader;