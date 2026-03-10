import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Modal, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, Bell, User, LogOut, Settings, ChevronDown, Sun, Moon, ArrowLeft } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

interface HeaderProps {
  onMenuPress: () => void;
  onBackPress?: () => void;
  showBackButton?: boolean;
  title?: string;
  subtitle?: string;
  status?: 'Completed' | 'Pending' | 'In Progress';
  onProfilePress?: () => void;
  hasNotifications?: boolean;
}

const Header = ({ 
  onMenuPress,
  onBackPress,
  showBackButton = false,
  title = 'Dashboard', 
  subtitle,
  status,
  onProfilePress,
  hasNotifications = false 
}: HeaderProps) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme, theme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const insets = useSafeAreaInsets();

  const colors = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border, paddingTop: insets.top }]}>
      <StatusBar 
        backgroundColor={colors.background} 
        barStyle={darkMode ? 'light-content' : 'dark-content'} 
        translucent={true} 
      />
      
      <View style={[styles.content, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {/* Left Menu/Back Button and Logo */}
        <View style={styles.leftSection}>
          {showBackButton ? (
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: colors.surface }]} 
              onPress={onBackPress}
            >
              <ArrowLeft size={20} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: colors.surface }]} 
              onPress={onMenuPress}
            >
              <Menu size={20} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
          )}
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        {/* Spacer */}
        <View style={styles.spacer} />
        
        {/* Right Actions */}
        <View style={styles.rightActions}>
          {/* Notifications */}
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            onPress={() => {
              Toast.show({
                type: 'info',
                text1: 'Notifications',
                text2: '3 new updates available'
              });
            }}
          >
            <Bell size={18} color={colors.text} strokeWidth={2} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
          
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
          
          {/* Profile Button */}
          <TouchableOpacity 
            style={[styles.profileButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowProfileMenu(true)}
          >
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Profile Menu Modal */}
      <Modal
        visible={showProfileMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowProfileMenu(false)}
        >
          <View style={[styles.profileMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.profileMenuHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
              <View style={[styles.profileMenuAvatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.profileMenuAvatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.profileMenuInfo}>
                <Text style={[styles.profileMenuName, { color: colors.text }]}>
                  {user?.name ? String(user.name) : 'User'}
                </Text>
                <Text style={[styles.profileMenuEmail, { color: colors.textSecondary }]}>
                  {user?.email ? String(user.email) : 'No email'}
                </Text>
                <View style={[styles.profileMenuRole, { backgroundColor: colors.primary }]}>
                  <Text style={styles.profileMenuRoleText}>
                    {user?.roles?.[0]?.name || user?.roles?.[0]?.code || 'Member'}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={[styles.profileMenuDivider, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => {
                setShowProfileMenu(false);
                onProfilePress && onProfilePress();
              }}
            >
              <User size={18} color={colors.primary} />
              <Text style={[styles.profileMenuItemText, { color: colors.text }]}>View Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => setShowProfileMenu(false)}
            >
              <Settings size={18} color={colors.primary} />
              <Text style={[styles.profileMenuItemText, { color: colors.text }]}>Settings</Text>
            </TouchableOpacity>
            
            <View style={[styles.profileMenuDivider, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity
              style={[styles.profileMenuItem, { backgroundColor: darkMode ? '#2D1B1B' : '#FEF2F2' }]}
              onPress={() => {
                setShowProfileMenu(false);
                logout();
              }}
            >
              <LogOut size={18} color="#DC2626" />
              <Text style={[styles.profileMenuItemText, styles.logoutText]}>Secure Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  spacer: {
    flex: 1,
  },
  logo: {
    width: 100,
    height: 32,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  profileMenu: {
    position: 'absolute',
    top: 80,
    right: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    minWidth: 260,
    overflow: 'hidden',
    borderWidth: 1,
  },
  profileMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  profileMenuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileMenuAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  profileMenuInfo: {
    flex: 1,
  },
  profileMenuName: {
    fontSize: 16,
    fontWeight: '700',
  },
  profileMenuEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  profileMenuRole: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  profileMenuRoleText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileMenuDivider: {
    height: 1,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  profileMenuItemText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF4444',
  },
});

export default Header;