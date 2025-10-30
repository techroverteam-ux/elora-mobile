import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { translateContent } from '../utils/contentTranslator';
import AppBarHeader from '../components/AppBarHeader';
import EmptyState from '../components/EmptyState';
import { wp, hp, normalize } from '../utils/responsive';

const SatsangScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const satsangs = [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title={translateContent('Satsang')} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
            <MaterialDesignIcons name="account-group" size={60} color={colors.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>{translateContent('Spiritual')} {translateContent('Satsang')}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
            {translateContent('Divine')} {translateContent('Teachings')} {translateContent('Spiritual')}
          </Text>
        </View>

        <View style={styles.satsangSection}>
          <EmptyState 
            icon="account-group-outline" 
            title="No content found" 
            subtitle="Coming soon" 
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: { alignItems: 'center', padding: wp(6), marginBottom: hp(2) },
  iconContainer: { width: wp(20), height: wp(20), borderRadius: wp(10), justifyContent: 'center', alignItems: 'center', marginBottom: hp(2) },
  headerTitle: { fontSize: normalize(28), fontWeight: 'bold', marginBottom: hp(1) },
  headerSubtitle: { fontSize: normalize(16), textAlign: 'center' },
  satsangSection: { paddingHorizontal: wp(4) },
});

export default SatsangScreen;