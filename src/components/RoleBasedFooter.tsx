import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePermissions } from '../hooks/usePermissions';
import { 
  Home, 
  BarChart3, 
  Users, 
  Store, 
  FileText, 
  MessageSquare, 
  Settings,
  UserCheck,
  Package,
  Shield,
  Map,
  Wrench
} from 'lucide-react-native';

interface FooterItem {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  screen: string;
  module: string;
  alwaysShow?: boolean;
}

const FOOTER_ITEMS: FooterItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    screen: 'Dashboard',
    module: 'dashboard',
    alwaysShow: true
  },
  {
    key: 'clients',
    label: 'Clients',
    icon: UserCheck,
    screen: 'Clients',
    module: 'clients'
  },
  {
    key: 'users',
    label: 'Users',
    icon: Users,
    screen: 'Users',
    module: 'users'
  },
  {
    key: 'roles',
    label: 'Roles',
    icon: Shield,
    screen: 'Roles',
    module: 'roles'
  },
  {
    key: 'stores',
    label: 'Stores',
    icon: Store,
    screen: 'Stores',
    module: 'stores'
  },
  {
    key: 'recce',
    label: 'Recce',
    icon: Package,
    screen: 'Recce',
    module: 'recce'
  },
  {
    key: 'installation',
    label: 'Installation',
    icon: Wrench,
    screen: 'Installation',
    module: 'installation'
  },
  {
    key: 'elements',
    label: 'Elements',
    icon: Map,
    screen: 'Elements',
    module: 'elements'
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: FileText,
    screen: 'Reports',
    module: 'reports',
    alwaysShow: true
  },
  {
    key: 'enquiries',
    label: 'Enquiries',
    icon: MessageSquare,
    screen: 'Enquiries',
    module: 'enquiries'
  }
];

export default function RoleBasedFooter() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { hasPermission } = usePermissions();

  // Use exact same permission logic as web portal
  const canView = (moduleName: string) => {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;

    // SUPER_ADMIN bypass - exact same check as web portal
    if (user.roles.some((r: any) => r.code === "SUPER_ADMIN")) return true;

    // Check if ANY role has view permission for this module - exact same logic as web portal
    return user.roles.some((role: any) => {
      const perms = role.permissions;
      if (!perms) return false;
      return perms[moduleName]?.view === true;
    });
  };

  const getVisibleItems = () => {
    const filteredItems = FOOTER_ITEMS.filter(item => {
      // Always show items marked as alwaysShow (like Dashboard and Reports)
      if (item.alwaysShow) return true;
      
      // Check permission for other items
      return canView(item.module);
    });

    // Show max 5 items in footer for better UX
    return filteredItems.slice(0, 5);
  };

  const visibleItems = getVisibleItems();

  const handlePress = (screen: string) => {
    navigation.navigate(screen as never);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
      {visibleItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            onPress={() => handlePress(item.screen)}
          >
            <IconComponent size={20} color={theme.colors.text} />
            <Text style={[styles.label, { color: theme.colors.text }]} numberOfLines={1}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
});