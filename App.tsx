// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */

// import { NewAppScreen } from '@react-native/new-app-screen';
// import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//       <NewAppScreen templateFileName="App.tsx" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });

// export default App;

import {
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AppNavigator from './src/AppNavigator';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <SafeAreaView
        edges={['top', 'bottom']}
        style={{ flex: 1, backgroundColor: isDarkMode ? '#000' : '#fff' }}
      >
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppNavigator />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({});
