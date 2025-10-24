import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import AppBarHeader from '../components/AppBarHeader';

const HelpSupportScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqData = [
    {
      question: 'How do I download content for offline viewing?',
      answer: 'Tap the download icon next to any audio, video, or PDF content. Downloaded content will be available in the Downloads section.',
    },
    {
      question: 'Can I change the app language?',
      answer: 'Yes! Go to Settings > Language to select from available languages including Hindi, English, and Sanskrit.',
    },
    {
      question: 'How do I switch between light and dark themes?',
      answer: 'Navigate to Settings > Appearance and choose between Light, Dark, or System theme options.',
    },
    {
      question: 'Is the content free to access?',
      answer: 'Yes, all spiritual content including audio lectures, videos, and books are completely free to access.',
    },
    {
      question: 'How do I report a technical issue?',
      answer: 'You can contact our support team using the contact options below or send us an email with details about the issue.',
    },
  ];

  const contactOptions = [
    {
      title: 'Email Support',
      subtitle: 'support@geetabalsanskar.org',
      icon: 'email-outline',
      onPress: () => Linking.openURL('mailto:support@geetabalsanskar.org'),
    },
    {
      title: 'Website',
      subtitle: 'Visit our official website',
      icon: 'web',
      onPress: () => Linking.openURL('https://gbs.org.in'),
    },
    {
      title: 'Phone Support',
      subtitle: '+91 12345 67890',
      icon: 'phone-outline',
      onPress: () => Linking.openURL('tel:+911234567890'),
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title="Help & Support" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>Contact Us</Text>
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
            Frequently Asked Questions
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
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>Quick Actions</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => (navigation as any).navigate('ReportIssue')}
          >
            <MaterialDesignIcons name="bug-outline" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Report an Issue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary || colors.primary }]}
            onPress={() => (navigation as any).navigate('FeatureRequest')}
          >
            <MaterialDesignIcons name="lightbulb-outline" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Request Feature</Text>
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