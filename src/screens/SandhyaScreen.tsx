import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import AppBarHeader from '../components/AppBarHeader';
import { wp, hp, normalize } from '../utils/responsive';

const SandhyaScreen = () => {
  const { colors } = useTheme();

  const sandhyas = [
    { id: 1, title: 'Evening Sandhya Vandana', artist: 'Traditional', duration: '12:30' },
    { id: 2, title: 'Sunset Prayers', artist: 'Vedic Chant', duration: '8:15' },
    { id: 3, title: 'Twilight Meditation', artist: 'Peaceful', duration: '15:45' },
    { id: 4, title: 'Sandhya Aarti', artist: 'Devotional', duration: '6:20' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title="Sandhya" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
            <MaterialDesignIcons name="weather-sunset" size={60} color={colors.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Evening Sandhya</Text>
          <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
            Sacred twilight prayers and meditation
          </Text>
        </View>

        <View style={styles.sandhyaSection}>
          {sandhyas.map((sandhya) => (
            <TouchableOpacity
              key={sandhya.id}
              style={[styles.sandhyaCard, { backgroundColor: colors.surface }]}
            >
              <View style={[styles.sandhyaImage, { backgroundColor: `${colors.primary}15` }]}>
                <MaterialDesignIcons name="candle" size={40} color={colors.primary} />
              </View>
              <View style={styles.sandhyaInfo}>
                <Text style={[styles.sandhyaTitle, { color: colors.onSurface }]}>{sandhya.title}</Text>
                <Text style={[styles.sandhyaArtist, { color: colors.onSurfaceVariant }]}>{sandhya.artist}</Text>
                <Text style={[styles.sandhyaDuration, { color: colors.onSurfaceVariant }]}>{sandhya.duration}</Text>
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
  sandhyaSection: { paddingHorizontal: wp(4) },
  sandhyaCard: { flexDirection: 'row', alignItems: 'center', padding: wp(4), marginBottom: hp(2), borderRadius: normalize(16), elevation: 2 },
  sandhyaImage: { width: wp(16), height: wp(16), borderRadius: normalize(12), justifyContent: 'center', alignItems: 'center', marginRight: wp(4) },
  sandhyaInfo: { flex: 1 },
  sandhyaTitle: { fontSize: normalize(18), fontWeight: 'bold', marginBottom: hp(0.5) },
  sandhyaArtist: { fontSize: normalize(14), marginBottom: hp(0.5) },
  sandhyaDuration: { fontSize: normalize(12) },
  playButton: { padding: wp(2) },
});

export default SandhyaScreen;