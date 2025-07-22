import { StatusBar, StyleSheet, useColorScheme } from 'react-native'
import React from 'react'
import "./src/localization/i18n";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import AppNavigator from './src/AppNavigator';
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { store } from './src/data/redux/store';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <PaperProvider>
        <SafeAreaProvider>
          <SafeAreaView
            edges={['top', 'bottom']}
            style={{ flex: 1, backgroundColor: isDarkMode ? '#000' : '#fff' }}
          >
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <AppNavigator />
          </SafeAreaView>
        </SafeAreaProvider>
      </PaperProvider>
    </Provider>
  )
}

export default App

const styles = StyleSheet.create({})


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