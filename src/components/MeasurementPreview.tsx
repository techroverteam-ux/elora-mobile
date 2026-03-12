import React from 'react';
import { View, Text, Image, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, Ruler, Camera } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface MeasurementPreviewProps {
  visible: boolean;
  onClose: () => void;
  imageUri: string;
  measurements?: {
    width: number;
    height: number;
    unit?: string;
  };
  photoType?: string;
  capturedAt?: string;
  hasDrawings?: boolean;
}

export default function MeasurementPreview({
  visible,
  onClose,
  imageUri,
  measurements,
  photoType = 'photo',
  capturedAt,
  hasDrawings = false
}: MeasurementPreviewProps) {
  const { theme } = useTheme();

  if (!visible) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 50,
          paddingBottom: 16,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Camera size={24} color={theme.colors.primary} />
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: theme.colors.text,
              marginLeft: 8
            }}>
              {photoType.toUpperCase()} View
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: theme.colors.background,
              padding: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.colors.border
            }}
          >
            <X size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          {/* Image Container */}
          <View style={{
            flex: 1,
            backgroundColor: '#000',
            justifyContent: 'center',
            alignItems: 'center',
            margin: 16,
            borderRadius: 12,
            overflow: 'hidden'
          }}>
            <Image
              source={{ uri: imageUri }}
              style={{
                width: '100%',
                height: '100%',
                minHeight: 300
              }}
              resizeMode="contain"
            />
            
            {/* Overlay indicators */}
            {hasDrawings && (
              <View style={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: 'rgba(16, 185, 129, 0.9)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Ruler size={14} color="#FFFFFF" />
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: 'bold',
                  marginLeft: 4
                }}>
                  With Measurements
                </Text>
              </View>
            )}
          </View>

          {/* Measurement Info */}
          {measurements && (
            <View style={{
              backgroundColor: theme.colors.surface,
              margin: 16,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12
              }}>
                <Ruler size={20} color={theme.colors.primary} />
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: theme.colors.text,
                  marginLeft: 8
                }}>
                  Measurements
                </Text>
              </View>
              
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                backgroundColor: theme.colors.background,
                padding: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.colors.border
              }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: theme.colors.primary
                  }}>
                    {(measurements.width * 12).toFixed(1)}"
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                    marginTop: 2
                  }}>
                    Width
                  </Text>
                </View>
                
                <View style={{
                  width: 1,
                  backgroundColor: theme.colors.border,
                  marginHorizontal: 16
                }} />
                
                <View style={{ alignItems: 'center' }}>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: theme.colors.primary
                  }}>
                    {(measurements.height * 12).toFixed(1)}"
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                    marginTop: 2
                  }}>
                    Height
                  </Text>
                </View>
              </View>
              
              {hasDrawings && (
                <View style={{
                  marginTop: 12,
                  padding: 12,
                  backgroundColor: theme.colors.primary + '15',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.colors.primary + '40'
                }}>
                  <Text style={{
                    fontSize: 12,
                    color: theme.colors.text,
                    textAlign: 'center',
                    fontWeight: '600'
                  }}>
                    ✓ Measurements calculated from hand-drawn outline
                  </Text>
                  <Text style={{
                    fontSize: 10,
                    color: theme.colors.textSecondary,
                    textAlign: 'center',
                    marginTop: 4
                  }}>
                    Drawing overlay preserved in saved image
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Photo Details */}
          <View style={{
            backgroundColor: theme.colors.surface,
            marginHorizontal: 16,
            marginBottom: 16,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.colors.text,
              marginBottom: 8
            }}>
              Photo Details
            </Text>
            
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  Type:
                </Text>
                <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '500' }}>
                  {photoType.charAt(0).toUpperCase() + photoType.slice(1)} View
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  Captured:
                </Text>
                <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '500' }}>
                  {formatDate(capturedAt)}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  Measurements:
                </Text>
                <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '500' }}>
                  {hasDrawings ? 'Hand-drawn' : 'Reference overlay'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}