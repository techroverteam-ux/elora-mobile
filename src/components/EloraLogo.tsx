import React from 'react';
import { View, Image } from 'react-native';

interface EloraLogoProps {
  width?: number;
  height?: number;
}

const EloraLogo: React.FC<EloraLogoProps> = ({ 
  width = 200, 
  height = 50 
}) => {
  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={require('../assets/images/logo.png')}
        style={{ width, height }}
        resizeMode="contain"
      />
    </View>
  );
};

export default EloraLogo;