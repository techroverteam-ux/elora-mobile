import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { ThemedAlertProvider } from './src/context/ThemedAlertProvider';
import { DownloadModalProvider } from './src/services/downloadModalService';
import DownloadModalContainer from './src/components/DownloadModalContainer';
import { setupCrashHandler } from './src/utils/crashHandler';
import { pushNotificationService } from './src/services/pushNotificationService';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import ScreenLayout from './src/components/ScreenLayout';
import CustomDrawer from './src/components/CustomDrawer';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/components/ui/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, BackHandler } from 'react-native';

// Setup crash handler immediately
setupCrashHandler();

// Initialize push notifications
pushNotificationService; // This will trigger the constructor

// Import ALL screens including the ones that were removed
import ProfileScreen from './src/screens/ProfileScreen';
import RecceScreen from './src/screens/recce/RecceScreen';
import InstallationScreen from './src/screens/installation/InstallationScreen';
import StoresScreen from './src/screens/stores/StoresScreen';
import StoreDetailScreen from './src/screens/stores/StoreDetailScreen';
import RecceDetailScreen from './src/screens/recce/RecceDetailScreen';
import InstallationDetailScreen from './src/screens/installation/InstallationDetailScreen';
import RecceFormScreen from './src/screens/recce/RecceFormScreen';
import RecceReviewScreen from './src/screens/recce/RecceReviewScreen';
import InstallationFormScreen from './src/screens/installation/InstallationFormScreen';

// Add back the screens that were removed
import UsersScreen from './src/screens/users/UsersScreen';
import UserDetailScreen from './src/screens/users/UserDetailScreen';
import RolesScreen from './src/screens/roles/RolesScreen';
import ElementsScreen from './src/screens/elements/ElementsScreen';
import ClientsScreen from './src/screens/clients/ClientsScreen';
import RFQScreen from './src/screens/rfq/RFQScreen';
import EnquiriesScreen from './src/screens/enquiries/EnquiriesScreen';
import ReportsScreen from './src/screens/reports/ReportsScreen';
import AnalyticsScreen from './src/screens/analytics/AnalyticsScreen';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = 280;

// Main app content with ALL screens now included
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('Dashboard');
  const [navigationParams, setNavigationParams] = useState<any>(null);

  const openDrawer = () => {
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Auto-restore active screen whenever app starts or user returns
  useEffect(() => {
    let isMounted = true;
    const restoreActiveState = async () => {
      try {
        const savedScreen = await AsyncStorage.getItem('@active_screen');
        const savedParamsStr = await AsyncStorage.getItem('@active_navigation_params');
        if (isMounted && savedScreen && savedScreen !== 'Dashboard') {
          const parsedParams = savedParamsStr ? JSON.parse(savedParamsStr) : null;
          setCurrentScreen(savedScreen);
          setNavigationParams(parsedParams);
        }
      } catch (e) {
        console.warn('Failed to restore active screen state:', e);
      }
    };

    if (isAuthenticated) {
      restoreActiveState();
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Clear active screen on explicit logout
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      AsyncStorage.removeItem('@active_screen');
      AsyncStorage.removeItem('@active_navigation_params');
      setCurrentScreen('Dashboard');
      setNavigationParams(null);
    }
  }, [isAuthenticated, isLoading]);

  // Hardware back button support for Android
  useEffect(() => {
    const handleHardwareBack = () => {
      if (isDrawerOpen) {
        closeDrawer();
        return true;
      }
      if (currentScreen !== 'Dashboard') {
        if (currentScreen === 'StoreDetail') {
          navigateToScreen('Stores');
          return true;
        }
        if (currentScreen === 'RecceDetail' || currentScreen === 'RecceForm' || currentScreen === 'RecceReview') {
          navigateToScreen('Recce');
          return true;
        }
        if (currentScreen === 'InstallationDetail' || currentScreen === 'InstallationForm') {
          navigateToScreen('Installation');
          return true;
        }
        if (currentScreen === 'UserDetail') {
          navigateToScreen('Users');
          return true;
        }
        navigateToScreen('Dashboard');
        return true;
      }
      return false; // On Dashboard, let Android minimize the app
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);
    return () => backSub.remove();
  }, [currentScreen, isDrawerOpen]);

  const navigateToScreen = (screenName: string, params?: any) => {
    setCurrentScreen(screenName);
    setNavigationParams(params);
    closeDrawer();

    // Persist screen state so app minimization/switching/calls never resets screen
    try {
      if (screenName && screenName !== 'Dashboard') {
        AsyncStorage.setItem('@active_screen', screenName);
        if (params) {
          AsyncStorage.setItem('@active_navigation_params', JSON.stringify(params));
        } else {
          AsyncStorage.removeItem('@active_navigation_params');
        }
      } else {
        AsyncStorage.removeItem('@active_screen');
        AsyncStorage.removeItem('@active_navigation_params');
      }
    } catch (e) {
      console.warn('Failed to save active screen state:', e);
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'Dashboard':
        return <DashboardScreen onMenuPress={openDrawer} onProfilePress={() => navigateToScreen('Profile')} onNavigate={navigateToScreen} />;
      
      case 'Profile':
        return (
          <ScreenLayout 
            title="Profile" 
            onMenuPress={openDrawer}
            onBackPress={() => navigateToScreen('Dashboard')}
            showBackButton={true}
          >
            <ProfileScreen 
              navigation={{ goBack: () => navigateToScreen('Dashboard') }}
            />
          </ScreenLayout>
        );
      
      // Users Management
      case 'Users':
        return (
          <ScreenLayout
            title="Users Management"
            onMenuPress={openDrawer}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <UsersScreen navigation={{ navigate: navigateToScreen }} />
          </ScreenLayout>
        );

      case 'UserDetail':
        return (
          <ScreenLayout
            title="User Details"
            onMenuPress={openDrawer}
            onBackPress={() => navigateToScreen('Users')}
            showBackButton={true}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <UserDetailScreen route={{ params: navigationParams }} />
          </ScreenLayout>
        );

      // Roles Management
      case 'Roles':
        return (
          <ScreenLayout 
            title="Roles Management"
            onMenuPress={openDrawer}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <RolesScreen />
          </ScreenLayout>
        );
      
      // Elements Mapping
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
      
      // Clients Management
      case 'Clients':
        return (
          <ScreenLayout 
            title="Clients Management"
            onMenuPress={openDrawer}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <ClientsScreen />
          </ScreenLayout>
        );
      
      // RFQ Generation
      case 'RFQ':
        return (
          <ScreenLayout 
            title="RFQ Generation" 
            onMenuPress={openDrawer}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <RFQScreen navigation={{ navigate: navigateToScreen }} />
          </ScreenLayout>
        );
      
      // Enquiries
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
      
      // Reports
      case 'Reports':
        return (
          <ScreenLayout
            title="Reports"
            onMenuPress={openDrawer}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <ReportsScreen navigation={{ navigate: navigateToScreen }} />
          </ScreenLayout>
        );
      
      // Analytics
      case 'Analytics':
        return (
          <ScreenLayout 
            title="Analytics"
            onMenuPress={openDrawer}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <AnalyticsScreen />
          </ScreenLayout>
        );
      
      case 'Stores':
        return (
          <ScreenLayout 
            title="Stores"
            onMenuPress={openDrawer}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <StoresScreen navigation={{ navigate: navigateToScreen }} />
          </ScreenLayout>
        );
      
      case 'StoreDetail':
        return (
          <ScreenLayout 
            title="Store Details"
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
      
      case 'RecceDetail':
        return (
          <ScreenLayout 
            title="Recce Details"
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
      
      case 'RecceForm':
        return (
          <ScreenLayout 
            title="Recce Form"
            onMenuPress={openDrawer}
            onBackPress={() => navigateToScreen('Recce')}
            showBackButton={true}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <RecceFormScreen 
              route={{ params: navigationParams }}
              navigation={{ 
                goBack: () => navigateToScreen('Recce'),
                navigate: navigateToScreen,
              }}
            />
          </ScreenLayout>
        );
      
      case 'RecceReview':
        return (
          <ScreenLayout 
            title="Review Recce Photos"
            onMenuPress={openDrawer}
            onBackPress={() => navigateToScreen('Recce')}
            showBackButton={true}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <RecceReviewScreen 
              route={{ params: navigationParams }}
              navigation={{ 
                goBack: () => navigateToScreen('Recce'),
                navigate: navigateToScreen,
              }}
            />
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
      
      case 'InstallationDetail':
        return (
          <ScreenLayout 
            title="Installation Details" 
            onMenuPress={openDrawer}
            onBackPress={() => navigateToScreen('Installation')}
            showBackButton={true}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <InstallationDetailScreen 
              route={{ params: navigationParams }}
              navigation={{ goBack: () => navigateToScreen('Installation') }}
            />
          </ScreenLayout>
        );
      
      case 'InstallationForm':
        return (
          <ScreenLayout 
            title="Installation Form"
            onMenuPress={openDrawer}
            onBackPress={() => navigateToScreen('Installation')}
            showBackButton={true}
            onProfilePress={() => navigateToScreen('Profile')}
          >
            <InstallationFormScreen 
              route={{ params: navigationParams }}
              navigation={{ 
                goBack: () => navigateToScreen('Installation'),
                navigate: navigateToScreen,
              }}
            />
          </ScreenLayout>
        );
      
      default:
        return <DashboardScreen onMenuPress={openDrawer} onProfilePress={() => navigateToScreen('Profile')} onNavigate={navigateToScreen} />;
    }
  };

  if (showSplash) {
    setTimeout(() => setShowSplash(false), 2000);
    return <SplashScreen />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <LoginScreen />
      </View>
    );
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

const MinimizedOriginalApp = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedAlertProvider>
          <DownloadModalProvider>
            <AuthProvider>
              <NavigationContainer>
                <AppContent />
              </NavigationContainer>
              <Toast
                position='bottom'
                bottomOffset={100}
                visibilityTime={4000}
                autoHide={true}
                config={toastConfig}
              />
              <DownloadModalContainer />
            </AuthProvider>
          </DownloadModalProvider>
        </ThemedAlertProvider>
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
  toastSuccess: {
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
  },
  toastError: {
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
  },
  toastInfo: {
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
  },
  toastText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  toastSubText: {
    color: '#FFF',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default MinimizedOriginalApp;