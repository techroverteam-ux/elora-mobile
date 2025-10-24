import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppBarHeader from '../components/AppBarHeader';

const AboutScreen = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title="About" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>GBS</Text>
          </View>
          <Text style={[styles.appName, { color: colors.onBackground }]}>Geeta Bal Sanskar</Text>
          <Text style={[styles.version, { color: colors.onSurfaceVariant }]}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>About the App</Text>
          <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
            Geeta Bal Sanskar is a comprehensive spiritual learning platform that brings the timeless wisdom of the Bhagavad Gita to modern learners. Our app provides access to audio lectures, video content, and digital books to help you on your spiritual journey.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>Features</Text>
          <View style={styles.featureList}>
            <Text style={[styles.featureItem, { color: colors.onSurfaceVariant }]}>
              • Audio lectures and spiritual discourses
            </Text>
            <Text style={[styles.featureItem, { color: colors.onSurfaceVariant }]}>
              • Video content and teachings
            </Text>
            <Text style={[styles.featureItem, { color: colors.onSurfaceVariant }]}>
              • Digital books and PDFs
            </Text>
            <Text style={[styles.featureItem, { color: colors.onSurfaceVariant }]}>
              • Multiple language support
            </Text>
            <Text style={[styles.featureItem, { color: colors.onSurfaceVariant }]}>
              • Dark and light theme options
            </Text>
            <Text style={[styles.featureItem, { color: colors.onSurfaceVariant }]}>
              • Offline content access
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>Mission</Text>
          <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
            Our mission is to make spiritual knowledge accessible to everyone, everywhere. We believe that the teachings of the Bhagavad Gita can transform lives and bring peace, wisdom, and happiness to all who seek it.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>Contact</Text>
          <Text style={[styles.contactInfo, { color: colors.onSurfaceVariant }]}>
            Email: support@gbs.org.in
          </Text>
          <Text style={[styles.contactInfo, { color: colors.onSurfaceVariant }]}>
            Website: gbs.org.in
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.copyright, { color: colors.onSurfaceVariant }]}>
            © 2024 Geeta Bal Sanskar. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
  featureList: {
    paddingLeft: 8,
  },
  featureItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 16,
    marginBottom: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 24,
  },
  copyright: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AboutScreen;