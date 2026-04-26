/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Simplified entry point - removed complex dependencies that might cause crashes
// Removed: react-native-reanimated, GestureHandlerRootView

AppRegistry.registerComponent(appName, () => App);
