import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'react-native-linear-gradient';
import Svg, {Path, G} from 'react-native-svg';
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
  Moon
} from 'lucide-react-native';

const CustomDrawer = (props: any) => {
  const { logout, user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

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

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#1F2937' : '#fff' }]}>
          <LinearGradient
            colors={['#F6B21C', '#FECC00']}
            style={styles.header}
          >
            <Svg width={120} height={30} viewBox="0 0 5053.18 1243.33">
              <G>
                <Path
                  d="M298.73 534.54c-2.3,-105.32 -13.79,-202.98 66.64,-247.03 55.15,-30.64 225.2,-19.15 298.73,-19.15 75.83,0 241.29,-11.49 298.74,19.15 78.13,42.13 68.94,147.45 66.64,248.94l-730.74 -1.91zm928.37 706.62l0 -266.18c-195.33,0 -392.95,0 -588.28,0 -153.96,0 -301.03,28.72 -333.2,-105.32 -9.19,-28.72 -11.49,-109.15 -6.89,-139.79l1031.78 0c0,-95.75 0,-189.58 0,-283.41 0,-256.61 -108,-423.2 -404.44,-442.35 -80.43,-5.75 -489.46,-5.75 -563,1.91 -172.35,21.06 -280.35,97.66 -333.2,233.63 -27.57,78.51 -29.87,160.85 -29.87,248.94 0,93.83 0,187.67 0,281.5 0,199.16 41.37,319.8 165.45,400.22 130.98,86.17 321.71,70.85 496.36,70.85 188.43,0 376.86,0 565.3,0z"
                  fill="#FFFFFF"
                />
                <Path
                  d="M2408.24 1235.41c9.19,-36.39 0,-155.11 2.3,-201.07 -167.75,0 -333.2,0 -498.65,0 -73.54,0 -160.86,5.74 -213.71,-32.56 -52.85,-38.3 -39.07,-128.3 -41.37,-208.73 0,-36.39 -2.3,-86.17 2.3,-120.64 13.79,-139.79 170.05,-114.9 259.67,-114.9l494.06 0c4.59,-36.39 9.19,-172.35 0,-197.24 -29.87,-11.49 -622.74,-9.57 -687.09,0 -98.81,11.49 -174.65,42.13 -225.2,124.47 -50.56,82.34 -41.36,204.9 -41.36,308.31 -2.3,212.56 -9.19,404.06 259.67,442.35 101.11,13.41 241.28,5.74 344.69,5.74 52.85,0 321.71,5.74 344.69,-5.74z"
                  fill="#FFFFFF"
                />
                <Path
                  d="M1608.56 205.17c78.13,5.75 174.65,1.92 255.07,1.92l507.84 0c94.22,-1.92 149.37,0 188.43,63.19 22.98,34.47 18.38,63.19 18.38,109.15 0,42.13 0,84.26 0,126.39l0 631.94c0,70.85 -11.49,101.49 25.28,101.49 55.15,0 135.58,5.74 186.13,-3.83 4.59,-11.49 2.3,-783.22 2.3,-861.73 -4.6,-292.99 -202.22,-371.5 -489.46,-371.5l-693.98 0 0 202.98z"
                  fill="#FFFFFF"
                />
              </G>
            </Svg>
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
    paddingTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 12,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 3,
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
});

export default CustomDrawer;