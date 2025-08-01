import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, useLinkBuilder } from '@react-navigation/native';
import { PlatformPressable } from '@react-navigation/elements';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

// Import stack navigators
import HomeStack from './stack/HomeStack';
import CategoriesStack from './stack/CategoriesStack';
import DownloadsStack from './stack/DownloadsStack';
import AccountStack from './stack/AccountStack';

const Tab = createBottomTabNavigator();

const ICONS_MAP: Record<string, string> = {
  Home: 'home-outline',
  Categories: 'view-dashboard-outline',
  Downloads: 'download-outline',
  Account: 'account-outline',
};

function MyTabBar({ state, descriptors, navigation }: any) {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();

  // Only show tab bar if there is only one route
  console.log("state.routes", state);
  if (state.routes[state.index]?.state?.routes?.length > 1) return null;

  return (
    <View style={[styles.tabBarContainer, { backgroundColor: colors.card }]}>
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

const DashboardNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <MyTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Categories" component={CategoriesStack} />
      <Tab.Screen name="Downloads" component={DownloadsStack} />
      <Tab.Screen name="Account" component={AccountStack} />
    </Tab.Navigator>
  );
};

export default DashboardNavigator;

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingBottom: 10,
    paddingTop: 6,
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
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});
