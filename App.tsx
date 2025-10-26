import { StatusBar, StyleSheet } from 'react-native';
import React from 'react';
import './src/localization/i18n';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { store } from './src/data/redux/store';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigation from './src/navigation/RootNavigation';
import {
  CombinedDarkNavigationTheme,
  CombinedDarkPaperTheme,
  CombinedLightNavigationTheme,
  CombinedLightPaperTheme,
} from './src/theme';
import { AudioPlayerProvider } from './src/context/AudioPlayerContext';
import { CurrentPlayerProvider } from './src/context/CurrentPlayerContext';
import { PlaylistProvider } from './src/context/PlaylistContext';
import { ThemeProvider, useThemeContext } from './src/context/ThemeContext';
import { RedirectProvider } from './src/context/RedirectContext';
import { MediaPlayerManagerProvider } from './src/context/MediaPlayerManager';
import { BookmarkProvider } from './src/context/BookmarkContext';
import { RecentlyPlayedProvider } from './src/context/RecentlyPlayedContext';

const ThemedApp = () => {
  const { theme, isThemeLoaded } = useThemeContext();

  if (!isThemeLoaded) {
    return null; // Or render a splash/loading screen
  }

  const isDarkMode = theme === 'dark';

  const paperTheme = isDarkMode ? CombinedDarkPaperTheme : CombinedLightPaperTheme;
  const navigationTheme = isDarkMode ? CombinedDarkNavigationTheme : CombinedLightNavigationTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <SafeAreaProvider>
        <SafeAreaView
          edges={['top']}
          style={{ flex: 1, backgroundColor: isDarkMode ? '#000' : '#F8803B' }}
        >
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <AuthProvider>
            <RedirectProvider>
              <BookmarkProvider>
                <RecentlyPlayedProvider>
                  <MediaPlayerManagerProvider>
                    <AudioPlayerProvider>
                      <CurrentPlayerProvider>
                        <PlaylistProvider>
                          <RootNavigation theme={navigationTheme} />
                        </PlaylistProvider>
                      </CurrentPlayerProvider>
                    </AudioPlayerProvider>
                  </MediaPlayerManagerProvider>
                </RecentlyPlayedProvider>
              </BookmarkProvider>
            </RedirectProvider>
          </AuthProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </Provider>
  );
};

export default App;

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