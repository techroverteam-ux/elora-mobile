import { Alert, Linking, Share } from 'react-native';

interface ShareOptions {
  title: string;
  message: string;
  url?: string;
  phoneNumber?: string;
  email?: string;
}

export const useSharing = () => {
  const shareToWhatsApp = async (options: ShareOptions) => {
    try {
      const { message, url, phoneNumber } = options;
      const shareContent = url ? `${message}\n\n${url}` : message;
      const encodedMessage = encodeURIComponent(shareContent);
      
      const whatsappUrl = phoneNumber 
        ? `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`
        : `whatsapp://send?text=${encodedMessage}`;

      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        return true;
      } else {
        Alert.alert('WhatsApp Not Found', 'WhatsApp is not installed on this device.');
        return false;
      }
    } catch (error) {
      console.error('WhatsApp sharing error:', error);
      Alert.alert('Error', 'Failed to open WhatsApp');
      return false;
    }
  };

  const shareToSMS = async (options: ShareOptions) => {
    try {
      const { message, url, phoneNumber } = options;
      const shareContent = url ? `${message}\n\n${url}` : message;
      
      const smsUrl = phoneNumber 
        ? `sms:${phoneNumber}?body=${encodeURIComponent(shareContent)}`
        : `sms:?body=${encodeURIComponent(shareContent)}`;

      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
        return true;
      } else {
        Alert.alert('Error', 'SMS not available on this device');
        return false;
      }
    } catch (error) {
      console.error('SMS sharing error:', error);
      Alert.alert('Error', 'Failed to open SMS');
      return false;
    }
  };

  const shareToEmail = async (options: ShareOptions) => {
    try {
      const { title, message, url, email } = options;
      const shareContent = url ? `${message}\n\n${url}` : message;
      
      const emailUrl = `mailto:${email || ''}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareContent)}`;
      
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
        return true;
      } else {
        Alert.alert('Error', 'Email not available on this device');
        return false;
      }
    } catch (error) {
      console.error('Email sharing error:', error);
      Alert.alert('Error', 'Failed to open email');
      return false;
    }
  };

  const shareGeneral = async (options: ShareOptions) => {
    try {
      const { title, message, url } = options;
      const shareContent = url ? `${message}\n\n${url}` : message;
      
      const result = await Share.share({
        title: title,
        message: shareContent,
        url: url,
      });

      return result.action === Share.sharedAction;
    } catch (error) {
      console.error('General sharing error:', error);
      Alert.alert('Error', 'Failed to share');
      return false;
    }
  };

  const quickWhatsAppShare = async (message: string, phoneNumber?: string) => {
    return shareToWhatsApp({ title: '', message, phoneNumber });
  };

  return {
    shareToWhatsApp,
    shareToSMS,
    shareToEmail,
    shareGeneral,
    quickWhatsAppShare,
  };
};

export default useSharing;