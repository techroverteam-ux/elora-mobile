import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions} from 'react-native';
import {
  LayoutDashboard,
  Users,
  Shield,
  Store,
  Map,
  Hammer,
  MessageSquare,
  Layers,
  Building2,
  FileSpreadsheet,
  BarChart3,
  LogOut,
} from 'lucide-react-native';
import {useTheme} from '../context/ThemeContext';
import {useAuth} from '../context/AuthContext';
import FastImage from 'react-native-fast-image';

const {width} = Dimensions.get('window');

interface SidebarProps {
  navigation: any;
  currentRoute: string;
}

const Sidebar = ({navigation, currentRoute}: SidebarProps) => {
  const {darkMode} = useTheme();
  const {user, logout} = useAuth();

  const canView = (moduleName: string) => {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;
    if (user.roles.some((r: any) => r.code === 'SUPER_ADMIN')) return true;
    return user.roles.some((role: any) => role.permissions?.[moduleName]?.view === true);
  };

  const menuItems = [
    {name: 'Dashboard', route: 'Dashboard', icon: LayoutDashboard, module: 'dashboard', alwaysShow: true},
    {name: 'User Management', route: 'Users', icon: Users, module: 'users'},
    {name: 'Role Management', route: 'Roles', icon: Shield, module: 'roles'},
    {name: 'Store Operations', route: 'Stores', icon: Store, module: 'stores'},
    {name: 'Recce', route: 'Recce', icon: Map, module: 'recce'},
    {name: 'Installation', route: 'Installation', icon: Hammer, module: 'installation'},
    {name: 'Enquiries', route: 'Enquiries', icon: MessageSquare, module: 'enquiries'},
    {name: 'Element Mapping', route: 'Elements', icon: Layers, module: 'elements'},
    {name: 'Client Management', route: 'Clients', icon: Building2, module: 'clients'},
    {name: 'RFQ Generation', route: 'RFQ', icon: FileSpreadsheet, module: 'rfq', alwaysShow: true},
    {name: 'Analytics', route: 'Analytics', icon: BarChart3, module: 'analytics', alwaysShow: true},
  ];

  const colors = {
    bg: darkMode ? '#000000' : '#FFFFFF',
    headerBg: darkMode ? '#1F2937CC' : '#FEF3C7',
    text: darkMode ? '#F9FAFB' : '#111827',
    textSecondary: darkMode ? '#9CA3AF' : '#6B7280',
    border: darkMode ? '#374151' : '#E5E7EB',
    activeItemBg: darkMode ? '#EAB30820' : '#EAB308',
    activeText: darkMode ? '#EAB308' : '#FFFFFF',
    hoverBg: darkMode ? '#1F2937CC' : '#FEF3C7',
    logoutBg: darkMode ? '#EAB30820' : '#EAB308',
    logoutText: darkMode ? '#EAB308' : '#FFFFFF',
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.bg}]}>
      {/* Logo Header */}
      <View style={[styles.header, {backgroundColor: colors.headerBg, borderBottomColor: colors.border}]}>
        <FastImage
          source={require('../assets/images/logo.png')}
          style={styles.logoImage}
          resizeMode={FastImage.resizeMode.contain}
        />
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => {
          const hasAccess = item.alwaysShow || canView(item.module);
          if (!hasAccess) return null;

          const isActive = currentRoute === item.route;
          const Icon = item.icon;

          return (
            <TouchableOpacity
              key={item.route}
              style={[
                styles.menuItem,
                {
                  backgroundColor: isActive ? colors.activeItemBg : 'transparent',
                  borderColor: isActive && darkMode ? '#EAB30830' : 'transparent',
                },
              ]}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.7}>
              <Icon
                size={20}
                color={isActive ? (darkMode ? '#EAB308' : '#FFFFFF') : colors.textSecondary}
              />
              <Text
                style={[
                  styles.menuText,
                  {color: isActive ? colors.activeText : colors.text},
                ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Logout Button */}
      <View style={[styles.footer, {backgroundColor: colors.headerBg, borderTopColor: colors.border}]}>
        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: colors.logoutBg,
              borderColor: darkMode ? '#EAB30830' : 'transparent',
            },
          ]}
          onPress={logout}
          activeOpacity={0.7}>
          <LogOut size={20} color={colors.logoutText} />
          <Text style={[styles.logoutText, {color: colors.logoutText}]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  logoImage: {
    width: width * 0.5,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    elevation: 3,
  },
  menu: {
    flex: 1,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Sidebar;
