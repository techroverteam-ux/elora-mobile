import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { translateContent } from '../utils/contentTranslator';
import AppBarHeader from '../components/AppBarHeader';

const FeatureRequestScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    email: '',
    priority: 'Medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priorities = ['Low', 'Medium', 'High'];

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.email.trim()) {
      Alert.alert(translateContent('Error'), translateContent('Please fill in all required fields'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api/support/feature-request', {
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
          translateContent('Success'),
          translateContent('Your feature request has been submitted successfully. Thank you for your suggestion!'),
          [{ text: translateContent('OK'), onPress: () => navigation.goBack() }]
        );
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      Alert.alert(translateContent('Error'), translateContent('Failed to submit your request. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title={translateContent('Feature Request')} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
          {translateContent('Have an idea for a new feature? We\'d love to hear your suggestions!')}
        </Text>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.onBackground }]}>{translateContent('Feature Title')} *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.onSurface }]}
            placeholder={translateContent('Brief title for your feature idea')}
            placeholderTextColor={colors.onSurfaceVariant}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />

          <Text style={[styles.label, { color: colors.onBackground }]}>{translateContent('Priority')}</Text>
          <View style={styles.priorityContainer}>
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.priorityButton,
                  { backgroundColor: formData.priority === priority ? colors.primary : colors.surface }
                ]}
                onPress={() => setFormData({ ...formData, priority })}
              >
                <Text style={[
                  styles.priorityText,
                  { color: formData.priority === priority ? '#fff' : colors.onSurface }
                ]}>
                  {translateContent(priority)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.onBackground }]}>{translateContent('Feature Description')} *</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.surface, color: colors.onSurface }]}
            placeholder={translateContent('Please describe your feature idea in detail. How would it work? What problem would it solve?')}
            placeholderTextColor={colors.onSurfaceVariant}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
          />

          <Text style={[styles.label, { color: colors.onBackground }]}>{translateContent('Email')} *</Text>
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
                <MaterialDesignIcons name="lightbulb-outline" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>{translateContent('Submit Request')}</Text>
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
    minHeight: 150,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  priorityContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  priorityButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    elevation: 1,
  },
  priorityText: {
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

export default FeatureRequestScreen;