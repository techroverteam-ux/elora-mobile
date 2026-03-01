import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Send, User, Mail, Phone, MessageSquare, Building } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { enquiryService } from '../../services/enquiryService';
import Toast from 'react-native-toast-message';

export default function ContactScreen() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    subject: 'General Inquiry'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      Toast.show({ 
        type: 'error', 
        text1: 'Required fields missing',
        text2: 'Please fill name, email and message'
      });
      return;
    }

    setSubmitting(true);
    try {
      await enquiryService.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        message: formData.message,
        subject: formData.subject,
        source: 'Mobile App'
      });
      
      Toast.show({ 
        type: 'success', 
        text1: 'Message sent successfully!',
        text2: 'We will get back to you soon.'
      });
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
        subject: 'General Inquiry'
      });
    } catch (error) {
      Toast.show({ 
        type: 'error', 
        text1: 'Failed to send message',
        text2: 'Please try again later'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const InputField = ({ label, value, onChangeText, placeholder, icon, keyboardType = 'default', multiline = false }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ 
        color: theme.colors.textSecondary, 
        fontSize: 12, 
        fontWeight: '600', 
        marginBottom: 6 
      }}>
        {label}
      </Text>
      <View style={{ 
        flexDirection: 'row', 
        alignItems: multiline ? 'flex-start' : 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: 12,
        paddingVertical: multiline ? 12 : 0
      }}>
        <View style={{ marginRight: 8, marginTop: multiline ? 4 : 0 }}>
          {icon}
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={{ 
            flex: 1, 
            padding: multiline ? 0 : 12, 
            color: theme.colors.text,
            minHeight: multiline ? 80 : 48
          }}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: theme.colors.text,
          marginBottom: 8
        }}>
          Contact Us
        </Text>
        <Text style={{ 
          color: theme.colors.textSecondary, 
          marginBottom: 24 
        }}>
          Get in touch with our team for support and inquiries
        </Text>

        <InputField
          label="NAME *"
          value={formData.name}
          onChangeText={text => setFormData({ ...formData, name: text })}
          placeholder="Enter your full name"
          icon={<User size={16} color={theme.colors.textSecondary} />}
        />

        <InputField
          label="EMAIL *"
          value={formData.email}
          onChangeText={text => setFormData({ ...formData, email: text })}
          placeholder="Enter your email address"
          keyboardType="email-address"
          icon={<Mail size={16} color={theme.colors.textSecondary} />}
        />

        <InputField
          label="PHONE"
          value={formData.phone}
          onChangeText={text => setFormData({ ...formData, phone: text })}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          icon={<Phone size={16} color={theme.colors.textSecondary} />}
        />

        <InputField
          label="COMPANY"
          value={formData.company}
          onChangeText={text => setFormData({ ...formData, company: text })}
          placeholder="Enter your company name"
          icon={<Building size={16} color={theme.colors.textSecondary} />}
        />

        <InputField
          label="MESSAGE *"
          value={formData.message}
          onChangeText={text => setFormData({ ...formData, message: text })}
          placeholder="Enter your message or inquiry"
          multiline={true}
          icon={<MessageSquare size={16} color={theme.colors.textSecondary} />}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          style={{
            backgroundColor: theme.colors.primary,
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 8,
            marginBottom: 32,
            opacity: submitting ? 0.6 : 1
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Send size={20} color="#FFF" />
            <Text style={{ 
              color: '#FFF', 
              fontSize: 16, 
              fontWeight: '600',
              marginLeft: 8
            }}>
              {submitting ? 'Sending Message...' : 'Send Message'}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}