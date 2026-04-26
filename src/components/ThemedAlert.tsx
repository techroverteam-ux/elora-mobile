import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Check, X, Share, FolderOpen, Settings, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface ThemedAlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
  icon?: 'check' | 'x' | 'share' | 'folder' | 'settings' | 'warning';
}

interface ThemedAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: ThemedAlertButton[];
  onDismiss?: () => void;
}

export const ThemedAlert: React.FC<ThemedAlertProps> = ({
  visible,
  title,
  message,
  buttons,
  onDismiss
}) => {
  const { theme } = useTheme();

  const getButtonIcon = (icon?: string, color?: string) => {
    const iconSize = 16;
    switch (icon) {
      case 'check':
        return <Check size={iconSize} color={color} />;
      case 'x':
        return <X size={iconSize} color={color} />;
      case 'share':
        return <Share size={iconSize} color={color} />;
      case 'folder':
        return <FolderOpen size={iconSize} color={color} />;
      case 'settings':
        return <Settings size={iconSize} color={color} />;
      case 'warning':
        return <AlertTriangle size={iconSize} color={color} />;
      default:
        return null;
    }
  };

  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return {
          backgroundColor: '#EF4444',
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderRadius: 12,
          minHeight: 48,
          flex: 1
        };
      case 'cancel':
        return {
          backgroundColor: '#F3F4F6',
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          minHeight: 48,
          flex: 1
        };
      default:
        return {
          backgroundColor: '#3B82F6',
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderRadius: 12,
          minHeight: 48,
          flex: 1
        };
    }
  };

  const getButtonTextColor = (style?: string) => {
    switch (style) {
      case 'cancel':
        return '#374151';
      default:
        return '#FFFFFF';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 24,
          width: '85%',
          maxWidth: 320,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 12
        }}>
          {/* Title */}
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#1F2937',
            marginBottom: 12,
            textAlign: 'center'
          }}>
            {title}
          </Text>

          {/* Message */}
          <Text style={{
            fontSize: 15,
            color: '#6B7280',
            lineHeight: 22,
            textAlign: 'center',
            marginBottom: 24
          }}>
            {message}
          </Text>

          {/* Buttons */}
          <View style={{
            flexDirection: 'row',
            gap: 12,
            marginTop: 8
          }}>
            {buttons.map((button, index) => {
              const buttonStyle = getButtonStyle(button.style);
              const textColor = getButtonTextColor(button.style);
              const icon = getButtonIcon(button.icon, textColor);
              return (
                <TouchableOpacity
                  key={index}
                  onPress={button.onPress}
                  style={[
                    {
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row'
                    },
                    buttonStyle
                  ]}
                >
                  {icon && (
                    <View style={{ marginRight: button.text ? 4 : 0 }}>
                      {icon}
                    </View>
                  )}
                  {button.text && (
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: textColor
                    }}>
                      {button.text}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Hook for using themed alerts
export const useThemedAlert = () => {
  const [alertConfig, setAlertConfig] = React.useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: ThemedAlertButton[];
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });

  const showAlert = (
    title: string,
    message: string,
    buttons: ThemedAlertButton[]
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons.map(button => ({
        ...button,
        onPress: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          button.onPress?.();
        }
      }))
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const AlertComponent = () => (
    <ThemedAlert
      visible={alertConfig.visible}
      title={alertConfig.title}
      message={alertConfig.message}
      buttons={alertConfig.buttons}
      onDismiss={hideAlert}
    />
  );

  return { showAlert, AlertComponent };
};