import React from 'react';
import { Button, View } from 'react-native';
import { fetchAndFormatStorage } from '../../utils/storageLogger';

const LanguageSwitcher = ({ onLanguageChange }: { onLanguageChange: (lang: string) => void }) => {
  const handleChange = async (lang: string) => {
    onLanguageChange(lang); // changes the language via i18n
    await fetchAndFormatStorage();
  };

  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Button title='English' onPress={() => handleChange('en')} />
      <Button title='French' onPress={() => handleChange('fr')} />
    </View>
  );
};

export default LanguageSwitcher;
