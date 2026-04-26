import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { permissionService } from '../services/permissionService';
import { themedAlertService } from '../services/themedAlertService';

export const PermissionTestComponent = () => {
  const testStorageAlert = () => {
    console.log('Testing storage permission alert...');
    permissionService.handleNeverAskAgainState('storage');
  };

  const testNativeAlert = () => {
    console.log('Testing native alert fallback...');
    permissionService.showNativePermissionAlert('storage');
  };

  const testThemedAlert = () => {
    console.log('Testing themed alert directly...');
    themedAlertService.showStoragePermissionDeniedAlert();
  };

  return (
    <View style={{ padding: 20, gap: 10 }}>
      <TouchableOpacity 
        onPress={testStorageAlert}
        style={{ backgroundColor: '#3B82F6', padding: 15, borderRadius: 8 }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          Test Storage Permission Alert
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={testNativeAlert}
        style={{ backgroundColor: '#EF4444', padding: 15, borderRadius: 8 }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          Test Native Alert Fallback
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={testThemedAlert}
        style={{ backgroundColor: '#10B981', padding: 15, borderRadius: 8 }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          Test Themed Alert Direct
        </Text>
      </TouchableOpacity>
    </View>
  );
};