import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import AppBarHeader from '../components/AppBarHeader';
import { wp, hp, normalize } from '../utils/responsive';

const NityaStutiScreen = () => {
  const { colors } = useTheme();

  const stutis = [
    { id: 1, title: 'Morning Prayer', artist: 'Daily Recitation', duration: '3:45' },
    { id: 2, title: 'Gayatri Mantra', artist: 'Sacred Chant', duration: '2:30' },
    { id: 3, title: 'Evening Aarti', artist: 'Traditional', duration: '4:15' },
    { id: 4, title: 'Shanti Path', artist: 'Peace Prayer', duration: '5:00' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title="Nitya Stuti" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
            <MaterialDesignIcons name="meditation" size={60} color={colors.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Daily Prayers</Text>
          <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
            Sacred recitations for daily practice
          </Text>
        </View>

        <View style={styles.stutiSection}>
          {stutis.map((stuti) => (
            <TouchableOpacity
              key={stuti.id}
              style={[styles.stutiCard, { backgroundColor: colors.surface }]}
            >
              <View style={[styles.stutiImage, { backgroundColor: `${colors.primary}15` }]}>
                <MaterialDesignIcons name="hands-pray" size={40} color={colors.primary} />
              </View>
              <View style={styles.stutiInfo}>
                <Text style={[styles.stutiTitle, { color: colors.onSurface }]}>{stuti.title}</Text>
                <Text style={[styles.stutiArtist, { color: colors.onSurfaceVariant }]}>{stuti.artist}</Text>
                <Text style={[styles.stutiDuration, { color: colors.onSurfaceVariant }]}>{stuti.duration}</Text>
              </View>
              <TouchableOpacity style={styles.playButton}>
                <MaterialDesignIcons name="play-circle" size={56} color={colors.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
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
  stutiSection: { paddingHorizontal: wp(4) },
  stutiCard: { flexDirection: 'row', alignItems: 'center', padding: wp(4), marginBottom: hp(2), borderRadius: normalize(16), elevation: 2 },
  stutiImage: { width: wp(16), height: wp(16), borderRadius: normalize(12), justifyContent: 'center', alignItems: 'center', marginRight: wp(4) },
  stutiInfo: { flex: 1 },
  stutiTitle: { fontSize: normalize(18), fontWeight: 'bold', marginBottom: hp(0.5) },
  stutiArtist: { fontSize: normalize(14), marginBottom: hp(0.5) },
  stutiDuration: { fontSize: normalize(12) },
  playButton: { padding: wp(2) },
});

export default NityaStutiScreen;