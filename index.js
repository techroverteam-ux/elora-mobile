/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';

import App from './App';
import { name as appName } from './app.json';

// Known, harmless dev warnings — hidden from LogBox and the DevTools console.
//  • Legacy Architecture notice: we run with newArchEnabled=false on purpose
//    (moving to the New Architecture is a separate, planned migration).
//  • "<ViewManager> is unlikely to work with the New Architecture": comes from
//    @react-native-community/slider; only matters after that migration.
LogBox.ignoreLogs([
  'The app is running using the Legacy Architecture',
  /is unlikely to work with the New Architecture/,
]);

// Simplified entry point - removed complex dependencies that might cause crashes
// Removed: react-native-reanimated, GestureHandlerRootView

AppRegistry.registerComponent(appName, () => App);
