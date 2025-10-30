import i18n from '../localization/i18n';

// Simple direct translation mapping for API content
const apiTranslations: Record<string, string> = {
  // Direct API content translations
  'Geeta Bal Sanskar Offline': 'गीता बाल संस्कार ऑफलाइन',
  'Govind Bolo Hari Gopal bolo': 'गोविंद बोलो हरि गोपाल बोलो',
  
  // Common words that appear in API
  'Educational': 'शैक्षिक',
  'Spiritual': 'आध्यात्मिक',
  'Devotional': 'भक्ति',
  'Stories': 'कहानियां',
  'Bhajans': 'भजन',
  'Mantras': 'मंत्र',
  'Prayers': 'प्रार्थनाएं',
  'Meditation': 'ध्यान',
  'Yoga': 'योग',
  'Wisdom': 'ज्ञान',
  'Teachings': 'शिक्षाएं',
  'Values': 'मूल्य',
  'Culture': 'संस्कृति',
  'Tradition': 'परंपरा',
  'Festivals': 'त्योहार',
  'Worship': 'पूजा',
  'Faith': 'श्रद्धा',
  'Peace': 'शांति',
  'Love': 'प्रेम',
  'Truth': 'सत्य',
  'Dharma': 'धर्म',
  'Karma': 'कर्म',
  'Divine': 'दिव्य',
  'Sacred': 'पवित्र',
  'Holy': 'पवित्र',
  'Pure': 'शुद्ध',
  'Ancient': 'प्राचीन',
  'Traditional': 'पारंपरिक',
  'Krishna': 'कृष्ण',
  'Rama': 'राम',
  'Hanuman': 'हनुमान',
  'Shiva': 'शिव',
  'Gita': 'गीता',
  'Geeta': 'गीता',
  'Ramayana': 'रामायण',
  'Bal': 'बाल',
  'Sanskar': 'संस्कार',
  'Children': 'बच्चे',
  'Kids': 'बच्चे',
  'Family': 'परिवार',
  'Gallery': 'गैलरी',
  'Offline': 'ऑफलाइन',
  'Online': 'ऑनलाइन',
  'Content': 'सामग्री',
  'Learning': 'शिक्षा',
  'Knowledge': 'ज्ञान',
  'Guidance': 'मार्गदर्शन',
  'Blessings': 'आशीर्वाद',
  'Devotion': 'भक्ति',
  'Enlightenment': 'ज्ञान',
  'Consciousness': 'चेतना',
  'Soul': 'आत्मा',
  'Spirit': 'आत्मा',
  'Eternal': 'शाश्वत',
  'Universal': 'सार्वभौमिक',
  'Peaceful': 'शांतिपूर्ण',
  'Beautiful': 'सुंदर',
  'Wonderful': 'अद्भुत',
  'Amazing': 'आश्चर्यजनक',
  'Magical': 'जादुई',
  'Mystical': 'रहस्यमय',
  'Timeless': 'कालातीत',
  'Immortal': 'अमर',
  'Blessed': 'धन्य',
  'Compassion': 'करुणा',
  'Kindness': 'दया',
  'Salvation': 'मुक्ति',
  'Liberation': 'मुक्ति',
  'Awakening': 'जागृति',
  'Inner': 'आंतरिक',
  'Outer': 'बाहरी',
  'Higher': 'उच्च',
  'Lower': 'निम्न',
  'Supreme': 'परम',
  'Ultimate': 'परम',
  'Infinite': 'अनंत',
  'Eternal': 'शाश्वत',
  'Everlasting': 'चिरस्थायी',
  'Imperishable': 'अविनाशी',
  'Indestructible': 'अविनाशी'
};

/**
 * Simple and direct translation function
 */
export const translateSimple = (text: string): string => {
  if (!text || typeof text !== 'string') return text;
  
  const currentLanguage = i18n.language;
  if (currentLanguage !== 'hi' && currentLanguage !== 'sa') return text;
  
  console.log('🔄 Simple translating:', text);
  
  // Direct match first
  if (apiTranslations[text]) {
    console.log('✅ Direct translation found:', apiTranslations[text]);
    return apiTranslations[text];
  }
  
  // Sanskrit specific translations
  if (currentLanguage === 'sa') {
    const sanskritTranslations: Record<string, string> = {
      'Geeta Bal Sanskar Offline': 'गीता बाल संस्कारः अप्रवाहितः',
      'Govind Bolo Hari Gopal bolo': 'गोविन्दं ब्रूहि हरिं गोपालं ब्रूहि',
      'Educational': 'शैक्षिकम्',
      'Spiritual': 'आध्यात्मिकम्',
      'Devotional': 'भक्तिमयम्',
      'Stories': 'कथाः',
      'Bhajans': 'भजनानि',
      'Mantras': 'मन्त्राः',
      'Prayers': 'प्रार्थनाः',
      'Meditation': 'ध्यानम्',
      'Yoga': 'योगः',
      'Wisdom': 'ज्ञानम्',
      'Teachings': 'उपदेशाः',
      'Values': 'मूल्यानि',
      'Culture': 'संस्कृतिः',
      'Tradition': 'परम्परा',
      'Festivals': 'उत्सवाः',
      'Worship': 'पूजा',
      'Faith': 'श्रद्धा',
      'Peace': 'शान्तिः',
      'Love': 'प्रेम',
      'Truth': 'सत्यम्',
      'Dharma': 'धर्मः',
      'Karma': 'कर्म',
      'Divine': 'दिव्यम्',
      'Sacred': 'पवित्रम्',
      'Holy': 'पवित्रम्',
      'Pure': 'शुद्धम्',
      'Ancient': 'प्राचीनम्',
      'Traditional': 'पारम्परिकम्',
      'Krishna': 'कृष्णः',
      'Rama': 'रामः',
      'Hanuman': 'हनुमान्',
      'Shiva': 'शिवः',
      'Gita': 'गीता',
      'Geeta': 'गीता',
      'Ramayana': 'रामायणम्',
      'Bal': 'बालः',
      'Sanskar': 'संस्कारः',
      'Children': 'बालाः',
      'Kids': 'बालाः',
      'Family': 'परिवारः',
      'Gallery': 'चित्रशाला',
      'Offline': 'अप्रवाहितम्',
      'Online': 'प्रवाहितम्',
      'Content': 'सामग्री',
      'Learning': 'अध्ययनम्',
      'Knowledge': 'ज्ञानम्',
      'Guidance': 'मार्गदर्शनम्'
    };
    
    if (sanskritTranslations[text]) {
      console.log('✅ Sanskrit translation found:', sanskritTranslations[text]);
      return sanskritTranslations[text];
    }
  }
  
  // Case insensitive match
  const lowerText = text.toLowerCase();
  const matchKey = Object.keys(apiTranslations).find(key => key.toLowerCase() === lowerText);
  if (matchKey) {
    console.log('✅ Case-insensitive translation found:', apiTranslations[matchKey]);
    return apiTranslations[matchKey];
  }
  
  // Word by word replacement
  let result = text;
  let hasChange = false;
  
  Object.entries(apiTranslations).forEach(([english, hindi]) => {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    if (regex.test(result)) {
      result = result.replace(regex, hindi);
      hasChange = true;
      console.log(`🔄 Replaced "${english}" with "${hindi}"`);
    }
  });
  
  if (hasChange) {
    console.log('✅ Final simple translation:', result);
    return result;
  }
  
  console.log('❌ No simple translation found, keeping original:', text);
  return text;
};

/**
 * Translate object with simple method
 */
export const translateObjectSimple = <T extends Record<string, any>>(
  obj: T,
  fieldsToTranslate: (keyof T)[] = ['title', 'description', 'name']
): T => {
  const translated = { ...obj };
  
  fieldsToTranslate.forEach(field => {
    if (translated[field] && typeof translated[field] === 'string') {
      translated[field] = translateSimple(translated[field] as string);
    }
  });
  
  return translated;
};

/**
 * Translate array with simple method
 */
export const translateArraySimple = <T extends Record<string, any>>(
  array: T[],
  fieldsToTranslate?: (keyof T)[]
): T[] => {
  return array.map(item => translateObjectSimple(item, fieldsToTranslate));
};