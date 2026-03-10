import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LoadingScreen from '../screens/LoadingScreen';
import CustomDrawer from '../components/CustomDrawer';

// Import all the screens
import UsersScreen from '../screens/users/UsersScreen';
import RolesScreen from '../screens/roles/RolesScreen';
import StoresScreen from '../screens/stores/StoresScreen';
import RecceScreen from '../screens/recce/RecceScreen';
import InstallationScreen from '../screens/installation/InstallationScreen';
import ElementsScreen from '../screens/elements/ElementsScreen';
import ClientsScreen from '../screens/clients/ClientsScreen';
import RFQScreen from '../screens/rfq/RFQScreen';
import EnquiriesScreen from '../screens/enquiries/EnquiriesScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Stack Navigator for Recce
function RecceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RecceList" component={RecceScreen} />
      <Stack.Screen name="RecceDetail" component={RecceScreen} />
      <Stack.Screen name="RecceForm" component={RecceScreen} />
    </Stack.Navigator>
  );
}

// Stack Navigator for Installation
function InstallationStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InstallationList" component={InstallationScreen} />
      <Stack.Screen name="InstallationDetail" component={InstallationScreen} />
      <Stack.Screen name="InstallationForm" component={require('../screens/installation/InstallationFormScreen').default} />
    </Stack.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: { width: 280 },
      }}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={(props) => <DashboardScreen {...props} onMenuPress={() => props.navigation.openDrawer()} />} 
      />
      <Drawer.Screen name="Users" component={UsersScreen} />
      <Drawer.Screen name="Roles" component={RolesScreen} />
      <Drawer.Screen name="Stores" component={StoresScreen} />
      <Drawer.Screen name="Recce" component={RecceStack} />
      <Drawer.Screen name="Installation" component={InstallationStack} />
      <Drawer.Screen name="Elements" component={ElementsScreen} />
      <Drawer.Screen name="Clients" component={ClientsScreen} />
      <Drawer.Screen name="RFQ" component={RFQScreen} />
      <Drawer.Screen name="Enquiries" component={EnquiriesScreen} />
      <Drawer.Screen name="Reports" component={ReportsScreen} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      ) : (
        <Stack.Screen name="Main" component={DrawerNavigator} />
      )}
    </Stack.Navigator>
  );
}