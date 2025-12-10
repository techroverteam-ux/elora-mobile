import React from 'react';
import { TouchableOpacity, ActivityIndicator, ViewStyle } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

interface LoadingButtonProps {
  onPress: () => void;
  loading?: boolean;
  iconName: string;
  iconSize?: number;
  iconColor?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  onPress,
  loading = false,
  iconName,
  iconSize = 24,
  iconColor = '#fff',
  style,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[{ padding: 8, opacity: disabled ? 0.5 : 1 }, style]}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <MaterialDesignIcons name={iconName} size={iconSize} color={iconColor} />
      )}
    </TouchableOpacity>
  );
};

export default LoadingButton;