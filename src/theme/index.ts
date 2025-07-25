import {
  MD3LightTheme as PaperLightTheme,
  MD3DarkTheme as PaperDarkTheme,
} from 'react-native-paper';
import {
  DefaultTheme as NavigationLightTheme,
  DarkTheme as NavigationDarkTheme,
  Theme as NavigationThemeType,
} from '@react-navigation/native';

// Use only colors from one theme and pass into the other
export const CombinedLightPaperTheme = {
  ...PaperLightTheme,
  colors: {
    ...PaperLightTheme.colors,
    primary: '#F8803B',
  },
};

export const CombinedDarkPaperTheme = {
  ...PaperDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,
    primary: '#F8803B',
  },
};

export const CombinedLightNavigationTheme: NavigationThemeType = {
  ...NavigationLightTheme,
  colors: {
    ...NavigationLightTheme.colors,
    primary: '#F8803B',
    background: '#FFFFFF',
  },
};

export const CombinedDarkNavigationTheme: NavigationThemeType = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: '#F8803B',
    background: '#000000',
  },
};
