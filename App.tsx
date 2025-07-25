import { StatusBar, StyleSheet, useColorScheme } from 'react-native'
import React from 'react'
import "./src/localization/i18n";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { store } from './src/data/redux/store';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigation from './src/navigation/RootNavigation';
import { CombinedDarkNavigationTheme, CombinedDarkPaperTheme, CombinedLightNavigationTheme, CombinedLightPaperTheme } from './src/theme';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const paperTheme = isDarkMode ? CombinedDarkPaperTheme : CombinedLightPaperTheme;
  const navigationTheme = isDarkMode ? CombinedDarkNavigationTheme : CombinedLightNavigationTheme;

  return (
    <Provider store={store}>
      <PaperProvider theme={paperTheme}>
        <SafeAreaProvider>
          <SafeAreaView
            edges={['top']}
            style={{ flex: 1, backgroundColor: isDarkMode ? '#000' : "#F8803B" }}
          >
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <AuthProvider>
              <RootNavigation theme={navigationTheme} />
            </AuthProvider>
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