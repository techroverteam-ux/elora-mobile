import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Modal, Animated } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'react-native-linear-gradient';
import {
  Home,
  Users,
  Shield,
  Store,
  Search,
  Wrench,
  Map,
  UserCheck,
  FileText,
  HelpCircle,
  BarChart3,
  TrendingUp,
  Bell,
  Sun,
  Moon,
  LogOut,
  X,
  CheckCircle
} from 'lucide-react-native';

const CustomDrawer = (props: any) => {
  const { logout, user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const fadeAnim = new Animated.Value(0);

  // Check permissions dynamically like web portal
  const canView = (moduleName: string) => {
    console.log('=== PERMISSION CHECK ===');
    console.log('Module:', moduleName);
    console.log('User:', user);
    console.log('User roles:', user?.roles);
    
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      console.log('No user or roles found');
      return false;
    }

    // SUPER_ADMIN bypass: They see everything
    if (user.roles.some((r: any) => r.code === "SUPER_ADMIN")) {
      console.log('SUPER_ADMIN access granted');
      return true;
    }

    // Check if ANY assigned role has 'view' permission for this module
    const hasPermission = user.roles.some((role: any) => {
      console.log('Checking role:', role.name, 'permissions:', role.permissions);
      const perms = role.permissions;
      if (!perms) {
        console.log('No permissions found for role');
        return false;
      }
      const modulePermission = perms[moduleName]?.view === true;
      console.log(`Module ${moduleName} permission:`, modulePermission);
      return modulePermission;
    });
    
    console.log('Final permission result:', hasPermission);
    console.log('========================');
    return hasPermission;
  };

  // Navigation items with permission modules
  const navigation = [
    { name: 'Dashboard', href: 'Dashboard', icon: Home, module: 'dashboard', alwaysShow: true },
    { name: 'User Management', href: 'Users', icon: Users, module: 'users' },
    { name: 'Role Management', href: 'Roles', icon: Shield, module: 'roles' },
    { name: 'Store Operations', href: 'Stores', icon: Store, module: 'stores' },
    { name: 'Recce', href: 'Recce', icon: Search, module: 'recce' },
    { name: 'Installation', href: 'Installation', icon: Wrench, module: 'installation' },
    { name: 'Element Mapping', href: 'Elements', icon: Map, module: 'elements' },
    { name: 'Client Management', href: 'Clients', icon: UserCheck, module: 'clients' },
    { name: 'RFQ Generation', href: 'RFQ', icon: FileText, module: 'stores' },
    { name: 'Enquiries', href: 'Enquiries', icon: HelpCircle, module: 'enquiries' },
    { name: 'Reports', href: 'Reports', icon: BarChart3, module: 'reports', alwaysShow: true },
    { name: 'Analytics', href: 'Analytics', icon: TrendingUp, module: 'reports' },
    { name: 'Notifications', href: 'Notifications', icon: Bell, module: 'dashboard' },
  ];

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    showToastMessage('Logging out securely...');
    setTimeout(async () => {
      await logout();
      showToastMessage('Session ended successfully');
    }, 1000);
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowToast(false));
  };

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#1F2937' : '#fff' }]}>
          <LinearGradient
            colors={['#F6B21C', '#FECC00']}
            style={styles.header}
          >
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={[styles.userText, { color: darkMode ? '#F9FAFB' : '#fff' }]}>Welcome, {user?.name || 'User'}</Text>
            <Text style={[styles.roleText, { color: darkMode ? 'rgba(249,250,251,0.8)' : 'rgba(255,255,255,0.8)' }]}>
              {user?.roles?.[0]?.name || user?.roles?.[0]?.code || 'Member'}
            </Text>
          </LinearGradient>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {navigation.map((item, index) => {
          // Check permissions - only show if user has access or it's always shown
          const hasAccess = item.alwaysShow || canView(item.module);
          if (!hasAccess) return null;
          
          const IconComponent = item.icon;
          return (
            <TouchableOpacity 
              key={`${item.name}-${index}`}
              style={[styles.menuItem, { borderBottomColor: darkMode ? '#374151' : '#f0f0f0' }]}
              onPress={() => {
                try {
                  console.log('Navigating to:', item.href);
                  if (props.navigation?.navigate) {
                    props.navigation.navigate(item.href);
                  }
                  if (props.navigation?.closeDrawer) {
                    props.navigation.closeDrawer();
                  }
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }}
            >
              <IconComponent 
                size={20} 
                color={darkMode ? '#F9FAFB' : '#666'} 
                style={styles.menuIcon}
              />
              <Text style={[styles.menuText, { color: darkMode ? '#F9FAFB' : '#333' }]}>{item.name}</Text>
            </TouchableOpacity>
          );
        })}
        
        <TouchableOpacity 
          style={[styles.menuItem, { borderBottomColor: darkMode ? '#374151' : '#f0f0f0' }]}
          onPress={toggleTheme}
        >
          {darkMode ? (
            <Sun size={20} color="#F9FAFB" style={styles.menuIcon} />
          ) : (
            <Moon size={20} color="#666" style={styles.menuIcon} />
          )}
          <Text style={[styles.menuText, { color: darkMode ? '#F9FAFB' : '#333' }]}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      <View style={[styles.footer, { borderTopColor: darkMode ? '#374151' : '#f0f0f0' }]}>
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: darkMode ? '#374151' : '#F6B21C' }]} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Banking-themed Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.logoutModal, { backgroundColor: darkMode ? '#1F2937' : '#fff' }]}>
            <LinearGradient
              colors={['#F6B21C', '#FECC00']}
              style={styles.modalHeader}
            >
              <View style={styles.securityIcon}>
                <LogOut size={24} color="#fff" />
              </View>
              <Text style={styles.modalTitle}>Secure Logout</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            
            <View style={styles.modalContent}>
              <Text style={[styles.modalMessage, { color: darkMode ? '#F9FAFB' : '#374151' }]}>
                You are about to end your secure session.
              </Text>
              <Text style={[styles.modalSubMessage, { color: darkMode ? '#9CA3AF' : '#6B7280' }]}>
                All your data will be safely stored and encrypted.
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.cancelButton, { borderColor: darkMode ? '#374151' : '#E5E7EB' }]}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={[styles.cancelButtonText, { color: darkMode ? '#9CA3AF' : '#6B7280' }]}>Stay Logged In</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={confirmLogout}
                >
                  <LinearGradient
                    colors={['#DC2626', '#B91C1C']}
                    style={styles.confirmButtonGradient}
                  >
                    <LogOut size={16} color="#fff" />
                    <Text style={styles.confirmButtonText}>End Session</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Banking Toast */}
      {showToast && (
        <Animated.View 
          style={[styles.toast, { opacity: fadeAnim }]}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.toastGradient}
          >
            <CheckCircle size={16} color="#fff" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#F6B21C',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 12,
  },
  logoImage: {
    width: 120,
    height: 30,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 5,
  },
  userText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
    letterSpacing: 0.3,
  },
  roleText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'transparent',
  },
  menuIcon: {
    marginRight: 12,
    width: 24,
  },
  menuText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.2,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  logoutButton: {
    backgroundColor: '#F6B21C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoutModal: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  securityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 24,
  },
  modalMessage: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  modalSubMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toastGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});

export default CustomDrawer;