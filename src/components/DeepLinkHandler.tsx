import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { handleDeepLink } from '../utils/deepLinkHelper';

const DeepLinkHandler = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Handle deep link when app is opened from a link
    const handleInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log('Initial URL:', initialUrl);
          handleDeepLink(initialUrl, navigation);
        }
      } catch (error) {
        console.error('Error handling initial URL:', error);
      }
    };

    // Handle deep link when app is already running
    const handleURL = (event: { url: string }) => {
      console.log('Incoming URL:', event.url);
      handleDeepLink(event.url, navigation);
    };

    // Set up listeners
    handleInitialURL();
    const subscription = Linking.addEventListener('url', handleURL);

    return () => {
      subscription?.remove();
    };
  }, [navigation]);

  return null; // This component doesn't render anything
};

export default DeepLinkHandler;