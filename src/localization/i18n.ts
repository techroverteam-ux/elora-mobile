import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./translations/en.json";
import hi from "./translations/hi.json";

const STORE_LANGUAGE_KEY = "settings.lang";

const languageDetectorPlugin = {
  type: 'languageDetector' as const,
  async: true,
  init: () => { },
  detect: async function (callback: (lang: string) => void) {
    try {
      await AsyncStorage.getItem(STORE_LANGUAGE_KEY).then((language) => {
        console.log("Active Language: ", language);
        if (language && ['en', 'hi'].includes(language)) {
          return callback(language);
        } else {
          return callback("en");
        }
      });
    } catch (error) {
      console.log("Error reading language", error);
      callback("en");
    }
  },
  cacheUserLanguage: async function (language: string) {
    try {
      await AsyncStorage.setItem(STORE_LANGUAGE_KEY, language);
      console.log("Language Changed To: ", language);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  },
};

const resources = {
  en: {
    translation: en,
  },
  hi: {
    translation: hi,
  },
};

i18n.use(initReactI18next).use(languageDetectorPlugin).init({
  resources,
  compatibilityJSON: 'v4',
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;