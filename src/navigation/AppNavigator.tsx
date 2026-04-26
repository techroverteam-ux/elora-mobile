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
      <Stack.Screen name="RecceDetail" component={require('../screens/recce/RecceDetailScreen').default} />
      <Stack.Screen name="RecceForm" component={require('../screens/recce/RecceFormScreen').default} />
      <Stack.Screen name="RecceReview" component={require('../screens/recce/RecceReviewScreen').default} />
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
  const { user } = useAuth();
  
  // Use exact same permission logic as web portal
  const canAccessScreen = (moduleName: string) => {
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
      
      {/* Conditionally render screens based on user roles - same logic as web portal */}
      {canAccessScreen('users') && (
        <Drawer.Screen name="Users" component={UsersScreen} />
      )}
      {canAccessScreen('roles') && (
        <Drawer.Screen name="Roles" component={RolesScreen} />
      )}
      {canAccessScreen('stores') && (
        <Drawer.Screen name="Stores" component={StoresScreen} />
      )}
      {canAccessScreen('recce') && (
        <Drawer.Screen name="Recce" component={RecceStack} />
      )}
      {canAccessScreen('installation') && (
        <Drawer.Screen name="Installation" component={InstallationStack} />
      )}
      {canAccessScreen('elements') && (
        <Drawer.Screen name="Elements" component={ElementsScreen} />
      )}
      {canAccessScreen('clients') && (
        <Drawer.Screen name="Clients" component={ClientsScreen} />
      )}
      {canAccessScreen('rfq') && (
        <Drawer.Screen name="RFQ" component={RFQScreen} />
      )}
      {canAccessScreen('enquiries') && (
        <Drawer.Screen name="Enquiries" component={EnquiriesScreen} />
      )}
      {canAccessScreen('reports') && (
        <Drawer.Screen name="Reports" component={ReportsScreen} />
      )}
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