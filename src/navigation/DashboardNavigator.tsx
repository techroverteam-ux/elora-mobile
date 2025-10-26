import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View, Platform, Dimensions } from 'react-native';
import { useTheme, useLinkBuilder } from '@react-navigation/native';
import { PlatformPressable } from '@react-navigation/elements';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import stack navigators
import HomeStack from './stack/HomeStack';
import CategoriesStack from './stack/CategoriesStack';
import DownloadsStack from './stack/DownloadsStack';
import AccountStack from './stack/AccountStack';
import CustomDrawer from '../components/CustomDrawer';
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
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = Dimensions.get('window');
  
  // Calculate dynamic bottom padding based on device
  const getBottomPadding = () => {
    if (Platform.OS === 'ios') {
      return Math.max(insets.bottom, 10);
    }
    // For Android, check if device has gesture navigation
    const hasGestureNav = screenHeight > 800 && insets.bottom > 0;
    return hasGestureNav ? Math.max(insets.bottom + 5, 15) : 10;
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
      }
    ]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;
        const iconName: any = ICONS_MAP[route.name];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
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
            <Text style={[styles.tabLabel, { color: isFocused ? colors.primary : colors.text }]}>
              {label}
            </Text>
          </PlatformPressable>
        );
      })}
    </View>
  );
}

// Tab Navigator Component
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
      <Drawer.Screen name="MainTabs" component={TabNavigator} />
      <Drawer.Screen name="Downloads" component={DownloadsStack} />
      <Drawer.Screen name="BookmarksScreen" component={BookmarksScreen} />
      <Drawer.Screen name="RecentlyPlayedScreen" component={RecentlyPlayedScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="About" component={AboutScreen} />
      <Drawer.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Drawer.Screen name="SearchScreen" component={SearchScreen} />
      <Drawer.Screen name="ReportIssue" component={ReportIssueScreen} />
      <Drawer.Screen name="FeatureRequest" component={FeatureRequestScreen} />
      <Drawer.Screen name="GalleryList" component={GalleryListScreen} />
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
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});
