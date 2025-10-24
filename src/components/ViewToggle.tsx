import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

interface ViewToggleProps {
  isGridView: boolean;
  onToggle: (isGrid: boolean) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ isGridView, onToggle }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        style={[
          styles.button,
          isGridView && { backgroundColor: colors.primary }
        ]}
        onPress={() => onToggle(true)}
      >
        <MaterialDesignIcons
          name="view-grid"
          size={20}
          color={isGridView ? '#fff' : colors.onSurfaceVariant}
        />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.button,
          !isGridView && { backgroundColor: colors.primary }
        ]}
        onPress={() => onToggle(false)}
      >
        <MaterialDesignIcons
          name="view-list"
          size={20}
          color={!isGridView ? '#fff' : colors.onSurfaceVariant}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
});

export default ViewToggle;