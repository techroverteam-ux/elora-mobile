import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { permissionService } from './src/services/permissionService';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import ScreenLayout from './src/components/ScreenLayout';
import CustomDrawer from './src/components/CustomDrawer';
import Toast from 'react-native-toast-message';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';

// Import all existing screens (excluding problematic ones)
import UsersScreen from './src/screens/users/UsersScreen';
import RolesScreen from './src/screens/roles/RolesScreen';
// import StoresScreen from './src/screens/stores/StoresScreen'; // Commented out due to Picker dependency
import StoresScreen from './src/screens/stores/StoresScreen';
import StoreDetailScreen from './src/screens/stores/StoreDetailScreen';
import RecceDetailScreen from './src/screens/recce/RecceDetailScreen';
import InstallationDetailScreen from './src/screens/installation/InstallationDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RecceScreen from './src/screens/recce/RecceScreen';
import InstallationScreen from './src/screens/installation/InstallationScreen';
import ElementsScreen from './src/screens/elements/ElementsScreen';
import ClientsScreen from './src/screens/clients/ClientsScreen';
import RFQScreen from './src/screens/rfq/RFQScreen';
import EnquiriesScreen from './src/screens/enquiries/EnquiriesScreen';
import ReportsScreen from './src/screens/reports/ReportsScreen';
import AnalyticsScreen from './src/screens/analytics/AnalyticsScreen';
import RecceFormScreen from './src/screens/recce/RecceFormScreen';
import NotificationsScreen from './src/screens/notifications/NotificationsScreen';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = 280;

// Main app content using conditional rendering with simple drawer
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('Dashboard');
  const [navigationParams, setNavigationParams] = useState<any>(null);
  const [permissionsRequested, setPermissionsRequested] = useState(false);

  // Request permissions when app starts
  useEffect(() => {
    const requestPermissions = async () => {
      if (!permissionsRequested) {
        console.log('App started - requesting camera permissions...');
        await permissionService.requestInitialPermissions();
        setPermissionsRequested(true);
      }
    };
    
    if (!showSplash && isAuthenticated) {
      requestPermissions();
    }
  }, [showSplash, isAuthenticated, permissionsRequested]);

  const openDrawer = () => {
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const navigateToScreen = (screenName: string, params?: any) => {
    setCurrentScreen(screenName);
    setNavigationParams(params);
    closeDrawer();
  };

  const renderCurrentScreen = () => {
    const screenProps = { onMenuPress: openDrawer };
    
    switch (currentScreen) {
      case 'Dashboard':
        return <DashboardScreen onMenuPress={openDrawer} onProfilePress={() => navigateToScreen('Profile')} />;
      case 'Users':
        return (
          <ScreenLayout 
            onMenuPress={openDrawer}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <UsersScreen />
          </ScreenLayout>
        );
      case 'Roles':
        return (
          <ScreenLayout 
            onMenuPress={openDrawer}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <RolesScreen />
          </ScreenLayout>
        );
      case 'Stores':
        return (
          <ScreenLayout 
            onMenuPress={openDrawer}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <StoresScreen navigation={{ navigate: navigateToScreen }} />
          </ScreenLayout>
        );
      case 'StoreDetail':
        return (
          <ScreenLayout 
            onMenuPress={openDrawer}
            onBackPress={() => navigateToScreen('Stores')}
            showBackButton={true}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <StoreDetailScreen 
              route={{ params: navigationParams }}
              navigation={{ goBack: () => navigateToScreen('Stores') }}
            />
          </ScreenLayout>
        );
      case 'RecceDetail':
        return (
          <ScreenLayout 
            onMenuPress={openDrawer}
            onBackPress={() => navigateToScreen('Recce')}
            showBackButton={true}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <RecceDetailScreen 
              route={{ params: navigationParams }}
              navigation={{ goBack: () => navigateToScreen('Recce') }}
            />
          </ScreenLayout>
        );
      case 'InstallationDetail':
        return (
          <ScreenLayout 
            title="Installation Details" 
            onMenuPress={openDrawer}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <InstallationDetailScreen 
              route={{ params: navigationParams }}
              navigation={{ goBack: () => navigateToScreen('Installation') }}
            />
          </ScreenLayout>
        );
      case 'Profile':
        return (
          <ScreenLayout 
            title="Profile" 
            onMenuPress={openDrawer}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <ProfileScreen 
              navigation={{ goBack: () => navigateToScreen('Dashboard') }}
            />
          </ScreenLayout>
        );
      case 'Recce':
        return (
          <ScreenLayout 
            title="Recce" 
            onMenuPress={openDrawer}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <RecceScreen navigation={{ navigate: navigateToScreen }} />
          </ScreenLayout>
        );
      case 'Installation':
        return (
          <ScreenLayout 
            title="Installation" 
            onMenuPress={openDrawer}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <InstallationScreen navigation={{ navigate: navigateToScreen }} />
          </ScreenLayout>
        );
      case 'Elements':
        return (
          <ScreenLayout 
            title="Element Mapping" 
            onMenuPress={openDrawer}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <ElementsScreen />
          </ScreenLayout>
        );
      case 'Clients':
        return (
          <ScreenLayout 
            onMenuPress={openDrawer}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <ClientsScreen />
          </ScreenLayout>
        );
      case 'RFQ':
        return (
          <ScreenLayout 
            title="RFQ Generation" 
            onMenuPress={openDrawer}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <RFQScreen />
          </ScreenLayout>
        );
      case 'Enquiries':
        return (
          <ScreenLayout 
            title="Enquiries" 
            onMenuPress={openDrawer}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <EnquiriesScreen />
          </ScreenLayout>
        );
      case 'Reports':
        return (
          <ScreenLayout 
            title="Reports" 
            onMenuPress={openDrawer}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <ReportsScreen />
          </ScreenLayout>
        );
      case 'Analytics':
        return (
          <ScreenLayout 
            onMenuPress={openDrawer}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <AnalyticsScreen />
          </ScreenLayout>
        );
      case 'RecceForm':
        return (
          <ScreenLayout 
            onMenuPress={openDrawer}
            onBackPress={() => navigateToScreen('Recce')}
            showBackButton={true}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <RecceFormScreen 
              route={{ params: navigationParams }}
              navigation={{ goBack: () => navigateToScreen('Recce') }}
            />
          </ScreenLayout>
        );
      default:
        return <DashboardScreen onMenuPress={openDrawer} />;
    }
  };

  if (showSplash) {
    setTimeout(() => setShowSplash(false), 3000); // Reduced splash time
    return <SplashScreen />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <View style={styles.container}>
      {renderCurrentScreen()}
      
      {/* Simple Drawer Modal */}
      {isDrawerOpen && (
        <View style={styles.drawerContainer}>
          <TouchableOpacity style={styles.overlay} onPress={closeDrawer} />
          <View style={styles.drawer}>
            <CustomDrawer 
              navigation={{ 
                navigate: navigateToScreen, 
                closeDrawer 
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppContent />
          </NavigationContainer>
          <Toast 
            position='bottom'
            bottomOffset={60}
            visibilityTime={3000}
            autoHide={true}
            topOffset={60}
            config={{
              success: (props) => (
                <View style={{
                  backgroundColor: '#10B981',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 25,
                  marginHorizontal: 20,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                }}>
                  <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                    {props.text1}
                  </Text>
                  {props.text2 && (
                    <Text style={{ color: '#FFF', fontSize: 14, marginTop: 4, textAlign: 'center' }}>
                      {props.text2}
                    </Text>
                  )}
                </View>
              ),
              error: (props) => (
                <View style={{
                  backgroundColor: '#EF4444',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 25,
                  marginHorizontal: 20,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                }}>
                  <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                    {props.text1}
                  </Text>
                  {props.text2 && (
                    <Text style={{ color: '#FFF', fontSize: 14, marginTop: 4, textAlign: 'center' }}>
                      {props.text2}
                    </Text>
                  )}
                </View>
              ),
              info: (props) => (
                <View style={{
                  backgroundColor: '#3B82F6',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 25,
                  marginHorizontal: 20,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                }}>
                  <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                    {props.text1}
                  </Text>
                  {props.text2 && (
                    <Text style={{ color: '#FFF', fontSize: 14, marginTop: 4, textAlign: 'center' }}>
                      {props.text2}
                    </Text>
                  )}
                </View>
              ),
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default App;