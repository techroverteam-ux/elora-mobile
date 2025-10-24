import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import AppBarHeader from '../components/AppBarHeader';

const ReportIssueScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    email: '',
    category: 'Bug Report'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Bug Report', 'App Crash', 'Audio Issue', 'Video Issue', 'PDF Issue', 'Login Problem', 'Other'];

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.email.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api/support/report-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          platform: 'mobile'
        }),
      });

      if (response.ok) {
        Alert.alert(
          'Success',
          'Your issue has been reported successfully. We will get back to you soon.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit your report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title="Report Issue" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
          Help us improve the app by reporting any issues you encounter.
        </Text>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.onBackground }]}>Issue Title *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.onSurface }]}
            placeholder="Brief description of the issue"
            placeholderTextColor={colors.onSurfaceVariant}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />

          <Text style={[styles.label, { color: colors.onBackground }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  { backgroundColor: formData.category === category ? colors.primary : colors.surface }
                ]}
                onPress={() => setFormData({ ...formData, category })}
              >
                <Text style={[
                  styles.categoryText,
                  { color: formData.category === category ? '#fff' : colors.onSurface }
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.label, { color: colors.onBackground }]}>Description *</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.surface, color: colors.onSurface }]}
            placeholder="Please describe the issue in detail..."
            placeholderTextColor={colors.onSurfaceVariant}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
          />

          <Text style={[styles.label, { color: colors.onBackground }]}>Email *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.onSurface }]}
            placeholder="your.email@example.com"
            placeholderTextColor={colors.onSurfaceVariant}
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
          />

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialDesignIcons name="send" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </>
            )}
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
  description: {
    fontSize: 16,
    marginVertical: 16,
    textAlign: 'center',
  },
  form: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textArea: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    elevation: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ReportIssueScreen;