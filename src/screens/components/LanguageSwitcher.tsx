import React from 'react';
import { Button, View } from 'react-native';

const LanguageSwitcher = ({ onLanguageChange }: { onLanguageChange: (lang: string) => void }) => {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Button title='English' onPress={() => onLanguageChange('en')} />
      <Button title='French' onPress={() => onLanguageChange('fr')} />
    </View>
  );
};

export default LanguageSwitcher;
