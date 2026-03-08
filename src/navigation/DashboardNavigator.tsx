import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View, Platform, Dimensions } from 'react-native';
import { useTheme, useLinkBuilder } from '@react-navigation/native';
import { PlatformPressable } from '@react-navigation/elements';
import { useTranslation } from 'react-i18next';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { translateContent } from '../utils/contentTranslator';
import { getResponsiveFontSize, isOldPhone } from '../utils/responsive';
import { useAuth } from '../context/AuthContext';

// Import stack navigators
import HomeStack from './stack/HomeStack';
import CategoriesStack from './stack/CategoriesStack';
import AccountStack from './stack/AccountStack';
import CustomDrawer from '../components/CustomDrawer';
import RoleBasedFooter from '../components/RoleBasedFooter';

// Import screens
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import SearchScreen from '../screens/SearchScreen';
import ReportIssueScreen from '../screens/ReportIssueScreen';
import FeatureRequestScreen from '../screens/FeatureRequestScreen';
import GalleryListScreen from '../screens/GalleryListScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import RecentlyPlayedScreen from '../screens/RecentlyPlayedScreen';
import MiniPlayer from '../components/MiniPlayer';
import { useCurrentPlayer } from '../context/CurrentPlayerContext';
import AuthModalWrapper from './AuthModalWrapper';

// Business screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import UsersScreen from '../screens/users/UsersScreen';
import RolesScreen from '../screens/roles/RolesScreen';
import ClientsScreen from '../screens/clients/ClientsScreen';
import StoresScreen from '../screens/stores/StoresScreen';
import RecceScreen from '../screens/recce/RecceScreen';
import InstallationScreen from '../screens/installation/InstallationScreen';
import EnquiriesScreen from '../screens/enquiries/EnquiriesScreen';
import RFQScreen from '../screens/rfq/RFQScreen';
import ElementsScreen from '../screens/elements/ElementsScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const ICONS_MAP: Record<string, string> = {
  Home: 'home-outline',
  Categories: 'view-dashboard-outline',
  Account: 'account-outline',
};

function MyTabBar({ state, descriptors, navigation }: any) {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = Dimensions.get('window');
  
  // Calculate dynamic bottom padding based on device
  const getBottomPadding = () => {
    if (Platform.OS === 'ios') {
      return Math.max(insets.bottom, 12);
    }
    // For Android, check if device has gesture navigation
    const hasGestureNav = screenHeight > 800 && insets.bottom > 0;
    return hasGestureNav ? Math.max(insets.bottom + 8, 18) : 12;
  };

  // Calculate dynamic tab height based on screen size
  const getTabHeight = () => {
    if (isOldPhone()) return 70; // Old phones need more height
    if (screenHeight < 600) return 65; // Small screens
    if (screenHeight < 800) return 70; // Medium screens
    return 75; // Large screens
  };

  // Get responsive font size for tab labels
  const getTabLabelSize = () => {
    return getResponsiveFontSize(11);
  };

  // Hide tab bar only on specific screens like audio/video players
  const currentRoute = state.routes[state.index]?.state?.routes?.[state.routes[state.index]?.state?.index];
  const hideTabBarScreens = ['EnhancedAudioPlayer', 'EnhancedVideoPlayer'];
  if (currentRoute && hideTabBarScreens.includes(currentRoute.name)) return null;

  return (
    <View style={[
      styles.tabBarContainer, 
      { 
        backgroundColor: colors.card,
        paddingBottom: getBottomPadding(),
        minHeight: getTabHeight(),
      }
    ]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const getLabel = () => {
          switch (route.name) {
            case 'Home': return t('navigation.home');
            case 'Categories': return t('navigation.categories');
            case 'Account': return translateContent('Account');
            default: return options.tabBarLabel ?? options.title ?? route.name;
          }
        };
        const label = getLabel();
        const isFocused = state.index === index;
        const iconName: any = ICONS_MAP[route.name];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!event.defaultPrevented) {
            if (route.name === 'Categories') {
              // Always reset Categories stack to main screen
              navigation.navigate('Categories', {
                screen: 'CategoriesMain',
                params: undefined
              });
            } else if (!isFocused) {
              navigation.navigate(route.name, route.params);
            }
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <PlatformPressable
            key={route.key}
            href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            <MaterialDesignIcons
              name={iconName}
              size={24}
              color={isFocused ? colors.primary : colors.text}
            />
            <Text 
              style={[styles.tabLabel, { color: isFocused ? colors.primary : colors.text }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {label}
            </Text>
          </PlatformPressable>
        );
      })}
    </View>
  );
}

// Business Tab Navigator with Role-based Footer
const BusinessTabNavigator = () => {
  const { user } = useAuth();
  
  const getUserRole = () => {
    if (!user?.roles || user.roles.length === 0) return 'RECCE';
    return user.roles[0]?.name || 'RECCE';
  };

  const userRole = getUserRole();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={() => null} // Hide default tab bar
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        <Tab.Screen name="Users" component={UsersScreen} />
        <Tab.Screen name="Roles" component={RolesScreen} />
        <Tab.Screen name="Clients" component={ClientsScreen} />
        <Tab.Screen name="Stores" component={StoresScreen} />
        <Tab.Screen name="Recce" component={RecceScreen} />
        <Tab.Screen name="Installation" component={InstallationScreen} />
        <Tab.Screen name="Reports" component={ReportsScreen} />
        <Tab.Screen name="Enquiries" component={EnquiriesScreen} />
        <Tab.Screen name="RFQ" component={RFQScreen} />
        <Tab.Screen name="Elements" component={ElementsScreen} />
      </Tab.Navigator>
      
      {/* Role-based Footer Navigation */}
      <RoleBasedFooter />
    </View>
  );
};

// Tab Navigator Component (for media app)
const TabNavigator = () => {
  const { 
    currentAudioItem, 
    currentVideoItem,
    isAudioPlayerVisible,
    isVideoPlayerVisible,
    setAudioPlayerVisible,
    setVideoPlayerVisible,
    clearAudioPlayer,
    clearVideoPlayer
  } = useCurrentPlayer();
  
  const handleCloseMiniPlayer = () => {
    // Only hide the mini player, don't clear the audio/video
    if (currentAudioItem) {
      setAudioPlayerVisible(false);
    }
    if (currentVideoItem) {
      setVideoPlayerVisible(false);
    }
  };
  
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={(props) => <MyTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Categories" component={CategoriesStack} />
        <Tab.Screen name="Account" component={AccountStack} />
      </Tab.Navigator>
      
      {/* Show audio mini player when audio is playing and not in full screen */}
      {currentAudioItem && isAudioPlayerVisible && (
        <MiniPlayer 
          currentItem={currentAudioItem} 
          onClose={handleCloseMiniPlayer}
          type="audio"
        />
      )}
      
      {/* Show video mini player when video is playing and not in full screen */}
      {currentVideoItem && isVideoPlayerVisible && (
        <MiniPlayer 
          currentItem={currentVideoItem} 
          onClose={handleCloseMiniPlayer}
          type="video"
        />
      )}
    </View>
  );
};

// Main Dashboard with Drawer
const DashboardNavigator = () => {
  const { user } = useAuth();
  
  // Determine if user is in business mode (has business roles)
  const isBusinessUser = user?.roles?.some(role => 
    ['SUPER_ADMIN', 'CLIENT', 'STORE', 'RECCE', 'INSTALLATION'].includes(role?.name)
  );

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: 280,
        },
      }}
    >
      {isBusinessUser ? (
        <Drawer.Screen name="MainTabs" component={BusinessTabNavigator} />
      ) : (
        <Drawer.Screen name="MainTabs" component={TabNavigator} />
      )}
      
      <Drawer.Screen name="BookmarksScreen" component={BookmarksScreen} />
      <Drawer.Screen name="RecentlyPlayedScreen" component={RecentlyPlayedScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="About" component={AboutScreen} />
      <Drawer.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Drawer.Screen name="SearchScreen" component={SearchScreen} />
      <Drawer.Screen name="ReportIssue" component={ReportIssueScreen} />
      <Drawer.Screen name="FeatureRequest" component={FeatureRequestScreen} />
      <Drawer.Screen name="GalleryList" component={GalleryListScreen} />
      <Drawer.Screen 
        name="AuthModal" 
        component={AuthModalWrapper} 
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Drawer.Navigator>
  );
};

export default DashboardNavigator;

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 3,
    textAlign: 'center',
    fontWeight: '500',
    minHeight: 14,
  },
});
