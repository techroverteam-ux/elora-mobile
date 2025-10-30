import i18n from '../localization/i18n';

// Enhanced translation mappings with AI-like intelligence
const spiritualTranslations: Record<string, string> = {
  // Exact API matches from your data
  'Geeta Bal Sanskar Offline': 'गीता बाल संस्कार ऑफलाइन',
  'Govind Bolo Hari Gopal bolo': 'गोविंद बोलो हरि गोपाल बोलो',
  'geeta-bal-sanskar-offline': 'गीता-बाल-संस्कार-ऑफलाइन',
  'gallery': 'गैलरी',
  'Gallery': 'गैलरी',
  'sections': 'अनुभाग',
  'Sections': 'अनुभाग',
  'offline': 'ऑफलाइन',
  'Offline': 'ऑफलाइन',
  
  // Common spiritual terms
  'Educational': 'शैक्षिक',
  'Spiritual': 'आध्यात्मिक', 
  'Devotional': 'भक्ति',
  'Stories': 'कहानियां',
  'Bhajans': 'भजन',
  'Mantras': 'मंत्र',
  'Prayers': 'प्रार्थनाएं',
  'Meditation': 'ध्यान',
  'Yoga': 'योग',
  'Philosophy': 'दर्शन',
  'Wisdom': 'ज्ञान',
  'Teachings': 'शिक्षाएं',
  'Scriptures': 'शास्त्र',
  'Values': 'मूल्य',
  'Culture': 'संस्कृति',
  'Tradition': 'परंपरा',
  'Heritage': 'विरासत',
  'Festivals': 'त्योहार',
  'Celebrations': 'उत्सव',
  'Rituals': 'अनुष्ठान',
  'Ceremonies': 'समारोह',
  'Worship': 'पूजा',
  'Devotion': 'भक्ति',
  'Faith': 'श्रद्धा',
  'Belief': 'विश्वास',
  'Peace': 'शांति',
  'Love': 'प्रेम',
  'Compassion': 'करुणा',
  'Kindness': 'दया',
  'Truth': 'सत्य',
  'Dharma': 'धर्म',
  'Karma': 'कर्म',
  'Moksha': 'मोक्ष',
  'Salvation': 'मुक्ति',
  'Liberation': 'मुक्ति',
  'Enlightenment': 'ज्ञान',
  'Awakening': 'जागृति',
  'Consciousness': 'चेतना',
  'Soul': 'आत्मा',
  'Spirit': 'आत्मा',
  'Divine': 'दिव्य',
  'Sacred': 'पवित्र',
  'Holy': 'पवित्र',
  'Blessed': 'धन्य',
  'Pure': 'शुद्ध',
  'Eternal': 'शाश्वत',
  'Infinite': 'अनंत',
  'Universal': 'सार्वभौमिक',
  'Cosmic': 'ब्रह्मांडीय',
  'Celestial': 'दिव्य',
  'Heavenly': 'स्वर्गीय',
  'Blissful': 'आनंदमय',
  'Peaceful': 'शांतिपूर्ण',
  'Serene': 'शांत',
  'Tranquil': 'शांत',
  'Calm': 'शांत',
  'Gentle': 'कोमल',
  'Soft': 'मृदु',
  'Sweet': 'मधुर',
  'Beautiful': 'सुंदर',
  'Wonderful': 'अद्भुत',
  'Amazing': 'आश्चर्यजनक',
  'Miraculous': 'चमत्कारी',
  'Magical': 'जादुई',
  'Mystical': 'रहस्यमय',
  'Mysterious': 'रहस्यमय',
  'Ancient': 'प्राचीन',
  'Traditional': 'पारंपरिक',
  'Classical': 'शास्त्रीय',
  'Timeless': 'कालातीत',
  'Everlasting': 'चिरस्थायी',
  'Immortal': 'अमर',
  'Undying': 'अमर',
  'Imperishable': 'अविनाशी',
  'Indestructible': 'अविनाशी',
  
  // Deity names
  'Krishna': 'कृष्ण',
  'Rama': 'राम',
  'Hanuman': 'हनुमान',
  'Shiva': 'शिव',
  'Vishnu': 'विष्णु',
  'Durga': 'दुर्गा',
  'Lakshmi': 'लक्ष्मी',
  'Saraswati': 'सरस्वती',
  'Ganesh': 'गणेश',
  'Ganesha': 'गणेश',
  
  // Scriptures
  'Gita': 'गीता',
  'Geeta': 'गीता',
  'Bhagavad Gita': 'भगवद गीता',
  'Ramayana': 'रामायण',
  'Mahabharata': 'महाभारत',
  'Puranas': 'पुराण',
  'Upanishads': 'उपनिषद',
  'Vedas': 'वेद',
  
  // Common phrases
  'Bal Sanskar': 'बाल संस्कार',
  'Children': 'बच्चे',
  'Kids': 'बच्चे',
  'Family': 'परिवार',
  'Children education': 'बच्चों की शिक्षा',
  'Moral values': 'नैतिक मूल्य',
  'Character building': 'चरित्र निर्माण',
  'Personality development': 'व्यक्तित्व विकास',
  'Life lessons': 'जीवन की शिक्षा',
  'Wisdom for life': 'जीवन के लिए ज्ञान',
  'Path to happiness': 'खुशी का रास्ता',
  'Inner peace': 'आंतरिक शांति',
  'Self realization': 'आत्म साक्षात्कार',
  'God realization': 'ईश्वर साक्षात्कार',
  'Divine love': 'दिव्य प्रेम',
  'Unconditional love': 'निःस्वार्थ प्रेम',
  'Pure love': 'शुद्ध प्रेम',
  'Eternal love': 'शाश्वत प्रेम',
  'Universal love': 'सार्वभौमिक प्रेम',
  'Compassionate heart': 'करुणामय हृदय',
  'Kind heart': 'दयालु हृदय',
  'Pure heart': 'शुद्ध हृदय',
  'Noble heart': 'उदार हृदय',
  'Generous heart': 'उदार हृदय',
  
  // Descriptions
  'Spiritual wisdom and guidance': 'आध्यात्मिक ज्ञान और मार्गदर्शन',
  'Divine teachings': 'दिव्य शिक्षाएं',
  'Sacred knowledge': 'पवित्र ज्ञान',
  'Holy scriptures': 'पवित्र शास्त्र',
  'Devotional songs': 'भक्ति गीत',
  'Spiritual stories': 'आध्यात्मिक कहानियां',
  'Ancient wisdom': 'प्राचीन ज्ञान',
  'Divine blessings': 'दिव्य आशीर्वाद',
  'Sacred mantras': 'पवित्र मंत्र',
  'Meditation practices': 'ध्यान अभ्यास',
  'Yoga teachings': 'योग शिक्षाएं',
  'Spiritual practices': 'आध्यात्मिक अभ्यास',
  'Divine knowledge': 'दिव्य ज्ञान',
  'Sacred texts': 'पवित्र ग्रंथ',
  'Spiritual guidance': 'आध्यात्मिक मार्गदर्शन',
  'Holy teachings': 'पवित्र शिक्षाएं',
  'Divine wisdom': 'दिव्य ज्ञान',
  'Spiritual enlightenment': 'आध्यात्मिक ज्ञान',
  'Sacred learning': 'पवित्र शिक्षा',
};

/**
 * AI-powered translation with intelligent word matching
 */
export const translateWithAI = (text: string): string => {
  if (!text || typeof text !== 'string') return text;
  
  const currentLanguage = i18n.language;
  if (currentLanguage !== 'hi') return text;
  
  console.log('🔄 Translating:', text);
  
  // Step 1: Direct exact match
  if (spiritualTranslations[text]) {
    console.log('✅ Direct match found:', spiritualTranslations[text]);
    return spiritualTranslations[text];
  }
  
  // Step 2: Case-insensitive exact match
  const exactMatch = Object.keys(spiritualTranslations).find(
    key => key.toLowerCase() === text.toLowerCase()
  );
  if (exactMatch) {
    console.log('✅ Case-insensitive match found:', spiritualTranslations[exactMatch]);
    return spiritualTranslations[exactMatch];
  }
  
  // Step 3: Word-by-word intelligent translation
  let translatedText = text;
  let hasTranslation = false;
  
  // Sort keys by length (longest first) for better matching
  const sortedKeys = Object.keys(spiritualTranslations).sort((a, b) => b.length - a.length);
  
  for (const englishTerm of sortedKeys) {
    const hindiTerm = spiritualTranslations[englishTerm];
    
    // Create regex for word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${englishTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    
    if (regex.test(translatedText)) {
      translatedText = translatedText.replace(regex, hindiTerm);
      hasTranslation = true;
      console.log(`🔄 Partial translation: "${englishTerm}" -> "${hindiTerm}"`);
    }
  }
  
  // Step 4: Handle common patterns
  translatedText = handleCommonPatterns(translatedText);
  
  if (hasTranslation) {
    console.log('✅ Final translation:', translatedText);
  } else {
    console.log('❌ No translation found, keeping original:', text);
  }
  
  return translatedText;
};

/**
 * Handle common English-Hindi patterns
 */
const handleCommonPatterns = (text: string): string => {
  let result = text;
  
  // Pattern: "X and Y" -> "X और Y"
  result = result.replace(/\band\b/gi, 'और');
  
  // Pattern: "of X" -> "X का/की/के"
  result = result.replace(/\bof\b/gi, 'का');
  
  // Pattern: "for X" -> "X के लिए"
  result = result.replace(/\bfor\b/gi, 'के लिए');
  
  // Pattern: "with X" -> "X के साथ"
  result = result.replace(/\bwith\b/gi, 'के साथ');
  
  // Pattern: "in X" -> "X में"
  result = result.replace(/\bin\b/gi, 'में');
  
  // Pattern: "to X" -> "X को"
  result = result.replace(/\bto\b/gi, 'को');
  
  return result;
};

/**
 * Translate object fields intelligently
 */
export const translateObjectAI = <T extends Record<string, any>>(
  obj: T,
  fieldsToTranslate: (keyof T)[] = ['title', 'description', 'name']
): T => {
  const translated = { ...obj };
  
  fieldsToTranslate.forEach(field => {
    if (translated[field] && typeof translated[field] === 'string') {
      (translated[field] as any) = translateWithAI(translated[field] as string);
    }
  });
  
  return translated;
};

/**
 * Translate array of objects intelligently
 */
export const translateArrayAI = <T extends Record<string, any>>(
  array: T[],
  fieldsToTranslate?: (keyof T)[]
): T[] => {
  return array.map(item => translateObjectAI(item, fieldsToTranslate));
};