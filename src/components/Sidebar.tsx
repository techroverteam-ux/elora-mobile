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
import Svg, {Path, G} from 'react-native-svg';

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
    {name: 'Reports', route: 'Reports', icon: BarChart3, module: 'reports', alwaysShow: true},
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
        <Svg width={width * 0.5} height={50} viewBox="0 0 5053.18 1243.33">
          <G>
            <Path
              d="M298.73 534.54c-2.3,-105.32 -13.79,-202.98 66.64,-247.03 55.15,-30.64 225.2,-19.15 298.73,-19.15 75.83,0 241.29,-11.49 298.74,19.15 78.13,42.13 68.94,147.45 66.64,248.94l-730.74 -1.91zm928.37 706.62l0 -266.18c-195.33,0 -392.95,0 -588.28,0 -153.96,0 -301.03,28.72 -333.2,-105.32 -9.19,-28.72 -11.49,-109.15 -6.89,-139.79l1031.78 0c0,-95.75 0,-189.58 0,-283.41 0,-256.61 -108,-423.2 -404.44,-442.35 -80.43,-5.75 -489.46,-5.75 -563,1.91 -172.35,21.06 -280.35,97.66 -333.2,233.63 -27.57,78.51 -29.87,160.85 -29.87,248.94 0,93.83 0,187.67 0,281.5 0,199.16 41.37,319.8 165.45,400.22 130.98,86.17 321.71,70.85 496.36,70.85 188.43,0 376.86,0 565.3,0z"
              fill="#F6B21C"
            />
            <Path
              d="M2408.24 1235.41c9.19,-36.39 0,-155.11 2.3,-201.07 -167.75,0 -333.2,0 -498.65,0 -73.54,0 -160.86,5.74 -213.71,-32.56 -52.85,-38.3 -39.07,-128.3 -41.37,-208.73 0,-36.39 -2.3,-86.17 2.3,-120.64 13.79,-139.79 170.05,-114.9 259.67,-114.9l494.06 0c4.59,-36.39 9.19,-172.35 0,-197.24 -29.87,-11.49 -622.74,-9.57 -687.09,0 -98.81,11.49 -174.65,42.13 -225.2,124.47 -50.56,82.34 -41.36,204.9 -41.36,308.31 -2.3,212.56 -9.19,404.06 259.67,442.35 101.11,13.41 241.28,5.74 344.69,5.74 52.85,0 321.71,5.74 344.69,-5.74z"
              fill="#F6B21C"
            />
            <Path
              d="M1608.56 205.17c78.13,5.75 174.65,1.92 255.07,1.92l507.84 0c94.22,-1.92 149.37,0 188.43,63.19 22.98,34.47 18.38,63.19 18.38,109.15 0,42.13 0,84.26 0,126.39l0 631.94c0,70.85 -11.49,101.49 25.28,101.49 55.15,0 135.58,5.74 186.13,-3.83 4.59,-11.49 2.3,-783.22 2.3,-861.73 -4.6,-292.99 -202.22,-371.5 -489.46,-371.5l-693.98 0 0 202.98z"
              fill="#F6B21C"
            />
            <Path d="M2998.82 1227.75l33.47 0 0 -1227.48 -36.77 0z" fill="#F6B21C" />
            <Path
              d="M4039.79 86.44c20.68,-3.83 64.34,-1.92 87.32,-1.92 13.79,0 29.87,0 43.66,0 20.68,0 20.68,0 20.68,21.07 0,53.62 6.89,61.28 -20.68,61.28l-130.98 0 0 -80.43z"
              fill="#F6B21C"
            />
            <Path
              d="M3571 946.26l133.28 -1.92c20.68,0 22.98,0 22.98,21.07 0,51.7 4.59,57.45 -20.68,57.45l-135.58 0 0 -76.6z"
              fill="#FECC00"
            />
          </G>
        </Svg>
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
