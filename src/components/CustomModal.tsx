import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { AlertTriangle, CheckCircle, X, Info } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'error' | 'success' | 'warning' | 'info';
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

export default function CustomModal({
  visible,
  onClose,
  title,
  message,
  type = 'info',
  buttons = [{ text: 'OK', onPress: onClose }]
}: CustomModalProps) {
  const { theme } = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertTriangle size={24} color="#EF4444" />;
      case 'success':
        return <CheckCircle size={24} color="#10B981" />;
      case 'warning':
        return <AlertTriangle size={24} color="#F59E0B" />;
      default:
        return <Info size={24} color={theme.colors.primary} />;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'error':
        return '#EF4444';
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      default:
        return theme.colors.primary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <View style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 400,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: getIconColor() + '15',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12
            }}>
              {getIcon()}
            </View>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: theme.colors.text,
              flex: 1
            }}>
              {title}
            </Text>
          </View>

          {/* Message */}
          <Text style={{
            fontSize: 16,
            color: theme.colors.textSecondary,
            lineHeight: 24,
            marginBottom: 24
          }}>
            {message}
          </Text>

          {/* Buttons */}
          <View style={{
            flexDirection: buttons.length > 1 ? 'row' : 'column',
            gap: 12
          }}>
            {buttons.map((button, index) => {
              const isCancel = button.style === 'cancel';
              const isDestructive = button.style === 'destructive';
              
              return (
                <TouchableOpacity
                  key={index}
                  onPress={button.onPress}
                  style={{
                    flex: buttons.length > 1 ? 1 : undefined,
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                    backgroundColor: isDestructive 
                      ? '#EF4444' 
                      : isCancel 
                        ? theme.colors.background
                        : theme.colors.primary,
                    borderWidth: isCancel ? 1 : 0,
                    borderColor: isCancel ? theme.colors.border : 'transparent',
                    alignItems: 'center'
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: isCancel 
                      ? theme.colors.text 
                      : '#FFFFFF'
                  }}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}