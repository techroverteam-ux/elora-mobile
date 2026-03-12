import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { MapPin, Settings, Save, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { clientService, ClientLocationConfig } from '../../services/clientService';
import Toast from 'react-native-toast-message';

interface ClientLocationConfigScreenProps {
  route: {
    params: {
      clientId: string;
      clientName: string;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

export default function ClientLocationConfigScreen({ route, navigation }: ClientLocationConfigScreenProps) {
  const { theme } = useTheme();
  const { clientId, clientName } = route.params;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ClientLocationConfig>({
    enableLocationOverlay: false,
    mapSize: 80,
    showAddress: true,
    showCoordinates: true,
    showTimestamp: true,
    position: 'bottom-left',
  });

  useEffect(() => {
    loadLocationConfig();
  }, []);

  const loadLocationConfig = async () => {
    try {
      setLoading(true);
      const locationConfig = await clientService.getLocationConfig(clientId);
      setConfig(locationConfig);
    } catch (error) {
      console.error('Error loading location config:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load location configuration'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveLocationConfig = async () => {
    try {
      setSaving(true);
      await clientService.updateLocationConfig(clientId, config);
      Toast.show({
        type: 'success',
        text1: 'Configuration Saved',
        text2: 'Location overlay settings have been updated'
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error saving location config:', error);
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: 'Failed to save location configuration'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: keyof ClientLocationConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const positionOptions = [
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-right', label: 'Top Right' },
  ];

  const mapSizeOptions = [
    { value: 60, label: 'Small (60px)' },
    { value: 80, label: 'Medium (80px)' },
    { value: 100, label: 'Large (100px)' },
  ];

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.textSecondary }}>Loading configuration...</Text>
      </View>
    );
  }

  return (
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>
            Location Settings
          </Text>
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>
            {clientName}
          </Text>
        </View>
        <TouchableOpacity
          onPress={saveLocationConfig}
          disabled={saving}
          style={{
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
            opacity: saving ? 0.6 : 1
          }}
        >
          <Save size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Main Toggle */}
        <View style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <MapPin size={20} color={theme.colors.primary} />
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
              GPS Location Overlay
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 16, color: theme.colors.text, flex: 1 }}>
              Enable location overlay on photos
            </Text>
            <Switch
              value={config.enableLocationOverlay}
              onValueChange={(value) => updateConfig('enableLocationOverlay', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
              thumbColor={config.enableLocationOverlay ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
          
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary, lineHeight: 16 }}>
            When enabled, photos taken through the measurement camera will automatically include GPS location information with a map overlay.
          </Text>
        </View>

        {/* Configuration Options */}
        {config.enableLocationOverlay && (
          <>
            {/* Map Size */}
            <View style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 12 }}>
                Map Size
              </Text>
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {mapSizeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => updateConfig('mapSize', option.value)}
                    style={{
                      backgroundColor: config.mapSize === option.value ? theme.colors.primary : theme.colors.background,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: config.mapSize === option.value ? theme.colors.primary : theme.colors.border
                    }}
                  >
                    <Text style={{
                      color: config.mapSize === option.value ? '#FFFFFF' : theme.colors.text,
                      fontSize: 14,
                      fontWeight: '500'
                    }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Position */}
            <View style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 12 }}>
                Overlay Position
              </Text>
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {positionOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => updateConfig('position', option.value)}
                    style={{
                      backgroundColor: config.position === option.value ? theme.colors.primary : theme.colors.background,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: config.position === option.value ? theme.colors.primary : theme.colors.border
                    }}
                  >
                    <Text style={{
                      color: config.position === option.value ? '#FFFFFF' : theme.colors.text,
                      fontSize: 14,
                      fontWeight: '500'
                    }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Display Options */}
            <View style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 16 }}>
                Display Information
              </Text>
              
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: theme.colors.text }}>Show Address</Text>
                  <Switch
                    value={config.showAddress}
                    onValueChange={(value) => updateConfig('showAddress', value)}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                    thumbColor={config.showAddress ? theme.colors.primary : theme.colors.textSecondary}
                  />
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: theme.colors.text }}>Show Coordinates</Text>
                  <Switch
                    value={config.showCoordinates}
                    onValueChange={(value) => updateConfig('showCoordinates', value)}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                    thumbColor={config.showCoordinates ? theme.colors.primary : theme.colors.textSecondary}
                  />
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: theme.colors.text }}>Show Timestamp</Text>
                  <Switch
                    value={config.showTimestamp}
                    onValueChange={(value) => updateConfig('showTimestamp', value)}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                    thumbColor={config.showTimestamp ? theme.colors.primary : theme.colors.textSecondary}
                  />
                </View>
              </View>
            </View>

            {/* Preview */}
            <View style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 12 }}>
                Preview
              </Text>
              
              <View style={{
                backgroundColor: '#E5E5E5',
                height: 200,
                borderRadius: 8,
                position: 'relative',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Text style={{ color: '#666', fontSize: 14 }}>Photo Preview</Text>
                
                {/* Mock overlay */}
                <View style={{
                  position: 'absolute',
                  ...(config.position === 'bottom-left' && { bottom: 10, left: 10 }),
                  ...(config.position === 'bottom-right' && { bottom: 10, right: 10 }),
                  ...(config.position === 'top-left' && { top: 10, left: 10 }),
                  ...(config.position === 'top-right' && { top: 10, right: 10 }),
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  maxWidth: 200,
                }}>
                  {/* Mock map */}
                  <View style={{
                    width: config.mapSize || 80,
                    height: config.mapSize || 80,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: '#333333',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 8,
                  }}>
                    <Text style={{ fontSize: 16 }}>📍</Text>
                  </View>
                  
                  {/* Mock text */}
                  <View style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                    minWidth: 120,
                  }}>
                    {config.showCoordinates && (
                      <Text style={{ color: '#FFFFFF', fontSize: 9, marginBottom: 2 }}>
                        28.6139, 77.2090
                      </Text>
                    )}
                    {config.showAddress && (
                      <Text style={{ color: '#FFFFFF', fontSize: 9, marginBottom: 2 }}>
                        New Delhi, India
                      </Text>
                    )}
                    {config.showTimestamp && (
                      <Text style={{ color: '#FFFFFF', fontSize: 9 }}>
                        {new Date().toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}