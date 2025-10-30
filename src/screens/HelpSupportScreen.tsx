import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { translateContent } from '../utils/contentTranslator';
import AppBarHeader from '../components/AppBarHeader';

const HelpSupportScreen = () => {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
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

  const faqData = [
    {
      question: translateContent('How do I download content for offline viewing?'),
      answer: translateContent('Tap the download icon next to any audio, video, or PDF content. Downloaded content will be available in the Downloads section.'),
    },
    {
      question: translateContent('Can I change the app language?'),
      answer: translateContent('Yes! Go to Settings > Language to select from available languages including Hindi, English, and Sanskrit.'),
    },
    {
      question: translateContent('How do I switch between light and dark themes?'),
      answer: translateContent('Navigate to Settings > Appearance and choose between Light, Dark, or System theme options.'),
    },
    {
      question: translateContent('Is the content free to access?'),
      answer: translateContent('Yes, all spiritual content including audio lectures, videos, and books are completely free to access.'),
    },
    {
      question: translateContent('How do I report a technical issue?'),
      answer: translateContent('You can contact our support team using the contact options below or send us an email with details about the issue.'),
    },
  ];

  const contactOptions = [
    {
      title: translateContent('Email Support'),
      subtitle: 'support@geetabalsanskar.org',
      icon: 'email-outline',
      onPress: () => Linking.openURL('mailto:support@geetabalsanskar.org'),
    },
    {
      title: translateContent('Website'),
      subtitle: translateContent('Visit our official website'),
      icon: 'web',
      onPress: () => Linking.openURL('https://gbs.org.in'),
    },
    {
      title: translateContent('Phone Support'),
      subtitle: '+91 12345 67890',
      icon: 'phone-outline',
      onPress: () => Linking.openURL('tel:+911234567890'),
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <View key={i18n.language} style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title={translateContent('Help & Support')} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>{translateContent('Contact Us')}</Text>
          {contactOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.contactItem, { backgroundColor: colors.surface }]}
              onPress={option.onPress}
            >
              <MaterialDesignIcons name={option.icon} size={24} color={colors.primary} />
              <View style={styles.contactText}>
                <Text style={[styles.contactTitle, { color: colors.onSurface }]}>
                  {option.title}
                </Text>
                <Text style={[styles.contactSubtitle, { color: colors.onSurfaceVariant }]}>
                  {option.subtitle}
                </Text>
              </View>
              <MaterialDesignIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
            {translateContent('Frequently Asked Questions')}
          </Text>
          {faqData.map((faq, index) => (
            <View key={index} style={[styles.faqItem, { backgroundColor: colors.surface }]}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFAQ(index)}
              >
                <Text style={[styles.questionText, { color: colors.onSurface }]}>
                  {faq.question}
                </Text>
                <MaterialDesignIcons
                  name={expandedFAQ === index ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={colors.onSurfaceVariant}
                />
              </TouchableOpacity>
              {expandedFAQ === index && (
                <View style={styles.faqAnswer}>
                  <Text style={[styles.answerText, { color: colors.onSurfaceVariant }]}>
                    {faq.answer}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>{translateContent('Quick Actions')}</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => (navigation as any).navigate('ReportIssue')}
          >
            <MaterialDesignIcons name="bug-outline" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>{translateContent('Report an Issue')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary || colors.primary }]}
            onPress={() => (navigation as any).navigate('FeatureRequest')}
          >
            <MaterialDesignIcons name="lightbulb-outline" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>{translateContent('Request Feature')}</Text>
          </TouchableOpacity>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactText: {
    flex: 1,
    marginLeft: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
  },
  faqItem: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});

export default HelpSupportScreen;