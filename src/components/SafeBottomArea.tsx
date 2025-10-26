import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeBottomAreaProps {
  children: React.ReactNode;
  backgroundColor?: string;
  minHeight?: number;
}

const SafeBottomArea: React.FC<SafeBottomAreaProps> = ({ 
  children, 
  backgroundColor = 'transparent',
  minHeight = 60 
}) => {
  const insets = useSafeAreaInsets();
  const { height } = Dimensions.get('window');
  
  // Calculate safe bottom height based on device
  const safeBottomHeight = Math.max(insets.bottom, minHeight);
  
  // Add extra padding for devices with home indicators
  const extraPadding = height > 800 ? 10 : 5;
  
  return (
    <View style={[
      styles.container,
      {
        backgroundColor,
        paddingBottom: safeBottomHeight + extraPadding,
        minHeight: safeBottomHeight + minHeight
      }
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default SafeBottomArea;