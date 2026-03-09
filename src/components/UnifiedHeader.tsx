import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, Sun, Moon } from 'lucide-react-native';

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
  const { darkMode, toggleTheme, theme } = useTheme();
  
  const colors = theme.colors;

  return (
    <>
      <StatusBar 
        backgroundColor={colors.background} 
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        translucent={false}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.content, { borderBottomColor: colors.border }]}>
          {/* Left Menu Button */}
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: colors.surface }]} 
            onPress={onMenuPress}
          >
            <Menu size={20} color={colors.text} strokeWidth={2} />
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
                  <Text style={[styles.greeting, { color: colors.text }]}>
                    Welcome, {user?.name?.split(' ')[0] || 'User'}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.titleSection}>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              </View>
            )}
          </View>
          
          {/* Right Actions */}
          <View style={styles.rightActions}>
            {/* Theme Toggle */}
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: colors.surface }]} 
              onPress={toggleTheme}
            >
              {darkMode ? (
                <Sun size={18} color={colors.text} />
              ) : (
                <Moon size={18} color={colors.text} />
              )}
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
    </>
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