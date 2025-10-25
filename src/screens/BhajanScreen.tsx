import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import AppBarHeader from '../components/AppBarHeader';
import { wp, hp, normalize } from '../utils/responsive';

const BhajanScreen = () => {
  const { colors } = useTheme();

  const bhajans = [
    { id: 1, title: 'Hare Krishna Hare Rama', artist: 'Traditional', duration: '5:30' },
    { id: 2, title: 'Hanuman Chalisa', artist: 'Pandit Ji', duration: '8:15' },
    { id: 3, title: 'Om Namah Shivaya', artist: 'Devotional', duration: '6:45' },
    { id: 4, title: 'Jai Mata Di', artist: 'Classical', duration: '4:20' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title="Bhajans" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
            <MaterialDesignIcons name="music-circle" size={60} color={colors.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Divine Bhajans</Text>
          <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
            Sacred songs for spiritual connection
          </Text>
        </View>

        <View style={styles.bhajanSection}>
          {bhajans.map((bhajan) => (
            <TouchableOpacity
              key={bhajan.id}
              style={[styles.bhajanCard, { backgroundColor: colors.surface }]}
            >
              <View style={[styles.bhajanImage, { backgroundColor: `${colors.primary}15` }]}>
                <MaterialDesignIcons name="music-note" size={40} color={colors.primary} />
              </View>
              <View style={styles.bhajanInfo}>
                <Text style={[styles.bhajanTitle, { color: colors.onSurface }]}>{bhajan.title}</Text>
                <Text style={[styles.bhajanArtist, { color: colors.onSurfaceVariant }]}>{bhajan.artist}</Text>
                <Text style={[styles.bhajanDuration, { color: colors.onSurfaceVariant }]}>{bhajan.duration}</Text>
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
  bhajanSection: { paddingHorizontal: wp(4) },
  bhajanCard: { flexDirection: 'row', alignItems: 'center', padding: wp(4), marginBottom: hp(2), borderRadius: normalize(16), elevation: 2 },
  bhajanImage: { width: wp(16), height: wp(16), borderRadius: normalize(12), justifyContent: 'center', alignItems: 'center', marginRight: wp(4) },
  bhajanInfo: { flex: 1 },
  bhajanTitle: { fontSize: normalize(18), fontWeight: 'bold', marginBottom: hp(0.5) },
  bhajanArtist: { fontSize: normalize(14), marginBottom: hp(0.5) },
  bhajanDuration: { fontSize: normalize(12) },
  playButton: { padding: wp(2) },
});

export default BhajanScreen;