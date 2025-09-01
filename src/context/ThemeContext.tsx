import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemePreference = 'light' | 'dark' | 'system';
type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
  isThemeLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  preference: 'system',
  setPreference: () => { },
  isThemeLoaded: false,
});

export const useThemeContext = () => useContext(ThemeContext);

const STORAGE_KEY = 'user-theme-preference';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [theme, setTheme] = useState<ThemeType>('light');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  const resolveTheme = (pref: ThemePreference, systemScheme?: ColorSchemeName) => {
    if (pref === 'system') {
      // Use provided systemScheme or fallback to Appearance.getColorScheme()
      const system = systemScheme || Appearance.getColorScheme();
      setTheme(system === 'dark' ? 'dark' : 'light');
    } else {
      setTheme(pref);
    }
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedPref = await AsyncStorage.getItem(STORAGE_KEY) as ThemePreference | null;
        const finalPref: ThemePreference = storedPref || 'system';
        setPreferenceState(finalPref);
        resolveTheme(finalPref);
      } catch (e) {
        console.error('Failed to load theme preference', e);
      } finally {
        setIsThemeLoaded(true);
      }
    };

    loadTheme();

    // Subscribe to system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (preference === 'system') {
        resolveTheme('system', colorScheme);
      }
    });

    // Cleanup subscription on unmount
    return () => subscription.remove();
  }, [preference]);

  const setPreference = async (pref: ThemePreference) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, pref);
      setPreferenceState(pref);
      resolveTheme(pref);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference, isThemeLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};
