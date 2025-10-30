import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { translateContent } from '../utils/contentTranslator';
import AppBarHeader from '../components/AppBarHeader';

const AboutScreen = () => {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate({});
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return (
    <View key={i18n.language} style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title={translateContent('About Us')} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../assets/images/logo1234.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>{translateContent('Geeta Bal Sanskar')}</Text>
          <Text style={styles.tagline}>{translateContent('Spiritual Wisdom & Guidance')}</Text>
          <Text style={styles.version}>{translateContent('Version')} 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>{translateContent('About the App')}</Text>
          <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
            {translateContent('Geeta Bal Sanskar is a comprehensive spiritual learning platform that brings the timeless wisdom of the Bhagavad Gita to modern learners. Our app provides access to audio lectures, video content, and digital books to help you on your spiritual journey.')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>{translateContent('Features')}</Text>
          <View style={styles.featureList}>
            <Text style={[styles.featureItem, { color: colors.onSurfaceVariant }]}>
              {translateContent('• Audio lectures and spiritual discourses')}
            </Text>
            <Text style={[styles.featureItem, { color: colors.onSurfaceVariant }]}>
              {translateContent('• Video content and teachings')}
            </Text>
            <Text style={[styles.featureItem, { color: colors.onSurfaceVariant }]}>
              {translateContent('• Digital books and PDFs')}
            </Text>
            <Text style={[styles.featureItem, { color: colors.onSurfaceVariant }]}>
              {translateContent('• Multiple language support')}
            </Text>
            <Text style={[styles.featureItem, { color: colors.onSurfaceVariant }]}>
              {translateContent('• Dark and light theme options')}
            </Text>
            <Text style={[styles.featureItem, { color: colors.onSurfaceVariant }]}>
              {translateContent('• Offline content access')}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>{translateContent('Mission')}</Text>
          <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
            {translateContent('Our mission is to make spiritual knowledge accessible to everyone, everywhere. We believe that the teachings of the Bhagavad Gita can transform lives and bring peace, wisdom, and happiness to all who seek it.')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>{translateContent('Developer Information')}</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.infoTitle, { color: colors.primary }]}>{translateContent('Login Credentials (Demo)')}</Text>
            <Text style={[styles.infoText, { color: colors.onSurface }]}>{translateContent('Email: demo@gbs.org.in')}</Text>
            <Text style={[styles.infoText, { color: colors.onSurface }]}>{translateContent('Password: demo123')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>{translateContent('Contact')}</Text>
          <Text style={[styles.contactInfo, { color: colors.onSurfaceVariant }]}>
            {translateContent('Email: support@gbs.org.in')}
          </Text>
          <Text style={[styles.contactInfo, { color: colors.onSurfaceVariant }]}>
            {translateContent('Website: gbs.org.in')}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.copyright, { color: colors.onSurfaceVariant }]}>
            {translateContent('© 2024 Geeta Bal Sanskar. All rights reserved.')}
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
    paddingVertical: 40,
    marginHorizontal: -20,
    marginTop: -20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 30,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginBottom: 8,
  },
  version: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F8803B',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'monospace',
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