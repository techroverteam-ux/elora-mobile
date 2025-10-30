import { useTranslation } from 'react-i18next';
import { translateSimple, translateObjectSimple, translateArraySimple } from '../utils/simpleTranslator';

/**
 * Hook for translating API content based on current language
 */
export const useContentTranslation = () => {
  const { i18n } = useTranslation();

  const translateText = (text: string): string => {
    return translateSimple(text);
  };

  const translateItem = <T extends Record<string, any>>(
    item: T,
    fieldsToTranslate?: (keyof T)[]
  ): T => {
    return translateObjectSimple(item, fieldsToTranslate);
  };

  const translateItems = <T extends Record<string, any>>(
    items: T[],
    fieldsToTranslate?: (keyof T)[]
  ): T[] => {
    return translateArraySimple(items, fieldsToTranslate);
  };

  return {
    translateText,
    translateItem,
    translateItems,
    currentLanguage: i18n.language,
    isHindi: i18n.language === 'hi'
  };
};