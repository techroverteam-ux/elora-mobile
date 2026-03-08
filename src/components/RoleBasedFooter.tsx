import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Home, 
  BarChart3, 
  Users, 
  Store, 
  FileText, 
  MessageSquare, 
  Settings,
  UserCheck,
  Package
} from 'lucide-react-native';

interface FooterItem {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  screen: string;
  roles?: string[];
}

const FOOTER_ITEMS: FooterItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    screen: 'Dashboard',
    roles: ['SUPER_ADMIN', 'CLIENT', 'STORE', 'RECCE']
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    screen: 'Analytics',
    roles: ['SUPER_ADMIN', 'CLIENT']
  },
  {
    key: 'users',
    label: 'Users',
    icon: Users,
    screen: 'Users',
    roles: ['SUPER_ADMIN']
  },
  {
    key: 'clients',
    label: 'Clients',
    icon: UserCheck,
    screen: 'Clients',
    roles: ['SUPER_ADMIN']
  },
  {
    key: 'stores',
    label: 'Stores',
    icon: Store,
    screen: 'Stores',
    roles: ['SUPER_ADMIN', 'CLIENT']
  },
  {
    key: 'recce',
    label: 'Recce',
    icon: Package,
    screen: 'Recce',
    roles: ['SUPER_ADMIN', 'CLIENT', 'RECCE']
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: FileText,
    screen: 'Reports',
    roles: ['SUPER_ADMIN', 'CLIENT']
  },
  {
    key: 'enquiries',
    label: 'Enquiries',
    icon: MessageSquare,
    screen: 'Enquiries',
    roles: ['SUPER_ADMIN', 'CLIENT']
  }
];

export default function RoleBasedFooter() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { theme } = useTheme();

  const getUserRole = () => {
    if (!user?.roles || user.roles.length === 0) return 'RECCE';
    return user.roles[0]?.name || 'RECCE';
  };

  const userRole = getUserRole();

  const getVisibleItems = () => {
    const filteredItems = FOOTER_ITEMS.filter(item => 
      !item.roles || item.roles.includes(userRole)
    );

    // Banking standard: Show max 5 items in footer
    // For RECCE users, show only essential items
    if (userRole === 'RECCE') {
      return filteredItems.slice(0, 3); // Dashboard, Recce, Settings
    }
    
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