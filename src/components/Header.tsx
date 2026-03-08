import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Modal } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, Bell, MapPin, User, LogOut, Settings, ChevronDown } from 'lucide-react-native';

interface HeaderProps {
  onMenuPress: () => void;
  title?: string;
  subtitle?: string;
  status?: 'Completed' | 'Pending' | 'In Progress';
  onProfilePress?: () => void;
  hasNotifications?: boolean;
}

const Header = ({ 
  onMenuPress, 
  title = 'Dashboard', 
  subtitle,
  status,
  onProfilePress,
  hasNotifications = false 
}: HeaderProps) => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Completed': return '#10B981';
      case 'Pending': return '#F59E0B';
      case 'In Progress': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar backgroundColor="#E6A500" barStyle="light-content" translucent={false} />
      
      <LinearGradient
        colors={['#F6B21C', '#FECC00', '#E6A500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Left Menu Button */}
          <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
            <Menu size={22} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          
          {/* Center Title Area */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && (
              <View style={styles.subtitleRow}>
                <MapPin size={10} color="rgba(255,255,255,0.7)" />
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>
            )}
          </View>
          
          {/* Right Actions */}
          <View style={styles.rightActions}>
            {/* Notification Bell */}
            <TouchableOpacity style={styles.notificationButton}>
              <Bell size={20} color="#FFFFFF" strokeWidth={2} />
              {hasNotifications && <View style={styles.notificationBadge} />}
            </TouchableOpacity>
            
            {/* Profile Button */}
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => setShowProfileMenu(true)}
            >
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user?.name?.split(' ')[0] || 'User'}
                </Text>
                <ChevronDown size={14} color="rgba(255,255,255,0.8)" />
              </View>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Status Chip */}
        {status && (
          <View style={styles.statusContainer}>
            <View style={[styles.statusChip, { backgroundColor: getStatusColor(status) }]}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>
        )}
      </LinearGradient>
      
      {/* Professional Shadow */}
      <View style={styles.shadowLine} />
      
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
          <View style={[styles.profileMenu, { top: insets.top + 75 }]}>
            <View style={styles.profileMenuHeader}>
              <View style={styles.profileMenuAvatar}>
                <Text style={styles.profileMenuAvatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.profileMenuInfo}>
                <Text style={styles.profileMenuName}>
                  {user?.name ? String(user.name) : 'User'}
                </Text>
                <Text style={styles.profileMenuEmail}>
                  {user?.email ? String(user.email) : 'No email'}
                </Text>
                <View style={styles.profileMenuRole}>
                  <Text style={styles.profileMenuRoleText}>
                    {user?.roles?.[0]?.name || user?.roles?.[0]?.code || 'Member'}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.profileMenuDivider} />
            
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => {
                setShowProfileMenu(false);
                onProfilePress && onProfilePress();
              }}
            >
              <User size={18} color="#F6B21C" />
              <Text style={styles.profileMenuItemText}>View Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => setShowProfileMenu(false)}
            >
              <Settings size={18} color="#F6B21C" />
              <Text style={styles.profileMenuItemText}>Settings</Text>
            </TouchableOpacity>
            
            <View style={styles.profileMenuDivider} />
            
            <TouchableOpacity
              style={[styles.profileMenuItem, styles.logoutItem]}
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 12,
  },
  gradient: {
    paddingBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 18,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.2,
    fontFamily: 'System',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 3,
    fontWeight: '500',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
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
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 22,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  profileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    color: '#E6A500',
    fontSize: 14,
    fontWeight: '700',
  },
  statusContainer: {
    alignItems: 'center',
    paddingBottom: 6,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shadowLine: {
    height: 1,
    backgroundColor: 'rgba(246,178,28,0.1)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  profileMenu: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    minWidth: 260,
    overflow: 'hidden',
  },
  profileMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  profileMenuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F6B21C',
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
    color: '#1E293B',
  },
  profileMenuEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  profileMenuRole: {
    backgroundColor: '#F6B21C',
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
    backgroundColor: '#E2E8F0',
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  profileMenuItemText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '600',
  },
});

export default Header;