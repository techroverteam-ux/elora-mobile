import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import AppBarHeader from '../components/AppBarHeader';
import { wp, hp, normalize } from '../utils/responsive';

const SatsangScreen = () => {
  const { colors } = useTheme();

  const satsangs = [
    { id: 1, title: 'Spiritual Discourse', artist: 'Guruji', duration: '45:30' },
    { id: 2, title: 'Bhagavad Gita Chapter 1', artist: 'Pandit Ji', duration: '32:15' },
    { id: 3, title: 'Life Lessons', artist: 'Spiritual Teacher', duration: '28:45' },
    { id: 4, title: 'Meditation Guide', artist: 'Yoga Master', duration: '15:20' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title="Satsang" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
            <MaterialDesignIcons name="account-group" size={60} color={colors.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Spiritual Satsang</Text>
          <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
            Divine discourses and spiritual teachings
          </Text>
        </View>

        <View style={styles.satsangSection}>
          {satsangs.map((satsang) => (
            <TouchableOpacity
              key={satsang.id}
              style={[styles.satsangCard, { backgroundColor: colors.surface }]}
            >
              <View style={[styles.satsangImage, { backgroundColor: `${colors.primary}15` }]}>
                <MaterialDesignIcons name="microphone" size={40} color={colors.primary} />
              </View>
              <View style={styles.satsangInfo}>
                <Text style={[styles.satsangTitle, { color: colors.onSurface }]}>{satsang.title}</Text>
                <Text style={[styles.satsangArtist, { color: colors.onSurfaceVariant }]}>{satsang.artist}</Text>
                <Text style={[styles.satsangDuration, { color: colors.onSurfaceVariant }]}>{satsang.duration}</Text>
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
  satsangSection: { paddingHorizontal: wp(4) },
  satsangCard: { flexDirection: 'row', alignItems: 'center', padding: wp(4), marginBottom: hp(2), borderRadius: normalize(16), elevation: 2 },
  satsangImage: { width: wp(16), height: wp(16), borderRadius: normalize(12), justifyContent: 'center', alignItems: 'center', marginRight: wp(4) },
  satsangInfo: { flex: 1 },
  satsangTitle: { fontSize: normalize(18), fontWeight: 'bold', marginBottom: hp(0.5) },
  satsangArtist: { fontSize: normalize(14), marginBottom: hp(0.5) },
  satsangDuration: { fontSize: normalize(12) },
  playButton: { padding: wp(2) },
});

export default SatsangScreen;