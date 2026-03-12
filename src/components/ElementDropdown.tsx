import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface ElementDropdownProps {
  elements: any[];
  selectedElementId: string;
  selectedElementName: string;
  onSelect: (elementId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ElementDropdown({
  elements,
  selectedElementId,
  selectedElementName,
  onSelect,
  isOpen,
  onToggle
}: ElementDropdownProps) {
  const { theme } = useTheme();
  const { canViewElementRates } = useAuth();
  const showRates = canViewElementRates();

  return (
    <View>
      <TouchableOpacity
        onPress={onToggle}
        style={{
          backgroundColor: theme.colors.background,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 8,
          padding: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ 
            color: selectedElementId ? theme.colors.text : theme.colors.textSecondary, 
            fontSize: 16,
            fontWeight: selectedElementId ? '600' : '400'
          }}>
            {selectedElementName || 'Select an element'}
          </Text>
          {selectedElementId && showRates && (
            <Text style={{ 
              color: theme.colors.textSecondary, 
              fontSize: 12,
              marginTop: 2
            }}>
              ₹{elements.find(el => (el.elementId || el._id)?.toString() === selectedElementId)?.customRate || 
                elements.find(el => (el.elementId || el._id)?.toString() === selectedElementId)?.rate || 0}
            </Text>
          )}
        </View>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
          {isOpen ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>
      
      {isOpen && (
        <View style={{ 
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 8,
          marginTop: 8,
          maxHeight: 200
        }}>
          <ScrollView style={{ maxHeight: 200 }}>
            {elements.map((element: any) => (
              <TouchableOpacity
                key={element.elementId || element._id}
                onPress={() => {
                  onSelect((element.elementId || element._id)?.toString() || '');
                  onToggle();
                }}
                style={{
                  backgroundColor: selectedElementId === (element.elementId || element._id)?.toString() 
                    ? theme.colors.primary + '20' 
                    : 'transparent',
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ 
                    color: selectedElementId === (element.elementId || element._id)?.toString() 
                      ? theme.colors.primary 
                      : theme.colors.text, 
                    fontSize: 14, 
                    fontWeight: '600',
                    flex: 1
                  }}>
                    {element.elementName || element.name || `Element ${element.elementId || element._id}`}
                  </Text>
                  {showRates && (
                    <Text style={{ 
                      color: selectedElementId === (element.elementId || element._id)?.toString() 
                        ? theme.colors.primary 
                        : theme.colors.textSecondary, 
                      fontSize: 12,
                      fontWeight: '500'
                    }}>
                      ₹{element.customRate || element.rate || 0}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}