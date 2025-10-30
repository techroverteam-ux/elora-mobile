import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { translateContent } from '../utils/contentTranslator';
import { wp, hp, normalize } from '../utils/responsive';

interface EmptyStateProps {
  icon: string;
  title?: string;
  subtitle?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title = 'No content found', 
  subtitle = 'Coming soon' 
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.emptyState}>
      <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}10` }]}>
        <MaterialDesignIcons 
          name={icon} 
          size={80} 
          color={colors.primary} 
          style={{ opacity: 0.6 }}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
        {translateContent(title)}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>
        {translateContent(subtitle)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    paddingVertical: hp(8),
    paddingHorizontal: wp(8),
  },
  iconContainer: {
    width: wp(24),
    height: wp(24),
    borderRadius: wp(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  emptyTitle: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    marginBottom: hp(1),
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: normalize(16),
    textAlign: 'center',
    lineHeight: normalize(22),
  },
});

export default EmptyState;