import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from 'react-native-paper';

interface CustomTextInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  showToggle?: boolean;
  showPassword?: boolean;
  setShowPassword?: (show: boolean) => void;
  style?: TextStyle | TextStyle[];
  containerStyle?: ViewStyle | ViewStyle[];
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  value,
  onChangeText,
  placeholder,
  placeholderTextColor,
  secureTextEntry,
  showToggle = false,
  showPassword = false,
  setShowPassword,
  keyboardType = 'default',
  style,
  containerStyle,
  ...rest
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { borderColor: colors.outline },
        showToggle && styles.passwordContainer,
        containerStyle,
      ]}
    >
      <TextInput
        style={[
          styles.input,
          {
            color: colors.onSurface,
            borderColor: colors.outline,
          },
          showToggle && { borderWidth: 0, flex: 1, marginBottom: 0 },
          style,
        ]}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor || colors.onSurfaceVariant || '#888'}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        {...rest}
      />
      {showToggle && setShowPassword && (
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeButton}
        >
          <MaterialDesignIcons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color={colors.onSurface}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 12,
  },
  input: {
    padding: 12,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeButton: {
    paddingHorizontal: 12,
  },
});

export default CustomTextInput;
